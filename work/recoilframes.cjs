const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[25,143,131];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.width=840;canvas.height=3*180;
for(let index=0;index<3;index++){if(index){exSwitch(f,index,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,12));u=f.p}
 u.pos.set(0,0,0);e.pos.set(0,0,10);e.stun=999;u.face=.2;for(let i=0;i<100;i++)tick();u.hp=u.max=1000;u.inv=0;
 const cam=f.cam.clone(),h=u.height;cam.position.set(.23*h,1.02*h,Math.max(1.1,1.66*h));cam.lookAt(0,h*.47,0);
 function picture(col){let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,40,0,560,360,col*280,index*180,280,180)}
 picture(0);exHurt(f,u,110,e.d,false,V(.94,-.15,.08));for(let i=0;i<8;i++)tick();picture(1);for(let i=0;i<86;i++)tick();picture(2);
 ctx.fillStyle='rgba(20,22,25,.78)';ctx.fillRect(0,index*180,840,24);ctx.fillStyle='white';ctx.font='14px Microsoft YaHei';ctx.fillText(u.d.name+' · 命中前',8,index*180+17);ctx.fillText('侧面冲击',288,index*180+17);ctx.fillText('回稳',568,index*180+17)}
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/recoil-comparison.jpg',Buffer.from(result,'base64'));console.log('PASS: three filmed recoveries');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
