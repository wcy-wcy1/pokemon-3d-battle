const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[135,136,197];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.height=1080;for(let species=0;species<3;species++){
 if(species){exSwitch(f,species,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,12));u=f.p}
 for(let trial=0;trial<4;trial++){
 f.blocks=[];u.pos.set(-1.5,0,0);e.pos.set(1.35,0,0);e.stun=999;e.inv=0;e.scorch=null;e.slowUntil=0;u.face=Math.PI/2;for(let j=0;j<28;j++)tick();f.cd[1]=0;exAct(f,1);const a=u.cmd,hp=e.hp;let first=null,last=hp;
 if(trial===2)f.blocks=[{x:0,z:0,r:.47,h:8}];
 for(let frame=0;frame<117;frame++){
 if(frame===5&&trial===1)e.pos.z=12;if(frame===7&&trial===3)e.pos.set(-1.5,0,2.6);tick();
 if(e.hp<last&&first===null)first=f.t-a.t;last=e.hp;
 if(!trial&&frame===[43,65,55][species]){let cam=f.cam.clone();cam.position.set(-.3,2.7,8.5);cam.lookAt(-.5,.95,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,species*360,640,360)}}
 let expect=trial===0||trial===3&&species!==2;check(expect?first>a.wind&&hp>e.hp:first===null,'field hit '+[species,trial,first,a.wind,hp,e.hp]);
 if(expect&&species===0)check(e.slowUntil>0,'slow');if(expect&&species===1)check(e.scorch,'burn');
 }}return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/eevee-fields.jpg',Buffer.from(result,'base64'));console.log('PASS: three field types, radial vs directional, obstruction, escape and status');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
