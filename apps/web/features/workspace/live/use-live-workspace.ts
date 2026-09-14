"use client";

// The design is a presentation adapter. All durable state and writes come
// from the API; fixtures remain available only when no API is configured.
import { useEffect, useRef } from "react";
import { Client, type User, type WorkspaceClient, type WorkflowGraph } from "@botinc/api";
import type { Vals } from "../vals";
import { mapAccount, mapAutopilot, mapConversation, mapIssue, mapMessage, mapRun, mapWorkflowSteps, type PeopleIndex } from "./map";
import { parseWorkspaceRoute, workspacePath, type WorkspaceRoute } from "./routes";

export type LiveStatus = "off" | "connecting" | "live" | "signed-out" | "error";
export type Logic = Vals & { state: Vals; setState: (patch: Vals) => void; renderVals: () => Vals };
declare global { interface Window { __BOTINC__?: { apiURL?: string } } }
export function apiBaseURL(): string { return typeof window === "undefined" ? "" : (window.__BOTINC__?.apiURL ?? "").trim(); }
const titleCase = (s: string) => s ? s[0]!.toUpperCase() + s.slice(1) : "";
const pluginKey = (s: unknown) => String(s??"").toLowerCase().replace(/^mcp:/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const catalogPluginKeys = new Set(["github","slack","gmail","google-drive","notion","claude-design","figma","sentry","google-calendar","jira","confluence","gitlab","bitbucket","discord","microsoft-teams","dropbox","onedrive","airtable","posthog"]);
const uuid = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(s);
const phaseFor = (s?: string) => s && ["queued", "provisioning", "running"].includes(s) ? "working" : s === "waiting" ? "paused" : "done";
const draftKey = (workspace: string, conversation?: unknown) => `botinc:draft:v2:${workspace}:${uuid(conversation) ? conversation : "new"}`;
const dockConversationKey = (workspace: string) => `botinc:dock-conversation:v2:${workspace}`;
const dockDraftKey = (workspace: string) => `botinc:dock-draft:v2:${workspace}`;
export function readDraft(workspace: string, conversation?: unknown): string {
 try{return window.localStorage.getItem(draftKey(workspace,conversation))||""}catch{return ""}
}
export function saveDraft(workspace: string, conversation: unknown, value: string): void {
 try{if(value)window.localStorage.setItem(draftKey(workspace,conversation),value);else window.localStorage.removeItem(draftKey(workspace,conversation))}catch{}
}
export function openNewChatWithDraft(logic: Pick<Logic,"setState">, workspace: string, open: () => void): void {
 open();
 logic.setState({draft:readDraft(workspace,null)});
}
function readLocal(key: string): string { try{return window.localStorage.getItem(key)||""}catch{return ""} }
function saveLocal(key: string, value: string): void { try{if(value)window.localStorage.setItem(key,value);else window.localStorage.removeItem(key)}catch{} }

export function useLiveWorkspace(logic: Logic | null, onStatus?: (s: LiveStatus, detail?: string) => void) {
 const statusRef = useRef(onStatus);
 useEffect(()=>{statusRef.current=onStatus},[onStatus]);
 useEffect(() => {
  const baseURL=apiBaseURL(); if(!logic||!baseURL){statusRef.current?.("off");return;}
  let hydrated=false;let alive=true; const abort=new AbortController(); let disconnect:(()=>void)|undefined; let restore:(()=>void)|undefined; let timer:ReturnType<typeof setTimeout>|undefined;
  const report=(s:LiveStatus,detail?:string)=>{if(alive)statusRef.current?.(s,detail)};
  report("connecting");
  const fail=(err:unknown)=>{if(!alive)return;const text=err instanceof Error?err.message:String(err);logic.setState({error:text});if(!hydrated)report("error",text)};
  const api=new Client({baseURL,onUnauthenticated:()=>report("signed-out")});
  void (async()=>{
   const me=(await api.me(abort.signal)).user;
   const initialRoute=parseWorkspaceRoute(new URL(window.location.href));
   const {workspaces}=await api.workspaces(abort.signal);const first=workspaces.find(w=>w.slug===initialRoute.workspace)||workspaces[0];if(!first)throw new Error("This account has no workspace");
   const ws=api.workspace(first.slug);const people:PeopleIndex=new Map();const member=me.name.trim()||me.email.split("@")[0]||"You";
   let refreshing=false,again=false;
   const hydrate=async()=>{
    if(!alive)return;if(refreshing){again=true;return;}refreshing=true;
    try{
     const [issues,chats,autos,accounts,routing,overview,members,skills,memories,credits,plugins,repos,projects,workflows,invites,sessions,keys]=await Promise.all([
      ws.issues(undefined,abort.signal),ws.conversations(abort.signal),ws.autopilots(abort.signal),ws.accounts(abort.signal),ws.routing(abort.signal),ws.overview(abort.signal),ws.members(abort.signal),ws.skills(abort.signal),ws.memories(abort.signal),ws.credits(abort.signal),ws.plugins(abort.signal),ws.repositories(abort.signal),ws.projects(abort.signal),ws.workflows(abort.signal),ws.invitations(abort.signal),api.request<{sessions:Vals[]}>("GET","/api/me/sessions",undefined,abort.signal),api.request<{keys:Vals[]}>("GET","/api/me/keys",undefined,abort.signal),
     ]);
     if(!alive)return;
     for(const p of members.members)people.set(p.user_id,{name:p.name,email:p.email});
     const previous=String(logic.state.member??"");const patch:Vals={};
     // Empty defaults replace every persona-keyed fixture before changing the key.
     for(const k of ["connections","agentPrefs","funding","memoryByMember","skillGrants","modelAccounts","preferencesBy10","fallbackPolicies10"]){patch[k]={[member]:{}};}
     patch.liveWorkspaces=workspaces;patch.workspace16=overview.workspace.name;patch.member=member;patch.signed=true;patch.workspaceName=overview.workspace.name;
     patch.issues=issues.issues.map(i=>mapIssue(i,people));
     const selectedIssue=issues.issues.find(i=>i.identifier===logic.state.activeIssue||i.id===logic.state.activeIssue);
     if(selectedIssue){const detail=await ws.issue(selectedIssue.id,abort.signal);const files=await api.request<{attachments:Vals[]}>("GET",`/api/w/${ws.slug}/attachments?issue=${selectedIssue.id}`,undefined,abort.signal);patch.liveIssueDetail=detail;patch.liveIssueFiles=files.attachments;patch.liveIssueWorkflow=detail.issue.workflow_id?await ws.workflow(detail.issue.workflow_id,abort.signal):null;patch.issues=patch.issues.map((i:Vals)=>i.uuid===selectedIssue.id?{...i,events:detail.comments.map(c=>({who:people.get(c.author_user_id||"")?.name||"Previous agent",role:c.author_kind,when:new Date(c.created_at).toLocaleString(),text:c.body})),cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100}:i)}
     const oldChats=logic.state.chats?.[previous]||[];
     patch.chats={[member]:chats.conversations.map(c=>{
      const old=oldChats.find((x:Vals)=>x.id===c.id);return {...mapConversation(c,[],me,people),messages:old?.messages||[],phase:old?.phase||"done"};
     })};
     const active=String(logic.state.activeChat||"");
     if(active&&chats.conversations.some(c=>c.id===active)){
      const detail=await ws.conversation(active,abort.signal);if(!alive)return;
      const run=detail.runs.at(-1);const phase=phaseFor(run?.status);
      const apiOrigin=new URL(api.baseURL||"/",window.location.origin);
      const attachments=detail.attachments.map(a=>({...a,url:new URL(a.url,apiOrigin).toString()}));
      patch.chats[member]=patch.chats[member].map((c:Vals)=>c.id===active?{...mapConversation(detail.conversation,detail.messages,me,people,attachments),phase,runId:run?.id,runError:run?.error||"",cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100,taskLimit:(run?.task_limit_cents??routing.default_task_limit_cents)/100}:c);
      patch.phase=phase;
      if(run?.error)patch.error=run.error;
     }
     const dockConversation=String(logic.state.dockConversationID||readLocal(dockConversationKey(ws.slug)));
     patch.dockLiveDraft=logic.state.dockLiveDraft??readLocal(dockDraftKey(ws.slug));
     if(uuid(dockConversation)&&chats.conversations.some(c=>c.id===dockConversation)){
      const dock=await ws.conversation(dockConversation,abort.signal);if(!alive)return;
      const apiOrigin=new URL(api.baseURL||"/",window.location.origin);
      const attachments=dock.attachments.map(a=>({...a,url:new URL(a.url,apiOrigin).toString()}));
      const dockRun=dock.runs.at(-1);
      patch.dockConversationID=dockConversation;
      patch.dockLiveMessages=dock.messages.map(m=>mapMessage(m,me,people,attachments));
      patch.dockLiveRun=dockRun||null;
      patch.dockLivePhase=phaseFor(dockRun?.status);
      patch.dockLiveCost=dock.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100;
     }else if(dockConversation){saveLocal(dockConversationKey(ws.slug),"");patch.dockConversationID="";patch.dockLiveMessages=[];patch.dockLiveRun=null;patch.dockLivePhase="done";}
     patch.autopilots9=autos.autopilots.map(a=>({...mapAutopilot(a),owner:member,kind:a.trigger.kind,status:a.enabled?"active":"paused",history:[],limit:2,daily:20}));
     patch.accounts10=accounts.accounts.map(mapAccount);patch.modelAccounts={[member]:patch.accounts10};
     patch.connections={[member]:Object.fromEntries(plugins.plugins.map(p=>[titleCase(p.kind.replace(/^mcp:/,"")),p.status==="connected"]))};
     patch.customPlugins10=plugins.plugins.filter(p=>p.kind.startsWith("mcp:")&&!catalogPluginKeys.has(pluginKey(p.kind))).map(p=>({name:String((p.account as Vals)?.name||titleCase(p.kind.slice(4).replace(/-/g," "))),owner:member,category:"Custom",copy:"Workspace MCP server",icon:"code-xml"}));
     patch.plan=titleCase(overview.workspace.plan);patch.monthly=0;patch.purchased=credits.balance_cents/100;patch.runningRuns=overview.running_runs;
     patch.paymentsEnabled=credits.payments_enabled;patch.paymentsTestMode=credits.payments_test_mode;patch.workspaceRole=overview.workspace.role||first.role;
     patch.ledger=credits.entries.map((e,i)=>({id:String(i),kind:e.kind,label:e.note,title:e.note,amount:e.amount_cents/100,date:e.created_at,when:e.created_at}));
     patch.members14=members.members.map(p=>({id:p.user_id,name:p.name||p.email.split("@")[0],email:p.email,role:titleCase(p.role),meta:"Joined "+new Date(p.joined_at).toLocaleDateString(),scope:"",locked:p.role==="owner"}));
     patch.invites14=invites.invitations.map(i=>({id:i.id,email:i.email,role:titleCase(i.role),state:"Pending",scope:"",meta:"Expires "+new Date(i.expires_at).toLocaleDateString()}));
     patch.skills=skills.skills.map(k=>({...k,description:k.body.split("\n").find(t=>t&&!t.startsWith("#"))||"Workspace instructions",source:"Workspace",owner:"workspace",version:"Saved",files:["SKILL.md"]}));
     patch.memories14=memories.memories.map(m=>({id:m.id,scope:m.scope,owner:people.get(m.user_id)?.name||people.get(m.user_id)?.email.split("@")[0],project:projects.projects.find(p=>p.id===m.project_id)?.name,type:"Fact",text:m.body,pinned:m.pinned,provenance:"Saved by a workspace member",updated:new Date(m.updated_at).toLocaleString(),lastUsed:"",source:"",why:"Explicitly saved instructions"}));
     patch.suggested14=[];patch.repos14=repos.repositories.map(r=>({id:r.id,name:r.full_name,full:r.full_name,branch:r.default_branch,status:"Connected",provider:"GitHub"}));
     patch.liveProjects=projects.projects;patch.livePlugins=plugins.plugins;
     patch.workflows14=workflows.workflows.map(w=>({id:w.id,name:w.name,meta:w.description,icon:"git-branch",state:w.active_version_id?"Active":"Draft",tone:w.active_version_id?"ok14":""}));
     patch.profileByMember15={[member]:{...(logic.state.profileByMember15?.[previous]||{}),name:me.name||member,email:me.email}};
     patch.sec19={...(logic.state.sec19||{}),twoStep:false,sms:false,codes:[],codesLeft:0,codesWhen:"Never",sessions:sessions.sessions.map(d=>({id:d.id,name:d.current?"Current browser":"Browser session",short:"browser",icon:"monitor",meta:d.user_agent,where:d.location||"",ip:d.ip,when:new Date(d.last_seen_at).toLocaleString(),current:d.current})),keys:keys.keys.map(k=>({id:k.id,name:k.name,prefix:k.prefix,scope:k.scopes.includes("write")?"Full access":"Read only",created:new Date(k.created_at).toLocaleDateString(),used:k.last_used_at?new Date(k.last_used_at).toLocaleString():"Never"}))};
     logic.setState(patch);if(!hydrated){if(previous!==member)logic.newChat();const conversation=initialRoute.conversation;const issue=initialRoute.issue;const requestedView=initialRoute.view;if(conversation&&chats.conversations.some(c=>c.id===conversation)){logic.setState({activeChat:conversation,view:"chat",draft:readDraft(ws.slug,conversation)});again=true}else if(issue&&issues.issues.some(i=>i.id===issue||i.identifier===issue)){logic.setState({activeIssue:issue,view:requestedView==="thread9"?"thread9":"issue"});again=true}else{logic.setState({view:requestedView,...initialRoute.autopilot?{activeAuto9:initialRoute.autopilot}:{},...initialRoute.section?{section:initialRoute.section}:{},draft:readDraft(ws.slug,null)})}const canonicalIssue=issue?issues.issues.find(i=>i.id===issue||i.identifier===issue)?.id:undefined;window.history.replaceState({},"",workspacePath({...initialRoute,workspace:ws.slug,...canonicalIssue?{issue:canonicalIssue}:{}}))}hydrated=true;report("live");
    }finally{refreshing=false;if(again&&alive){again=false;void hydrate().catch(fail)}}
   };
   restore=installActions(logic,ws,api,me,people,hydrate,fail);
   await hydrate();if(!alive)return;
   if(initialRoute.workflow&&typeof logic.openGraph14==="function")await logic.openGraph14(initialRoute.workflow);
   disconnect=ws.connect(e=>{if(e.type==="hello")return;if(timer)clearTimeout(timer);timer=setTimeout(()=>{void hydrate().catch(fail)},100)},up=>{if(up)void hydrate().catch(fail)});
  })().catch(err=>{if(err?.status===401)report("signed-out");else fail(err)});
  return()=>{alive=false;abort.abort();if(timer)clearTimeout(timer);disconnect?.();restore?.()};
 },[logic]);
}

// Kept outside React so adapter behavior can be tested against real API calls.
export function installActions(logic:Logic,ws:WorkspaceClient,api:Client,me:User,people:PeopleIndex,hydrate:()=>Promise<void>,fail:(err:unknown)=>void){
 const originals=new Map<string,unknown>();let disposed=false;
 const pendingFiles=new Map<string,File>();
 let fileTarget:"main"|"dock"="main";
 const bind=(name:string,fn:unknown)=>{if(!originals.has(name))originals.set(name,logic[name]);logic[name]=fn};
 const routeURL=(view:string,patch:Vals={},replace=false)=>{const state:Vals={...logic.state,...patch,view};const issueRow=(state.issues||[]).find((item:Vals)=>item.id===state.activeIssue||item.uuid===state.activeIssue);const issueID=issueRow?.uuid||state.activeIssue;const route:WorkspaceRoute={workspace:ws.slug,view,...(view==="chat"&&uuid(state.activeChat)?{conversation:state.activeChat}:{}),...(["issue","thread9"].includes(view)&&issueID?{issue:issueID}:{}),...(view==="auto9"&&state.activeAuto9?{autopilot:state.activeAuto9}:{}),...(view==="settings"&&state.section?{section:state.section}:{}),...(view==="settings"&&state.section==="workflows"&&state.activeWorkflow?{workflow:state.activeWorkflow}:{})};window.history[replace?"replaceState":"pushState"]({},"",workspacePath(route))};
 const originalGo=typeof logic.go==="function"?logic.go.bind(logic):null;
 if(originalGo)bind("go",(view:string,patch:Vals={})=>{originalGo(view,patch);routeURL(view,patch)});
 const originalNewChat=typeof logic.newChat==="function"?logic.newChat.bind(logic):null;
 if(originalNewChat)bind("newChat",()=>openNewChatWithDraft(logic,ws.slug,originalNewChat));
 const originalAccountRoutable=typeof logic.accountRoutable14==="function"?logic.accountRoutable14.bind(logic):null;
 if(originalAccountRoutable)bind("accountRoutable14",(account:Vals)=>typeof account.runtimeRoutable==="boolean"?account.runtimeRoutable&&account.enabled!==false:originalAccountRoutable(account));
 const write=(fn:()=>Promise<void>)=>async()=>{if(disposed)return;try{await fn();if(!disposed)await hydrate()}catch(err){if(!disposed)fail(err)}};
 let sending=false;
 const send=async(e?:{preventDefault:()=>void})=>{
  e?.preventDefault();if(sending||disposed)return;let draft=String(logic.state.draft||"").trim();const queued=[...(logic.state.attachments11||[])].filter((a:Vals)=>pendingFiles.has(a.id));if(!draft&&!queued.length)return;if(!draft)draft="Review the attached files.";sending=true;
  try{
   let active=logic.state.activeChat;
   if(!uuid(active)){const out=await ws.createConversation({title:draft.slice(0,72),model:String(logic.state.model||"auto").toLowerCase()==="auto"?"auto":String(logic.state.model)});if(disposed)return;active=out.conversation.id;logic.setState({activeChat:active,view:"chat"});routeURL("chat",{activeChat:active})}
   const attachmentIDs:string[]=[];
   for(const item of queued){const file=pendingFiles.get(item.id);if(!file)continue;const out=await ws.uploadConversationAttachment(active,file);attachmentIDs.push(out.attachment.id)}
   await ws.sendMessage(active,draft,attachmentIDs);
   saveDraft(ws.slug,logic.state.activeChat,"");saveDraft(ws.slug,active,"");
   for(const item of queued){pendingFiles.delete(item.id);if(String(item.url||"").startsWith("blob:"))URL.revokeObjectURL(item.url)}
   if(!disposed){logic.setState({draft:"",attachments11:[]});await hydrate()}
  }catch(err){if(!disposed)fail(err)}finally{sending=false}
 };
 bind("send",send);
 let dockSending=false;
 const sendDock=async(e?:{preventDefault:()=>void},suggested?:string)=>{
  e?.preventDefault();if(dockSending||disposed)return;
  let draft=String(suggested??logic.state.dockLiveDraft??"").trim();
  const queued=[...(logic.state.dockAttachmentsLive||[])].filter((a:Vals)=>pendingFiles.has(a.id));
  if(!draft&&!queued.length)return;if(!draft)draft="Review the attached files.";dockSending=true;
  try{
   let active=String(logic.state.dockConversationID||readLocal(dockConversationKey(ws.slug)));
   if(!uuid(active)){
    const out=await ws.createConversation({title:"Ask Operator",model:String(logic.state.model||"auto").toLowerCase()==="auto"?"auto":String(logic.state.model)});
    if(disposed)return;active=out.conversation.id;saveLocal(dockConversationKey(ws.slug),active);logic.setState({dockConversationID:active});
   }
   const attachmentIDs:string[]=[];
   for(const item of queued){const file=pendingFiles.get(item.id);if(!file)continue;const out=await ws.uploadConversationAttachment(active,file);attachmentIDs.push(out.attachment.id)}
   await ws.sendMessage(active,draft,attachmentIDs);
   saveLocal(dockDraftKey(ws.slug),"");
   for(const item of queued){pendingFiles.delete(item.id);if(String(item.url||"").startsWith("blob:"))URL.revokeObjectURL(item.url)}
   if(!disposed){logic.setState({dockLiveDraft:"",dockAttachmentsLive:[]});await hydrate()}
  }catch(err){if(!disposed)fail(err)}finally{dockSending=false}
 };
 bind("openIssue",(id:string)=>{logic.go("thread9",{activeIssue:id,issueComment:"",liveIssueDetail:null,liveIssueFiles:[]});void hydrate().catch(fail)});
 bind("issue",()=>logic.state.issues.find((i:Vals)=>i.id===logic.state.activeIssue||i.uuid===logic.state.activeIssue)||{id:"",title:"Select an issue",description:"",status:"Incoming",events:[]});
 // The prototype has several generations of composer handlers. All route here.
 for(const name of ["sendComposer10","sendComposer11","sendThreadMessage9"])bind(name,send);
 bind("workspaceMenu16",(event:Event)=>logic.openMenu14(null,event,[...(logic.state.liveWorkspaces||[]).map((w:Vals)=>({label:w.name,hint:w.role,on:w.slug===ws.slug,run:()=>window.location.assign(workspacePath({workspace:w.slug,view:"chat"}))})),{label:"New workspace",run:()=>logic.newWorkspace16()}],"Workspaces"));
 bind("createWorkspace16",write(async()=>{const name=String(logic.state.nwName16||"").trim();if(!name)throw new Error("Enter a workspace name");const created=await api.request<{slug:string}>("POST","/api/workspaces",{name});window.location.assign(workspacePath({workspace:created.slug,view:"chat"}))}));
 bind("commitRename16",write(async()=>{const s=logic.state;const title=String(s.renameDraft16||"").trim();if(!title)throw new Error("Enter a name");if(uuid(s.renameId16))await ws.updateConversation(s.renameId16,{title});else await api.request("PATCH",`/api/w/${ws.slug}/issues/${s.renameId16}`,{title});logic.setState({renameId16:null})}));
 bind("archiveRow16",(id:string)=>write(async()=>{if(!uuid(id))throw new Error("Open the issue to change its status");await ws.updateConversation(id,{archived:true});if(logic.state.activeChat===id)logic.newChat()})());
 bind("shareRow16",(row:Vals)=>write(async()=>{let path:string;if(uuid(row.id)){await ws.updateConversation(row.id,{shared:true});path=workspacePath({workspace:ws.slug,view:"chat",conversation:row.id})}else{const issue=row.uuid||row.issueId||String(row.id||"").replace(/^issue:/,"");if(!issue)throw new Error("Open a record before sharing it");path=workspacePath({workspace:ws.slug,view:"issue",issue})}await navigator.clipboard.writeText(new URL(path,window.location.origin).toString());logic.toast("Workspace link copied")})());
 bind("pluginConnected10",(name:string)=>(logic.state.livePlugins||[]).some((p:Vals)=>pluginKey(p.kind)===pluginKey(name)&&p.status==="connected"));
 bind("connect",(name:string)=>logic.showPlugin10(name));
 bind("submitMcp10",write(async()=>{
  const name=String(logic.state.mcpName10||"").trim();const rawURL=String(logic.state.mcpUrl10||"").trim();let endpoint:URL;
  try{endpoint=new URL(rawURL);if(endpoint.protocol!=="https:"||endpoint.username||endpoint.password||!name)throw new Error()}
  catch{logic.setState({mcpError10:"Use a name and an HTTPS server URL without credentials."});return}
  if(logic.state.mcpAuth10!=="none"){logic.setState({mcpError10:"Use the provider connection for OAuth. Custom MCP URLs currently support no-authentication servers."});return}
  if(!logic.state.mcpReview10){logic.setState({mcpReview10:true,mcpError10:""});return}
  const key=pluginKey(name);if(!key){logic.setState({mcpError10:"Use a name containing letters or numbers."});return}
  await api.request("POST",`/api/w/${ws.slug}/plugins`,{kind:`mcp:${key}`,account:{name,source:"custom"},secret:JSON.stringify({url:endpoint.toString()})});
  logic.setState({dialog:null,mcpName10:"",mcpUrl10:"",mcpReview10:false,mcpError10:""});
 }));
 bind("finishChat",()=>{});bind("skillFixture16",()=>[]);
 const repo=logic.repo14;
 bind("repo14",()=>repo.call(logic)||{id:"",name:"No repository connected",connected:false,meta:"Add a repository to start coding work",branch:"",state:"Not connected",tone:""});
 const openChat=async(id:string)=>{logic.setState({activeChat:id,view:"chat",dialog:null,draft:readDraft(ws.slug,id)});routeURL("chat",{activeChat:id});try{await hydrate()}catch(e){fail(e)}};
 for(const name of ["loadChat","loadChat9","loadChat10"])bind(name,openChat);
 const start=write(async()=>{const i=logic.issue();await ws.work(i.uuid||i.id)});bind("startIssue",start);bind("beginRun",start);
 bind("saveSkill",write(async()=>{const s=logic.state;const out=await ws.saveSkill({name:s.skillNameInput,body:s.skillBodyInput},uuid(s.editingSkill)?s.editingSkill:undefined);await hydrate();logic.openSkill(out.skill.id)}));
 bind("saveMemory14",write(async()=>{const s=logic.state;const project=s.liveProjects.find((p:Vals)=>p.name===s.memoryProject14);await ws.saveMemory({body:s.memoryDraft14,...(s.memoryEdit14==="__new"?{scope:s.memoryScope14||"personal",...(s.memoryScope14==="project"?{project_id:project?.id}:{} )}:{})},uuid(s.memoryEdit14)?s.memoryEdit14:undefined);logic.setState({memoryEdit14:null,memoryDraft14:""})}));
 bind("forgetMemory14",(id:string)=>write(async()=>{await ws.deleteMemory(id)})());
 bind("pinMemory14",(id:string)=>write(async()=>{const m=logic.state.memories14.find((m:Vals)=>m.id===id);await ws.saveMemory({pinned:!m?.pinned},id)})());
 bind("revokeInvite14",(id:string)=>write(async()=>{await ws.revokeInvitation(id)})());
 bind("setMemberRole14",(id:string,role:string)=>write(async()=>{await ws.setMemberRole(id,role.toLowerCase())})());
 bind("sendInvites14",write(async()=>{const s=logic.state;const emails=String(s.inviteEmails14||"").split(/[\s,;]+/).filter(Boolean);if(!emails.length)throw new Error("Add an email address");const links=[];for(const email of emails){const invite=await ws.invite(email,String(s.inviteRole14||"member").toLowerCase());links.push(invite.link)}logic.generic("Invitation links","Share each link with the invited person",[],{genericText:links.join("\n")});logic.setState({inviteEmails14:""})}));
 bind("openGraph14",(id:string)=>write(async()=>{const out=await ws.workflow(id);const v=out.versions.find(v=>v.id===out.workflow.active_version_id)||out.versions[0];if(!v)throw new Error("This workflow has no version");const graph={id:out.workflow.id,name:out.workflow.name,version:v.version,nodes:v.graph.nodes.map((n,i)=>({id:n.key,type:n.kind,label:n.name,model:n.model||"Auto",prompt:n.prompt||"",x:n.x??i*220,y:n.y??120})),edges:v.graph.edges.map((e,i)=>({id:"e"+i,from:e[0],to:e[1],label:""}))};logic.setState({view:"settings",section:"workflows",activeWorkflow:id,graph14:graph,graphSaved14:structuredClone(graph),graphVersions14:out.versions.map(v=>({id:v.id,name:"Version "+v.version,meta:v.created_at,state:titleCase(v.status)})),graphId14:id,overlay14:"graph",graphSide14:"node",graphSel14:graph.nodes[0]?.id});routeURL("settings",{section:"workflows",activeWorkflow:id})})());
 bind("saveGraph14",write(async()=>{const g=logic.state.graph14;const graph:WorkflowGraph={nodes:g.nodes.map((n:Vals)=>({key:n.id,name:n.label,kind:n.type,model:n.model==="Auto"?"auto":n.model,prompt:n.prompt||"",x:n.x,y:n.y})),edges:g.edges.map((e:Vals)=>[e.from,e.to])};const out=uuid(g.id)?await ws.saveWorkflow(g.id,graph):await ws.createWorkflow({name:g.name,graph});const id="workflow" in out?out.workflow.id:g.id;await logic.openGraph14(id)}));
 const render=logic.renderVals;
 bind("renderVals",()=>{
  const v=render.call(logic);const s=logic.state;
  v.workspaceName= s.workspace16||"BotInc";v.previewCard15=false;
  const autopilotByTitle=new Map<string,Vals>();for(const autopilot of s.autopilots9||[])autopilotByTitle.set(String(autopilot.title),autopilot);
  const applyLiveSchedule=(rows:Vals[]=[])=>(rows||[]).map((row:Vals)=>{const autopilot=autopilotByTitle.get(row.title);return autopilot?{...row,trigger:autopilot.triggerText||row.trigger,next:autopilot.nextText||row.next,zone:autopilot.zone||row.zone,source:autopilot.source||row.source}:row});
  v.routineRows14=applyLiveSchedule(v.routineRows14);v.upcomingRows14=applyLiveSchedule(v.upcomingRows14);
  const detail=s.liveIssueDetail;const currentIssue=logic.issue();
  v.i8Computer="Remote";v.i8Agent="Operator";
  v.i8HasPr=!!detail?.runs?.some((r:Vals)=>r.result?.pull_request?.url);v.i8HasDeploy=false;v.i8HasCriteria=false;v.i8NoCriteria=true;
  v.i8HasArtifacts=!!s.liveIssueFiles?.length;v.i8NoArtifacts=!v.i8HasArtifacts;
  v.liveIssueFiles=s.liveIssueFiles||[];
  v.commentIssue=(event?:Event)=>{event?.preventDefault();return write(async()=>{const body=String(s.issueComment||"").trim();if(!body)return;await ws.comment(currentIssue.uuid||currentIssue.id,body);logic.setState({issueComment:""})})()};
  const activeRun=detail?.runs?.find((r:Vals)=>!r.finished_at);
  const latestRun=activeRun||detail?.runs?.at(-1);
  const sourceIssue=detail?.issue;
  const issueWorkflow=s.liveIssueWorkflow;
  const workflowVersion=issueWorkflow?.versions?.find((version:Vals)=>version.id===issueWorkflow.workflow.active_version_id)||issueWorkflow?.versions?.[0];
  const migrated=sourceIssue?.source?.kind==="migration";
  const timestamp=(value?:string)=>value?new Date(value).toLocaleString():"Unavailable";
  v.i8Created=timestamp(sourceIssue?.created_at);v.i8Updated=timestamp(sourceIssue?.updated_at);
  v.i8RunState=latestRun?titleCase(latestRun.status):migrated?"Ready to continue":"Ready";v.i8RunTone="";
  v.i8ActionState=sourceIssue?titleCase(sourceIssue.status.replaceAll("_"," ")):"Loading";
  v.i8ActionTitle=latestRun?`Latest run: ${titleCase(latestRun.status)}`:migrated?"Continue this work":"Ready for Operator";
  v.i8ActionCopy=latestRun?.error||(migrated?"This work and its original discussion were imported successfully. Start when you are ready to continue.":"Start work when you are ready.");
  v.i8Model=latestRun?.model||"Not selected";v.i8Funding=latestRun?.funding||"Not charged";
  v.i8Credit=logic.cash((detail?.runs||[]).reduce((sum:number,r:Vals)=>sum+r.cost_cents,0)/100)+" used";
  v.i8FundingWarn=false;v.thinkingLabel=latestRun?.effort||"Not recorded";
  v.i8Owner=currentIssue.owner||"Unassigned";v.i8OwnerInitial=currentIssue.ownerInitial||"?";
  v.i8Reporter=people.get(sourceIssue?.created_by)?.name||"Preserved in source record";
  v.i8PeopleNote="Issue history is shared with workspace members.";
  v.i8NoArtifactCopy=migrated?"No files attached to this imported issue.":"No output files have been recorded.";
  v.i8SourceLabel=migrated?"Imported from v1":currentIssue.source;
  if(issueWorkflow&&workflowVersion){
   const workflowID=String(issueWorkflow.workflow.id);const openIndex=Number(s.liveIssueWorkflowOpen??-1);
   v.issueWorkflow17=issueWorkflow.workflow.name;v.issueWorkflowTitle17=`Uses ${issueWorkflow.workflow.name}. Open it in the editor.`;
   v.wfPaneVersion18=`v${workflowVersion.version}`;v.wfPaneName18=issueWorkflow.workflow.name;v.wfPaneLede18=issueWorkflow.workflow.description||"The active workflow for this issue.";
   v.wfLiveTone18=activeRun?"live18":"";v.wfNowEyebrow18=activeRun?titleCase(activeRun.status):latestRun?titleCase(latestRun.status):"Ready";
   v.wfNowTitle18=activeRun?"Operator is running this workflow":latestRun?`Latest run: ${titleCase(latestRun.status)}`:"Ready to start";
   v.wfNowCopy18=activeRun?"Live progress appears here as each workflow step reports back.":latestRun?.error||"No run is active. The configured steps are ready for the next request.";
   v.wfNowHasAction18=false;v.wfSteps18=mapWorkflowSteps(workflowVersion,openIndex,(index)=>logic.setState({liveIssueWorkflowOpen:index===openIndex?-1:index}));
   v.wfSpend18=`${detail?.runs?.length||0} runs · ${logic.cash((detail?.runs||[]).reduce((sum:number,run:Vals)=>sum+run.cost_cents,0)/100)} used`;
   v.openIssueWorkflow17=()=>{void logic.openGraph14(workflowID)};
  }

  v.i8PrimaryLabel=activeRun?"Cancel run":"Start work";v.i8HasSecondary=false;
  v.i8Primary=write(async()=>{if(activeRun)await ws.cancelRun(activeRun.id);else await ws.work(currentIssue.uuid||currentIssue.id)});
  v.chooseComputer=()=>logic.toast("All work runs on remote computers");
  v.openReceipt=()=>logic.generic("Run usage","Provider-reported usage for this issue",[],{genericText:(detail?.runs||[]).map((r:Vals)=>`${r.purpose}: ${r.status} · ${logic.cash(r.cost_cents/100)}`).join("\n")||"No usage has been charged for this issue."});
  v.runActivity=v.openReceipt;
  v.sourceDetail=()=>logic.generic("Issue source",v.i8SourceLabel,[],{genericText:migrated?"Original issue identifiers and source records are preserved in the migration archive.":currentIssue.url||"Created in this workspace."});
  v.saveI8Title=write(async()=>{const title=String(s.titleDraft||"").trim();if(!title)throw new Error("Enter an issue title");await ws.updateIssue(currentIssue.uuid||currentIssue.id,{title});logic.setState({titleEditing:false})});
  v.confirmCancelIssue=write(async()=>{await ws.updateIssue(currentIssue.uuid||currentIssue.id,{status:"cancelled"});logic.setState({dialog:null})});
  v.topup=()=>logic.open("topup",{paymentError:false});
  v.checkoutNotice=s.paymentsTestMode?"Stripe test checkout. Test payments add staging credit only.":"Secure checkout with Stripe. Credit is added after payment is confirmed.";
  v.checkoutBusy=!!s.checkoutBusy;v.payLabel=s.checkoutBusy?"Opening checkout…":"Continue to Stripe";
  v.payTopup=async()=>{if(s.checkoutBusy)return;logic.setState({checkoutBusy:true});try{if(!s.paymentsEnabled)throw new Error("Payments are not configured for this environment");const out=await api.request<{url:string}>("POST",`/api/w/${ws.slug}/billing/checkout`,{amount_cents:Math.round(Number(s.topupAmount)*100)});window.location.assign(out.url)}catch(err){fail(err);logic.setState({checkoutBusy:false})}};
  const selectedPlugins=(s.livePlugins||[]).filter((p:Vals)=>pluginKey(p.kind)===pluginKey(s.plugin10));
  const isSelectedPluginConnected=selectedPlugins.some((p:Vals)=>p.status==="connected");
  v.liveGitHub=s.plugin10==="GitHub"&&!isSelectedPluginConnected;v.livePluginSecret=s.livePluginSecret||"";v.liveRepoName=s.liveRepoName||"";
  v.customMcp10=()=>logic.setState({dialog:"mcp10",mcpName10:"",mcpUrl10:"",mcpAuth10:"none",mcpReview10:false,mcpError10:""});
  v.mcpSubmitLabel10=s.mcpReview10?"Connect MCP server":"Review connection";
  v.editLivePluginSecret=(e:Event)=>logic.setState({livePluginSecret:(e.target as HTMLInputElement).value});
  v.editLiveRepoName=(e:Event)=>logic.setState({liveRepoName:(e.target as HTMLInputElement).value});
  v.pluginButton10=isSelectedPluginConnected?"Use in a conversation":s.plugin10==="GitHub"?"Save connection":`Connect ${s.plugin10}`;
  v.pluginConnect10=write(async()=>{
   if(isSelectedPluginConnected){const draft=`Use ${s.plugin10} to `;logic.newChat();logic.setState({draft,dialog:null});saveDraft(ws.slug,null,draft);return}
   if(s.plugin10!=="GitHub"){logic.setState({dialog:"mcp10",mcpName10:s.plugin10,mcpUrl10:"",mcpAuth10:"none",mcpReview10:false,mcpError10:""});return}
   if(s.livePluginSecret)await api.request("POST",`/api/w/${ws.slug}/plugins`,{kind:"github",secret:s.livePluginSecret});
   if(s.liveRepoName)await api.request("POST",`/api/w/${ws.slug}/repositories`,{full_name:String(s.liveRepoName).trim()});
   if(!s.livePluginSecret&&!s.liveRepoName)throw new Error("Enter a token or repository name");
   logic.setState({livePluginSecret:"",liveRepoName:"",dialog:null});
  });
  v.pluginDisconnect10=write(async()=>{for(const plugin of selectedPlugins)await api.request("DELETE",`/api/w/${ws.slug}/plugins/${plugin.id}`);logic.setState({dialog:null})});
  v.repoFromGithub16=()=>logic.showPlugin10("GitHub");v.repoConnect14=v.repoFromGithub16;
  const chat=logic.currentChat();
  v.conversationCost10=logic.cash(chat?.cost||0);v.routeCostShort17=v.conversationCost10;
  v.routeLimit17=logic.cash(chat?.taskLimit||0);
  const dockMessages=(s.dockLiveMessages||[]).map((message:Vals)=>{
   const mine=String(message.cls||"").includes("user-message");
   return{...message,cls:mine?"mine":"operator",hasAvatar:!mine,avatar:"/assets/logo/botinc-mark.svg",author:mine?(me.name||me.email||"You"):(message.author||"Operator"),hasAttachments11:!!message.attachments11?.length,isOperator11:!mine,copy11:()=>navigator.clipboard?.writeText(String(message.text||"")),quote11:()=>{const value=String(message.text||"");logic.setState({dockLiveDraft:value});saveLocal(dockDraftKey(ws.slug),value)}};
  });
  const dockRun=s.dockLiveRun;const isDockRunning=s.dockLivePhase==="working"||s.dockLivePhase==="paused";
  v.dockRows15=dockMessages;v.dockNoLog15=!dockMessages.length;
  v.dockRunning15=isDockRunning;v.dockRunCopy15=s.dockLivePhase==="paused"?"Operator is waiting for your input.":"Operator is working. Your next message will be queued safely.";
  v.dockQueued15=false;v.dockQueueRows15=[];
  v.dockDraft15=s.dockLiveDraft||"";v.editDockDraft15=(event:Event)=>{const value=(event.target as HTMLTextAreaElement).value;logic.setState({dockLiveDraft:value});saveLocal(dockDraftKey(ws.slug),value)};
  v.dockEmpty15=!String(s.dockLiveDraft||"").trim()&&!(s.dockAttachmentsLive||[]).length;
  v.dockSend15=(event?:Event)=>{void sendDock(event as Event&{preventDefault:()=>void})};
  v.dockKey15=(event:KeyboardEvent)=>{if(event.key==="Enter"&&!event.shiftKey&&!event.isComposing){event.preventDefault();void sendDock(event)}};
  v.dockSuggestions15=(v.dockSuggestions15||[]).map((item:Vals)=>({...item,ask:()=>{void sendDock(undefined,String(item.label||""))}}));
  v.dockExpand15=()=>{const id=String(s.dockConversationID||"");if(uuid(id))void openChat(id);else{logic.setState({dock15:"closed"});logic.newChat()}};
  v.dockStop15=()=>{if(dockRun?.id)void write(async()=>{await ws.cancelRun(dockRun.id)})()};
  v.dockFoot15="Private conversation in this workspace. Messages, files, and drafts are saved.";
  v.dockSendLabel15=isDockRunning?"Queue this message":"Send message";
  v.dockHasCost19=!!s.dockConversationID;v.conversationCost10=logic.cash(s.dockLiveCost||0);
  v.dockDictate15=()=>logic.toast("Voice dictation is not available in this browser yet.");
  v.accountsNote15="Connected accounts are scoped to this workspace. Secrets are encrypted, and provider usage is reported without converting quota into a dollar amount.";
  v.accountPrivacy14=`${(s.accounts10||[]).length} connected accounts, private to ${me.name||me.email}. Other members cannot see these identities or use their capacity.`;
  v.usageMonthNote19="Current workspace usage from completed runs. No preview or estimated charges are included.";
  v.pfWeeks15=[];v.pfMonths15=[];v.pfStats15=[];v.pfActivitySummary15="Repository activity appears after connected repositories report it.";v.pfFoot15="No repository contribution activity has been reported yet.";
  if(Array.isArray(v.conversationGroups12))v.conversationGroups12=v.conversationGroups12.map((group:Vals)=>({...group,rows:(group.rows||[]).map((row:Vals)=>{
   const id=String(row.id||"");
   if(id.startsWith("chat:")&&uuid(id.slice(5)))return{...row,open:()=>{void openChat(id.slice(5))}};
   if(id.startsWith("issue:")){const issue=id.slice(6);return{...row,open:()=>{logic.setState({activeIssue:issue,view:"thread9",issueComment:"",liveIssueDetail:null,liveIssueFiles:[]});routeURL("thread9",{activeIssue:issue});void hydrate().catch(fail)}}}
   return row;
  })}));
  for(const key of ["sendMessage","sendComposer10","sendComposer11","sendThreadMessage9"])v[key]=send;
  v.editComposer10=(event:Event)=>{const value=(event.target as HTMLTextAreaElement).value;logic.setState({draft:value});saveDraft(ws.slug,s.activeChat,value)};
  v.composerKey12=(event:KeyboardEvent)=>{if(event.key==="Enter"&&!event.shiftKey&&!event.isComposing){event.preventDefault();void send(event)}};
  const addFiles=(files:File[],target:"main"|"dock"=fileTarget)=>{const stateKey=target==="dock"?"dockAttachmentsLive":"attachments11";const rows=files.filter(file=>file.size<=64*1024*1024).map(file=>{const id=`upload-${Date.now()}-${crypto.randomUUID()}`;pendingFiles.set(id,file);return{id,name:file.webkitRelativePath||file.name,image:file.type.startsWith("image/"),url:file.type.startsWith("image/")?URL.createObjectURL(file):"",size:file.size,meta:`${Math.max(1,Math.ceil(file.size/1024))} KB · ${file.type.startsWith("image/")?"Image":"File"}`,remove:()=>{pendingFiles.delete(id);logic.setState({[stateKey]:(logic.state[stateKey]||[]).filter((a:Vals)=>a.id!==id)})}}});if(rows.length!==files.length)logic.setState({composerError10:"Choose files smaller than 64 MB."});if(rows.length)logic.setState({[stateKey]:[...(logic.state[stateKey]||[]),...rows],composerError10:""})};
  const changed=(event:Event)=>{const input=event.target as HTMLInputElement;addFiles(Array.from(input.files||[]),fileTarget);input.value="";fileTarget="main"};
  v.filesChanged11=changed;v.filesChanged15=changed;
  v.composerPaste=(event:ClipboardEvent)=>{const files=Array.from(event.clipboardData?.items||[]).filter(item=>item.kind==="file").map(item=>item.getAsFile()).filter((file):file is File=>!!file);if(files.length){event.preventDefault();addFiles(files)}};
  v.dockPaste=(event:ClipboardEvent)=>{const files=Array.from(event.clipboardData?.items||[]).filter(item=>item.kind==="file").map(item=>item.getAsFile()).filter((file):file is File=>!!file);if(files.length){event.preventDefault();addFiles(files,"dock")}};
  v.dockHasAttach15=!!(s.dockAttachmentsLive||[]).length;
  v.dockAttachRows19=(s.dockAttachmentsLive||[]).map((item:Vals)=>({...item,removeLabel:`Remove ${item.name}`,open:()=>{}}));
  v.dockPlusMenu15=(event:Event)=>logic.openMenu14(null,event,[{label:"Attach files",icon:"paperclip",run:()=>{fileTarget="dock";document.getElementById("attachments11")?.click()}},{label:"Use this page as context",icon:"layout-dashboard",on:true,run:()=>{}}],"Add to message");
  v.context11=(event:Event)=>{fileTarget="main";logic.plusMenu15(event,"main")};
  v.createIssue=write(async()=>{const title=String(s.newIssueTitle||"").trim();if(!title)throw new Error("Give the issue a title");const out=await ws.createIssue({title,description:s.newIssueDescription,priority:String(s.newIssuePriority||"normal").toLowerCase().replace(" priority","")});await hydrate();logic.openIssue(out.issue.identifier);logic.setState({dialog:null})});
  v.pauseChat=write(async()=>{const c=logic.currentChat();if(c?.runId)await ws.cancelRun(c.runId)});
  v.signOut=write(async()=>{await api.logout();window.location.assign("/")});
  v.saveSkill=logic.saveSkill;v.saveMemory14=logic.saveMemory14;v.sendInvites14=logic.sendInvites14;
  // No demo recovery codes, invented sessions, or locally generated API keys.
  v.akCreate19=write(async()=>{const out=await api.request<{token:string}>("POST","/api/me/keys",{name:"Workspace key"});logic.setState({sec19:{...s.sec19,newKey:{secret:out.token}}})});
  v.addNeedsKey=true;v.addTrue=false;v.addKeySample=s.liveAccountSecret||"";
  v.editLiveAccountSecret=(e:Event)=>logic.setState({liveAccountSecret:(e.target as HTMLInputElement).value});
  v.addMethods15=(v.addMethods15||[]).filter((m:Vals)=>/api/i.test(m.title));
  v.addStartLabel="Save account";
  v.addStart=write(async()=>{
   if(!["claude","codex","openrouter"].includes(s.addProvider))throw new Error("This provider is not available for remote runs");
   const secret=String(s.liveAccountSecret||"").trim();if(!secret)throw new Error("Enter the provider API key");
   await api.request("POST",`/api/w/${ws.slug}/accounts`,{provider:s.addProvider,kind:"api_key",label:s.addLabel||s.addProvider,secret});
   logic.setState({liveAccountSecret:"",dialog:null});
  });
  v.devSummary19=`${(s.sec19?.sessions||[]).length} active sessions`;
  v.devRows19=(v.devRows19||[]).map((d:Vals)=>({...d,out:write(async()=>{await api.request("DELETE","/api/me/sessions/"+d.id)})}));
  v.devOutAll19=write(async()=>{for(const d of s.sec19.sessions){if(!d.current)await api.request("DELETE","/api/me/sessions/"+d.id)}});
  v.akRows19=(v.akRows19||[]).map((k:Vals)=>({
   ...k,
   revoke:write(async()=>{await api.request("DELETE","/api/me/keys/"+k.id)}),
   scopePick:(e:Event)=>logic.openMenu14(null,e,["Read only","Full access"].map(scope=>({
    label:scope,on:k.scope===scope,
    run:write(async()=>{await api.request("PATCH","/api/me/keys/"+k.id,{scopes:scope==="Full access"?["read","write"]:["read"]})})
   })),"What this key may do")
  }));
  return v;
 });
 logic.forceUpdate?.();
 const popRoute=()=>{const route=parseWorkspaceRoute(new URL(window.location.href));if(route.workspace!==ws.slug){window.location.reload();return}if(route.conversation){logic.setState({view:"chat",activeChat:route.conversation,draft:readDraft(ws.slug,route.conversation)});void hydrate().catch(fail)}else if(route.issue){logic.setState({view:route.view==="thread9"?"thread9":"issue",activeIssue:route.issue});void hydrate().catch(fail)}else{logic.setState({view:route.view,...route.view==="chat"?{activeChat:null,draft:readDraft(ws.slug,null)}:{},...route.autopilot?{activeAuto9:route.autopilot}:{},...route.section?{section:route.section}:{}});if(route.workflow&&typeof logic.openGraph14==="function")void logic.openGraph14(route.workflow)}};
 window.addEventListener("popstate",popRoute);
 return()=>{disposed=true;window.removeEventListener("popstate",popRoute);for(const[k,v]of originals){if(v===undefined)delete logic[k];else logic[k]=v}};
}
export {mapIssue,mapConversation,mapAutopilot,mapAccount,mapRun};
