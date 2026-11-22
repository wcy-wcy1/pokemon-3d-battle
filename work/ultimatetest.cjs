const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[150,25,9];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
for(let zone=0;zone<4;zone++){
 const kind=['gale','thunder','surge','ash'][zone],species=[65,25,9,4][zone];
 const orig=u.d;u.d=db[species];wxClear(f);f.wx.phase='calm';f.wx.left=999;u.pos.set(-3,0,0);e.pos.set(zone===2?14:2,0,0);
 e.stun=999;f.cd[3]=0;u.en=ULT_COST-1;exAct(f,3);check(!u.cmd,'energy gate');u.en=ULT_COST;f.cd[3]=0;exAct(f,3);const hp=e.hp;
 check(u.cmd.k==='resonance'&&!u.cmd.psych&&u.cmd.front===kind&&u.en===0,'ultimate identity');
 for(let frame=0;frame<(kind==='ash'?310:190);frame++){tick();if(frame===35)check(f.wx.phase==='calm'&&e.hp===hp,'early release');if(frame===107){let cam=f.cam.clone();cam.position.set(-.6,5.5,19);cam.lookAt(-.5,1.55,0);let prev=f.cam;f.cam=cam;f.updateSight();f.r.render(f.sc,cam);f.cam=prev;ctx.drawImage(f.r.domElement,0,zone*360,640,360)}}
 check(f.wx.type===kind&&f.wx.phase==='active'&&f.wx.power>.7,'weather');check(zone===2?e.hp===hp:e.hp<hp,'wave reach '+kind);u.d=orig;
 }for(let j=0;j<720;j++)tick();check(f.wx.phase==='calm','weather expiry');
return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/weather-fronts.jpg',Buffer.from(result,'base64'));console.log('PASS: independent L, four fronts, wave reach, weather persists on miss and expires');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
