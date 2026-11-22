const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const p=await b.newPage({viewport:{width:512,height:320}}),errors=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(/Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text())});
 await p.goto(require('url').pathToFileURL(path.resolve('outputs/index.html')).href);
 await p.evaluate(()=>{Math.random=seeded(370);S.team=[68,9,25];exOpen(0);cancelAnimationFrame(field.frame)});
 await p.waitForFunction(()=>field.p.ready&&field.e.ready);
 const report=await p.evaluate(async clip=>{
  const f=field;f.el.querySelector('.exStart').click();f.sc.remove(f.e.root);exDispose(f.e.root);f.e=exUnit(db[66],true);await exModel(f,f.e);
  const u=f.p,e=f.e;f.blocks=[];f.wx.left=999;f.nextAttack=999;e.stun=999;e.hp=e.max=5000;u.hp=u.max=5000;
  u.pos.set(-1.25,0,0);e.pos.set(.60,0,0);u.face=Math.PI/2;e.face=-Math.PI/2;f.zoom=.84;
  window.film=[];const tick=()=>exSim(f,1/96);for(let n=0;n<100;n++)tick();
  let hits=[],timeline=[],maxSlip=0,planted=false,recover=false,barrage=null,body=u.body,prevQuat=body.quaternion.clone(),finishJump=0;
  for(let n=0;n<380;n++){
   if(n===14||n===310)exAct(f,0);
   if(n===88)newCast(f,e,0,u.pos);
   if(n===150){exAct(f,1);barrage=u.cmd;if(barrage?.k!=='barrage')throw Error('wrong special')}
   if(n===234)f.keys.add('KeyW');if(n===252)f.keys.delete('KeyW');
   if(n===250)newCast(f,e,0,u.pos);
   const last=u.cmd,hp=e.hp;tick();
   if(last===barrage&&barrage&&hp>e.hp)hits.push(+(f.t-barrage.t-barrage.wind).toFixed(3));
   if(last&&!u.cmd){recover=true;finishJump=Math.max(finishJump,prevQuat.angleTo(body.quaternion))}
   if(last?.stance&&last===u.cmd&&last.k==='barrage'&&f.t-last.t>.11&&f.t-last.t<last.wind-.04){
    planted=true;const s=last.stance,foot=s.foot.getWorldPosition(V());maxSlip=Math.max(maxSlip,Math.hypot(foot.x-s.anchor.x,foot.z-s.anchor.z))
   }
   prevQuat.copy(body.quaternion);
   if(n%4===0&&clip){f.updateSight();f.r.render(f.sc,f.cam);film.push(f.r.domElement.toDataURL('image/jpeg',.86).split(',')[1])}
  }
  if(hits.length!==4||hits.some((t,i)=>Math.abs(t-fourFists[i])>.02))throw Error('fist/impact mismatch '+hits);
  if(!recover||finishJump>.055)throw Error('recovery pop '+finishJump);
  if(!planted||maxSlip>u.height*.12)throw Error('skating support foot '+maxSlip);
  // A later punch cannot use a hit from an earlier contact.
  u.pos.set(0,0,0);e.pos.set(1.1,0,0);f.cd[1]=0;exAct(f,1);const a=u.cmd,base=e.hp;
  for(let i=0;i<120;i++){tick();if(e.hp<base)e.pos.z=9}
  if(a?.punches!==1)throw Error('follow-ups landed after escape '+a?.punches);
  // A single K tap during J recovery should survive a coarse 20 Hz frame,
  // but a tap during the wind-up must not become a delayed automatic attack.
  f.cd[0]=f.cd[1]=0;exAct(f,0);queueOrAct(f,1);if(f.buffered)throw Error('early command kept');
  while(actionWait(f,0)>.13)tick();queueOrAct(f,1);if(!f.buffered)throw Error('lost K tap');
  for(let j=0;j<5;j++)exSim(f,.05);if(u.cmd?.k!=='barrage'||f.buffered)throw Error('K did not chain');
  return {hits,finishJump,maxSlip,buffered:true,frames:film.length}
 },process.argv.includes('--clip'));
 if(errors.length)throw Error(errors.join(';'));
 if(report.frames){const frames=await p.evaluate(()=>film),ff=require('child_process').spawnSync('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','outputs/combat-flow.mp4'],{input:Buffer.concat(frames.map(v=>Buffer.from(v,'base64')))});if(ff.status!==0)throw Error(ff.error||String(ff.stderr))}
 console.log('PASS',report)
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
