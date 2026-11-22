const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[150,25,9];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1080;let ctx=canvas.getContext('2d');
for(let trial=0;trial<2;trial++){u.pos.set(-3,0,0);e.pos.set(2,0,0);u.face=Math.PI/2;for(let i=0;i<180;i++)tick();u.en=100;let key=trial===2?3:1;f.cd[key]=0;exAct(f,key);let a=u.cmd,s=a.psych,hp=e.hp,center=s.center.clone();check(s.rad===(key===1?2.05:3.1),'radius');
for(let frame=0;frame<160;frame++){if(trial===1&&frame===12)e.pos.z=8;tick();if(!s.done)check(hp===e.hp,'early hit');if(s.done&&trial===1)e.pos.z=0;
if(trial===0&&[43,61,86].includes(frame)){let cam=f.cam.clone();cam.position.set(-.6,3.3,13);cam.lookAt(-.5,1.95,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,[43,61,86].indexOf(frame)*360,640,360)}
if(s.done&&a.firstHP===undefined)a.firstHP=e.hp;if(s.done)check(e.hp===a.firstHP,'repeat hit')}
check(s.done&&center.equals(s.center),'fixed lock');check(trial===1?e.hp===hp:e.hp<hp,'impact '+trial)}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/psystrike-sequence.jpg',Buffer.from(result,'base64'));console.log('PASS: K, delayed single impact, escape and late reentry');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
