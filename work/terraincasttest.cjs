const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[26,74,95];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.height=1440;
for(let n=0;n<4;n++){if(n){const ix=(f.slot+1)%3;f.team[ix]=exUnit(db[[26,74,95,130][n]]);exSwitch(f,ix,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,8));u=f.p}
 for(let trial=0;trial<3;trial++){u.pos.set(-2,0,0);e.pos.set(2,0,0);e.stun=999;e.inv=0;for(let i=0;i<45;i++)tick();f.cd[1]=0;exAct(f,1);let a=u.cmd,hp=e.hp,when=null;
 for(let i=0;i<170;i++){let elapsed=f.t-a.t;if(trial===1)e.pos.z=elapsed>a.wind+(n===0?.09:n===3?.59:1.03)?0:5;if(trial===2)e.air=12;tick();if(e.hp<hp&&when===null)when=f.t-a.t;
 let shot=a.wind+(n===0?.06:n===3?.39:.38);if(!trial&&!a.snapped&&f.t-a.t>=shot){a.snapped=true;let cam=f.cam.clone();cam.position.set(-.2,3.6,11);cam.lookAt(0,2.2,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,n*360,640,360)}}
 check(trial?when===null:when!==null&&when>=a.wind,'hit '+[a.k,trial,when]);if(!trial&&a.terrainCast.rock)check(when>a.wind+.42,'rock hit before descent')
 }}return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/terrain-casts.jpg',Buffer.from(result,'base64'));console.log('PASS: four terrain casts: visible impact timing, late reentry and height');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
