"use client";

// The design is a presentation adapter. All durable state and writes come
// from the API; fixtures remain available only when no API is configured.
import { useEffect, useRef } from "react";
import { Client, type Account, type User, type WorkspaceClient, type WorkflowGraph } from "@botinc/api";
import type { Vals } from "../vals";
import { bindingWindowFields, clampConversationPaneWidth, conversationPaneBounds, formatUsageReset, normalizePublicAssets, resetDayLabel, usageRingStyleFromCapacity } from "./layout";
import { dayLabel, mapAccount, mapAutopilot, mapConversation, mapIssue, mapIssueTimeline, mapMessage, mapRun, mapWorkflowSteps, whenLabel, type PeopleIndex } from "./map";
import { parseWorkspaceRoute, workspacePath, type WorkspaceRoute } from "./routes";
import { installPerformanceGuards } from "./perf";

export type LiveStatus = "off" | "connecting" | "live" | "signed-out" | "error";
export type Logic = Vals & { state: Vals; setState: (patch: Vals) => void; renderVals: () => Vals };
declare global { interface Window { __BOTINC__?: { apiURL?: string } } }
export function apiBaseURL(): string { return typeof window === "undefined" ? "" : (window.__BOTINC__?.apiURL ?? "").trim(); }
const titleCase = (s: string) => s ? s[0]!.toUpperCase() + s.slice(1) : "";
const pluginKey = (s: unknown) => String(s??"").toLowerCase().replace(/^mcp:/,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
/* The design keys its brand marks (brands12) and plugin catalog (pluginCatalogV10) by canonical
   product names - "GitHub", "PostHog", "Google Drive" - while connector kinds arrive as slugs
   ("mcp:github"). A plain title-case of the slug ("Github") misses the brand mark and the
   catalog entry, so resolve the canonical name first, then the name the member gave the
   server, and only then a readable form of the slug. */
const connectorCatalogNames = ["GitHub","Linear","Slack","Gmail","Google Drive","Notion","Claude Design","Figma","Sentry","Google Calendar","Jira","Confluence","GitLab","Bitbucket","Discord","Microsoft Teams","Dropbox","OneDrive","Airtable","PostHog"];
const connectorNameByKey = new Map(connectorCatalogNames.map(name=>[pluginKey(name),name] as const));
// Linear is the one catalog entry the design hides (pluginCatalog10 filters it out), so a
// Linear connector still lists as a custom plugin.
const catalogPluginKeys = new Set([...connectorNameByKey.keys()].filter(key=>key!=="linear"));
export function connectorDisplayName(plugin: { kind?: unknown; account?: unknown }): string {
 const key=pluginKey(plugin.kind);
 const catalog=connectorNameByKey.get(key);if(catalog)return catalog;
 const account=String((plugin.account as Vals|undefined)?.name??"").trim();if(account)return account;
 return key.split("-").filter(Boolean).map(titleCase).join(" ");
}
const uuid = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(s);
const phaseFor = (s?: string) => s && ["queued", "provisioning", "running"].includes(s) ? "working" : s === "waiting" ? "paused" : "done";
export function liveConnectedConnectorNames(plugins: Vals[] = []): string[] {
 return plugins.filter(plugin=>plugin.status==="connected"&&String(plugin.kind||"").startsWith("mcp:")).map(connectorDisplayName);
}
/* The welcome strip has room for four marks; lead with the connectors the design has a brand
   mark for so a workspace with many custom servers still shows GitHub, Slack and Gmail there. */
export function liveFeaturedConnectorNames(plugins: Vals[] = [], limit = 4): string[] {
 const names=liveConnectedConnectorNames(plugins);
 return [...names.filter(name=>connectorNameByKey.has(pluginKey(name))),...names.filter(name=>!connectorNameByKey.has(pluginKey(name)))].slice(0,limit);
}
export function liveRoutineConnectorNames(autopilot: Vals | undefined, plugins: Vals[] = []): string[] {
 const selected=new Set(Array.isArray(autopilot?.pluginIds)?autopilot.pluginIds:[]);
 return plugins.filter(plugin=>selected.has(plugin.id)&&plugin.status==="connected").map(connectorDisplayName);
}
export function runFailurePatch(run?: { status?: string; error?: string }): Vals {
 const error=run?.status==="failed"?String(run.error||"").trim():"";
 return{composerError10:error?`Run failed: ${error}`:""};
}
export function conversationRoutingPatch(member: string, conversation?: { model?: string }, run?: { model?: string; effort?: string; funding?: string }): Vals {
 const rawModel=String(run?.model||conversation?.model||"auto").trim();
 const model=rawModel.toLowerCase()==="auto"?"Auto":rawModel;
 const effort=String(run?.effort||"").trim();
 const funding=run?.funding?run.funding==="credits"?"credits":"subscription":"";
 return{model,...effort?{reasoning:effort}:{},...funding?{funding:{[member]:funding}}:{}};
}
export function accountHydrationPatch(member: string, accounts: Account[]): Vals {
 const rows=accounts.map(mapAccount);
 return{accounts10:rows,modelAccounts:{[member]:rows}};
}
export function lastReportedProviderRing(group: Vals, accounts: Vals[]): Vals {
 if(String(group.index14||"")!=="n/a")return group;
 const capacity=accounts.filter(account=>account.provider===group.id).map(account=>{
  const windows=Array.isArray(account.limits)?account.limits:[];
  if(!windows.length)return null;
  return Math.min(...windows.map((window:Vals)=>Math.max(0,Math.min(100,100-Number(window.percent||0)))));
 }).filter((left):left is number=>left!==null&&Number.isFinite(left));
 if(!capacity.length)return{...group,indexTone14:"muted14 no-report14"};
 const left=Math.round(capacity.reduce((sum,value)=>sum+value,0)/capacity.length);
 return{
  ...group,
  index14:`${left}%`,
  indexTone14:"muted14 reported14",
  ringStyle14:usageRingStyleFromCapacity(left),
  usedLabel19:`${100-left}% used`,
  aria14:`${group.name} - last reported average capacity left ${left}% across ${capacity.length} account${capacity.length===1?"":"s"}`,
 };
}
export function issueThinkingLabel(view: unknown, current: unknown, run?: { effort?: string }): string {
 if(view!=="issue"&&view!=="thread9")return String(current||"Not recorded");
 return String(run?.effort||"Not recorded");
}
export function normalizeScheduleSourceLogo(row: Vals): Vals {
 return {...row,hasSourceLogo:Boolean(String(row.sourceLogo||"").trim())};
}
const draftKey = (workspace: string, conversation?: unknown) => `botinc:draft:v2:${workspace}:${uuid(conversation) ? conversation : "new"}`;
const dockConversationKey = (workspace: string) => `botinc:dock-conversation:v2:${workspace}`;
const dockDraftKey = (workspace: string) => `botinc:dock-draft:v2:${workspace}`;
export function threadInspectorPatch(isDesktop: boolean): Vals {
 return isDesktop
  ?{inspector10:true,mobileInspector10:false,inspectorTab10:"issue",paneWidth11:400,paneRestore11:400}
  :{inspector10:false,mobileInspector10:false};
}
export function livePersonaDefaults(member: string, funding: string = "credits"): Vals {
 return {
  chats:{[member]:[]},
  connections:{[member]:{}},
  agentPrefs:{[member]:{}},
  funding:{[member]:funding},
  memoryByMember:{[member]:{}},
  skillGrants:{[member]:{}},
  modelAccounts:{[member]:[]},
  preferencesBy10:{[member]:""},
  fallbackPolicies10:{[member]:"ask"},
 };
}
export function hydrationIssueKey(activeIssue: unknown, routeIssue: string | undefined, hydrated: boolean): unknown {
 return !hydrated&&routeIssue?routeIssue:activeIssue;
}
export function readDraft(workspace: string, conversation?: unknown): string {
 try{return window.localStorage.getItem(draftKey(workspace,conversation))||""}catch{return ""}
}
export function saveDraft(workspace: string, conversation: unknown, value: string): void {
 try{if(value)window.localStorage.setItem(draftKey(workspace,conversation),value);else window.localStorage.removeItem(draftKey(workspace,conversation))}catch{}
}
export function openNewChatWithDraft(logic: Pick<Logic,"state"|"setState">, workspace: string, open: () => void): void {
 const member=String(logic.state.member||"");
 const routing={model:logic.state.model,reasoning:logic.state.reasoning,funding:logic.state.funding?.[member]};
 open();
 logic.setState({draft:readDraft(workspace,null),model:routing.model,reasoning:routing.reasoning,funding:{...logic.state.funding,[member]:routing.funding}});
}
export function routineTrigger(draft: Vals): Record<string, string> {
 const kind=String(draft.kind||"manual");
 if(kind!=="schedule")return{kind:kind==="api"?"manual":kind,...draft.source?{source:String(draft.source)}:{}};
 const zone=String(draft.zone||draft.tz||"UTC");const existing=String(draft.cron||"");const cadence=String(draft.cadence||"daily");
 if(existing&&!['daily','weekdays','weekly'].includes(cadence))return{kind:"schedule",cron:existing,tz:zone,...draft.source?{source:String(draft.source)}:{}};
 const match=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(draft.time||""));if(!match)throw new Error("Choose a valid schedule time");
 const tail=cadence==="weekdays"?"* * 1-5":cadence==="weekly"?"* * 1":"* * *";
 return{kind:"schedule",cron:`${Number(match[2])} ${Number(match[1])} ${tail}`,tz:zone,...draft.source?{source:String(draft.source)}:{}};
}
function readLocal(key: string): string { try{return window.localStorage.getItem(key)||""}catch{return ""} }
function saveLocal(key: string, value: string): void { try{if(value)window.localStorage.setItem(key,value);else window.localStorage.removeItem(key)}catch{} }

export function useLiveWorkspace(logic: Logic | null, onStatus?: (s: LiveStatus, detail?: string) => void) {
 const statusRef = useRef(onStatus);
 useEffect(()=>{statusRef.current=onStatus},[onStatus]);
 useEffect(() => {
  const baseURL=apiBaseURL(); if(!logic||!baseURL){statusRef.current?.("off");return;}
  let hydrated=false;let alive=true; const abort=new AbortController(); let disconnect:(()=>void)|undefined; let restore:(()=>void)|undefined; let timer:ReturnType<typeof setTimeout>|undefined;let hasConnected=false;
  const report=(s:LiveStatus,detail?:string)=>{if(alive)statusRef.current?.(s,detail)};
  report("connecting");
  const fail=(err:unknown)=>{if(!alive)return;const text=err instanceof Error?err.message:String(err);logic.setState({error:text});if(!hydrated)report("error",text)};
  const api=new Client({baseURL,onUnauthenticated:()=>report("signed-out")});
  void (async()=>{
   const me=(await api.me(abort.signal)).user;
   const initialRoute=parseWorkspaceRoute(new URL(window.location.href));
   const {workspaces}=await api.workspaces(abort.signal);const first=workspaces.find(w=>w.slug===initialRoute.workspace||w.aliases?.includes(initialRoute.workspace))||workspaces[0];if(!first)throw new Error("This account has no workspace");
   const ws=api.workspace(first.slug);const people:PeopleIndex=new Map();const member=me.name.trim()||me.email.split("@")[0]||"You";
   let bootIssueDetail:Awaited<ReturnType<WorkspaceClient["issue"]>>|null=null;
   let bootConversationDetail:Awaited<ReturnType<WorkspaceClient["conversation"]>>|null=null;
   let bootConversationAccounts:Awaited<ReturnType<WorkspaceClient["accounts"]>>|null=null;
   let bootIssues:Awaited<ReturnType<WorkspaceClient["issues"]>>|null=null;
   let bootAutopilots:Awaited<ReturnType<WorkspaceClient["autopilots"]>>|null=null;
   let bootAutopilotDetail:Awaited<ReturnType<WorkspaceClient["autopilot"]>>|null=null;
   let bootPlugins:Awaited<ReturnType<WorkspaceClient["plugins"]>>|null=null;
   let refreshing=false,again=false;
   /* Opening a conversation, an issue or a routine must not re-download the whole workspace
      inventory (the issue pages alone are 1.7 MB on a workspace with 3,566 issues) before the
      subject can render. Navigation reuses the inventory fetched in the last 60 s; realtime
      events, reconnects and writes still refresh all of it. */
   const INVENTORY_FRESH_MS=60_000;const inventory=new Map<string,{at:number;value:Promise<unknown>}>();let reuseInventory=false;
   const inv=<T>(key:string,load:()=>Promise<T>):Promise<T>=>{const hit=inventory.get(key);if(reuseInventory&&hit&&Date.now()-hit.at<INVENTORY_FRESH_MS)return hit.value as Promise<T>;const value=load();inventory.set(key,{at:Date.now(),value});value.catch(()=>{inventory.delete(key)});return value};
   let againFull=false;
   const hydrate=async(options:{reuseInventory?:boolean}={})=>{
    if(!alive)return;if(refreshing){again=true;if(!options.reuseInventory)againFull=true;return;}refreshing=true;reuseInventory=!!options.reuseInventory;
    /* The optimised boot paths below fetch the visible subject before the workspace inventory
       and hand those responses to the first hydration. Only that hydration may reuse them: a
       snapshot that survived into later refreshes would hide the plugin a member just connected
       or the reply that just arrived in a deep-linked conversation. Consume them here, once. */
    const boot={issues:bootIssues,autopilots:bootAutopilots,accounts:bootConversationAccounts,plugins:bootPlugins,issueDetail:bootIssueDetail,conversationDetail:bootConversationDetail,autopilotDetail:bootAutopilotDetail};
    bootIssues=bootAutopilots=bootConversationAccounts=bootPlugins=bootIssueDetail=bootConversationDetail=bootAutopilotDetail=null;
    try{
     const [issues,chats,autos,accounts,routing,overview,members,skills,memories,credits,usage,plugins,repos,projects,workflows,invites,sessions,keys]=await Promise.all([
      inv("issues",()=>boot.issues?Promise.resolve(boot.issues):ws.issues(undefined,abort.signal)),ws.conversations(abort.signal),inv("autopilots",()=>boot.autopilots?Promise.resolve(boot.autopilots):ws.autopilots(abort.signal)),boot.accounts??ws.accounts(abort.signal),ws.routing(abort.signal),ws.overview(abort.signal),inv("members",()=>ws.members(abort.signal)),inv("skills",()=>ws.skills(abort.signal)),inv("memories",()=>ws.memories(abort.signal)),ws.credits(abort.signal),ws.usage(abort.signal),boot.plugins??ws.plugins(abort.signal),inv("repositories",()=>ws.repositories(abort.signal)),inv("projects",()=>ws.projects(abort.signal)),inv("workflows",()=>ws.workflows(abort.signal)),inv("invitations",()=>ws.invitations(abort.signal)),api.request<{sessions:Vals[]}>("GET","/api/me/sessions",undefined,abort.signal),api.request<{keys:Vals[]}>("GET","/api/me/keys",undefined,abort.signal),
     ]);
     if(!alive)return;
     for(const p of members.members)people.set(p.user_id,{name:p.name,email:p.email});
     const previous=String(logic.state.member??"");const patch:Vals=livePersonaDefaults(member,String(logic.state.funding?.[member]||"credits"));
     // Empty defaults replace every persona-keyed fixture before changing the key.
     patch.liveWorkspaces=workspaces;patch.workspace16=overview.workspace.name;patch.member=member;patch.signed=true;patch.workspaceName=overview.workspace.name;
     patch.issues=issues.issues.map(i=>mapIssue(i,people));
     // On a cold deep link the design logic has not copied the route into
     // activeIssue yet. Load that issue during the first hydration instead of
     // waiting for a second state-driven pass which can be interrupted by the
     // initial render. Without this, a hard refresh shows the sparse design
     // fallback until the user navigates away and back.
     const requestedIssue=hydrationIssueKey(logic.state.activeIssue,initialRoute.issue,hydrated);
     const selectedIssue=issues.issues.find(i=>i.identifier===requestedIssue||i.id===requestedIssue);
     if(selectedIssue){const detail=boot.issueDetail?.issue.id===selectedIssue.id?boot.issueDetail:await ws.issue(selectedIssue.id,abort.signal);const files=await api.request<{attachments:Vals[]}>("GET",`/api/w/${ws.slug}/attachments?issue=${selectedIssue.id}`,undefined,abort.signal);patch.liveIssueDetail=detail;patch.liveIssueFiles=files.attachments;patch.liveIssueWorkflow=detail.issue.workflow_id?await ws.workflow(detail.issue.workflow_id,abort.signal):null;patch.issues=patch.issues.map((i:Vals)=>i.uuid===selectedIssue.id?{...i,events:detail.comments.map(c=>({who:people.get(c.author_user_id||"")?.name||"Previous agent",role:c.author_kind,when:new Date(c.created_at).toLocaleString(),text:c.body})),cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100}:i)}
     const oldChats=logic.state.chats?.[previous]||[];
     patch.chats={[member]:chats.conversations.map(c=>{
      const old=oldChats.find((x:Vals)=>x.id===c.id);return {...mapConversation(c,[],me,people),messages:old?.messages||[],phase:old?.phase||"done"};
     })};
     const active=String(logic.state.activeChat||"");
     if(active&&chats.conversations.some(c=>c.id===active)){
      const detail=boot.conversationDetail?.conversation.id===active?boot.conversationDetail:await ws.conversation(active,abort.signal);if(!alive)return;
      const run=detail.runs.at(-1);const phase=phaseFor(run?.status);
      const apiOrigin=new URL(api.baseURL||"/",window.location.origin);
      const attachments=detail.attachments.map(a=>({...a,url:new URL(a.url,apiOrigin).toString()}));
      patch.chats[member]=patch.chats[member].map((c:Vals)=>c.id===active?{...mapConversation(detail.conversation,detail.messages,me,people,attachments),phase,runId:run?.id,runError:run?.error||"",cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100,taskLimit:(run?.task_limit_cents??routing.default_task_limit_cents)/100}:c);
      patch.phase=phase;
      Object.assign(patch,conversationRoutingPatch(member,detail.conversation,run));
      Object.assign(patch,runFailurePatch(run));
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
     const activeAutopilot=String(logic.state.activeAuto9||initialRoute.autopilot||"");
     if(uuid(activeAutopilot)&&autos.autopilots.some(a=>a.id===activeAutopilot)){const detail=boot.autopilotDetail?.autopilot.id===activeAutopilot?boot.autopilotDetail:await ws.autopilot(activeAutopilot,abort.signal);patch.autopilots9=patch.autopilots9.map((autopilot:Vals)=>autopilot.id===activeAutopilot?{...autopilot,history:detail.runs.map(run=>({title:titleCase(run.status),detail:run.summary||run.run_id||"Run recorded",when:new Date(run.created_at).toLocaleString(),status:run.status}))}:autopilot)}
     Object.assign(patch,accountHydrationPatch(member,accounts.accounts));
     patch.connections={[member]:Object.fromEntries(plugins.plugins.map(p=>[connectorDisplayName(p),p.status==="connected"]))};
     patch.customPlugins10=plugins.plugins.filter(p=>p.kind.startsWith("mcp:")&&!catalogPluginKeys.has(pluginKey(p.kind))).map(p=>({name:connectorDisplayName(p),owner:member,category:"Custom",copy:"Workspace MCP server",icon:"code-xml"}));
     patch.plan=titleCase(overview.workspace.plan);patch.monthly=0;patch.purchased=credits.balance_cents/100;patch.runningRuns=overview.running_runs;
     patch.paymentsEnabled=credits.payments_enabled;patch.paymentsTestMode=credits.payments_test_mode;patch.workspaceRole=overview.workspace.role||first.role;
     patch.ledger=credits.entries.map((e,i)=>({id:String(i),kind:e.kind,label:e.note,title:e.note,amount:e.amount_cents/100,date:e.created_at,when:e.created_at}));
     patch.liveUsage=usage;
     patch.members14=members.members.map(p=>({id:p.user_id,name:p.name||p.email.split("@")[0],email:p.email,role:titleCase(p.role),meta:"Joined "+new Date(p.joined_at).toLocaleDateString(),scope:"",locked:p.role==="owner"}));
     patch.invites14=invites.invitations.map(i=>({id:i.id,email:i.email,role:titleCase(i.role),state:"Pending",scope:"",meta:"Expires "+new Date(i.expires_at).toLocaleDateString()}));
     patch.skills=skills.skills.map(k=>({...k,description:k.body.split("\n").find(t=>t&&!t.startsWith("#"))||"Workspace instructions",source:"Workspace",owner:"workspace",version:"Saved",files:["SKILL.md"]}));
     patch.memories14=memories.memories.map(m=>({id:m.id,scope:m.scope,owner:people.get(m.user_id)?.name||people.get(m.user_id)?.email.split("@")[0],project:projects.projects.find(p=>p.id===m.project_id)?.name,type:"Fact",text:m.body,pinned:m.pinned,provenance:"Saved by a workspace member",updated:new Date(m.updated_at).toLocaleString(),lastUsed:"",source:"",why:"Explicitly saved instructions"}));
     patch.suggested14=[];patch.repos14=repos.repositories.map(r=>({id:r.id,name:r.full_name,full:r.full_name,branch:r.default_branch,status:"Connected",state:"Connected",tone:"ok14",provider:"GitHub",connected:true,meta:`Default branch ${r.default_branch}`}));
     patch.liveProjects=projects.projects;patch.livePlugins=plugins.plugins;
     patch.workflows14=workflows.workflows.map(w=>({id:w.id,name:w.name,meta:w.description,icon:"git-branch",state:w.active_version_id?"Active":"Draft",tone:w.active_version_id?"ok14":""}));
     patch.profileByMember15={[member]:{...(logic.state.profileByMember15?.[previous]||{}),name:me.name||member,email:me.email}};
     patch.sec19={...(logic.state.sec19||{}),twoStep:false,sms:false,codes:[],codesLeft:0,codesWhen:"Never",sessions:sessions.sessions.map(d=>({id:d.id,name:d.current?"Current browser":"Browser session",short:"browser",icon:"monitor",meta:d.user_agent,where:d.location||"",ip:d.ip,when:new Date(d.last_seen_at).toLocaleString(),current:d.current})),keys:keys.keys.map(k=>({id:k.id,name:k.name,prefix:k.prefix,scope:k.scopes.includes("write")?"Full access":"Read only",created:new Date(k.created_at).toLocaleDateString(),used:k.last_used_at?new Date(k.last_used_at).toLocaleString():"Never"}))};
     logic.setState(patch);if(!hydrated){if(previous!==member)logic.newChat();const conversation=initialRoute.conversation;const issue=initialRoute.issue;const requestedView=initialRoute.view;if(conversation&&chats.conversations.some(c=>c.id===conversation)){logic.setState({activeChat:conversation,view:"chat",draft:readDraft(ws.slug,conversation),inspector10:false,mobileInspector10:false});again=true}else if(issue&&issues.issues.some(i=>i.id===issue||i.identifier===issue)){const thread=requestedView==="thread9";const issueID=issues.issues.find(i=>i.id===issue||i.identifier===issue)!.id;logic.setState({activeIssue:issue,view:thread?"thread9":"issue",threadDraft9:readDraft(ws.slug,issueID),...threadInspectorPatch(thread&&window.matchMedia("(min-width: 901px)").matches)});again=true}else{logic.setState({view:requestedView,...initialRoute.autopilot?{activeAuto9:initialRoute.autopilot}:{},...initialRoute.section?{section:initialRoute.section}:{},draft:readDraft(ws.slug,null)})}const canonicalIssue=issue?issues.issues.find(i=>i.id===issue||i.identifier===issue)?.id:undefined;window.history.replaceState({},"",workspacePath({...initialRoute,workspace:ws.slug,...canonicalIssue?{issue:canonicalIssue}:{}}))}hydrated=true;report("live");
    }finally{refreshing=false;if(again&&alive){const reuse=!againFull;again=false;againFull=false;void hydrate({reuseInventory:reuse}).catch(fail)}}
   };
   let liveRefreshing=false,liveAgain=false;
   const refreshActiveWork=async()=>{
    if(!alive)return;if(liveRefreshing){liveAgain=true;return}liveRefreshing=true;
    try{
     const patch:Vals={};const active=String(logic.state.activeChat||"");const dockID=String(logic.state.dockConversationID||readLocal(dockConversationKey(ws.slug)));const issueRow=(logic.state.issues||[]).find((item:Vals)=>item.id===logic.state.activeIssue||item.uuid===logic.state.activeIssue);
     if(uuid(active)){
      const detail=await ws.conversation(active,abort.signal);if(!alive)return;const run=detail.runs.at(-1);const phase=phaseFor(run?.status);const apiOrigin=new URL(api.baseURL||"/",window.location.origin);const attachments=detail.attachments.map(a=>({...a,url:new URL(a.url,apiOrigin).toString()}));
      patch.chats={...logic.state.chats,[member]:(logic.state.chats?.[member]||[]).map((conversation:Vals)=>conversation.id===active?{...mapConversation(detail.conversation,detail.messages,me,people,attachments),phase,runId:run?.id,runError:run?.error||"",cost:detail.runs.reduce((sum,r)=>sum+r.cost_cents,0)/100,taskLimit:conversation.taskLimit}:conversation)};patch.phase=phase;Object.assign(patch,conversationRoutingPatch(member,detail.conversation,run),runFailurePatch(run));
     }
     if(uuid(dockID)&&dockID!==active){
      const detail=await ws.conversation(dockID,abort.signal);if(!alive)return;const apiOrigin=new URL(api.baseURL||"/",window.location.origin);const attachments=detail.attachments.map(a=>({...a,url:new URL(a.url,apiOrigin).toString()}));const run=detail.runs.at(-1);
      patch.dockLiveMessages=detail.messages.map(message=>mapMessage(message,me,people,attachments));patch.dockLiveRun=run||null;patch.dockLivePhase=phaseFor(run?.status);patch.dockLiveCost=detail.runs.reduce((sum,item)=>sum+item.cost_cents,0)/100;
     }
     if(issueRow){
      const detail=await ws.issue(issueRow.uuid||issueRow.id,abort.signal);if(!alive)return;patch.liveIssueDetail=detail;patch.issues=(logic.state.issues||[]).map((item:Vals)=>item.uuid===detail.issue.id?{...item,events:detail.comments.map(comment=>({who:people.get(comment.author_user_id||"")?.name||"Previous agent",role:comment.author_kind,when:new Date(comment.created_at).toLocaleString(),text:comment.body})),cost:detail.runs.reduce((sum,run)=>sum+run.cost_cents,0)/100}:item);
     }
     if(Object.keys(patch).length)logic.setState(patch);
    }finally{liveRefreshing=false;if(liveAgain&&alive){liveAgain=false;void refreshActiveWork().catch(fail)}}
   };
   restore=installActions(logic,ws,api,me,people,hydrate,fail);
   // A fresh conversation needs only the selected workspace's accounts and
   // connector marks to paint honestly. Do not hold its composer and welcome
   // state behind every issue, routine, member, billing and settings request.
   if(initialRoute.view==="chat"&&!initialRoute.conversation){
    [bootConversationAccounts,bootPlugins]=await Promise.all([ws.accounts(abort.signal),ws.plugins(abort.signal)]);if(!alive)return;
    const connections=Object.fromEntries(bootPlugins.plugins.map(plugin=>[connectorDisplayName(plugin),plugin.status==="connected"]));
    logic.setState({
     ...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,
     member,signed:true,view:"chat",activeChat:null,draft:readDraft(ws.slug,null),inspector10:false,mobileInspector10:false,
     ...accountHydrationPatch(member,bootConversationAccounts.accounts),connections:{[member]:connections},livePlugins:bootPlugins.plugins,
    });
    report("live");
   }
   // A canonical work-conversation URL already contains the issue UUID. Show
   // that issue and its real timeline as soon as the detail request returns;
   // the larger workspace inventory can populate the navigation afterward.
   // This keeps thousands of imported issues off the route's critical path.
   if(initialRoute.view==="thread9"&&uuid(initialRoute.issue)){
    bootIssueDetail=await ws.issue(initialRoute.issue,abort.signal);if(!alive)return;
    logic.setState({
     ...livePersonaDefaults(member),
     liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,
     issues:[mapIssue(bootIssueDetail.issue,people)],activeIssue:bootIssueDetail.issue.id,view:"thread9",
     liveIssueDetail:bootIssueDetail,threadDraft9:readDraft(ws.slug,bootIssueDetail.issue.id),
     ...threadInspectorPatch(window.matchMedia("(min-width: 901px)").matches),
    });
    report("live");
   }
   // A canonical chat URL also has enough information to paint the complete
   // conversation before the workspace-wide navigation, settings and billing
   // inventories finish. The full hydration reuses this response, so a cold
   // chat does not pay for the detail request twice.
   if(initialRoute.view==="chat"&&uuid(initialRoute.conversation)){
    [bootConversationDetail,bootConversationAccounts]=await Promise.all([ws.conversation(initialRoute.conversation,abort.signal),ws.accounts(abort.signal)]);if(!alive)return;
    const run=bootConversationDetail.runs.at(-1);const phase=phaseFor(run?.status);
    const apiOrigin=new URL(api.baseURL||"/",window.location.origin);
    const attachments=bootConversationDetail.attachments.map(a=>({...a,url:new URL(a.url,apiOrigin).toString()}));
    const conversation={
     ...mapConversation(bootConversationDetail.conversation,bootConversationDetail.messages,me,people,attachments),
     phase,runId:run?.id,runError:run?.error||"",
     cost:bootConversationDetail.runs.reduce((sum,item)=>sum+item.cost_cents,0)/100,
     taskLimit:(run?.task_limit_cents??200)/100,
    };
    logic.setState({
     ...livePersonaDefaults(member),
     liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,
     chats:{[member]:[conversation]},activeChat:initialRoute.conversation,view:"chat",phase,
     draft:readDraft(ws.slug,initialRoute.conversation),inspector10:false,mobileInspector10:false,
     ...accountHydrationPatch(member,bootConversationAccounts.accounts),
     ...conversationRoutingPatch(member,bootConversationDetail.conversation,run),...runFailurePatch(run),
    });
    report("live");
   }
   // Inventory and settings pages should reveal as soon as the data for the
   // requested screen is ready. The remaining workspace data hydrates in the
   // background and must not hold a large migrated issue list behind billing,
   // security, repository, memory and profile requests.
   if(initialRoute.view==="work"){
    const firstIssuePage=await ws.issuePage({limit:80},abort.signal);if(!alive)return;
    logic.setState({...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,view:"work",issues:firstIssuePage.issues.map(issue=>mapIssue(issue,people))});
    report("live");
   }
   if(initialRoute.view==="issue"&&uuid(initialRoute.issue)){
    bootIssueDetail=await ws.issue(initialRoute.issue,abort.signal);if(!alive)return;
    const mapped=mapIssue(bootIssueDetail.issue,people);
    logic.setState({...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,view:"issue",activeIssue:bootIssueDetail.issue.id,issues:[mapped],liveIssueDetail:bootIssueDetail,inspector10:false,mobileInspector10:false});
    report("live");
   }
   if(initialRoute.view==="schedule9"){
    bootAutopilots=await ws.autopilots(abort.signal);if(!alive)return;
    logic.setState({...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,view:"schedule9",autopilots9:bootAutopilots.autopilots.map(autopilot=>({...mapAutopilot(autopilot),owner:member,kind:autopilot.trigger.kind,status:autopilot.enabled?"active":"paused",history:[],limit:2,daily:20}))});
    report("live");
   }
   if(initialRoute.view==="auto9"&&uuid(initialRoute.autopilot)){
    [bootAutopilots,bootAutopilotDetail,bootPlugins]=await Promise.all([ws.autopilots(abort.signal),ws.autopilot(initialRoute.autopilot,abort.signal),ws.plugins(abort.signal)]);if(!alive)return;
    logic.setState({...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,view:"auto9",activeAuto9:initialRoute.autopilot,livePlugins:bootPlugins.plugins,autopilots9:bootAutopilots.autopilots.map(autopilot=>({...mapAutopilot(autopilot),owner:member,kind:autopilot.trigger.kind,status:autopilot.enabled?"active":"paused",history:autopilot.id===initialRoute.autopilot?bootAutopilotDetail!.runs.map(run=>({title:titleCase(run.status),detail:run.summary||run.run_id||"Run recorded",when:new Date(run.created_at).toLocaleString(),status:run.status})):[],limit:2,daily:20}))});
    report("live");
   }
   if(initialRoute.view==="plugins10"){
    bootPlugins=await ws.plugins(abort.signal);if(!alive)return;
    logic.setState({...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,view:"plugins10",livePlugins:bootPlugins.plugins,connections:{[member]:Object.fromEntries(bootPlugins.plugins.map(plugin=>[titleCase(plugin.kind.replace(/^mcp:/,"")),plugin.status==="connected"]))}});
    report("live");
   }
   if(initialRoute.view==="settings"&&initialRoute.section==="accounts"){
    bootConversationAccounts=await ws.accounts(abort.signal);if(!alive)return;
    logic.setState({...livePersonaDefaults(member),liveWorkspaces:workspaces,workspace16:first.name,workspaceName:first.name,member,signed:true,view:"settings",section:"accounts",...accountHydrationPatch(member,bootConversationAccounts.accounts)});
    report("live");
   }
   await hydrate();if(!alive)return;
   if(initialRoute.workflow&&typeof logic.openGraph14==="function")await logic.openGraph14(initialRoute.workflow);
   disconnect=ws.connect(e=>{if(e.type==="hello")return;if(timer)clearTimeout(timer);const isActiveWorkEvent=e.type==="message.created"||e.type.startsWith("run.");timer=setTimeout(()=>{void (isActiveWorkEvent?refreshActiveWork():hydrate()).catch(fail)},isActiveWorkEvent?350:100)},up=>{if(!up)return;if(hasConnected)void hydrate().catch(fail);hasConnected=true});
  })().catch(err=>{if(err?.status===401)report("signed-out");else fail(err)});
  return()=>{alive=false;abort.abort();if(timer)clearTimeout(timer);disconnect?.();restore?.()};
 },[logic]);
}

// Kept outside React so adapter behavior can be tested against real API calls.
export function installActions(logic:Logic,ws:WorkspaceClient,api:Client,me:User,people:PeopleIndex,hydrate:(options?:{reuseInventory?:boolean})=>Promise<void>,fail:(err:unknown)=>void){
 const originals=new Map<string,unknown>();let disposed=false;
 const pendingFiles=new Map<string,File>();
 let paneFrame:number|undefined;let finishPaneDrag:(()=>void)|undefined;
 let fileTarget:"main"|"dock"="main";
 const bind=(name:string,fn:unknown)=>{if(!originals.has(name))originals.set(name,logic[name]);logic[name]=fn};
 installPerformanceGuards(logic);
 const paneAvailable=()=>document.querySelector<HTMLElement>(".app-v19 .workspace-body")?.clientWidth||Number(logic.state.paneAvailable11)||1040;
 const setPane=(width:number,remember=true)=>{
  if(width<=0){logic.setState({inspector10:false,mobileInspector10:false,paneWidth11:0});return}
  const next=clampConversationPaneWidth(width,paneAvailable());
  logic.setState({paneWidth11:next,...remember?{paneRestore11:next}:{},inspector10:true});
 };
 bind("paneMax11",()=>conversationPaneBounds(paneAvailable()).max);
 bind("setPane11",setPane);
 bind("resizeKey11",(event:KeyboardEvent)=>{
  if(!["ArrowLeft","ArrowRight","Home","End","Enter"].includes(event.key))return;
  event.preventDefault();logic.closePicker11?.();
  const current=Number(logic.state.paneWidth11)||400;
  if(event.key==="Home")setPane(0);
  else if(event.key==="End")setPane(conversationPaneBounds(paneAvailable()).max);
  else if(event.key==="Enter")setPane(400);
  else setPane(current+(event.key==="ArrowLeft"?1:-1)*(event.shiftKey?80:24));
 });
 bind("dragPane11",(event:PointerEvent)=>{
  if(event.button!==undefined&&event.button!==0)return;
  event.preventDefault();logic.closePicker11?.();finishPaneDrag?.();
  const startX=event.clientX;const startWidth=Number(logic.state.paneWidth11)||400;
  let pendingWidth=clampConversationPaneWidth(startWidth,paneAvailable());
  const inspector=event.currentTarget instanceof Element?event.currentTarget.closest(".inspector10") as HTMLElement|null:document.querySelector<HTMLElement>(".app-v19 .inspector10");
  const app=inspector?.closest(".app-v19") as HTMLElement|null;
  app?.classList.add("pane-dragging11");
  const paint=()=>{paneFrame=undefined;if(!inspector)return;inspector.style.width=`${pendingWidth}px`;inspector.style.flexBasis=`${pendingWidth}px`};
  const move=(moveEvent:PointerEvent)=>{pendingWidth=clampConversationPaneWidth(startWidth+startX-moveEvent.clientX,paneAvailable());if(paneFrame===undefined)paneFrame=requestAnimationFrame(paint)};
  const finish=()=>{
   document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",finish);document.removeEventListener("pointercancel",finish);
   if(paneFrame!==undefined){cancelAnimationFrame(paneFrame);paneFrame=undefined}app?.classList.remove("pane-dragging11");if(!disposed){paint();logic.setState({paneWidth11:pendingWidth,paneRestore11:pendingWidth,inspector10:true})}finishPaneDrag=undefined;
  };
  finishPaneDrag=finish;document.addEventListener("pointermove",move);document.addEventListener("pointerup",finish);document.addEventListener("pointercancel",finish);
 });
 const routeURL=(view:string,patch:Vals={},replace=false)=>{const state:Vals={...logic.state,...patch,view};const issueRow=(state.issues||[]).find((item:Vals)=>item.id===state.activeIssue||item.uuid===state.activeIssue);const issueID=issueRow?.uuid||state.activeIssue;const route:WorkspaceRoute={workspace:ws.slug,view,...(view==="chat"&&uuid(state.activeChat)?{conversation:state.activeChat}:{}),...(["issue","thread9"].includes(view)&&issueID?{issue:issueID}:{}),...(view==="auto9"&&state.activeAuto9?{autopilot:state.activeAuto9}:{}),...(view==="settings"&&state.section?{section:state.section}:{}),...(view==="settings"&&state.section==="workflows"&&state.activeWorkflow?{workflow:state.activeWorkflow}:{})};window.history[replace?"replaceState":"pushState"]({},"",workspacePath(route))};
 const originalGo=typeof logic.go==="function"?logic.go.bind(logic):null;
 if(originalGo)bind("go",(view:string,patch:Vals={})=>{originalGo(view,patch);routeURL(view,patch)});
 const originalNewChat=typeof logic.newChat==="function"?logic.newChat.bind(logic):null;
 if(originalNewChat)bind("newChat",()=>openNewChatWithDraft(logic,ws.slug,originalNewChat));
 const originalAccountRoutable=typeof logic.accountRoutable14==="function"?logic.accountRoutable14.bind(logic):null;
 if(originalAccountRoutable)bind("accountRoutable14",(account:Vals)=>typeof account.runtimeRoutable==="boolean"?account.runtimeRoutable&&account.enabled!==false:originalAccountRoutable(account));
 // The prototype enumerates a fixture-only `connections` object. Live
 // workspaces instead receive connector records from the API, so source this
 // menu directly from those records. Otherwise the UI says "0 connected"
 // while every migrated connector is present and usable.
 bind("connectedConnectors15",()=>liveConnectedConnectorNames(logic.state.livePlugins||[]).map(name=>{const brand=typeof logic.brand12==="function"?logic.brand12(name):{};return{name,logo:brand.brand12||"",logoClass:brand.brandClass12||""}}));
 const write=(fn:()=>Promise<void>)=>async()=>{if(disposed)return;try{await fn();if(!disposed)await hydrate()}catch(err){if(!disposed)fail(err)}};
 const selectedPluginIDs=(where:"main"|"dock"="main"):string[]=>{
  const key=typeof logic.composerKey15==="function"?logic.composerKey15(where):typeof logic.key12==="function"?logic.key12():"";
  const selected:string[]=typeof logic.tools15==="function"?logic.tools15(key):[];
  const selectedKeys=new Set(selected.map(pluginKey));
  return (logic.state.livePlugins||[]).filter((plugin:Vals)=>plugin.status==="connected"&&selectedKeys.has(pluginKey(plugin.kind))).map((plugin:Vals)=>String(plugin.id));
 };
 let sending=false;
 const send=async(e?:{preventDefault:()=>void})=>{
  e?.preventDefault();if(sending||disposed)return;const isThread=logic.state.view==="thread9";let draft=String(isThread?logic.state.threadDraft9:logic.state.draft||"").trim();const queued=[...(logic.state.attachments11||[])].filter((a:Vals)=>pendingFiles.has(a.id));if(!draft&&!queued.length)return;if(!draft)draft="Review the attached files.";sending=true;logic.setState({composerError10:""});
  try{
   if(isThread){
    const issue=logic.issue();const issueID=String(issue.uuid||issue.id);if(!uuid(issueID))throw new Error("Open an issue before sending a message");
    for(const item of queued){const file=pendingFiles.get(item.id);if(!file)continue;await ws.uploadIssueAttachment(issueID,file)}
    await ws.comment(issueID,draft);saveDraft(ws.slug,issueID,"");
    for(const item of queued){pendingFiles.delete(item.id);if(String(item.url||"").startsWith("blob:"))URL.revokeObjectURL(item.url)}
    if(!disposed){logic.setState({threadDraft9:"",attachments11:[]});await hydrate()}return;
   }
   let active=logic.state.activeChat;
   if(!uuid(active)){const out=await ws.createConversation({title:draft.slice(0,72),model:String(logic.state.model||"auto").toLowerCase()==="auto"?"auto":String(logic.state.model)});if(disposed)return;active=out.conversation.id;logic.setState({activeChat:active,view:"chat"});routeURL("chat",{activeChat:active})}
   const attachmentIDs:string[]=[];
   for(const item of queued){const file=pendingFiles.get(item.id);if(!file)continue;const out=await ws.uploadConversationAttachment(active,file);attachmentIDs.push(out.attachment.id)}
   await ws.sendMessage(active,draft,attachmentIDs,selectedPluginIDs("main"),String(logic.state.reasoning||""));
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
   await ws.sendMessage(active,draft,attachmentIDs,selectedPluginIDs("dock"),String(logic.state.reasoning||""));
   saveLocal(dockDraftKey(ws.slug),"");
   for(const item of queued){pendingFiles.delete(item.id);if(String(item.url||"").startsWith("blob:"))URL.revokeObjectURL(item.url)}
   if(!disposed){logic.setState({dockLiveDraft:"",dockAttachmentsLive:[]});await hydrate()}
  }catch(err){if(!disposed)fail(err)}finally{dockSending=false}
 };
 bind("openIssue",(id:string)=>{const issue=logic.state.issues.find((row:Vals)=>row.id===id||row.uuid===id);logic.go("thread9",{activeIssue:id,issueComment:"",threadDraft9:readDraft(ws.slug,issue?.uuid||id),liveIssueDetail:null,liveIssueFiles:[],...threadInspectorPatch(window.matchMedia("(min-width: 901px)").matches)});void hydrate({reuseInventory:true}).catch(fail)});
 bind("issue",()=>logic.state.issues.find((i:Vals)=>i.id===logic.state.activeIssue||i.uuid===logic.state.activeIssue)||{id:"",title:"Select an issue",description:"",status:"Incoming",owner:"",events:[]});
 // The prototype has several generations of composer handlers. All route here.
 for(const name of ["sendComposer10","sendComposer11","sendThreadMessage9"])bind(name,send);
 bind("openAuto9",(id:string)=>{logic.go("auto9",{activeAuto9:id,panel:null});void hydrate({reuseInventory:true}).catch(fail)});
 bind("toggleAuto9",(id:string,enabled:boolean)=>{void write(async()=>{await ws.setAutopilotEnabled(id,enabled)})()});
 bind("saveAuto9",()=>{const s=logic.state,draft=s.autoDraft9||{};const error=!String(draft.title||"").trim()?"Give this routine a name.":String(draft.prompt||"").trim().length<12?"Give this routine a clear instruction.":"";if(error){logic.setState({autoFormError9:error});return}if(s.autoFormStep9!=="review"){logic.setState({autoFormStep9:"review",autoFormError9:""});return}void write(async()=>{const trigger=routineTrigger(draft);const existing=uuid(s.autoEditing9)?s.autoEditing9:undefined;const out=await ws.saveAutopilot({name:String(draft.title).trim(),description:String(draft.description||""),prompt:String(draft.prompt).trim(),model:String(draft.model||"auto").toLowerCase()==="auto"?"auto":String(draft.model),trigger,workflow_id:draft.workflowId||null,plugin_ids:Array.isArray(draft.pluginIds)?draft.pluginIds:[],enabled:draft.enabled!==false},existing);logic.setState({dialog:null,autoEditing9:null,activeAuto9:out.autopilot.id});routeURL("auto9",{activeAuto9:out.autopilot.id})})()});
 bind("runAuto9",()=>{const autopilot=logic.state.autopilots9?.find((row:Vals)=>row.id===logic.state.activeAuto9);if(!autopilot?.enabled){logic.toast("Enable this routine before running it.");return}void write(async()=>{await ws.triggerAutopilot(autopilot.id)})()});
 bind("deleteRoutine14",(id:string)=>{const autopilot=logic.state.autopilots9?.find((row:Vals)=>row.id===id);if(!autopilot)return;logic.generic("Delete this routine?","Its recorded run history stays attached to the work it created.",[],{genericText:autopilot.title,genericActionLabel:"Delete routine",genericAction:()=>{void write(async()=>{await ws.deleteAutopilot(id);logic.setState({dialog:null,activeAuto9:null});logic.go("schedule9",{scheduleTab14:"routines"})})()}})});
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
 const openChat=async(id:string)=>{logic.setState({activeChat:id,view:"chat",dialog:null,draft:readDraft(ws.slug,id),inspector10:false,mobileInspector10:false});routeURL("chat",{activeChat:id});try{await hydrate({reuseInventory:true})}catch(e){fail(e)}};
 for(const name of ["loadChat","loadChat9","loadChat10"])bind(name,openChat);
 const start=write(async()=>{const i=logic.issue();await ws.work(i.uuid||i.id)});bind("startIssue",start);bind("beginRun",start);
 bind("saveSkill",write(async()=>{const s=logic.state;const out=await ws.saveSkill({name:s.skillNameInput,body:s.skillBodyInput},uuid(s.editingSkill)?s.editingSkill:undefined);await hydrate();logic.openSkill(out.skill.id)}));
 bind("saveMemory14",write(async()=>{const s=logic.state;const project=s.liveProjects.find((p:Vals)=>p.name===s.memoryProject14);await ws.saveMemory({body:s.memoryDraft14,...(s.memoryEdit14==="__new"?{scope:s.memoryScope14||"personal",...(s.memoryScope14==="project"?{project_id:project?.id}:{} )}:{})},uuid(s.memoryEdit14)?s.memoryEdit14:undefined);logic.setState({memoryEdit14:null,memoryDraft14:""})}));
 bind("forgetMemory14",(id:string)=>write(async()=>{await ws.deleteMemory(id)})());
 bind("pinMemory14",(id:string)=>write(async()=>{const m=logic.state.memories14.find((m:Vals)=>m.id===id);await ws.saveMemory({pinned:!m?.pinned},id)})());
 bind("revokeInvite14",(id:string)=>write(async()=>{await ws.revokeInvitation(id)})());
 bind("setMemberRole14",(id:string,role:string)=>write(async()=>{await ws.setMemberRole(id,role.toLowerCase())})());
 bind("sendInvites14",write(async()=>{const s=logic.state;const emails=String(s.inviteEmails14||"").split(/[\s,;]+/).filter(Boolean);if(!emails.length)throw new Error("Add an email address");const links=[];for(const email of emails){const invite=await ws.invite(email,String(s.inviteRole14||"member").toLowerCase());links.push(invite.link)}logic.generic("Invitation links","Share each link with the invited person",[],{genericText:links.join("\n")});logic.setState({inviteEmails14:""})}));
 bind("openGraph14",(id:string)=>write(async()=>{const out=await ws.workflow(id);const v=out.versions.find(v=>v.id===out.workflow.active_version_id)||out.versions[0];if(!v)throw new Error("This workflow has no version");const graph={id:out.workflow.id,name:out.workflow.name,version:v.version,nodes:v.graph.nodes.map((n,i)=>({id:n.key,type:n.kind,label:n.name,model:n.model||"Auto",effort:n.effort||"Medium",prompt:n.prompt||"",x:n.x??i*220,y:n.y??120})),edges:v.graph.edges.map((e,i)=>({id:"e"+i,from:e[0],to:e[1],label:""}))};logic.setState({view:"settings",section:"workflows",activeWorkflow:id,graph14:graph,graphSaved14:structuredClone(graph),graphVersions14:out.versions.map(v=>({id:v.id,name:"Version "+v.version,meta:v.created_at,state:titleCase(v.status)})),graphId14:id,overlay14:"graph",graphSide14:"node",graphSel14:graph.nodes[0]?.id});routeURL("settings",{section:"workflows",activeWorkflow:id})})());
 const closeGraph=typeof logic.closeGraph14==="function"?logic.closeGraph14.bind(logic):()=>logic.setState({overlay14:null});
 bind("closeGraph14",()=>{closeGraph();logic.setState({activeWorkflow:null});routeURL("settings",{section:"workflows",activeWorkflow:null},true)});
 bind("backToWorkflows14",()=>{logic.closeGraph14()});
 bind("saveGraph14",write(async()=>{const g=logic.state.graph14;const graph:WorkflowGraph={nodes:g.nodes.map((n:Vals)=>({key:n.id,name:n.label,kind:n.type,model:n.model==="Auto"?"auto":n.model,effort:n.effort||"Medium",prompt:n.prompt||"",x:n.x,y:n.y})),edges:g.edges.map((e:Vals)=>[e.from,e.to])};const out=uuid(g.id)?await ws.saveWorkflow(g.id,graph):await ws.createWorkflow({name:g.name,graph});const id="workflow" in out?out.workflow.id:g.id;await logic.openGraph14(id)}));
  const render=logic.renderVals;
 bind("renderVals",()=>{
  const v=render.call(logic);const s=logic.state;
  v.workspaceName= s.workspace16||"BotInc";v.previewCard15=false;
  /* The design's chat Details pane stamps a fixture day; a live conversation shows the day it was
     opened, who opened it, and when it last moved. Message times already come from the rows. */
  if(s.view==="chat"&&s.activeChat){
   const chat=((s.chats||{})[s.member]||[]).find((row:Vals)=>row.id===s.activeChat);
   if(chat&&chat.createdAt){
    const rows:Vals[]=chat.messages||[];
    const opener=rows.find((row:Vals)=>!row.hasAvatar);
    v.chatCreated19=`${dayLabel(String(chat.createdAt))} · ${opener?.author||s.member}`;
    const last=rows[rows.length-1];
    v.chatUpdated19=whenLabel(String(last?.createdAt||chat.updatedAt||chat.createdAt));
   }
  }
  /* The welcome strip says "Connected tools": show the workspace's connected connectors, not the
     design's featured catalog. */
  v.featuredPlugins10=liveFeaturedConnectorNames(s.livePlugins||[]).map((name)=>{const brand=typeof logic.brand12==="function"?logic.brand12(name):{};return {name,brand12:brand.brand12||"",brandClass12:brand.brandClass12||"",open:()=>logic.showPlugin10(name)}});
  v.providerGroups13=(v.providerGroups13||[]).map((provider:Vals)=>({
   ...provider,
   ringStyle14:usageRingStyleFromCapacity(provider.index14),
   rows:(provider.rows||[]).map((account:Vals)=>{
    const windows=(account.windows||[]).map((window:Vals)=>{
     const resetShort14=formatUsageReset(window.resetShort14||window.reset);
     return {...window,resetShort14,resetDay19:resetDayLabel(window.reset||window.resetShort14)};
    });
    return {...account,windows,...bindingWindowFields(windows)};
   }),
  }));
  if(v.autopilotForm10){
   const available=(s.livePlugins||[]).filter((plugin:Vals)=>plugin.kind?.startsWith("mcp:"));
   const selectedIDs:string[]=Array.isArray(s.autoDraft9?.pluginIds)?s.autoDraft9.pluginIds:[];
   const selectedSet=new Set(selectedIDs);
   const label=(plugin:Vals)=>connectorDisplayName(plugin);
   const selectedNames=available.filter((plugin:Vals)=>selectedSet.has(plugin.id)).map(label);
   let connectorTrigger:EventTarget|null=null;
   const openConnectorMenu=()=>{
    // Read the draft each time the menu is (re)built: the menu reopens after a pick, and the
    // closure's snapshot from render time would otherwise discard the previous choice.
    const currentIDs:string[]=Array.isArray(logic.state.autoDraft9?.pluginIds)?logic.state.autoDraft9.pluginIds:[];
    const currentSet=new Set(currentIDs);
    // A connector that became unavailable while selected stays removable; only unselected unavailable rows are inert.
    const rows=available.map((plugin:Vals)=>{const name=label(plugin);const brand=typeof logic.brand12==="function"?logic.brand12(name):{};const on=currentSet.has(plugin.id);return{label:name,logo:brand.brand12||"",logoClass:brand.brandClass12||"",on,disabled:plugin.status!=="connected"&&!on,hint:plugin.status==="connected"?"":plugin.status==="needs_reauth"?"Reconnect":"Unavailable",run:()=>{const ids=on?currentIDs.filter((id)=>id!==plugin.id):[...currentIDs,plugin.id];logic.setState({autoDraft9:{...logic.state.autoDraft9,pluginIds:ids}});setTimeout(openConnectorMenu,0)}}});
    if(!rows.length)rows.push({label:"No connectors in this workspace",disabled:true});
    logic.openMenu14(null,{currentTarget:connectorTrigger},rows,"Connectors",{kind:"routine-connectors",cls:"menu-rich15 menu-plugins16",search:rows.length>6?"Search connectors":"",cta:{label:"Add a connector",icon:logic.icon14?.("plus"),run:()=>{logic.setState({dialog:null});logic.openPlugins10("all")}}});
   };
   v.afConnectorSummary19=selectedNames.length?selectedNames.length===1?selectedNames[0]:`${selectedNames.length} connectors`:"No connectors";
   v.afConnectorNote19=selectedNames.length?`Only ${selectedNames.join(", ")} will be available to this routine.`:"This routine will run without connector access.";
   v.afConnectorMenu19=(event:Event)=>{connectorTrigger=event.currentTarget;openConnectorMenu()};
   v.afConnectorManage19=()=>{logic.setState({dialog:null});logic.openPlugins10("all")};
  }
  if(s.view==="settings"&&s.section==="projects"){
   v.projectsSettings=false;v.reposSettings14=true;v.designSettings14=true;
  }
  const autopilotByTitle=new Map<string,Vals>();for(const autopilot of s.autopilots9||[])autopilotByTitle.set(String(autopilot.title),autopilot);
  const applyLiveSchedule=(rows:Vals[]=[])=>(rows||[]).map((row:Vals)=>{const autopilot=autopilotByTitle.get(row.title);return normalizeScheduleSourceLogo(autopilot?{...row,trigger:autopilot.triggerText||row.trigger,next:autopilot.nextText||row.next,zone:autopilot.zone||row.zone,source:autopilot.source||row.source}:row)});
  v.routineRows14=applyLiveSchedule(v.routineRows14);v.upcomingRows14=applyLiveSchedule(v.upcomingRows14);
  const activeAutopilot=(s.autopilots9||[]).find((autopilot:Vals)=>autopilot.id===s.activeAuto9);
  if(s.view==="auto9"&&activeAutopilot){
   const triggerText=String(activeAutopilot.triggerText||v.autoTrigger9||"");const nextText=String(activeAutopilot.nextText||v.autoNext9||"");const triggerParts=triggerText.split(" · ");const isSchedule=activeAutopilot.kind==="schedule";
   v.autoTrigger9=triggerText;v.autoNext9=nextText;
   v.rtDefs16=(v.rtDefs16||[]).map((definition:Vals)=>definition.key==="trigger"?{
    ...definition,icon:`i15.svg#${isSchedule?"calendar-clock":"zap"}`,
    v:isSchedule?`On a schedule · ${triggerParts[0]}`:definition.v,
    note:isSchedule?`Runs ${triggerParts[0]!.toLowerCase()}${triggerParts[1]?` in ${triggerParts[1]}`:""}, whether or not anything changed.`:definition.note,
   }:definition.key==="next"?{...definition,v:nextText,note:isSchedule?"You can also run it now from the header.":definition.note}:definition);
   const connectorNames=liveRoutineConnectorNames(activeAutopilot,s.livePlugins||[]);
   const connectorDefinition={key:"connectors",icon:"i15.svg#plug",k:"Connectors",v:connectorNames.length?connectorNames.join(", "):"None",note:connectorNames.length?"Only these connected services are available to this routine.":"This routine runs without connector access.",hasNote:true,hasAction:true,actionLabel:"Change",act:v.editAutopilot9,editing:false,cls:""};
   const repositoryIndex=v.rtDefs16.findIndex((definition:Vals)=>definition.key==="repo");
   if(repositoryIndex>=0)v.rtDefs16=[...v.rtDefs16.slice(0,repositoryIndex+1),connectorDefinition,...v.rtDefs16.slice(repositoryIndex+1)];
  }
  const detail=s.liveIssueDetail;const currentIssue=logic.issue();
  /* The issue page carries its own execution rail (Execution / Source and output / People). The
     conversation inspector reads the issue's run, so an issue without one (every imported v1
     issue before its first run) rendered it as an empty third column that squeezed the page.
     Hide it for those the way the design hides it on top-level pages. */
  if(s.view==="issue"&&v.inspectorShown16&&!(Array.isArray(detail?.runs)&&detail.runs.length)){v.inspectorOpen10=false;v.inspectorShown16=false;v.panelOpenClass="";v.rootClass=String(v.rootClass||"").replace(/\s*\binspector-open10\b/g,"").replace(/\s*\bmobile-inspector10\b/g,"")}
  /* Unassigned and not-yet-selected issues have no owner; the design's placeholder then read "Message undefined's agents". */
  {const owner=String(currentIssue.owner||"");const whose=!owner||owner===String(s.member||"")?"your":owner+"\u2019s";v.i8CommentPlaceholder=`Message ${whose} agents${currentIssue.id?` about ${currentIssue.id}`:""}\u2026`}
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
  const timeline=sourceIssue?mapIssueTimeline(sourceIssue,detail?.comments||[],detail?.runs||[],people,String(s.member||me.name||me.email)):[];
  const timelineExpanded=!!s.historyExpanded13?.[currentIssue.id];
  const visibleTimeline=timelineExpanded?timeline:timeline.slice(-7);
  v.hasScenario13=timeline.length>0;v.scenarioCount13=timeline.length;
  v.scenarioRows13=visibleTimeline.map((row)=>({...row,quote:()=>{logic.setState({threadDraft9:`> ${row.text}\n\n`});saveDraft(ws.slug,currentIssue.uuid||currentIssue.id,`> ${row.text}\n\n`)},copy:()=>navigator.clipboard?.writeText(row.text),fork14:()=>{},branch14:()=>{},more14:()=>{}}));
  v.hasEarlier13=!timelineExpanded&&timeline.length>7;v.earlierCount13=Math.max(0,timeline.length-7);
  v.showEarlier13=()=>{logic.setState({historyExpanded13:{...s.historyExpanded13,[currentIssue.id]:true}});setTimeout(()=>logic.scrollThread13?.("start"),40)};
  v.showStart13=v.showEarlier13;v.jumpLatest13=()=>logic.scrollThread13?.("latest");
  const timestamp=(value?:string)=>value?new Date(value).toLocaleString():"Unavailable";
  v.i8Created=timestamp(sourceIssue?.created_at);v.i8Updated=timestamp(sourceIssue?.updated_at);
  v.i8RunState=latestRun?titleCase(latestRun.status):migrated?"Ready to continue":"Ready";v.i8RunTone="";
  v.i8ActionState=sourceIssue?titleCase(sourceIssue.status.replaceAll("_"," ")):"Loading";
  v.i8ActionTitle=latestRun?`Latest run: ${titleCase(latestRun.status)}`:migrated?"Continue this work":"Ready for Operator";
  v.i8ActionCopy=latestRun?.error||(migrated?"This work and its original discussion were imported successfully. Start when you are ready to continue.":"Start work when you are ready.");
  v.i8Model=latestRun?.model||"Not selected";v.i8Funding=latestRun?.funding||"Not charged";
  v.i8Credit=logic.cash((detail?.runs||[]).reduce((sum:number,r:Vals)=>sum+r.cost_cents,0)/100)+" used";
  v.i8FundingWarn=false;v.thinkingLabel=issueThinkingLabel(s.view,v.thinkingLabel,latestRun);
  v.i8Owner=currentIssue.owner||"Unassigned";v.i8OwnerInitial=currentIssue.ownerInitial||"?";
  v.i8Reporter=people.get(sourceIssue?.created_by)?.name||"Preserved in source record";
  v.i8PeopleNote="Issue history is shared with workspace members.";
  v.i8NoArtifactCopy=migrated?"No files attached to this imported issue.":"No output files have been recorded.";
  v.i8SourceLabel=migrated?"Imported from v1":currentIssue.source;
  if(s.view==="thread9"){
   const activeInspector=["issue","workflow","pr","runs"].includes(String(s.inspectorTab10))?String(s.inspectorTab10):"issue";
   const tabs=[["issue","Issue","circle-dot"],["workflow","Workflow","git-branch"],["pr","Pull requests","git-pull-request"],["runs","Runs","play"]];
   v.inspectorTabs12=tabs.map(([id,label,icon])=>({label,icon19:`/i15.svg#${icon}`,cls:activeInspector===id?"selected":"",pick:()=>logic.setState({inspectorTab10:id})}));
   v.issuePane12=activeInspector==="issue";v.wfPane18=activeInspector==="workflow";v.prPane12=activeInspector==="pr";v.runsPane12=activeInspector==="runs";
   v.filesPane12=false;v.usagePane12=false;v.outputPane12=false;v.activityPane12=false;v.conversationPane12=false;v.routineRunPane16=false;
   const prText=[...(detail?.comments||[]).map((comment:Vals)=>String(comment.body||"")),...(detail?.runs||[]).map((run:Vals)=>JSON.stringify(run.result||{}))].join("\n");
   const prMatch=/https:\/\/github\.com\/([^/\s]+)\/([^/\s)]+)\/pull\/(\d+)/i.exec(prText);
   v.livePrPane19=true;v.livePrURL19=prMatch?.[0]||"";v.livePrRepository19=prMatch?`${prMatch[1]}/${prMatch[2]}`:"";v.livePrNumber19=prMatch?`#${prMatch[3]}`:"";
   v.liveRunRows19=(detail?.runs||[]).map((run:Vals)=>({id:run.id,status:titleCase(String(run.status||"recorded")),purpose:titleCase(String(run.purpose||"work")),model:run.model||"Model not recorded",cost:logic.cash(Number(run.cost_cents||0)/100),when:timestamp(run.created_at),error:run.error||""}));
   v.workflowRunSummary12=v.liveRunRows19.length?`${v.liveRunRows19.length} recorded ${v.liveRunRows19.length===1?"run":"runs"}`:"No runs recorded";
  }
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
  }else{
   v.wfPaneVersion18="";v.wfPaneName18="No workflow linked";v.wfPaneLede18="This work can be continued directly with Operator, or linked to a workspace workflow.";
   v.wfLiveTone18="";v.wfNowEyebrow18="Ready";v.wfNowTitle18="No workflow is attached";v.wfNowCopy18="Choose a workflow from workspace settings when this work needs a repeatable execution path.";
   v.wfNowHasAction18=false;v.wfSteps18=[];v.wfSpend18="No workflow runs";v.openIssueWorkflow17=()=>{logic.setState({view:"settings",section:"workflows"});routeURL("settings",{section:"workflows"})};
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
   if(isSelectedPluginConnected){const draft=`Use ${s.plugin10} to `;logic.newChat();logic.setState({draft,dialog:null});routeURL("chat");saveDraft(ws.slug,null,draft);return}
   if(s.plugin10!=="GitHub"){logic.setState({dialog:"mcp10",mcpName10:s.plugin10,mcpUrl10:"",mcpAuth10:"none",mcpReview10:false,mcpError10:""});return}
   if(s.livePluginSecret)await api.request("POST",`/api/w/${ws.slug}/plugins`,{kind:"github",secret:s.livePluginSecret});
   if(s.liveRepoName)await api.request("POST",`/api/w/${ws.slug}/repositories`,{full_name:String(s.liveRepoName).trim()});
   if(!s.livePluginSecret&&!s.liveRepoName)throw new Error("Enter a token or repository name");
   logic.setState({livePluginSecret:"",liveRepoName:"",dialog:null});
  });
  v.pluginDisconnect10=()=>logic.generic(`Disconnect ${s.plugin10}?`,"New messages and routine runs will stop receiving this connector. Existing conversations and recorded results stay intact.",[],{
   genericText:`Workspace: ${String(logic.state.workspaceName||logic.state.workspace16||ws.slug)}\nConnector: ${s.plugin10}`,
   genericActionLabel:"Disconnect connector",
   genericAction:()=>{void write(async()=>{for(const plugin of selectedPlugins)await api.request("DELETE",`/api/w/${ws.slug}/plugins/${plugin.id}`);logic.setState({dialog:null})})()},
  });
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
  v.providerGroups13=(v.providerGroups13||[]).map((group:Vals)=>lastReportedProviderRing(group,s.accounts10||[]));
  const usage=s.liveUsage||{days:[],providers:[],total_cost_cents:0,runs:0};const usageTotal=Number(usage.total_cost_cents||0)/100;
  v.usageMonthNote19="Last 30 days from recorded workspace runs. No preview or estimated charges are included.";
  v.billingTabs14=(v.billingTabs14||[]).filter((tab:Vals)=>tab.label!=="Invoices");
  v.invoiceTab14=false;v.invoiceRows14=[];
  v.ugTotal19=logic.cash(usageTotal);v.ugOfNote19=`${Number(usage.runs||0)} recorded runs`;
  v.ugSlices19=(usage.providers||[]).filter((provider:Vals)=>Number(provider.cost_cents)>0).map((provider:Vals,index:number)=>{const amount=Number(provider.cost_cents)/100;return{key:provider.provider,name:titleCase(String(provider.provider||"Other")),cls:`s${index%3+1}`,amount:logic.cash(amount),share:usageTotal>0?`${Math.round(amount/usageTotal*100)}%`:"0%",style:`flex:${Math.max(amount,0.01)}`,title:`${titleCase(String(provider.provider||"Other"))} · ${logic.cash(amount)}`}});
  v.ugPeople19=(usage.providers||[]).map((provider:Vals)=>({key:provider.provider,initial:titleCase(String(provider.provider||"?"))[0]||"?",name:titleCase(String(provider.provider||"Other")),meta:`${Number(provider.runs||0)} runs`,amount:logic.cash(Number(provider.cost_cents||0)/100)}));
  v.ugTasks19=(usage.days||[]).slice().reverse().map((day:Vals)=>({key:day.day,id:new Date(day.day).toLocaleDateString(),title:`${Number(day.runs||0)} recorded runs`,meta:"Workspace usage",amount:logic.cash(Number(day.cost_cents||0)/100),open:()=>{}}));
  v.ugFootNote19="Every figure comes from a recorded workspace run. Provider subscription quota is never converted into credit.";
  v.monthlyText=Number(s.monthly||0)>0?`${logic.cash(s.monthly)} included credit available now`:"No included credit remaining";
  const repositoryByName=new Map<string,Vals>();for(const repository of s.repos14||[])repositoryByName.set(String(repository.name),repository);
  v.repoTabs14=(v.repoTabs14||[]).map((row:Vals)=>{const repository=repositoryByName.get(String(row.name));return repository?{...row,sub:`Default branch ${repository.branch}`,ready:"Connected",tone:"ok14",readyIcon:"/i15.svg#circle-check"}:row});
  const selectedRepository=(s.repos14||[]).find((repository:Vals)=>repository.id===s.repoSel14)||(s.repos14||[])[0];
  const hasGitHubConnection=(s.livePlugins||[]).some((plugin:Vals)=>pluginKey(plugin.kind)==="github"&&plugin.status==="connected");
  if(selectedRepository){v.repoName14=selectedRepository.full;v.repoMeta14=`Default branch ${selectedRepository.branch}`;v.repoState14=hasGitHubConnection?"Connected":"Needs reconnection";v.repoTone14=hasGitHubConnection?"ok14":"bad14";v.repoConnected14=hasGitHubConnection;v.repoHealth14=[{title:"GitHub connection",detail:hasGitHubConnection?"Available to this workspace":"Reconnect GitHub before starting repository work",tone:hasGitHubConnection?"ok14":"bad14",icon:"/i15.svg#"+(hasGitHubConnection?"circle-check":"circle-alert"),when:""},{title:"Default branch",detail:selectedRepository.branch,tone:"ok14",icon:"/i15.svg#git-branch",when:""}];}
  v.repoConfigAvailable14=false;v.repoConnectLabel14=hasGitHubConnection?"Manage connection":"Reconnect";v.repoConnect14=()=>logic.showPlugin10("GitHub");
  const designProject="https://claude.ai/design/p/3409ba65-04b6-44b3-af90-d9eac984e5ec";
  const openDesign=(file:string)=>window.open(`${designProject}?file=${encodeURIComponent(file)}`,"_blank","noopener,noreferrer");
  const hasFigmaConnection=(s.livePlugins||[]).some((plugin:Vals)=>pluginKey(plugin.kind)==="figma"&&plugin.status==="connected");
  v.dsName15="BotInc product design";v.dsMeta15="Workspace v19 · Landing v4 · Claude Design";v.dsOpen15=()=>openDesign("Workspace v19.dc.html");
  v.designRows16=[
   {title:"Workspace v19",copy:"Workspace shell, chat, work, routines, settings, and responsive behavior.",kind16:"Claude Design",updated16:"Current",state:"Active",tone:"ok14",hasLogo16:true,logo16:"/assets/brands-v12/claude.svg",logoCls16:"has-logo16",editLabel:"Source",action:"Open",edit:()=>openDesign("Workspace v19.dc.html"),open:()=>openDesign("Workspace v19.dc.html")},
   {title:"Landing v4",copy:"Public product, pricing, model routing, and responsive landing experience.",kind16:"Claude Design",updated16:"Current",state:"Active",tone:"ok14",hasLogo16:true,logo16:"/assets/brands-v12/claude.svg",logoCls16:"has-logo16",editLabel:"Source",action:"Open",edit:()=>openDesign("Landing v4.dc.html"),open:()=>openDesign("Landing v4.dc.html")},
   {title:"Figma connection",copy:"Design files and components available to Operator through the migrated plugin.",kind16:"Plugin",updated16:"Connected account",state:hasFigmaConnection?"Connected":"Not connected",tone:hasFigmaConnection?"ok14":"warn14",hasLogo16:true,logo16:"/assets/brands-v12/figma.svg",logoCls16:"has-logo16",editLabel:"Manage",action:hasFigmaConnection?"Use":"Connect",edit:()=>logic.showPlugin10("Figma"),open:()=>logic.showPlugin10("Figma")},
  ];
  v.dsAdd15=()=>logic.showPlugin10("Figma");
  v.pfWeeks15=[];v.pfMonths15=[];v.pfStats15=[];v.pfActivitySummary15="Repository activity appears after connected repositories report it.";v.pfFoot15="No repository contribution activity has been reported yet.";
  if(Array.isArray(v.conversationGroups12))v.conversationGroups12=v.conversationGroups12.map((group:Vals)=>({...group,rows:(group.rows||[]).map((row:Vals)=>{
   const id=String(row.id||"");
   if(id.startsWith("chat:")&&uuid(id.slice(5)))return{...row,open:()=>{void openChat(id.slice(5))}};
   if(id.startsWith("issue:")){const issue=id.slice(6);const issueRow=(logic.state.issues||[]).find((item:Vals)=>item.id===issue||item.uuid===issue);return{...row,open:()=>{logic.setState({activeIssue:issue,view:"thread9",issueComment:"",threadDraft9:readDraft(ws.slug,issueRow?.uuid||issue),liveIssueDetail:null,liveIssueFiles:[],...threadInspectorPatch(window.matchMedia("(min-width: 901px)").matches)});routeURL("thread9",{activeIssue:issue});void hydrate({reuseInventory:true}).catch(fail)}}}
   return row;
  })}));
  for(const key of ["sendMessage","sendComposer10","sendComposer11","sendThreadMessage9"])v[key]=send;
  v.editComposer10=(event:Event)=>{const value=(event.target as HTMLTextAreaElement).value;if(s.view==="thread9"){const issueID=currentIssue.uuid||currentIssue.id;logic.setState({threadDraft9:value,composerError10:""});saveDraft(ws.slug,issueID,value)}else{logic.setState({draft:value,composerError10:""});saveDraft(ws.slug,s.activeChat,value)}};
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
   if(!["claude","codex","deepseek","openrouter"].includes(s.addProvider))throw new Error("This provider is not available for remote runs");
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
  return normalizePublicAssets(v) as Vals;
 });
 logic.forceUpdate?.();
  const popRoute=()=>{const route=parseWorkspaceRoute(new URL(window.location.href));if(route.workspace!==ws.slug){window.location.reload();return}if(route.conversation){logic.setState({view:"chat",activeChat:route.conversation,draft:readDraft(ws.slug,route.conversation)});void hydrate({reuseInventory:true}).catch(fail)}else if(route.issue){const thread=route.view==="thread9";logic.setState({view:thread?"thread9":"issue",activeIssue:route.issue,threadDraft9:readDraft(ws.slug,route.issue),...threadInspectorPatch(thread&&window.matchMedia("(min-width: 901px)").matches)});void hydrate({reuseInventory:true}).catch(fail)}else{logic.setState({view:route.view,...route.view==="chat"?{activeChat:null,draft:readDraft(ws.slug,null)}:{},...route.autopilot?{activeAuto9:route.autopilot}:{},...route.section?{section:route.section}:{}});if(route.workflow&&typeof logic.openGraph14==="function")void logic.openGraph14(route.workflow)}};
 window.addEventListener("popstate",popRoute);
 return()=>{disposed=true;finishPaneDrag?.();if(paneFrame!==undefined)cancelAnimationFrame(paneFrame);window.removeEventListener("popstate",popRoute);for(const[k,v]of originals){if(v===undefined)delete logic[k];else logic[k]=v}};
}
export {mapIssue,mapConversation,mapAutopilot,mapAccount,mapRun};
