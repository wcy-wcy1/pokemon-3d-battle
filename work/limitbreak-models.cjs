const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{const p=await b.newPage({viewport:{width:420,height:280}}),errors=[];
p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(/shader error|validate_status|webgl: invalid|webglprogram:/i.test(m.text()))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
await p.evaluate(()=>{S.team=[25,113,92];exOpen(1);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);await p.locator('.exStart').click();
const counts=await p.evaluate(async()=>{const f=field;f.e.stun=99999;f.e.hp=f.e.max=50000;f.blocks=[];f.wx.left=9999;const records=[];
 for(const id of [25,113,131,143,35,92]){if(f.p.d.id!==id){const j=(f.slot+1)%3;f.team[j]=exUnit(db[id]);exSwitch(f,j,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,8))}
 const u=f.p;exAct(f,3);const group=f.vfx.find(v=>v.o.userData.celestial)?.o;
 const cnt=group?.children.filter(c=>c.userData.borrowedGeometry).length;if(!cnt)throw Error('empty species '+id);
 for(let j=0;j<34;j++)exSim(f,1/60);f.updateSight?.();f.r.render(f.sc,f.cam);
 for(let j=0;j<240;j++)exSim(f,1/60);if(f.celestial||f.celestialLight.intensity)throw Error('cleanup '+id);records.push([id,cnt])
 }return records});if(errors.length)throw Error(errors.join('\n').slice(0,4000));console.log('PASS: rigid and skinned creatures',counts)
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})

