const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core'),fs=require('fs');
(async()=>{let b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const page=await b.newPage({viewport:{width:500,height:320}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text())});await page.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
await page.evaluate(()=>{S.team=[25,9,150];exOpen(0);cancelAnimationFrame(field.frame)});await page.waitForFunction(()=>field.p.ready&&field.e.ready);await page.evaluate(()=>{field.el.querySelector('.exStart').click();field.blocks=[];field.wx.left=9999;field.e.hp=field.e.max=100000});
const ids=await page.evaluate(()=>Object.keys(choreo).map(Number)),rows=[];
for(let id of ids){const row=await page.evaluate(async id=>{let f=field;const idx=(f.slot+1)%3;f.team[idx]=exUnit(db[id]);exSwitch(f,idx,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,8));
 let u=f.p,e=f.e;u.pos.set(-1.1,0,0);e.pos.set(1.1,0,0);e.stun=9999;u.max=u.hp=1000;u.face=Math.PI/2;let tick=()=>exSim(f,1/90);for(let i=0;i<70;i++)tick();
 // Hit from one side, then strike from the opposite side during the first bend.
 const hp=u.hp;exHurt(f,u,70,e.d,false,V(0,0,1));if(!u.recoil||u.hp>=hp)throw Error('hit missing '+id);
 let chestPeak=0,neckPeak=0,chestFrame=0,neckFrame=0;
 for(let i=0;i<80;i++){tick();let k=u.recoil;if(k.chest.p.z>chestPeak){chestPeak=k.chest.p.z;chestFrame=i}if(k.neck.p.z>neckPeak){neckPeak=k.neck.p.z;neckFrame=i}if(i===6){if([35,92,113,131,143].includes(id)&&!u.motion.softShapes.some(m=>Math.abs(m.morphTargetInfluences[2])+Math.abs(m.morphTargetInfluences[3])>.001))throw Error("no localized reaction "+id);f.updateSight();f.r.render(f.sc,f.cam)}}
 exHurt(f,u,70,e.d,false,V(0,0,1));for(let j=0;j<6;j++)tick();let k=u.recoil,before=k.chest.p.clone(),vel=k.chest.v.z;exHurt(f,u,70,e.d,false,V(0,0,-1));
 if(k!==u.recoil||before.distanceTo(k.chest.p)>1e-8||k.chest.v.z>=vel)throw Error('reaction snapped '+id);
 for(let j=0;j<275;j++)tick();if(u.recoil)throw Error('not recovered '+id);
 return {id,kg:u.d.kg,model:u.model3d,chestPeak,neckPeak,chestFrame,neckFrame,head:!!u.motion?.head}
 },id);rows.push(row);if(!row.model||!row.chestPeak||row.neckFrame<=row.chestFrame)throw Error('bad reaction '+JSON.stringify(row))}
 const pika=rows.find(r=>r.id===25),snorlax=rows.find(r=>r.id===143);if(pika.chestPeak<snorlax.chestPeak*2||pika.chestFrame>=snorlax.chestFrame)throw Error('mass response missing');
 fs.writeFileSync('work/roster-recoil-results.json',JSON.stringify({rows,errors},null,2));if(errors.length)throw Error(errors);console.log('PASS',rows.length,'real rigs: continuity, directional impulse, lag, mass, recovery',pika.chestPeak,snorlax.chestPeak)
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
