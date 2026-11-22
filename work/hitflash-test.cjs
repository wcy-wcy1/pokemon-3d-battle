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
 const check=(v,m)=>{if(!v)throw Error(m)};
 const box=()=>new THREE.BoxGeometry(1,1,1);
 const make=()=>{
  const root=new THREE.Group;
  const lit=new THREE.MeshStandardMaterial({color:0x886644});lit.emissive.setHex(0xf35a19);lit.emissiveIntensity=.95;
  const plain=new THREE.MeshStandardMaterial({color:0x334455});
  const basic=new THREE.MeshBasicMaterial({color:0xffffff});
  root.add(new THREE.Mesh(box(),lit));root.add(new THREE.Mesh(box(),[plain,basic]));root.add(new THREE.Mesh(box(),plain));
  const u={d:{},pos:V(0,0,0),root,face:0,frameSize:V(1,1,1),max:100};
  const e={d:{},pos:V(0,0,-4)};
  const f={t:0,p:u,e,cam:new THREE.PerspectiveCamera,sc:new THREE.Scene,effects:[],r:{getPixelRatio:()=>1}};
  return {u,e,f,lit,plain,basic};
 };
 const snap=m=>m.emissive.getHex()+'/'+m.emissiveIntensity;
 const tick=(f,u,t)=>{f.t=t;clearHitPose(u);applyHitPose(f,u)};
 const white=m=>Math.min(m.emissive.r,m.emissive.g,m.emissive.b)*m.emissiveIntensity;
 const run=(name,adv,minPeak,wantPulses,maxEnd)=>{
  const {u,e,f,lit,plain,basic}=make();const litBase=snap(lit),plainBase=snap(plain);
  startHitFeedback(f,u,30,adv,null,e.d);
  check(u.hitFeedback.mats.length===2,name+': emissive materials not collected once each');
  tick(f,u,0);const peak=white(plain);
  check(peak>=minPeak,name+': no flash on the hit frame '+peak);
  check(white(lit)>=peak-1e-9,name+': pre-lit material did not flash');
  check(basic.color.getHex()===0xffffff,name+': basic material changed');
  let pulses=1,prev=peak,end=0;
  for(let i=1;i<=40;i++){const t=i/100;tick(f,u,t);const w=white(plain);if(w>prev+.3)pulses++;if(w>1e-6)end=t;prev=w}
  check(pulses===wantPulses,name+': pulse count '+pulses);
  check(end<maxEnd,name+': flash lasted until '+end);
  clearHitPose(u);
  check(snap(lit)===litBase&&snap(plain)===plainBase,name+': emissive not restored');
  return {name,peak:+peak.toFixed(3),pulses,lastLitSeconds:end};
 };
 const rows=[run('normal',1,.69,1,.12),run('effective',1.4,.99,2,.24),run('resisted',.76,.69,1,.12)];
 reduced=true;rows.push(run('reduced-motion effective',1.4,.34,1,.12));reduced=false;
 // Fainting mid-flash clears like faint.js does.
 {const {u,e,f,lit,plain}=make();const a=snap(lit),b=snap(plain);startHitFeedback(f,u,30,1.4,null,e.d);tick(f,u,.02);
  check(snap(plain)!==b,'flash not active before faint');clearHitPose(u);u.hitFeedback=null;tick(f,u,.03);
  check(snap(lit)===a&&snap(plain)===b,'faint left the model white')}
 // Two units sharing one material both flash and still restore the original values.
 {const {u,e,f,plain}=make();const b=snap(plain);const root2=new THREE.Group;root2.add(new THREE.Mesh(box(),plain));
  const u2={d:{},pos:V(3,0,0),root:root2,face:0,frameSize:V(1,1,1),max:100};
  startHitFeedback(f,u,30,1.4,null,e.d);startHitFeedback(f,u2,30,1,null,e.d);
  for(let i=0;i<=40;i++){tick(f,u,i/100);tick(f,u2,i/100)}clearHitPose(u);clearHitPose(u2);
  check(snap(plain)===b&&!plain.userData.hitFlashing,'shared material not restored')}
 // A re-hit restarts the flash from full strength.
 {const {u,e,f,plain}=make();startHitFeedback(f,u,30,1,null,e.d);tick(f,u,.1);const low=white(plain);
  f.t=.1;startHitFeedback(f,u,30,1,null,e.d);tick(f,u,.1);check(white(plain)>low+.3,'re-hit did not restart flash')}
 return rows;
})()`,sandbox);
assert.equal(result.length,4);
console.log('PASS: hit frame flashes white, normal/resisted 1 pulse <120ms, super-effective 2 pulses <240ms, reduced motion 1 soft pulse, emissive restored after flash/faint/shared material, re-hit restarts');
console.log(JSON.stringify(result));