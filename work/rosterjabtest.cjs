const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core'),fs=require('fs');
(async()=>{let b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const page=await b.newPage({viewport:{width:500,height:320}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text())});await page.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
await page.evaluate(()=>{S.team=[25,9,150];exOpen(0);cancelAnimationFrame(field.frame)});await page.waitForFunction(()=>field.p.ready&&field.e.ready);await page.evaluate(()=>{field.el.querySelector('.exStart').click();field.blocks=[];field.wx.left=9999;field.e.hp=field.e.max=100000});
const ids=await page.evaluate(()=>Object.keys(choreo).map(Number)),rows=[];
for(let id of ids){const row=await page.evaluate(async id=>{let f=field;const idx=(f.slot+1)%3;f.team[idx]=exUnit(db[id]);exSwitch(f,idx,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,8));
 let u=f.p,e=f.e,pr=choreo[id],near=family(pr.b)==='contact'?(id===7?.65:id===25?.90:1.20):3.2;u.face=Math.PI/2;u.pos.set(-near/2,0,0);e.pos.set(near/2,0,0);e.air=0;e.vy=0;e.stun=9999;e.sleepUntil=e.sleepGuard=e.slowUntil=e.drowsy=0;e.scorch=null;e.inv=0;const tick=()=>exSim(f,1/60);
 for(let j=0;j<48;j++)tick();f.cd[0]=0;let hp=e.hp;exAct(f,0);const cmd=u.cmd;let contact=null;for(let j=0;j<120;j++){tick();if(!contact&&e.hp<hp)contact={time:f.t-cmd.t,air:u.air,dist:dst(e.pos,u.pos),height:e.height};if(j===15){f.updateSight();f.r.render(f.sc,f.cam)}}
 return {id,name:u.d.name,move:pr.n,kind:cmd?.k,model:u.model3d,damage:hp-e.hp,ended:!u.cmd,contact,range:near}
 },id);rows.push(row);if(!row.model||!row.ended||!row.damage)console.log('MISS',JSON.stringify(row))}
fs.writeFileSync('work/roster-jab-results.json',JSON.stringify({rows,errors},null,2));if(errors.length||rows.some(r=>!r.model||!r.ended||!r.damage))throw Error('see roster-jab-results.json');console.log('PASS',rows.length,'basic attacks on live models')
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
