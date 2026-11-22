function bindIronTail(u){
 if(u.d.id!==25||!u.model3d)return;
 const rig=u.iron={heat:{value:0}},tip=u.body.getObjectByName('Tail3_28');if(!tip)return;
 u.body.updateWorldMatrix(true,true);let pivot=u.body.getObjectByName('Tail1_30').getWorldPosition(V()),best=-1;
 u.body.traverse(m=>{
  if(!m.isSkinnedMesh||m.userData.fuzz||!m.geometry.attributes.skinWeight)return;
  const at=m.geometry.attributes,ids=m.skeleton.bones.map(b=>/^Tail[123]_/i.test(b.name)),mask=new Float32Array(at.position.count);let has=false;
  for(let i=0;i<mask.length;i++){for(let j=0;j<4;j++){let k=4*i+j;if(ids[at.skinIndex.array[k]])mask[i]+=at.skinWeight.array[k]}if(mask[i]>.5){has=true;const pos=m.localToWorld(m.boneTransform(i,V().fromBufferAttribute(at.position,i))),d=pos.distanceToSquared(pivot);if(d>best){best=d;rig.mesh=m;rig.idx=i}}}
  if(!has)return;m.geometry.setAttribute('ironWeight',new THREE.BufferAttribute(mask,1));let mat=m.material,old=mat.onBeforeCompile,key=mat.customProgramCacheKey();
  mat.customProgramCacheKey=()=>key+'|weighted-steel';mat.onBeforeCompile=function(s,r){old.call(this,s,r);s.uniforms.ironHeat=rig.heat;s.vertexShader='attribute float ironWeight;varying float ironMask;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nironMask=ironWeight;');s.fragmentShader='uniform float ironHeat;varying float ironMask;\n'+s.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.85,.94,1.)*(.88+.16*ironMask),ironHeat*smoothstep(.08,.90,ironMask));\n#include <tonemapping_fragment>')};mat.needsUpdate=true
 })
}
function ironStride(f,a,age,dt,target){
 if(age>.12&&age<.37){let step=Math.min(dt*5.4,Math.max(0,1.05-(a.travel||0)),Math.max(0,dst(a.u.pos,target.pos)-.43));exMove(f,a.u,step*a.dir.x,step*a.dir.z);a.travel=(a.travel||0)+step}
 if(age>=a.total)a.u.cmd=null
}
function ironPose(f,u){
 const rig=u.iron;if(!rig)return;const a=u.cmd;if(a?.k!=='irontail'){rig.heat.value=0;return}
 const t=f.t-a.t,s=x=>{x=cap(x,0,1);return x*x*(3-2*x)},wind=s(t/.18),whip=s((t-.18)/.27),settle=s((t-.45)/.18);
 rig.heat.value=wind*(1-settle);u.body.rotation.y=Math.atan2(a.dir.x,a.dir.z)-wind*.56+whip*6.84;
 u.body.rotation.z+=Math.sin(whip*Math.PI)*.19;u.body.position.y+=Math.sin(Math.PI*whip)*.13;
 if(!rig.mesh||t<.15||t>.50)return;
 const m=rig.mesh;m.updateWorldMatrix(true,false);for(const b of m.skeleton.bones)if(/^Tail[123]_/.test(b.name))b.updateWorldMatrix(true,false);
 const p=m.localToWorld(m.boneTransform(rig.idx,V().fromBufferAttribute(m.geometry.attributes.position,rig.idx)));
 if(t>.18&&t<.47)steelWake(f,a,p);
 if(a.lastTail&&!a.hit&&t>.20){let target=a.player?f.e:f.p,sz=target.height||1;
  let foot=groundY(target.pos.x,target.pos.z,f.z)+(target.air||0),center=target.pos.clone();center.y=cap(p.y,foot+.08,foot+sz*.90);
  const hit=new THREE.Line3(a.lastTail,p).closestPointToPoint(center,true,V()),r=cap(sz*.29,.22,.90);
  const dist=hit.distanceTo(center);if(dist<r+.10&&aerialRange(f,hit,center.clone().sub(hit).normalize(),dist)>=dist-.01){a.contact=hit;strikeHit(f,a,target)}}
 a.lastTail=p
}
