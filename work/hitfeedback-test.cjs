const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const assert=require('assert'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(pathToFileURL(path.resolve('outputs/index.html')).href);
 await p.evaluate(()=>{exOpen(0,[25,143,384]);cancelAnimationFrame(field.frame)});
 await p.waitForFunction(()=>field.p.ready&&field.e.ready);
 const results=await p.evaluate(async()=>{
  const f=field,rows=[],check=(v,m)=>{if(!v)throw Error(m)};
  f.el.querySelector('.exStart').click();f.r.setPixelRatio(1);f.blocks=[];
  for(const slot of [0,1,2]){
   if(slot){exSwitch(f,slot,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,10))}
   const u=f.p;u.inv=0;u.hp=u.max=5000;
   for(const away of [V(1,0,0),V(0,0,-1),V(1,0,1).normalize()]){
    clearHitPose(u);clearHitCamera(f);u.hitFeedback=null;u.recoil=null;u.pos.set(0,0,0);u.face=.7;
    f.e.pos.copy(away).multiplyScalar(-4);exUpdateActor(f,u,0,0);
    const pos=u.root.position.clone(),q=u.root.quaternion.clone(),face=u.face,logical=u.pos.clone(),start=f.t;
    f.cam.position.set(2,3,9);const camera=f.cam.position.clone(),effects=f.effects.length;
    exHurt(f,u,30,f.e.d,false,away);
    check(f.effects.slice(effects).filter(e=>e.hitDust).length===HIT_FEEDBACK.dustCount,'dust missing');
    f.t=start+.08;exUpdateActor(f,u,0,0);const peak=u.root.position.clone().sub(pos);
    check(Math.abs(peak.length()-u.frameSize.z*.15)<1e-8&&peak.clone().normalize().dot(away)>.99999,'scaled directional recoil');
    check(Math.abs(q.angleTo(u.root.quaternion)-HIT_FEEDBACK.leanRadians)<1e-7,'lean angle');
    check(u.pos.distanceTo(logical)<1e-10&&u.face===face,'gameplay transform changed');
    applyHitCamera(f);check(f.cam.position.distanceTo(camera)>0,'no camera response');
    check(f.cam.position.distanceTo(camera)<=HIT_FEEDBACK.shakeMax,'excessive shake');
    f.t=start+.28;exUpdateActor(f,u,0,0);check(u.root.position.clone().sub(pos).dot(away)<0,'no return overshoot');
    f.t=start+.330001;exUpdateActor(f,u,0,0);clearHitCamera(f);applyHitCamera(f);
    const positionError=u.root.position.distanceTo(pos),angleError=u.root.quaternion.angleTo(q),cameraError=f.cam.position.distanceTo(camera);
    check(positionError<1e-9&&angleError<1e-7&&cameraError<1e-9,'transform did not restore');
    check(!u.hitFeedback&&!f.hitCamera,'feedback not retired');rows.push({id:u.d.id,positionError,angleError,cameraError});
   }
  }
  f.r.setPixelRatio(.6);const count=f.effects.length;startHitFeedback(f,f.p,60,1.4,null,f.e.d);
  check(!f.hitCamera&&f.effects.length===count,'performance gate ignored');
  return rows;
 });
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.evaluate(()=>{const f=field;f.r.setPixelRatio(1);const n=f.effects.length;startHitFeedback(f,f.p,60,1.4,null,f.e.d);if(f.hitCamera||f.effects.length!==n)throw Error('reduced motion ignored')});
 assert.deepStrictEqual(errors,[]);console.log('PASS hit feedback: 3 real models × 3 directions, scaled peak, 10 degree lean, overshoot, exact position/orientation/camera recovery, performance/reduced-motion gates',results);
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
