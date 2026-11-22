const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[76,7,150];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.height=720;let counts=[];
 for(let trial=0;trial<3;trial++){u.pos.set(-3,0,0);e.pos.set(2,0,0);u.face=Math.PI/2;f.cd[1]=0;e.inv=0;for(let i=0;i<60;i++)tick();if(trial===2)f.blocks=[{x:0,z:0,r:.6,h:8}];let last=e.hp,hits=0;exAct(f,1);let a=u.cmd;
 for(let i=0;i<180;i++){if(trial===1&&hits===1)e.pos.z=5;tick();if(e.hp<last){last=e.hp;hits++}if(f.t-a.t<a.wind)check(!hits&&!f.shots.length,'early launch');
 if(!trial&&[55,87].includes(i)){let cam=f.cam.clone();cam.position.set(.25,2.8,10);cam.lookAt(0,.95,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,i===55?0:360,640,360)}}
 counts.push(hits);check(a.volley.next===3&&hits===[3,1,0][trial],'volley '+counts)}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/rock-volley.jpg',Buffer.from(result,'base64'));console.log('PASS: successive hits, escape after first impact, solid cover');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
