const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[150,25,9];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
for(let trial=0;trial<2;trial++){
 u.pos.set(-3,0,0);e.pos.set(2,0,0);e.stun=999;e.inv=0;u.en=100;f.cd[3]=0;exAct(f,3);
 const a=u.cmd,hp=e.hp,focus=a.focus.clone();check(a.k==='fault','dedicated ultimate');
 for(let frame=0;frame<304;frame++){if(trial===1&&frame===125)e.pos.z=9;tick();
 if(frame===2)check(f.quake.amp.value>.08&&!a.sent,'quake must precede release');if(frame===200)check(f.quake.hit&&f.quake.origin.value.x===focus.x,'blast epicenter');if(frame===297)check(f.quake.amp.value===0,'terrain reset');if(!a.burst)check(e.hp===hp,'early hit');if(a.burst&&trial===1)e.pos.z=0;
 if(trial===0&&[65,130,187,220].includes(frame)){let cam=f.cam.clone();cam.position.set(-.3,4.8,15);cam.lookAt(-.3,2,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,[65,130,187,220].indexOf(frame)*360,640,360)}
 }check(a.burst&&a.focus.equals(focus),'fixed detonation');check(trial===1?hp===e.hp:e.hp<hp,'evade or hit');}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/fault-sequence.jpg',Buffer.from(result,'base64'));console.log('PASS: stone lift and aim lock, delayed detonation hit and escape');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
