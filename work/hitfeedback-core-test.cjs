const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sandbox={console};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('work/three.js','utf8'),sandbox);
vm.runInContext(`
const V=(...a)=>new THREE.Vector3(...a),cap=(v,a,b)=>Math.max(a,Math.min(b,v));
const exDir=(a,b)=>V(b.x-a.x,0,b.z-a.z).normalize();
let reduced=false;const window={matchMedia:()=>({matches:reduced})};
const groundY=()=>0;
function exMesh(f,geo,color,pos,opacity){const o=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color,transparent:true,opacity}));o.position.copy(pos);f.sc.add(o);return o}
`,sandbox);
vm.runInContext(fs.readFileSync('work/hitfeedback.js','utf8'),sandbox);
const result=vm.runInContext(`(()=>{
 const check=(v,m)=>{if(!v)throw Error(m)},rows=[];
 for(const depth of [.3,2,12])for(const away of [V(1,0,0),V(0,0,-1),V(1,0,1).normalize()]){
  const root=new THREE.Group;root.position.set(1,2,3);root.rotation.set(.1,.7,-.1);
  const u={d:{},pos:root.position.clone(),root,face:.7,frameSize:V(1,1,depth),max:100};
  const e={d:{},pos:u.pos.clone().addScaledVector(away,-4)};
  const f={t:0,p:u,e,cam:new THREE.PerspectiveCamera,sc:new THREE.Scene,effects:[],r:{getPixelRatio:()=>1}};
  f.cam.position.set(2,3,9);const pos=root.position.clone(),q=root.quaternion.clone(),camera=f.cam.position.clone(),logical=u.pos.clone();
  startHitFeedback(f,u,40,1.4,away,e.d);check(f.effects.length===HIT_FEEDBACK.dustCount,'dust missing');
  f.t=.08;applyHitPose(f,u);const delta=root.position.clone().sub(pos);
  check(Math.abs(delta.length()-depth*.15)<1e-10&&delta.clone().normalize().dot(away)>.999999,'incorrect scale or direction');
  check(Math.abs(q.angleTo(root.quaternion)-HIT_FEEDBACK.leanRadians)<1e-7,'incorrect lean');
  applyHitCamera(f);check(f.cam.position.distanceTo(camera)>0&&f.cam.position.distanceTo(camera)<=HIT_FEEDBACK.shakeMax,'shake amplitude');
  clearHitPose(u);f.t=.28;applyHitPose(f,u);check(root.position.clone().sub(pos).dot(away)<0,'missing overshoot');
  clearHitPose(u);f.t=.330001;applyHitPose(f,u);clearHitCamera(f);applyHitCamera(f);
  const positionError=root.position.distanceTo(pos),angleError=root.quaternion.angleTo(q),cameraError=f.cam.position.distanceTo(camera);
  check(positionError<1e-10&&angleError<1e-7&&cameraError<1e-10,'failed recovery');
  check(u.pos.distanceTo(logical)===0&&u.face===.7&&!u.hitFeedback&&!f.hitCamera,'state leaked');
  // Repeated hits carry the current presentation into the next envelope without a snap.
  for(let i=0;i<5;i++){const prior=u.hitFeedback?sampleHitPose(u.hitFeedback,f.t-u.hitFeedback.start):null;startHitFeedback(f,u,40,1.4,away,e.d);if(prior){const next=sampleHitPose(u.hitFeedback,0);check(next.offset.distanceTo(prior.offset)<1e-10&&next.rotation.angleTo(prior.rotation)<1e-7,'re-hit snapped')}f.t+=.04;applyHitPose(f,u);clearHitPose(u)}
  check(root.position.distanceTo(pos)<1e-10&&root.quaternion.angleTo(q)<1e-7,'repeated hit drift');
  f.hitCamera=null;reduced=true;let n=f.effects.length;startHitFeedback(f,u,40,1.4,away,e.d);check(f.effects.length===n&&!f.hitCamera,'reduced motion');
  reduced=false;f.r.getPixelRatio=()=>.6;startHitFeedback(f,u,40,1.4,away,e.d);check(f.effects.length===n&&!f.hitCamera,'performance gate');
  rows.push({depth,positionError,angleError,cameraError});
 }
 return rows;
})()`,sandbox);
assert.equal(result.length,9);
console.log('PASS: real THREE transforms, 3 model depths x 3 directions; 15% recoil, 10deg lean, overshoot, exact recovery, repeated hits, reduced-motion/performance gates');
console.log(JSON.stringify(result));
