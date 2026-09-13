#!/usr/bin/env python3
"""Apply product-only input bindings after the design generator."""
from pathlib import Path
p=Path("apps/web/features/workspace/views/dialog-addaccountdialog.tsx")
s=p.read_text()
if 'onChange={v.editLiveAccountSecret}' not in s: s=s.replace('value={v.addKeySample}', 'type="password" autoComplete="new-password" onChange={v.editLiveAccountSecret} value={v.addKeySample}')
s=s.replace("This design preview never asks for a real key. In the product the key is requested here and stored against\n                  the provider&apos;s environment variable, never shown again.","The key is stored encrypted and passed only to your remote runs.")
s=s.replace("Simulated authorization with a sample identity. No credential is collected and nothing is sent to the\n              provider.","The account is saved to this workspace. Usage is reported by the provider during a run.")
p.write_text(s)
