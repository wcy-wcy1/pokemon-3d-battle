const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core'),fs=require('fs');
(async()=>{let b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const page=await b.newPage({viewport:{width:500,height:320}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text())});await page.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
await page.evaluate(()=>{S.team=[25,9,150];exOpen(0);cancelAnimationFrame(field.frame)});await page.waitForFunction(()=>field.p.ready&&field.e.ready);await page.evaluate(()=>{field.el.querySelector('.exStart').click();field.blocks=[];field.wx.left=9999;field.e.hp=field.e.max=100000});
const ids=await page.evaluate(()=>Object.keys(choreo).map(Number)),rows=[];
for(let id of ids){const row=await page.evaluate(async id=>{let f=field;const idx=(f.slot+1)%3;f.team[idx]=exUnit(db[id]);exSwitch(f,idx,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,8));
 let u=f.p,e=f.e,pr=choreo[id],near=family(pr.k)==='contact'?1.20:Math.min(3.8,pr.r*.72);u.face=Math.PI/2;u.pos.set(-near/2,0,0);e.pos.set(near/2,0,0);e.air=0;e.vy=0;e.stun=9999;e.sleepUntil=e.sleepGuard=e.slowUntil=e.drowsy=0;e.scorch=null;e.inv=0;const tick=()=>exSim(f,1/60);
 for(let j=0;j<48;j++)tick();f.cd[1]=0;let hp=e.hp;exAct(f,1);const cmd=u.cmd;let slept=false,origin=null;for(let j=0;j<240;j++){if(u.volts?.phase==='armed')exAct(f,1);tick();slept||=e.sleepUntil>f.t;if(!origin&&f.shots.length)origin=f.shots[0].o.position.toArray();if(j===32){f.updateSight();f.r.render(f.sc,f.cam)}}
 return {id,name:u.d.name,move:u.d.move,kind:pr.k,model:u.model3d,damage:hp-e.hp,slept,ended:!(u.cmd||u.volts||u.jet),origin,ray:cmd?.ray?.start.toArray(),range:near}
 },id);rows.push(row);if(!row.model||!row.ended||(!row.damage&&!row.slept))console.log('MISS',JSON.stringify(row))}
fs.writeFileSync('work/roster-cast-results.json',JSON.stringify({rows,errors},null,2));if(errors.length||rows.some(r=>!r.model||!r.ended||(!r.damage&&!r.slept)))throw Error('see roster-cast-results.json');console.log('PASS',rows.length,'signature moves on live models')
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
