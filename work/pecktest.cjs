const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[16,54,150];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.height=1440;
for(let species=0;species<2;species++){
 if(species){exSwitch(f,1,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,12));u=f.p}
 for(let trial=0;trial<3;trial++){u.pos.set(-1.2,0,0);e.pos.set(trial===1?7:0,0,0);e.stun=999;e.inv=0;u.face=Math.PI/2;f.cd[0]=0;for(let n=0;n<35;n++)tick();let hp=e.hp,last=hp,hits=0;const original=e.pos.clone();exAct(f,0);let a=u.cmd;check(a.peck&&a.k==='peck','move');
 for(let frame=0;frame<77;frame++){if(trial===2&&frame===6)e.pos.z+=3;tick();if(e.hp!==last){hits++;last=e.hp}if(f.t-a.t<a.wind)check(hp===e.hp,'windup');
 let pics=species?[12,30]:[8,30];if(!trial&&pics.includes(frame)){let cam=f.cam.clone();cam.position.set(-.3,species?1.22:2.5,species?3.2:5.1);cam.lookAt(-.5,species?.52:1,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,(species*2+pics.indexOf(frame))*360,640,360)}}
 check(hits===(trial?0:1),'hits '+[species,trial,hits]);if(!trial)check(a.contact&&u.billTipRef,'no skin contact');
 }}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/bill-contact.jpg',Buffer.from(result,'base64'));console.log('PASS: two bill meshes: near hit, wind-up, distance and sidestep');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
