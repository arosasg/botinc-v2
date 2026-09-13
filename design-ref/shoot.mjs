// Screenshot design previews. serve_url is kept in memory only.
import { chromium } from '/usr/local/lib/node_modules/playwright/index.mjs';
const A="825b8b30-375c-478c-afc2-9f88c3b168a8", P="3409ba65-04b6-44b3-af90-d9eac984e5ec";
const { BOTINC_SERVER_URL: srv, BOTINC_WORKSPACE_ID: ws, BOTINC_TOKEN: tok } = process.env;
async function serveUrl(path){
  const r = await fetch(`${srv}/api/design/accounts/${A}/call?workspace_id=${ws}`, {method:'POST',headers:{Authorization:`Bearer ${tok}`,'Content-Type':'application/json'},body:JSON.stringify({name:'render_preview',arguments:{project_id:P,path}})});
  const j = await r.json(); return JSON.parse(j.content[0].text).serve_url;
}
const [,, file, outPrefix, ...rest] = process.argv;
const opts = Object.fromEntries(rest.map(s=>{const i=s.indexOf('='); return [s.slice(0,i), s.slice(i+1)];}));
const url = await serveUrl(file);
const browser = await chromium.launch();
const widths = (opts.widths||'1440,390').split(',').map(Number);
for (const w of widths) {
  const h = w<500?844:900;
  for (const theme of (opts.themes||'light,dark').split(',')) {
    const ctx = await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',reducedMotion:'reduce'});
    await ctx.addInitScript(() => {
      let real; window.__logics=[];
      Object.defineProperty(window,'DCLogic',{configurable:true,get(){return real},set(v){ real=v; const o=v.prototype.setState; v.prototype.setState=function(...a){ if(!window.__logics.includes(this)) window.__logics.push(this); return o.apply(this,a); }; }});
    });
    const page = await ctx.newPage();
    const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
    await page.goto(url, {waitUntil:'networkidle', timeout:120000});
    await page.waitForTimeout(1200);
    // apply state: theme + custom
    const st = Object.assign({theme}, opts.state? JSON.parse(opts.state):{});
    await page.evaluate((st)=>{ const l=window.__logics.at(-1); if(l) l.setState(st); try { window.__dcSetProps(window.__dcRootName(), {theme: st.theme}); } catch(e) {} }, st);
    if (opts.go) { await page.evaluate((g)=>{ const l=window.__logics.at(-1); const [v,extra]=g.split(':'); l.go(v, extra? JSON.parse(extra):{}); }, opts.go); }
    if (opts.setting) { await page.evaluate((g)=>{ const l=window.__logics.at(-1); l.setting(g); }, opts.setting); }
    if (opts.freeze) { await page.evaluate((f)=>{ const l=window.__logics.at(-1); clearInterval(l.rti); clearInterval(l.wfi); clearTimeout(l.t); clearInterval(l.ti); clearTimeout(l.tl); const [idx,wf,rt]=f.split(',').map(Number); l.setState({idx,wf,rt,typed: idx>l.at('type')?l.TEXT:''}); }, opts.freeze); }
    if (opts.call) { await page.evaluate((c)=>{ const l=window.__logics.at(-1); for (const name of c.split(',')) { if (typeof l[name]==='function') { try { l[name]({preventDefault(){},stopPropagation(){},currentTarget:document.body,target:document.body}); } catch(e){ console.log('call err',name,String(e)); } } } }, opts.call); }
    await page.waitForTimeout(1500);
    if (opts.probe) { console.log('probe:', JSON.stringify(await page.evaluate(opts.probe))); }
    const out = `shots/${outPrefix}-${theme}-${w}.png`;
    await page.screenshot({path: out, fullPage: opts.full!=='0'});
    const dims = await page.evaluate(()=>({sw:document.documentElement.scrollWidth, sh:document.documentElement.scrollHeight, logics: window.__logics.length, view: window.__logics.at(-1)?.state?.view}));
    console.log(out, JSON.stringify(dims), errs.length? 'errors: '+errs.slice(0,3).join(' | ').replace(/https?:\S+/g,'<url>'):'');
    await ctx.close();
  }
}
await browser.close();
