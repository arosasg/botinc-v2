#!/usr/bin/env python3
"""Apply product-only input bindings after the design generator."""
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
