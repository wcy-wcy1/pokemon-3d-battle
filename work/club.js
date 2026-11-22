// The club is a rigid group of vertices bound to FeelerA beneath Cubone's right hand.
function clubHand(u){return u.motion?.joints('feelera','rhand')?.getWorldPosition(V())||bodyPoint(field,u)}
function detachClub(u,origin,group){
 const restore=[];u.body.updateWorldMatrix(true,true);
 u.body.traverse(m=>{if(!m.isSkinnedMesh)return;const joint=m.skeleton.bones.findIndex(b=>b.name==='FeelerA');if(joint<0)return;
 const geo=m.geometry,at=geo.attributes,idx=geo.index,keep=[],pp=[],uv=[],v=V();let count=idx?.count??at.position.count;
 const owned=i=>{for(let k=0;k<4;k++)if(at.skinIndex.array[4*i+k]===joint&&at.skinWeight.array[4*i+k]>.6)return true;return false};
 for(let t=0;t<count;t+=3){let tri=[0,1,2].map(j=>idx?idx.getX(t+j):t+j);if(!tri.every(owned)){keep.push(...tri);continue}
 for(let i of tri){v.fromBufferAttribute(at.position,i);m.boneTransform(i,v).applyMatrix4(m.matrixWorld).sub(origin);pp.push(...v.toArray());uv.push(at.uv.getX(i),at.uv.getY(i))}}
 if(!pp.length)return;
 // Prebuild both index buffers; switching draw indices does not disturb the skin or fingers.
 const cut=new THREE.BufferGeometry();cut.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));cut.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));cut.computeVertexNormals();
 const tex=m.material.map?.clone();if(tex){tex.needsUpdate=true;tex.userData={}}
 const mat=new THREE.MeshStandardMaterial({map:tex,color:m.material.color.clone(),roughness:.78,side:THREE.DoubleSide}),prop=new THREE.Mesh(cut,mat);
 prop.castShadow=true;group.add(prop);
 // Clone only the hand mesh's drawing shell, retaining its original buffers for restoration.
 const partial=new THREE.BufferGeometry;partial.setIndex(keep);for(let [key,attr] of Object.entries(at))partial.setAttribute(key,attr);
 partial.boundingSphere=geo.boundingSphere?.clone()||null;m.geometry=partial;restore.push(()=>{m.geometry=geo;for(const key of Object.keys(partial.attributes))partial.deleteAttribute(key);partial.dispose()})
 });return restore
}
function throwClub(f,a,target){
 const u=a.u,start=clubHand(u),dest=aimPoint(f,target,a.aim),dir=dest.clone().sub(start).normalize(),dist=Math.min(a.r,Math.max(2,start.distanceTo(dest)+2.4)),o=new THREE.Group;
 o.position.copy(start);f.sc.add(o);let restore=detachClub(u,start,o);if(!restore.length)projectShape(o,a);
 const club={...a,hit:false,o,u,restore,start,dir,dist,age:0,phase:'out',passHit:false,life:3,side:V(-dir.z,0,dir.x).normalize(),token:u.token};
 u.flyingClub=club;f.shots.push(club)
}
function endClub(s){for(const fn of s.restore.splice(0))fn();if(s.u.flyingClub===s)s.u.flyingClub=null}
function stepClub(f,s,dt,target){
 if(s.u.token!==s.token||!s.u.root||!s.u.hp)return false;
 const p=s.o.position,prev=p.clone();s.age+=dt;s.life-=dt;s.o.rotation.y+=dt*19;
 if(s.phase==='out'){
  const q=Math.min(1,s.age*13/s.dist);p.copy(s.start).addScaledVector(s.dir,s.dist*q).addScaledVector(s.side,.36*Math.sin(Math.PI*q));p.y+=.25*Math.sin(Math.PI*q)
 }else{
  const grip=clubHand(s.u),d=p.distanceTo(grip);
  if(d<.12+dt*17){s.u.catchAt=f.t;tone(235,.065,0,'triangle',.028);return false}
  p.addScaledVector(grip.sub(p).normalize(),dt*17)
 }
 const delta=p.clone().sub(prev),travel=delta.length(),line=delta.normalize(),clear=aerialRange(f,prev,line,travel),blocked=clear<travel-.001||p.y<strideFloor(f,p.x,p.z);
 if(blocked)p.copy(prev).addScaledVector(line,Math.max(0,clear-.08));
 if(!s.passHit&&target.hp>0&&target.inv<=0&&new THREE.Line3(prev,p).closestPointToPoint(bodyPoint(f,target),true,V()).distanceTo(bodyPoint(f,target))<cap(target.height*.31,.40,1.0)+.24){
  s.passHit=true;strikeHit(f,{...s,hit:false,power:s.power*.62},target)
 }
 if(blocked&&s.phase==='back'){exFx(f,p,0xefdab2,.45,p.y-strideFloor(f,p.x,p.z));return false}
 if(s.phase==='out'&&(blocked||s.age*13>=s.dist)){s.phase='back';s.passHit=false}
 return s.life>0
}
