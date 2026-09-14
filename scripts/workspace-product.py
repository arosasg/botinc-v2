#!/usr/bin/env python3
"""Apply product-only input bindings after the design generator."""
import re
from pathlib import Path
p=Path("apps/web/features/workspace/views/dialog-addaccountdialog.tsx")
s=p.read_text()
if 'onChange={v.editLiveAccountSecret}' not in s: s=s.replace('value={v.addKeySample}', 'type="password" autoComplete="new-password" onChange={v.editLiveAccountSecret} value={v.addKeySample}')
s=s.replace("This design preview never asks for a real key. In the product the key is requested here and stored against\n                  the provider&apos;s environment variable, never shown again.","The key is stored encrypted and passed only to your remote runs.")
s=s.replace("Simulated authorization with a sample identity. No credential is collected and nothing is sent to the\n              provider.","The account is saved to this workspace. Usage is reported by the provider during a run.")
p.write_text(s)

p=Path("apps/web/features/workspace/views/dialog-plugindialog10.tsx")
s=p.read_text()
if 'v.liveGitHub' not in s:
 s=s.replace('<button className="button primary" onClick={v.pluginConnect10}>','''{v.liveGitHub ? <>
            <label>GitHub token<input type="password" autoComplete="new-password" value={v.livePluginSecret} onChange={v.editLivePluginSecret} /></label>
            <label>Repository<input placeholder="owner/repository" value={v.liveRepoName} onChange={v.editLiveRepoName} /></label>
            <p className="fine">Use a token with repository contents and pull-request write access. Leave the token blank to use your saved connection.</p>
          </> : null}
          <button className="button primary" onClick={v.pluginConnect10}>''')
s=s.replace('Connection preview only. No account authorization is sent.','Connections are verified with the provider before they are saved.')
p.write_text(s)

p=Path("apps/web/features/workspace/views/shell-sidebar.tsx")
s=p.read_text().replace('<span>BotInc</span>', '<span>{interp(v.workspaceName || "BotInc")}</span>')
p.write_text(s)

p=Path("apps/web/features/workspace/views/shell-botinc-landing.tsx")
s=re.sub(r'\n\s*<small>Design proposal · Sample work and simulated actions</small>', '', p.read_text())
p.write_text(s)


p=Path("apps/web/features/workspace/views/dialog-topupdialog.tsx")
s=p.read_text().replace('Simulated checkout. No charge will be made.', '{interp(v.checkoutNotice || "Checkout preview")}')
s=s.replace('className="button primary" onClick={v.payTopup}', 'className="button primary" disabled={v.checkoutBusy} onClick={v.payTopup}')
p.write_text(s)

replacements={
 "apps/web/features/workspace/views/overlay-overlay12-1.tsx":{
  "Sample case":"Example configuration",
  "Sample workflow. Saving a version changes future sample runs only.":"Saving a version changes future runs only.",
 },
 "apps/web/features/workspace/views/page-settings.tsx":{
  "Invitations are sample records. Nothing is emailed and no account is created.":"Invitations are emailed after you confirm them.",
  "Sample records. No live billing runs from this design.":"Usage entries come from completed workspace runs.",
  "Sample invoices. No payment method is charged and no document is issued.":"Invoices appear after a completed payment.",
  "Shortcuts are shown for the design preview. Rebinding is a product setting that is not simulated here.":"Keyboard shortcuts are available throughout the workspace.",
 },
 "apps/web/features/workspace/views/dialog-roledialog14.tsx":{
  "Owner-only powers stay with the owner. Changes here are simulated; the server enforces the real ones.":"Owner-only powers stay with the owner. The server enforces every role change.",
 },
 "apps/web/features/workspace/views/dialog-skillcreatedialog.tsx":{"Preview sample import":"Review import"},
 "apps/web/features/workspace/views/dialog-twostepdialog19.tsx":{
  "Sample screen in this design. No authenticator app is contacted.":"Two-step verification is not available on this deployment yet.",
 },
 "apps/web/features/workspace/views/page-conversation-inspector.tsx":{
  "Sample pull request · Actions stay in this design":"Pull-request activity from the connected repository",
  "No call in this sample":"No call recorded",
 },
 "apps/web/features/workspace/views/page-schedule.tsx":{
  "Sample routines and recorded activity. Nothing runs from this design.":"Routines stay paused until you enable them. Activity is recorded after each run.",
 },
 "apps/web/features/workspace/views/dialog-voicestartdialog10.tsx":{
  "Simulated voice and actions. No microphone, live models, or charges.":"Voice calls are not available on this deployment yet.",
 },
 "apps/web/features/workspace/views/dialog-checkoutdialog.tsx":{
  "USD. Tax calculated at checkout. Sample Visa 4242. No real charge.":"USD. Tax is calculated at checkout. Payment is processed securely by Stripe.",
 },
 "apps/web/features/workspace/views/dialog-computerdialogv6.tsx":{
  "Sample run history for this computer. Open a task in Work to inspect its full evidence.":"Open a task in Work to inspect its full run history and evidence.",
 },
 "apps/web/features/workspace/views/dialog-connectdialog.tsx":{
  "Simulated authorization. No real account is connected.":"The connection is verified before it is saved to this workspace.",
 },
 "apps/web/features/workspace/views/dialog-calldecisiondialog9.tsx":{"Start sample call":"Start call"},
 "apps/web/features/workspace/views/dialog-authdialog.tsx":{
  "Prototype sign-in. No account is created.":"Sign in securely to keep this conversation in your workspace.",
 },
 "apps/web/features/workspace/views/dialog-invitedialog14.tsx":{
  "Prototype only. No invitation is emailed and no account is created.":"Invitation links are created securely and can be revoked from this workspace.",
 },
 "apps/web/features/workspace/views/dialog-previewdialog.tsx":{
  "REVIEW CONTROLS · SIMULATION ONLY":"WORKSPACE CONTROLS",
  "Explore the whole experience.":"Workspace diagnostics",
  "Preview as":"View as",
  "Switching members is a design test control. It changes private chats and connections while keeping shared issues.":"Private chats and personal connections remain scoped to the signed-in member.",
 },
 "apps/web/features/workspace/views/dialog-calldecisiondialog9.tsx":{
  "OPERATOR CALL · SIMULATION":"OPERATOR CALL",
  "Tap an answer to simulate speaking. Your microphone is not used.":"Choose an answer to continue. Microphone input is not available in this browser yet.",
 },
 "apps/web/features/workspace/views/dialog-quickaccountdialog10.tsx":{
  "This opens a simulated provider authorization. No credentials are requested or stored in the design.":"Continue to the provider&apos;s secure authorization screen. Use Model accounts for API-key access.",
 },
}
for path, values in replacements.items():
 p=Path(path);s=p.read_text()
 for old,new in values.items():s=s.replace(old,new)
 p.write_text(s)


p=Path("apps/web/features/workspace/views/page-issue-detail.tsx")
s=p.read_text()
start='<div className="i8-artifact-buttons">'
if 'v.liveIssueFiles' not in s:
 pos=s.index(start);end=s.index('</div>',pos)
 old=s[pos+len(start):end]
 s=s[:pos+len(start)]+"{v.liveIssueFiles ? v.liveIssueFiles.map((file: any) => <a key={file.id} className=\"small-button\" href={file.url} target=\"_blank\" rel=\"noopener noreferrer\">{file.filename}</a>) : <>"+old+"</>}"+s[end:]
p.write_text(s)
