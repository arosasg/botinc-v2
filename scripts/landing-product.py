#!/usr/bin/env python3
"""Deterministic product bindings layered over the generated design markup."""
import re
from pathlib import Path
p=Path("apps/web/features/landing/landing-view.tsx")
s=p.read_text()
if 'import { EmailSignIn }' not in s: s=s.replace('import { useLanding }','import { EmailSignIn } from "./email-sign-in";\nimport { useLanding }')
s=re.sub(r'<label className="sr-only" htmlFor="email">.*?<p className="ob-fine">Preview only\. No account is created\.</p>', '<EmailSignIn v={v} />',s,flags=re.S)
s=s.replace('<span>Sample work · simulated actions</span>','<span>See how Operator works</span>')
s=s.replace('Preview only. Connections are simulated; nothing is read from your accounts.','Connections are authorized after you sign in. Nothing is read without your approval.')
s=s.replace('Simulated authorization. No real account is connected.','Sign in to authorize this connection securely.')
s=s.replace('This opens a simulated provider authorization. No credentials are requested or stored in the design.','Sign in to continue to the provider&apos;s secure authorization screen.')
s=s.replace('Sample figures. No live model ran.','Illustrative usage. Actual receipts come from completed runs.')
s=re.sub(r'\s*<footer className=\{v\.footCls\}>.*?</footer>', '', s, flags=re.S)
p.write_text(s)
