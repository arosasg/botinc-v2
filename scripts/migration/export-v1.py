#!/usr/bin/env python3
"""Read-only, restartable export using the caller's existing BotInc authorization.
Never switches profiles, reads credentials, changes routines or starts runs.
"""
import argparse, concurrent.futures, hashlib, json, os, pathlib, subprocess, sys
p=argparse.ArgumentParser();p.add_argument('--workspace-id',required=True);p.add_argument('--output',type=pathlib.Path,required=True);a=p.parse_args()
a.output.mkdir(parents=True,exist_ok=True,mode=0o700)
def call(*args):
 r=subprocess.run(['botinc','--workspace-id',a.workspace_id,*args,'--output','json'],capture_output=True,text=True,timeout=90)
 if r.returncode:raise RuntimeError(r.stderr.strip())
 if 'Next ' in r.stderr and 'cursor' in r.stderr:raise RuntimeError('Unconsumed pagination cursor for '+args[0])
 return json.loads(r.stdout)
def save(name,value):
 path=a.output/name;tmp=path.with_suffix('.tmp');fd=os.open(tmp,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
 with os.fdopen(fd,'w') as f:json.dump(value,f,ensure_ascii=False)
 tmp.replace(path)
workspace=call('workspace','get');assert workspace['id']==a.workspace_id
save('workspace.json',workspace);save('members.json',call('workspace','member','list'));save('projects.json',call('project','list'));save('agents.json',call('agent','list'))
issues=[];offset=0
while True:
 page=call('issue','list','--limit','200','--offset',str(offset),'--sort','created_at','--direction','asc');issues+=page['issues']
 if not page.get('has_more'):break
 if not page['issues']:raise RuntimeError('Empty issue page before completion')
 offset+=len(page['issues'])
if len({i['id'] for i in issues})!=len(issues) or len(issues)!=page['total']:raise RuntimeError('Issue inventory changed during pagination; rerun export')
save('issues.json',issues)
routines=call('routine','list');save('routines.json',routines)
save('routines-full.json',[call('routine','get',r['id']) for r in routines['autopilots']])
for folder in ['comments','runs']:(a.output/folder).mkdir(exist_ok=True,mode=0o700)
def history(issue):
 for kind,command in [('comments',['issue','comment','list',issue['id'],'--full']),('runs',['issue','runs',issue['id']])]:
  save(kind+'/'+issue['id']+'.json',call(*command))
 return issue['id']
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for n,_ in enumerate(pool.map(history,issues),1):
  if n%100==0:print('Exported history',n,'/',len(issues),flush=True)
files={str(f.relative_to(a.output)):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(a.output.rglob('*.json')) if f.name!='manifest.json'}
save('manifest.json',{'format':1,'workspace_id':a.workspace_id,'issue_count':len(issues),'routine_count':len(routines['autopilots']),'files':files})
print('Complete:',len(issues),'issues,',len(routines['autopilots']),'routines,',len(files),'hashed files')
