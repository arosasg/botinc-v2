#!/usr/bin/env python3
"""Deterministic product bindings layered over the generated design markup."""
import re
from pathlib import Path
p=Path("apps/web/features/landing/landing-view.tsx")
s=p.read_text()
if 'import { EmailSignIn }' not in s: s=s.replace('import { useLanding }','import { EmailSignIn } from "./email-sign-in";\nimport { useLanding }')
s=re.sub(r'<label className="sr-only" htmlFor="email">.*?<p className="ob-fine">Preview only\. No account is created\.</p>', '<EmailSignIn v={v} />',s,flags=re.S)
p.write_text(s)
