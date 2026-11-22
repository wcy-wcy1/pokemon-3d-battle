function aimLimb(u,j,end,vector,weight){if(!j||!end)return;let start=j.getWorldPosition(V()),dir=end.getWorldPosition(V()).sub(start);if(dir.lengthSq()<1e-5)return;let q=j.getWorldQuaternion(new THREE.Quaternion),wanted=vector.applyAxisAngle(V(0,1,0),u.face).normalize(),rot=new THREE.Quaternion().setFromUnitVectors(dir.normalize(),wanted);rot=new THREE.Quaternion().slerp(rot,weight);j.quaternion.multiply(q.clone().invert().multiply(rot).multiply(q))}
function speciesAct(f,u){let l=u.lifeRig;if(!l)return;let cur=f.mode==='watch'&&f.watch?.intent==='inspect',a=cur?f.t-f.watch.actionAt:0,sniff=cur&&a>.9&&a<3.3?Math.sin((a-.9)*Math.PI/2.4)**2:0,shock=f.mode==='watch'&&f.watch?.intent==='retreat'?Math.max(0,1-(f.t-f.watch.actionAt)/.65):0;if(u.d.id===9){for(let s of ['L','R']){let j=(l.groups.arm||[]).find(b=>b.n.name===s+'Arm')?.n,w=(l.groups.arm||[]).find(b=>b.n.name===s+'ForeArm')?.n;if(j&&w)aimLimb(u,j,w,V((s==='L'?1:-1)*.32,-.82,.38),u.jet?.age>.64?.43:.69)}u.body.rotation.x+=.045+sniff*.115-shock*.06;u.body.rotation.z+=.017*Math.sin(l.breath*.61);let jaw=l.groups.jaw?.[0]?.n;if(jaw&&cur)jaw.rotateX(.048*(1+Math.sin(l.breath*.77)))}else if(u.d.id===25){u.body.rotation.x+=sniff*.16-shock*.13;let ears=(l.groups.ear||[]).filter(b=>/ear1/i.test(b.n.name));for(let b of ears)b.n.rotateZ(b.side*(shock*.41+sniff*.10))}}

function animalReflex(f,u){
 let l=u.lifeRig;if(!l)return;
 let flinch=Math.min(1,(u.flinch||0)*4),attend=f.mode==='watch'&&f.watch?.intent==='inspect',phase=l.breath;
 if(u.d.id===9){let jaw=l.groups.jaw?.[0]?.n;let inhale=.5-.5*Math.cos(phase);
 if(jaw)jaw.rotateX(.042*inhale**3*(1+l.energy)+.035*Math.sin(phase*2)*flinch);
 let h=l.groups.head?.find(b=>/head/i.test(b.n.name))?.n;if(h){h.rotateX(.036*flinch-.018*inhale);h.rotateZ(.015*Math.sin(phase*.57)*Number(attend))}
 }}

// Phase, pitch, body lift, forepaw sweep, femur and shank angles (from down),
// sole roll (from its standing orientation). Observed event order:
// gathered suspension -> hind contact -> toe-off -> long suspension -> fore contact.
const catBoundKeys=[
 [0, .92,.22,-.28, .40,.19, .03],
 [.16,.86,.20,-.57, .24,-.36, .04],
 [.33,.82,.31,-.22,-.42,-.88,1.06],
 [.49,.91,.37, .80,-.72,-1.07,1.89],
 [.62,1.04,.25, .95,-.35,-.94,1.52],
 [.76,1.05,.14, .19, .33,-.77, .74],
 [.90,.99,.19,-.43, .58,-.38, .18],
 [1, .92,.22,-.28, .40,.19, .03]
];
function felineFrame(t){t=((t%1)+1)%1;let i=1;while(catBoundKeys[i][0]<t)i++;
 let a=catBoundKeys[i-1],b=catBoundKeys[i],p=(t-a[0])/(b[0]-a[0]);p=p*p*(3-2*p);
 return a.slice(1).map((v,j)=>v+(b[j+1]-v)*p)
}
// A bounding gait: hindquarters gather under the hips, push off, then the forepaws catch.
function pikaBound(f,u,dt){
 if(u.d.id!==25||!u.model3d||!u.poseBones)return;
 const target=u===f.p&&sprinting(f)&&!u.cmd?cap(((u.drive||0)-1.4)/3,0,1):0;
 const blend=u.runBlend=(u.runBlend||0)+(target-(u.runBlend||0))*(1-Math.exp(-dt*(target?13:10)));
 if(blend<.004){u.boundRig?.contactQ?.identity();return}
 let rig=u.boundRig;
 if(!rig){const bone=name=>u.body.getObjectByName(name);
 rig=u.boundRig={legs:[],head:bone('Head_9'),toes:['LToe_20','RToe_24','LFoot_21','RFoot_25'].map(bone).filter(Boolean)};
 for(const [side,offset] of [['L',0],['R',.09]])for(const hind of [false,true]){
 const names=hind?(side==='L'?['LThigh_23','LLeg_22','LFoot_21']:['RThigh_27','RLeg_26','RFoot_25']):(side==='L'?['LArm_12','LForeArm_11','LHand_10']:['RArm_16','RForeArm_15','RHand_14']);
 let [a,b,c]=names.map(bone);if(a&&b&&c)rig.legs.push({a,b,c,hind,offset,foreScale:b.scale.clone(),pawScale:c.scale.clone()})
 }}
 let stride=u.boundPhase=((u.boundPhase||0)+dt*(1.45+.19*Math.min(10,u.drive||0))*(u.air>.06?.45:1))%1;
 let wave=Math.sin(stride*2*Math.PI),air=cap((u.air||0)*2,0,1);
 const gait=felineFrame(stride);
 let pitch=(.24+gait[0]-air*.09)*blend;
 u.body.rotation.x+=pitch;u.body.rotation.z*=1-.8*blend;
 u.body.position.y=u.body.position.y*(1-blend)+blend*gait[1];
 const fw=V(Math.sin(u.face),0,Math.cos(u.face)),up=V(0,1,0),side=up.clone().cross(fw);
 function turnJoint(j,rot,w){let q=j.getWorldQuaternion(new THREE.Quaternion),r=new THREE.Quaternion().slerp(rot,w);j.quaternion.multiply(q.clone().invert().multiply(r).multiply(q))}
 if(rig.head)turnJoint(rig.head,new THREE.Quaternion().setFromAxisAngle(side,-pitch*.48),1);
 for(let b of u.poseBones){if(b.job==='ear'&&/ear1/i.test(b.n.name))turnJoint(b.n,new THREE.Quaternion().setFromAxisAngle(side,-.64*blend),1);if(b.n.name==='Tail1_30')turnJoint(b.n,new THREE.Quaternion().setFromAxisAngle(side,(-1.02+.13*wave)*blend),1)}
 for(const {a,b,c,hind,offset,foreScale,pawScale} of rig.legs){
 if(!hind){b.scale.copy(foreScale).multiplyScalar(1-.055*blend);c.scale.copy(pawScale).multiplyScalar(1-.045*blend)}
 const phase=felineFrame(stride+(hind?1:-1)*offset*1.3);
 // Front paws swing as one short padded lever; the hocks use a separate push-off cycle.
 if(!hind){
  const sweep=phase[2];
  const dir=fw.clone().multiplyScalar(Math.sin(sweep)).addScaledVector(up,-Math.cos(sweep));
  for(const [joint,end] of [[a,b],[b,c]]){
   let current=end.getWorldPosition(V()).sub(joint.getWorldPosition(V())).normalize();
   turnJoint(joint,new THREE.Quaternion().setFromUnitVectors(current,dir),blend)
  }
  continue
 }
 // Drive the leg in its sagittal plane. These periodic angles stay near the
 // authored crouch: rotate the joints, never translate the heel or stretch the pelvis.
 // Joint orientations follow a short gallop arc, with a slight outward
 // knee track. No world-space paw targets pull on the rump.
 for(const [j,end,angle] of [[a,b,phase[3]],[b,c,phase[4]]]){
   const desired=fw.clone().multiplyScalar(Math.sin(angle)).addScaledVector(up,-Math.cos(angle)).addScaledVector(side,(offset?-1:1)*(j===a?.24:.08)).normalize();
   const actual=end.getWorldPosition(V()).sub(j.getWorldPosition(V())).normalize();
   turnJoint(j,new THREE.Quaternion().setFromUnitVectors(actual,desired),blend)
 }
 let rest=u.pawRest?.[c.name];if(rest){
   const toeRoll=phase[5];
   const goal=new THREE.Quaternion().setFromAxisAngle(side,toeRoll).multiply(new THREE.Quaternion().setFromAxisAngle(up,u.face)).multiply(rest.neutral);
   c.quaternion.slerp(c.parent.getWorldQuaternion(new THREE.Quaternion).invert().multiply(goal),blend)
 }
 }
 plantPikaFront(f,u,rig,stride,blend,dt)

}

// Keep the cross-section padded; compress the distal silhouette along the wrist axis.
function shapePikaPaws(model){
 model.traverse(m=>{
  if(!m.isSkinnedMesh||m.material?.name!=='BodyA')return;
  const g=m.geometry,attr=g.attributes,pos=attr.position,sk=m.skeleton;
  const joint=i=>V().setFromMatrixPosition(sk.boneInverses[i].clone().invert()).applyMatrix4(m.bindMatrixInverse);
  const ids=new Map(),chains=[];
  for(const side of ['L','R']){
   const joints=['Arm','ForeArm','Hand'].map(name=>sk.bones.findIndex(b=>b.name.startsWith(side+name+'_')));
   if(joints.includes(-1))continue;
   const chain=joints.map(joint);chains.push(chain);joints.forEach((id,part)=>ids.set(id,{chain,part}));
  }
  const v=V(),point=V(),delta=V(),axis=V(),nearest=V();
  // Fit each taper to its own skinned mesh, from the elbow to the outermost paw vertex.
  for(const chain of chains){chain.dir=chain[2].clone().sub(chain[1]).normalize();chain.span=chain[1].distanceTo(chain[2]);}
  for(let i=0;i<pos.count;i++)for(let j=0;j<4;j++){
   const b=ids.get(attr.skinIndex.array[i*4+j]);if(!b||b.part!==2||attr.skinWeight.array[i*4+j]<.2)continue;
   b.chain.span=Math.max(b.chain.span,v.fromBufferAttribute(pos,i).sub(b.chain[1]).dot(b.chain.dir));
  }
  for(let i=0;i<pos.count;i++){
   v.fromBufferAttribute(pos,i);let chain=null,amount=0,tip=0;
   for(let j=0;j<4;j++){let bone=ids.get(attr.skinIndex.array[i*4+j]),w=attr.skinWeight.array[i*4+j];if(!bone||!w)continue;chain=bone.chain;amount+=w*[.18,.19,.15][bone.part];if(bone.part===2)tip+=w}
   if(!chain||amount<=0)continue;let best=Infinity;
   for(let k=0;k<2;k++){axis.subVectors(chain[k+1],chain[k]);let t=cap(delta.subVectors(v,chain[k]).dot(axis)/Math.max(1e-9,axis.lengthSq()),0,1);point.copy(chain[k]).addScaledVector(axis,t);let d=point.distanceToSquared(v);if(d<best){best=d;nearest.copy(point);nearest.pawT=(k+t)/2}}
   nearest.lerp(chain[2],tip*.5);const wedge=cap((nearest.pawT-.18)/.82,0,1);v.lerp(nearest,cap(amount+(.73*wedge-.08*(1-wedge))*Math.min(1,amount/.15),0,.88));axis.subVectors(chain[2],chain[1]).normalize();let beyond=delta.subVectors(v,chain[2]).dot(axis);let along=delta.subVectors(v,chain[1]).dot(axis),t=cap(along/chain.span,0,1);
   if(t>0){point.copy(chain[1]).addScaledVector(axis,along);let influence=cap(amount/.15,0,1);v.addScaledVector(delta.copy(v).sub(point),(.12*(1-t)-.86*t)*influence)}
   if(beyond>0)v.addScaledVector(axis,-beyond*.65*tip);pos.setXYZ(i,v.x,v.y,v.z)
  }
  pos.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere()
 })
}

// Use the same triangles as the near terrain mesh, not the smooth source function.
function strideFloor(f,x,z){
 const cell=68/128,xx=(x+34)/cell,zz=(z+34)/cell,i=Math.floor(xx),j=Math.floor(zz),dx=xx-i,dz=zz-j,X=i*cell-34,Z=j*cell-34;
 const b=groundY(X,Z+cell,f.z),c=groundY(X+cell,Z,f.z);
 return dx+dz<=1?groundY(X,Z,f.z)*(1-dx-dz)+b*dz+c*dx:
 groundY(X+cell,Z+cell,f.z)*(dx+dz-1)+b*(1-dx)+c*(1-dz)
}
function plantPikaFront(f,u,rig,phase,blend,dt){
 if(!rig.soles){
  let mesh;u.body.traverse(m=>{if(m.isSkinnedMesh&&!m.userData.fuzz&&m.material.name==='BodyA')mesh=m});if(!mesh)return;
  const at=mesh.geometry.attributes,sets=[new Set(),new Set()];
  for(let k=0;k<2;k++){const ids=[];for(let i=0;i<at.position.count;i++)for(let j=0;j<4;j++){
   let name=mesh.skeleton.bones[at.skinIndex.array[i*4+j]].name;if(name.startsWith(k?'RHand_':'LHand_')&&at.skinWeight.array[i*4+j]>.30){ids.push(i);break}}
   for(const i of ids)sets[k].add(i);
  }
  rig.soles={mesh,ids:sets.map(s=>[...s])}
 }
 const {mesh,ids}=rig.soles,v=V(),pts=[V(),V()],rear=V(),fw=V(Math.sin(u.face),0,Math.cos(u.face)),air=u.air||0;
 function measure(){
  u.root.updateMatrixWorld(true);let gap=[Infinity,Infinity],back=Infinity;
  for(let k=0;k<2;k++)for(let i of ids[k]){mesh.boneTransform(i,v).applyMatrix4(mesh.matrixWorld);let d=v.y-strideFloor(f,v.x,v.z)-air;if(d<gap[k]){gap[k]=d;pts[k].copy(v)}}
  for(let node of rig.toes){v.setFromMatrixPosition(node.matrixWorld);let d=v.y-strideFloor(f,v.x,v.z)-air-.045;if(d<back){back=d;rear.copy(v)}}
  return {gap,back}
 }
 const {gap,back}=measure();if(!gap.every(Number.isFinite))return;
 const smooth=t=>(t=cap(t,0,1),t*t*(3-2*t));
 // At sprint speed .08 of a stride is barely two display frames. Let the
 // shoulders recover through toe-off and into the next aerial phase.
 const windows=[[.31,.69,.81,1.23],[.19,.57,.70,1.12]];
 const weight=windows.map(([a,b,c,d])=>{
  const t=phase<a?phase+1:phase;return smooth((t-a)/(b-a))*smooth((d-t)/(d-c))*blend
 });
 const w=1-(1-weight[0])*(1-weight[1]);
 const baseQ=u.body.quaternion.clone(),baseY=u.body.position.y;
 const levelHead=rig.head?.getWorldQuaternion(new THREE.Quaternion);
 const anchors=[...pts,rear].map(p=>u.body.worldToLocal(p.clone()));
 const rearLocal=rig.toes.map(n=>u.body.worldToLocal(V().setFromMatrixPosition(n.matrixWorld)));
 const baseLift=Math.max(0,-back,-gap[0],-gap[1]);
 const desired=gap.map((d,k)=>((1-w)*(d+baseLift)+w*Math.min(.065,d+baseLift))*(1-weight[k])+.0015*weight[k]);
 desired.push(Math.max(.003,back+baseLift));
 const side=V(fw.z,0,-fw.x),world=anchors.map(()=>V());
 // Fit the chest and shoulders to the three contact heights as one rigid body.
 // Work on three local points: intermediate iterations need no skeleton updates.
 for(let j=0;w>.001&&j<9;j++){
  u.body.updateWorldMatrix(true,false);let low=Infinity;for(const q of rearLocal){v.copy(q).applyMatrix4(u.body.matrixWorld);const d=v.y-strideFloor(f,v.x,v.z);if(d<low){low=d;anchors[2].copy(q)}}world.forEach((v,k)=>v.copy(anchors[k]).applyMatrix4(u.body.matrixWorld));
  const err=world.map((v,k)=>desired[k]-(v.y-strideFloor(f,v.x,v.z)-air-(k===2?.045:0)));
  const x0=world[0].clone().sub(world[2]),x1=world[1].clone().sub(world[2]);
  const a=-x0.dot(fw),b=x0.dot(side),c=-x1.dot(fw),d=x1.dot(side),det=a*d-b*c;
  if(Math.abs(det)<.012)break;
  const pitch=cap(((err[0]-err[2])*d-(err[1]-err[2])*b)/det,-.16,.16);
  const roll=cap((a*(err[1]-err[2])-c*(err[0]-err[2]))/det,-.13,.13);
  u.body.rotateOnWorldAxis(side,pitch);u.body.rotateOnWorldAxis(fw,roll);
  u.body.updateWorldMatrix(true,false);const heel=world[2].copy(anchors[2]).applyMatrix4(u.body.matrixWorld);
  u.body.position.y+=desired[2]+strideFloor(f,heel.x,heel.z)+air+.045-heel.y;
 }
 // Filter the correction in actor space, never the heading or animated limbs.
 const relief=u.body.quaternion.clone().premultiply(baseQ.clone().invert());
 rig.contactQ??=new THREE.Quaternion();
 rig.contactQ.rotateTowards(relief,dt*4.8);
 u.body.quaternion.copy(baseQ).multiply(rig.contactQ);
 u.body.position.y=baseY;
 const corrected=measure();
 const activeDrop=Math.max(...corrected.gap.map((v,k)=>(v-.0015)*weight[k]));
 u.body.position.y+=Math.max(-corrected.back,-Math.min(...corrected.gap),-activeDrop)*blend;
 if(levelHead){
  const lift=new THREE.Quaternion().setFromAxisAngle(side,-.34*w);
  const goal=rig.head.parent.getWorldQuaternion(new THREE.Quaternion).invert().multiply(lift).multiply(levelHead);
  rig.head.quaternion.slerp(goal,w);
  // Translate the head back up only if the muzzle approaches the terrain.
  if(!rig.headRest)rig.headRest=rig.head.position.clone();
  if(!rig.chinProbe){let mouth;u.body.traverse(m=>{if(m.isSkinnedMesh&&m.material?.name==='Mouth')mouth=m});
   if(mouth){const attr=mouth.geometry.attributes.position,indices=new Set();for(const x of [-1,0,1])for(const y of [-1,0,1])for(const z of [-1,0,1]){
    let best=-Infinity,index=0;for(let i=0;i<attr.count;i++){let d=x*attr.getX(i)+y*attr.getY(i)+z*attr.getZ(i);if(d>best){best=d;index=i}}indices.add(index)}
    rig.chinProbe={mouth,indices:[...indices]}}}
  if(rig.chinProbe){u.root.updateMatrixWorld(true);let gap=Infinity;const {mouth,indices}=rig.chinProbe;
   for(const i of indices){mouth.boneTransform(i,v).applyMatrix4(mouth.matrixWorld);gap=Math.min(gap,v.y-strideFloor(f,v.x,v.z)-air)}
   const rise=cap(.125*u.height-gap,0,.29)*blend;
   if(rise){const hp=rig.head.getWorldPosition(V());hp.y+=rise;rig.head.position.copy(rig.head.parent.worldToLocal(hp))}}

 }
 // Head stabilization does not move either limb; no second sole fit is needed.
}
