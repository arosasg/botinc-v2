"use client";

// The design is a presentation adapter. All durable state and writes come
// from the API; fixtures remain available only when no API is configured.
import { useEffect, useRef } from "react";
import { Client, type User, type WorkspaceClient, type WorkflowGraph } from "@botinc/api";
import type { Vals } from "../vals";
import { mapAccount, mapAutopilot, mapConversation, mapIssue, mapRun, type PeopleIndex } from "./map";

export type LiveStatus = "off" | "connecting" | "live" | "signed-out" | "error";
export type Logic = Vals & { state: Vals; setState: (patch: Vals) => void; renderVals: () => Vals };
declare global { interface Window { __BOTINC__?: { apiURL?: string } } }
export function apiBaseURL(): string { return typeof window === "undefined" ? "" : (window.__BOTINC__?.apiURL ?? "").trim(); }
const titleCase = (s: string) => s ? s[0]!.toUpperCase() + s.slice(1) : "";
const uuid = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(s);
const phaseFor = (s?: string) => s && ["queued", "provisioning", "running"].includes(s) ? "working" : s === "waiting" ? "paused" : "done";

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
   const {workspaces}=await api.workspaces(abort.signal);const selected=new URLSearchParams(window.location.search).get("workspace");const first=workspaces.find(w=>w.slug===selected)||workspaces[0];if(!first)throw new Error("This account has no workspace");
   const ws=api.workspace(first.slug);const people:PeopleIndex=new Map();const member=me.name.trim()||me.email.split("@")[0]||"You";
   let refreshing=false,again=false;
   const hydrate=async()=>{
    if(!alive)return;if(refreshing){again=true;return;}refreshing=true;
    try{
     const [issues,chats,autos,accounts,overview,members,skills,memories,credits,plugins,repos,projects,workflows,invites,sessions,keys]=await Promise.all([
      ws.issues(undefined,abort.signal),ws.conversations(abort.signal),ws.autopilots(abort.signal),ws.accounts(abort.signal),ws.overview(abort.signal),ws.members(abort.signal),ws.skills(abort.signal),ws.memories(abort.signal),ws.credits(abort.signal),ws.plugins(abort.signal),ws.repositories(abort.signal),ws.projects(abort.signal),ws.workflows(abort.signal),ws.invitations(abort.signal),api.request<{sessions:Vals[]}>("GET","/api/me/sessions",undefined,abort.signal),api.request<{keys:Vals[]}>("GET","/api/me/keys",undefined,abort.signal),
     ]);
     if(!alive)return;
     for(const p of members.members)people.set(p.user_id,{name:p.name,email:p.email});
     const previous=String(logic.state.member??"");const patch:Vals={};
     // Empty defaults replace every persona-keyed fixture before changing the key.
     for(const k of ["connections","agentPrefs","funding","memoryByMember","skillGrants","modelAccounts","preferencesBy10","fallbackPolicies10"]){patch[k]={[member]:{}};}
     patch.liveWorkspaces=workspaces;patch.workspace16=overview.workspace.name;patch.member=member;patch.signed=true;patch.workspaceName=overview.workspace.name;
     patch.issues=issues.issues.map(i=>mapIssue(i,people));
     const selectedIssue=issues.issues.find(i=>i.identifier===logic.state.activeIssue||i.id===logic.state.activeIssue);
     if(selectedIssue){const detail=await ws.issue(selectedIssue.id,abort.signal);const files=await api.request<{attachments:Vals[]}>("GET",`/api/w/${ws.slug}/attachments?issue=${selectedIssue.id}`,undefined,abort.signal);patch.liveIssueDetail=detail;patch.liveIssueFiles=files.attachments;patch.issues=patch.issues.map((i:Vals)=>i.uuid===selectedIssue.id?{...i,events:detail.comments.map(c=>({who:people.get(c.author_user_id||"")?.name||"Previous agent",role:c.author_kind,when:new Date(c.created_at).toLocaleString(),text:c.body})),cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100}:i)}
     const oldChats=logic.state.chats?.[previous]||[];
     patch.chats={[member]:chats.conversations.map(c=>{
      const old=oldChats.find((x:Vals)=>x.id===c.id);return {...mapConversation(c,[],me,people),messages:old?.messages||[],phase:old?.phase||"done"};
     })};
     const active=String(logic.state.activeChat||"");
     if(active&&chats.conversations.some(c=>c.id===active)){
      const detail=await ws.conversation(active,abort.signal);if(!alive)return;
      const run=detail.runs.at(-1);const phase=phaseFor(run?.status);
      patch.chats[member]=patch.chats[member].map((c:Vals)=>c.id===active?{...mapConversation(detail.conversation,detail.messages,me,people),phase,runId:run?.id,runError:run?.error||"",cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100,taskLimit:(run?.task_limit_cents||0)/100}:c);
      patch.phase=phase;
      if(run?.error)patch.error=run.error;
     }
     patch.autopilots9=autos.autopilots.map(a=>({...mapAutopilot(a),owner:member,kind:a.trigger.kind,status:a.enabled?"active":"paused",history:[],limit:2,daily:20}));
     patch.accounts10=accounts.accounts.map(mapAccount);patch.modelAccounts={[member]:patch.accounts10};
     patch.connections={[member]:Object.fromEntries(plugins.plugins.map(p=>[p.kind,p.status==="connected"]))};
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
     logic.setState(patch);if(previous!==member){logic.newChat();const conversation=new URLSearchParams(window.location.search).get("conversation");if(conversation&&chats.conversations.some(c=>c.id===conversation)){logic.setState({activeChat:conversation,view:"chat"});again=true}}hydrated=true;report("live");
    }finally{refreshing=false;if(again&&alive){again=false;void hydrate().catch(fail)}}
   };
   restore=installActions(logic,ws,api,me,people,hydrate,fail);
   await hydrate();if(!alive)return;
   disconnect=ws.connect(e=>{if(e.type==="hello")return;if(timer)clearTimeout(timer);timer=setTimeout(()=>{void hydrate().catch(fail)},100)},up=>{if(up)void hydrate().catch(fail)});
  })().catch(err=>{if(err?.status===401)report("signed-out");else fail(err)});
  return()=>{alive=false;abort.abort();if(timer)clearTimeout(timer);disconnect?.();restore?.()};
 },[logic]);
}

// Kept outside React so adapter behavior can be tested against real API calls.
export function installActions(logic:Logic,ws:WorkspaceClient,api:Client,me:User,people:PeopleIndex,hydrate:()=>Promise<void>,fail:(err:unknown)=>void){
 const originals=new Map<string,unknown>();let disposed=false;
 const bind=(name:string,fn:unknown)=>{if(!originals.has(name))originals.set(name,logic[name]);logic[name]=fn};
 const write=(fn:()=>Promise<void>)=>async()=>{if(disposed)return;try{await fn();if(!disposed)await hydrate()}catch(err){if(!disposed)fail(err)}};
 let sending=false;
 const send=async(e?:{preventDefault:()=>void})=>{
  e?.preventDefault();if(sending||disposed)return;const draft=String(logic.state.draft||"").trim();if(!draft)return;sending=true;
  try{
   const active=logic.state.activeChat;
   if(uuid(active)){await ws.sendMessage(active,draft)}else{const out=await ws.createConversation({message:draft});if(disposed)return;logic.setState({activeChat:out.conversation.id,view:"chat"})}
   if(!disposed){logic.setState({draft:""});await hydrate()}
  }catch(err){if(!disposed)fail(err)}finally{sending=false}
 };
 bind("send",send);
 bind("openIssue",(id:string)=>{logic.go("issue",{activeIssue:id,issueComment:"",liveIssueDetail:null,liveIssueFiles:[]});void hydrate().catch(fail)});
 bind("issue",()=>logic.state.issues.find((i:Vals)=>i.id===logic.state.activeIssue||i.uuid===logic.state.activeIssue)||{id:"",title:"Select an issue",description:"",status:"Incoming",events:[]});
 // The prototype has several generations of composer handlers. All route here.
 for(const name of ["sendComposer10","sendComposer11","sendThreadMessage9"])bind(name,send);
 bind("workspaceMenu16",(event:Event)=>logic.openMenu14(null,event,[...(logic.state.liveWorkspaces||[]).map((w:Vals)=>({label:w.name,hint:w.role,on:w.slug===ws.slug,run:()=>window.location.assign("/w?workspace="+encodeURIComponent(w.slug))})),{label:"New workspace",run:()=>logic.newWorkspace16()}],"Workspaces"));
 bind("createWorkspace16",write(async()=>{const name=String(logic.state.nwName16||"").trim();if(!name)throw new Error("Enter a workspace name");const created=await api.request<{slug:string}>("POST","/api/workspaces",{name});window.location.assign("/w?workspace="+encodeURIComponent(created.slug))}));
 bind("commitRename16",write(async()=>{const s=logic.state;const title=String(s.renameDraft16||"").trim();if(!title)throw new Error("Enter a name");if(uuid(s.renameId16))await ws.updateConversation(s.renameId16,{title});else await api.request("PATCH",`/api/w/${ws.slug}/issues/${s.renameId16}`,{title});logic.setState({renameId16:null})}));
 bind("archiveRow16",(id:string)=>write(async()=>{if(!uuid(id))throw new Error("Open the issue to change its status");await ws.updateConversation(id,{archived:true});if(logic.state.activeChat===id)logic.newChat()})());
 bind("shareRow16",(row:Vals)=>write(async()=>{if(!uuid(row.id))throw new Error("Open the issue to share its record");await ws.updateConversation(row.id,{shared:true});const url=new URL("/w",window.location.origin);url.searchParams.set("workspace",ws.slug);url.searchParams.set("conversation",row.id);await navigator.clipboard.writeText(url.toString());logic.toast("Workspace link copied")})());
 bind("pluginConnected10",(name:string)=>(logic.state.livePlugins||[]).some((p:Vals)=>p.kind===name.toLowerCase()&&p.status==="connected"));
 bind("connect",(name:string)=>logic.showPlugin10(name));
 bind("finishChat",()=>{});bind("skillFixture16",()=>[]);
 const repo=logic.repo14;
 bind("repo14",()=>repo.call(logic)||{id:"",name:"No repository connected",connected:false,meta:"Add a repository to start coding work",branch:"",state:"Not connected",tone:""});
 const openChat=async(id:string)=>{logic.setState({activeChat:id,view:"chat",dialog:null,draft:""});try{await hydrate()}catch(e){fail(e)}};
 for(const name of ["loadChat","loadChat9","loadChat10"])bind(name,openChat);
 const start=write(async()=>{const i=logic.issue();await ws.work(i.uuid||i.id)});bind("startIssue",start);bind("beginRun",start);
 bind("saveSkill",write(async()=>{const s=logic.state;const out=await ws.saveSkill({name:s.skillNameInput,body:s.skillBodyInput},uuid(s.editingSkill)?s.editingSkill:undefined);await hydrate();logic.openSkill(out.skill.id)}));
 bind("saveMemory14",write(async()=>{const s=logic.state;const project=s.liveProjects.find((p:Vals)=>p.name===s.memoryProject14);await ws.saveMemory({body:s.memoryDraft14,...(s.memoryEdit14==="__new"?{scope:s.memoryScope14||"personal",...(s.memoryScope14==="project"?{project_id:project?.id}:{} )}:{})},uuid(s.memoryEdit14)?s.memoryEdit14:undefined);logic.setState({memoryEdit14:null,memoryDraft14:""})}));
 bind("forgetMemory14",(id:string)=>write(async()=>{await ws.deleteMemory(id)})());
 bind("pinMemory14",(id:string)=>write(async()=>{const m=logic.state.memories14.find((m:Vals)=>m.id===id);await ws.saveMemory({pinned:!m?.pinned},id)})());
 bind("revokeInvite14",(id:string)=>write(async()=>{await ws.revokeInvitation(id)})());
 bind("setMemberRole14",(id:string,role:string)=>write(async()=>{await ws.setMemberRole(id,role.toLowerCase())})());
 bind("sendInvites14",write(async()=>{const s=logic.state;const emails=String(s.inviteEmails14||"").split(/[\s,;]+/).filter(Boolean);if(!emails.length)throw new Error("Add an email address");const links=[];for(const email of emails){const invite=await ws.invite(email,String(s.inviteRole14||"member").toLowerCase());links.push(invite.link)}logic.generic("Invitation links","Share each link with the invited person",[],{genericText:links.join("\n")});logic.setState({inviteEmails14:""})}));
 bind("openGraph14",(id:string)=>write(async()=>{const out=await ws.workflow(id);const v=out.versions.find(v=>v.id===out.workflow.active_version_id)||out.versions[0];if(!v)throw new Error("This workflow has no version");const graph={id:out.workflow.id,name:out.workflow.name,version:v.version,nodes:v.graph.nodes.map((n,i)=>({id:n.key,type:n.kind,label:n.name,model:n.model||"Auto",prompt:n.prompt||"",x:n.x??i*220,y:n.y??120})),edges:v.graph.edges.map((e,i)=>({id:"e"+i,from:e[0],to:e[1],label:""}))};logic.setState({graph14:graph,graphSaved14:structuredClone(graph),graphVersions14:out.versions.map(v=>({id:v.id,name:"Version "+v.version,meta:v.created_at,state:titleCase(v.status)})),graphId14:id,overlay14:"graph",graphSide14:"node",graphSel14:graph.nodes[0]?.id})})());
 bind("saveGraph14",write(async()=>{const g=logic.state.graph14;const graph:WorkflowGraph={nodes:g.nodes.map((n:Vals)=>({key:n.id,name:n.label,kind:n.type,model:n.model==="Auto"?"auto":n.model,prompt:n.prompt||"",x:n.x,y:n.y})),edges:g.edges.map((e:Vals)=>[e.from,e.to])};const out=uuid(g.id)?await ws.saveWorkflow(g.id,graph):await ws.createWorkflow({name:g.name,graph});const id="workflow" in out?out.workflow.id:g.id;await logic.openGraph14(id)}));
 const render=logic.renderVals;
 bind("renderVals",()=>{
  const v=render.call(logic);const s=logic.state;
  v.workspaceName= s.workspace16||"BotInc";v.previewCard15=false;
  const detail=s.liveIssueDetail;const currentIssue=logic.issue();
  v.i8Computer="Remote";v.i8Agent="Operator";
  v.i8HasPr=!!detail?.runs?.some((r:Vals)=>r.result?.pull_request?.url);v.i8HasDeploy=false;v.i8HasCriteria=false;v.i8NoCriteria=true;
  v.i8HasArtifacts=!!s.liveIssueFiles?.length;v.i8NoArtifacts=!v.i8HasArtifacts;
  v.liveIssueFiles=s.liveIssueFiles||[];
  v.commentIssue=(event?:Event)=>{event?.preventDefault();return write(async()=>{const body=String(s.issueComment||"").trim();if(!body)return;await ws.comment(currentIssue.uuid||currentIssue.id,body);logic.setState({issueComment:""})})()};
  const activeRun=detail?.runs?.find((r:Vals)=>!r.finished_at);
  v.i8PrimaryLabel=activeRun?"Cancel run":"Start work";v.i8HasSecondary=false;
  v.i8Primary=write(async()=>{if(activeRun)await ws.cancelRun(activeRun.id);else await ws.work(currentIssue.uuid||currentIssue.id)});
  v.chooseComputer=()=>logic.toast("All work runs on remote computers");
  v.openReceipt=()=>logic.generic("Run usage","Provider-reported usage for this issue",[],{genericText:(detail?.runs||[]).map((r:Vals)=>`${r.purpose}: ${r.status} · ${logic.cash(r.cost_cents/100)}`).join("\n")||"No v2 usage has been charged for this issue. Historical execution records are preserved in the migration archive."});
  v.saveI8Title=write(async()=>{const title=String(s.titleDraft||"").trim();if(!title)throw new Error("Enter an issue title");await ws.updateIssue(currentIssue.uuid||currentIssue.id,{title});logic.setState({titleEditing:false})});
  v.confirmCancelIssue=write(async()=>{await ws.updateIssue(currentIssue.uuid||currentIssue.id,{status:"cancelled"});logic.setState({dialog:null})});
  v.topup=()=>logic.open("topup",{paymentError:false});
  v.checkoutNotice=s.paymentsTestMode?"Stripe test checkout. Test payments add staging credit only.":"Secure checkout with Stripe. Credit is added after payment is confirmed.";
  v.checkoutBusy=!!s.checkoutBusy;v.payLabel=s.checkoutBusy?"Opening checkout…":"Continue to Stripe";
  v.payTopup=async()=>{if(s.checkoutBusy)return;logic.setState({checkoutBusy:true});try{if(!s.paymentsEnabled)throw new Error("Payments are not configured for this environment");const out=await api.request<{url:string}>("POST",`/api/w/${ws.slug}/billing/checkout`,{amount_cents:Math.round(Number(s.topupAmount)*100)});window.location.assign(out.url)}catch(err){fail(err);logic.setState({checkoutBusy:false})}};
  v.liveGitHub=s.plugin10==="GitHub";v.livePluginSecret=s.livePluginSecret||"";v.liveRepoName=s.liveRepoName||"";
  v.editLivePluginSecret=(e:Event)=>logic.setState({livePluginSecret:(e.target as HTMLInputElement).value});
  v.editLiveRepoName=(e:Event)=>logic.setState({liveRepoName:(e.target as HTMLInputElement).value});
  v.pluginButton10="Save connection";
  v.pluginConnect10=write(async()=>{
   if(s.plugin10!=="GitHub")throw new Error("This plugin still requires its provider integration");
   if(s.livePluginSecret)await api.request("POST",`/api/w/${ws.slug}/plugins`,{kind:"github",secret:s.livePluginSecret});
   if(s.liveRepoName)await api.request("POST",`/api/w/${ws.slug}/repositories`,{full_name:String(s.liveRepoName).trim()});
   if(!s.livePluginSecret&&!s.liveRepoName)throw new Error("Enter a token or repository name");
   logic.setState({livePluginSecret:"",liveRepoName:"",dialog:null});
  });
  v.pluginDisconnect10=write(async()=>{const p=s.livePlugins.find((p:Vals)=>p.kind===String(s.plugin10).toLowerCase());if(p)await api.request("DELETE",`/api/w/${ws.slug}/plugins/${p.id}`);logic.setState({dialog:null})});
  v.repoFromGithub16=()=>logic.showPlugin10("GitHub");v.repoConnect14=v.repoFromGithub16;
  const chat=logic.currentChat();
  v.conversationCost10=logic.cash(chat?.cost||0);v.routeCostShort17=v.conversationCost10;
  v.routeLimit17=logic.cash(chat?.taskLimit||0);
  for(const key of ["sendMessage","sendComposer10","sendComposer11","sendThreadMessage9"])v[key]=send;
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
 return()=>{disposed=true;for(const[k,v]of originals){if(v===undefined)delete logic[k];else logic[k]=v}};
}
export {mapIssue,mapConversation,mapAutopilot,mapAccount,mapRun};
