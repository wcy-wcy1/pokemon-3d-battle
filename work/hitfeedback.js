// All tunable values for the hit-only presentation layer (seconds / model ratios).
const HIT_FEEDBACK=Object.freeze({
 depthRatio:.15,leanRadians:10*Math.PI/180,outSeconds:.080,returnSeconds:.250,backOvershoot:.65,
 shakeSeconds:.150,shakeBase:.012,shakeDamage:.045,shakeEffective:1.3,shakeMax:.035,shakeHz:34,shakeVertical:.5,shakeYFrequency:1.37,
 lowPixelRatio:.88,dustCount:5,dustSeconds:.28,dustSize:.10,dustSpread:.30,dustLift:.20,
 dustOpacity:.38,dustColor:0xc3b699,groundLift:.012,
 flashSeconds:.12,flashPeak:.7,flashEffectivePeak:1,flashEffectivePulses:2,flashReducedPeak:.35
});
function hitMotionReduced(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function hitSceneEnabled(f){return !hitMotionReduced()&&(!f.r||f.r.getPixelRatio()>=HIT_FEEDBACK.lowPixelRatio)}
function hitEnvelope(age){
 const c=HIT_FEEDBACK;if(age<0||age>=c.outSeconds+c.returnSeconds)return 0;
 if(age<c.outSeconds)return 1-Math.pow(1-age/c.outSeconds,3);
 const x=(age-c.outSeconds)/c.returnSeconds-1;
 return -((c.backOvershoot+1)*x*x*x+c.backOvershoot*x*x);
}
function sampleHitPose(h,age){
 const c=HIT_FEEDBACK,w=hitEnvelope(age),offset=h.away.clone().multiplyScalar(h.depth*c.depthRatio*w);
 const rotation=new THREE.Quaternion().setFromAxisAngle(V(h.away.z,0,-h.away.x),c.leanRadians*w);
 if(age<c.outSeconds&&h.from){
  offset.addScaledVector(h.from.offset,1-w);
  rotation.copy(h.from.rotation).slerp(new THREE.Quaternion().setFromAxisAngle(V(h.away.z,0,-h.away.x),c.leanRadians),w);
 }
 return {offset,rotation};
}
function startHitFeedback(f,u,damage,effectiveness,dir,attacker){
 const c=HIT_FEEDBACK,other=u===f.p?f.e:f.p;
 // Prefer the actual attacker-to-victim line; environmental hits use their supplied direction.
 const away=other&&attacker===other.d?exDir(other.pos,u.pos):(dir?.clone()||exDir(other.pos,u.pos));
 away.y=0;if(away.lengthSq()<1e-8)away.set(-Math.sin(u.face),0,-Math.cos(u.face));away.normalize();
 const depth=u.frameSize?.z||u.height;
 const from=u.hitFeedback?sampleHitPose(u.hitFeedback,f.t-u.hitFeedback.start):null;
 u.hitFeedback={start:f.t,away,depth,from,flash:hitFlashPlan(effectiveness),mats:hitFlashMaterials(u)};
 if(!hitSceneEnabled(f))return;
 const amplitude=Math.min(c.shakeMax,(c.shakeBase+c.shakeDamage*damage/Math.max(1,u.max))*(effectiveness>1?c.shakeEffective:1));
 f.hitCamera={start:f.t,amplitude:Math.max(amplitude,f.hitCamera?.amplitude||0)};
 for(let i=0;i<c.dustCount;i++){
  const angle=i*Math.PI*2/c.dustCount,rad=depth*c.dustSpread;
  const o=exMesh(f,new THREE.PlaneGeometry(depth*c.dustSize,depth*c.dustSize),c.dustColor,
   V(u.pos.x,groundY(u.pos.x,u.pos.z,f.z)+c.groundLift,u.pos.z),c.dustOpacity);
  o.quaternion.copy(f.cam.quaternion);
  f.effects.push({o,life:c.dustSeconds,max:c.dustSeconds,hitDust:true,
   vel:V(Math.cos(angle)*rad/c.dustSeconds,depth*c.dustLift/c.dustSeconds,Math.sin(angle)*rad/c.dustSeconds)});
 }
}
function clearHitPose(u){
 clearHitFlash(u);const base=u.hitPoseBase;if(!base||!u.root)return;
 u.root.position.copy(base.position);u.root.quaternion.copy(base.quaternion);u.hitPoseBase=null;
}
function applyHitPose(f,u){
 const h=u.hitFeedback;if(!h||!u.root)return;
 if(f.t-h.start>=HIT_FEEDBACK.outSeconds+HIT_FEEDBACK.returnSeconds){u.hitFeedback=null;return}
 applyHitFlash(u,f.t-h.start);if(hitMotionReduced())return;
 u.hitPoseBase={position:u.root.position.clone(),quaternion:u.root.quaternion.clone()};
 const pose=sampleHitPose(h,f.t-h.start);
 u.root.position.add(pose.offset);u.root.quaternion.premultiply(pose.rotation);
}
function clearHitCamera(f){
 if(f.hitCameraOffset){f.cam.position.sub(f.hitCameraOffset);f.hitCameraOffset=null}
}
function applyHitCamera(f){
 const h=f.hitCamera;if(!h)return;const c=HIT_FEEDBACK,age=f.t-h.start;
 if(age>=c.shakeSeconds||!hitSceneEnabled(f)){f.hitCamera=null;return}
 const envelope=Math.pow(1-age/c.shakeSeconds,2),phase=age*c.shakeHz*Math.PI*2;
 f.hitCameraOffset=V(Math.sin(phase),Math.sin(phase*c.shakeYFrequency)*c.shakeVertical,0).multiplyScalar(h.amplitude*envelope).clampLength(0,c.shakeMax);
 f.cam.position.add(f.hitCameraOffset);
}
// Victim-only white flash on its own emissive materials. Like the pose, the base values are saved
// before each frame's flash and restored by clearHitPose, so species emissive tuning is preserved.
function hitFlashPlan(effectiveness){
 const c=HIT_FEEDBACK;if(hitMotionReduced())return {pulses:1,peak:c.flashReducedPeak};
 return effectiveness>1?{pulses:c.flashEffectivePulses,peak:c.flashEffectivePeak}:{pulses:1,peak:c.flashPeak};
}
function hitFlashMaterials(u){
 const mats=new Set;u.root?.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material))if(m?.emissive)mats.add(m)});
 return [...mats];
}
function hitFlashStrength(h,age){
 const c=HIT_FEEDBACK,p=h?.flash;if(!p||age<0||age>=p.pulses*c.flashSeconds)return 0;
 return p.peak*Math.pow(1-(age%c.flashSeconds)/c.flashSeconds,2);
}
function clearHitFlash(u){
 const base=u.hitFlashBase;if(!base)return;
 for(const b of base){b.m.emissive.copy(b.color);b.m.emissiveIntensity=b.intensity;b.m.userData.hitFlashing=false}
 u.hitFlashBase=null;
}
function applyHitFlash(u,age){
 const h=u.hitFeedback,k=hitFlashStrength(h,age);if(k<=0||!h.mats?.length)return;
 const base=[];
 for(const m of h.mats){
  // A material shared with another unit that is already flashing keeps that unit's saved base.
  if(m.userData.hitFlashing)continue;
  base.push({m,color:m.emissive.clone(),intensity:m.emissiveIntensity});m.userData.hitFlashing=true;
  m.emissive.multiplyScalar(m.emissiveIntensity).lerp({r:1,g:1,b:1},k);m.emissiveIntensity=1;
 }
 u.hitFlashBase=base;
}