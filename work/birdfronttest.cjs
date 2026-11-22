const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[144,145,146];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.height=1080;for(let species=0;species<3;species++){
 if(species){exSwitch(f,species,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,12));u=f.p}
 for(let dodge=0;dodge<2;dodge++){u.pos.set(-3,0,0);e.pos.set(3,0,0);e.stun=999;e.inv=0;e.scorch=null;e.slowUntil=0;u.face=Math.PI/2;for(let j=0;j<35;j++)tick();f.cd[1]=0;exAct(f,1);const a=u.cmd,hp=e.hp;let hits=0,last=hp,count=0;
 for(let frame=0;frame<130;frame++){if(dodge&&frame===15)e.pos.z=7;tick();let age=f.t-a.t;if(age<a.wind+(species?0:.23))check(e.hp===hp,'early hit');if(last!==e.hp){last=e.hp;hits++}
 count=Math.max(count,f.shots.length);if(!dodge&&frame===[64,46,51][species]){let cam=f.cam.clone();cam.position.set(1,4,12);cam.lookAt(0,1.7,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,species*360,640,360)}}
 check(dodge?hits===0:hits===1,'damage '+JSON.stringify([species,dodge,hits,count,a.k]));check(count===[0,1,2][species],'projectile count');if(!dodge)check(species===2?e.scorch:e.slowUntil>0,'status');}}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/legendary-fronts.jpg',Buffer.from(result,'base64'));console.log('PASS: three legendary casts, paths, timing, damage and escape');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
