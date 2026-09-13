#!/usr/bin/env python3
"""Materialize an already retrieved staging secret without shell evaluation."""
import json,os,pathlib,sys
secret=json.loads(pathlib.Path(sys.argv[1]).read_text())
root=pathlib.Path(sys.argv[2]);root.mkdir(parents=True,exist_ok=True)
for name,values in [('api',secret['api']),('postgres',secret['postgres'])]:
 for key,value in values.items():
  if not key.replace('_','').isalnum() or '\n' in str(value) or '\r' in str(value):raise ValueError('invalid environment entry')
 target=root/f'.{name}.env'
 fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
 with os.fdopen(fd,'w') as out:out.write(''.join(f'{key}={value}\n' for key,value in values.items()))
