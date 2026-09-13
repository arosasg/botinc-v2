// Run against a task-private API with BOTINC_DEV_VERIFICATION_CODE=000000.
// WEB_URL=http://127.0.0.1:38124 API_URL=http://127.0.0.1:38123 node ...
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const web=process.env.WEB_URL,api=process.env.API_URL;
if(!web||!api)throw new Error('WEB_URL and API_URL are required');
const browser=await chromium.launch({headless:true,channel:process.env.CHROME_CHANNEL||'chrome'});
try{
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Browser exception:',e.message)});page.on('console',m=>{if(m.type()==='error')console.error('Browser console:',m.text())});
 await page.goto(web+'/w');await page.getByText('Sign in to open your workspace.',{exact:true}).waitFor();
 await page.goto(web);await page.getByRole('button',{name:'Start free',exact:true}).first().click();
 const email=`browser-${Date.now()}@example.test`;
 await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByRole('button',{name:'Continue with email',exact:true}).click();
 await page.getByLabel('Sign-in code',{exact:true}).fill('111111');await page.getByRole('button',{name:'Verify code',exact:true}).click();await page.getByRole('alert').waitFor();
 await page.getByLabel('Sign-in code',{exact:true}).fill('000000');await page.getByRole('button',{name:'Verify code',exact:true}).click();
 await page.waitForFunction(()=>!document.querySelector('#code'));
 const identity=await ctx.request.get(api+'/api/me');assert.equal(identity.status(),200);assert.equal((await identity.json()).user.email,email);
 const workspaces=await(await ctx.request.get(api+'/api/workspaces')).json();const slug=workspaces.workspaces[0].slug;
 await page.goto(web+'/w');await page.waitForFunction(()=>window.__dcLogic?.state.member?.startsWith('browser-')).catch(async e=>{console.error((await page.locator('body').innerText()).slice(0,1200));throw e});
 await page.waitForTimeout(400);
 const secret=await(await ctx.request.post(api+'/api/me/keys',{data:{name:'Browser key'}})).json();assert.ok(secret.token);
 const forbidden=await ctx.request.post(api+'/api/w/'+slug+'/issues',{headers:{Authorization:'Bearer '+secret.token},data:{title:'Must be rejected'}});assert.equal(forbidden.status(),403);
 const saved=await(await ctx.request.post(api+'/api/w/'+slug+'/conversations',{data:{title:'Saved conversation',message:'Persist this real message'}})).json();
 await page.evaluate(id=>window.__dcLogic.loadChat(id),saved.conversation.id);await page.getByText('Persist this real message',{exact:true}).waitFor();
 await page.evaluate(()=>window.__dcLogic.newIssue14());await page.getByLabel('Issue title',{exact:true}).fill('Browser persisted issue');await page.getByLabel('Context',{exact:true}).fill('Created through the real form');await page.getByRole('button',{name:'Create issue',exact:true}).click();
 await page.waitForFunction(()=>window.__dcLogic.state.issues.some(i=>i.title==='Browser persisted issue'));
 await page.evaluate(()=>{const l=window.__dcLogic;l.go('settings',{section:'memory'});l.setState({memoryScope14:'personal'});l.addMemory14()});
 await page.locator('.mem14 textarea').fill('A fact saved in the browser');await page.getByRole('button',{name:'Save memory',exact:true}).click();await page.getByText('A fact saved in the browser',{exact:true}).waitFor();
 await page.reload();await page.waitForFunction(()=>window.__dcLogic?.state.memories14?.some(m=>m.text==='A fact saved in the browser'));
 if(process.env.PROOF_DIR){await fs.mkdir(process.env.PROOF_DIR,{recursive:true});for(const [theme,width]of [['light',1440],['dark',1440],['light',390]]){await page.setViewportSize({width,height:1000});await page.evaluate(theme=>{window.__dcLogic.setState({theme});window.__dcLogic.go('settings',{section:'memory'})},theme);await page.waitForTimeout(600);await page.screenshot({path:`${process.env.PROOF_DIR}/live-memory-${theme}-${width}.png`,fullPage:true})}}
 assert.deepEqual(errors,[]);console.log('PASS: signed-out gate, browser email sign-in, invalid-code error, authenticated cookie, read-only key, saved conversation, issue creation, memory persistence, no browser exceptions');
}finally{await browser.close()}
