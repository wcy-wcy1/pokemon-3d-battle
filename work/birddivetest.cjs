const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[18,7,150];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.height=1440;
for(let trial=0;trial<4;trial++){
 f.blocks=[];u.pos.set(-3,0,0);u.air=flightLevel(u);e.pos.set(2,0,0);e.air=0;e.inv=0;u.face=Math.PI/2;for(let n=0;n<32;n++)tick();
 if(trial===2)f.blocks=[{x:0,z:0,r:.8,h:8}];u.en=100;f.cd[1]=0;exAct(f,1);const a=u.cmd,hp=e.hp;let hits=0,last=hp,low=999,peak=0;
 for(let frame=0;frame<140;frame++){if(frame===32&&trial===1)e.pos.z=4;if(frame>=32&&trial===3)e.air=5;tick();if(last!==e.hp){hits++;last=e.hp}
 if(frame<32){peak=Math.max(peak,u.air);check(e.hp===hp,'windup damage')}if(frame>40)low=Math.min(low,u.air);
 if(!trial&&[23,63,82,111].includes(frame)){let cam=f.cam.clone();cam.position.set(-.2,3.6,13);cam.lookAt(-.25,2.0,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,[23,63,82,111].indexOf(frame)*360,640,360)}}
 check(hits===(trial===0?1:0),'hits '+trial+' '+hits);check(peak>flightLevel(u)+.3&&(trial===2||u.air>low+.65),'flight arc');
 check(trial===2?a.dive.blocked&&u.pos.x<0:u.pos.x>2.7,'commit or obstruction '+JSON.stringify([trial,a.dive.blocked,u.pos.x,a.dive.reach,a.dir.x]))}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/pidgeot-dive.jpg',Buffer.from(result,'base64'));console.log('PASS: dive arc, contact, lateral and vertical escape, obstacle');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
