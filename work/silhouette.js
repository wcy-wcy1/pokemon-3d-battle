// Tufts share the underlying skin weights and pigment. Roots stay attached; tips bend.
function buildCoat(u){
 if(!u.model3d||familyOf(u.d.id)!=='fur'||u.d.id===25)return;
 const T=THREE,l=u.lifeRig,clock=l.coatClock={value:0},lift=l.coatLift={value:.2},sources=[];
 u.body.traverse(m=>{if(m.isSkinnedMesh&&m.material.map&&!l.slots.some(s=>s.mat===m.material)&&!l.pupils.includes(m))sources.push(m)});
 for(const m of sources){
  const at=m.geometry.attributes,{position:pos,normal:nor,uv,skinWeight:sw,skinIndex:si}=at,ix=m.geometry.index;if(!nor||!uv||!sw||!at.animalCoord)continue;
  const names=m.skeleton.bones.map(b=>b.name.toLowerCase()),furry=names.map(name=>/tail|hair|feeler|spine|neck/.test(name)),long=names.map(name=>/tail|hair|feeler/.test(name)),idx=i=>ix?ix.getX(i):i;
  let triangles=[],areas=[],total=0,A=V(),B=V(),C=V();for(let t=0;t<(ix?.count??pos.count);t+=3){let a=idx(t),b=idx(t+1),c=idx(t+2),w=0;for(let j=0;j<4;j++)if(furry[si.array[a*4+j]])w+=sw.array[a*4+j];if(w<.55)continue;
   A.fromBufferAttribute(pos,a);B.fromBufferAttribute(pos,b);C.fromBufferAttribute(pos,c);total+=B.sub(A).cross(C.sub(A)).length();triangles.push([a,b,c]);areas.push(total)}
  if(!total)continue;
  let box=new T.Box3().setFromBufferAttribute(pos),dim=Math.max(...box.getSize(V()).toArray()),rng=seeded(u.d.id*47+triangles.length),attr=Array.from({length:9},()=>[]);
  for(let i=0,N=Math.min(4100,triangles.length*3);i<N;i++){let k=rng()*total,lo=0,hi=areas.length-1;while(lo<hi){let mid=(lo+hi)>>1;if(areas[mid]<k)lo=mid+1;else hi=mid}let tri=triangles[lo],a=tri[0],z=Math.sqrt(rng()),r=rng(),ws=[1-z,z*(1-r),z*r],p=V(),n=V(),tx=new T.Vector2,weights=new Map;tri.forEach((v,j)=>{p.addScaledVector(A.fromBufferAttribute(pos,v),ws[j]);n.addScaledVector(A.fromBufferAttribute(nor,v),ws[j]);tx.addScaledVector(new T.Vector2().fromBufferAttribute(uv,v),ws[j]);for(let h=0;h<4;h++){let bone=si.array[v*4+h];weights.set(bone,(weights.get(bone)||0)+sw.array[v*4+h]*ws[j])}});
   n.normalize();let bones=[...weights].sort((a,b)=>b[1]-a[1]).slice(0,4);while(bones.length<4)bones.push([0,0]);let sum=bones.reduce((s,b)=>s+b[1],0),h=dim*(long[bones[0][0]]?.010:.005)*(.55+rng()*.8),side=V(0,1,0).cross(n);if(side.lengthSq()<.02)side.set(1,0,0).cross(n);side.normalize();let flow=n.clone().cross(side).negate(),root=p.addScaledVector(n,-h*.14),tip=root.clone().addScaledVector(n,h*.38).addScaledVector(flow,h*.91);let phase=rng()*6.28;
   for(let j=0;j<3;j++){attr[0].push(...(j===2?tip:root.clone().addScaledVector(side,(j?1:-1)*h*.15)).toArray());attr[1].push(...n.toArray());attr[2].push(tx.x,tx.y);attr[3].push(...bones.map(b=>b[0]));attr[4].push(...bones.map(b=>b[1]/sum));attr[5].push(...side.clone().multiplyScalar(j===2?h*.8:0).toArray());attr[6].push(phase);let coord=V(),shade=0;tri.forEach((v,k)=>{coord.addScaledVector(A.fromBufferAttribute(at.animalCoord,v),ws[k]);shade+=at.animalShade.getX(v)*ws[k]});attr[7].push(...coord.toArray());attr[8].push(shade)}
  }
  const geom=new T.BufferGeometry;['position','normal','uv','skinIndex','skinWeight','coatBend','coatPhase','animalCoord','animalShade'].forEach((key,j)=>geom.setAttribute(key,new (j===3?T.Uint16BufferAttribute:T.Float32BufferAttribute)(attr[j],[3,3,2,4,4,3,1,3,1][j])));
  const src=m.material,mat=src.clone();mat.side=T.DoubleSide;mat.skinning=true;mat.customProgramCacheKey=()=>src.customProgramCacheKey()+"|fur-tips-2";mat.onBeforeCompile=(s,r)=>{src.onBeforeCompile.call(mat,s,r);s.fragmentShader=s.fragmentShader.replace("#include <normal_fragment_begin>",T.ShaderChunk.normal_fragment_begin.replace("normal = normal * faceDirection;",""));s.uniforms.coatTime=clock;s.uniforms.coatLift=lift;s.vertexShader='attribute vec3 coatBend;attribute float coatPhase;uniform float coatTime,coatLift;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed+=coatBend*coatLift*(sin(coatTime+coatPhase)*.65+.35*sin(coatTime*1.61+coatPhase*.5));')};
  const tuft=new T.SkinnedMesh(geom,mat);tuft.name='Living fur tips';tuft.position.copy(m.position);tuft.quaternion.copy(m.quaternion);tuft.scale.copy(m.scale);tuft.bindMode=m.bindMode;tuft.bind(m.skeleton,m.bindMatrix);tuft.frustumCulled=false;tuft.receiveShadow=true;m.parent.add(tuft)
 }
}
function animateSilhouette(f,u,g,w,p,strength,rotate,fw,right,up,dt){
 if(u.d.id===25)return;let life=u.lifeRig;if(!life)return;const n=g.joints,time=f.t,fur=familyOf(u.d.id)==='fur',focus=!!u.cmd,hurt=u.flinch>.04,exert=w*strength;
 if(life.coatClock){life.coatClock.value+=dt*(5+11*exert+4*(f.wx?.power||0));life.coatLift.value=.25+.9*exert+.45*(f.wx?.power||0)}
 if(!g.expressive){g.expressive=[];u.body.traverse(b=>{if(!b.isBone)return;let key=b.name.toLowerCase().replace(/^\d+\s+/,'').replace(/_\d+$/,'').replace(/_/g,'');if(/^(?:(?:l|r|left|right)?(?:hair|feeler)[abc]?\d*|tail\d*|(?:l|r|left|right)ear\d*)$/.test(key))g.expressive.push({b,key})})}
 let turn=cap(g.turn||0,-1,1),wave=Math.sin;
 for(const {b,key} of g.expressive){
  let j=+(key.match(/\d+$/)||[1])[0],s=/^(r|right)/.test(key)?-1:1;
  if(key.startsWith('tail')&&fur){rotate(b,up,(.095+.105*w)*wave(time*(focus?4.6:2.7)-j*.55+life.seed)-turn*.07);rotate(b,right,.085*wave(p-j*.64)*w+.035*wave(time*2-j*.47))}
  else if(fur&&/hair|feeler/.test(key)){rotate(b,right,exert*.12+(.04+.12*w)*wave(p-j*.61+s*.37));rotate(b,fw,s*.057*wave(time*3.8-j*.53)-turn*.09)}
  else if(fur&&/ear/.test(key)){rotate(b,right,.16*exert+.08*w*wave(p-j*.35));rotate(b,fw,s*(hurt?.18:focus?-.13:.046*wave(time*2.4+s)))}
 }
 if(fur){const pant=life.energy*(.5+.5*wave(time*(5.7+life.energy*2.1)));rotate(n('jaw','lowerjaw'),right,.19*pant+(focus?.12:0));rotate(n('spine1'),right,.045*wave(life.breath)+.08*w*wave(p));rotate(n('spine2'),right,-.052*w*wave(p-.48));rotate(g.head,right,-.043*wave(life.breath)+.035*pant)}
}
function fitFurTail(u){
 if(!u.motion||familyOf(u.d.id)!=='fur'||u.d.id===25)return;
 let roots=[];u.body.traverse(b=>{if(b.isBone&&/tail/i.test(b.name)&&!/end/i.test(b.name)&&!/tail/i.test(b.parent?.name||''))roots.push(b)});u.motion.tailCurves=[];
 for(let root of roots){
 const chain=[];for(let b=root;b;b=b.children.find(c=>c.isBone&&/tail/i.test(c.name)&&!/end/i.test(c.name)))chain.push(b);
 if(chain.length<2)continue;
 u.body.updateWorldMatrix(true,true);let inv=u.body.matrixWorld.clone().invert();
 const points=chain.map(b=>b.getWorldPosition(V()).applyMatrix4(inv)),dirs=points.slice(1).map((v,i)=>v.clone().sub(points[i]).normalize());
 const rest=chain.map(b=>b.quaternion.clone());
 u.motion.tailCurves.push({chain,rest,dirs:dirs.map((d,i)=>d.clone().multiplyScalar(2.8).add(dirs[Math.max(0,i-1)]).add(dirs[Math.min(i+1,dirs.length-1)]).normalize())});}
 u.motion.tailCurve=u.motion.tailCurves[0];
}
function sweepFurTail(f,u,g){
 if(!g.tailCurves)return;for(const [index,c] of g.tailCurves.entries()){
 // Absolute directions in torso space: a downstream segment never inherits a second copy of the same bend.
 const {chain,rest,dirs}=c,bodyQ=u.body.getWorldQuaternion(new THREE.Quaternion),inv=new THREE.Quaternion,up=V(0,1,0),right=V(1,0,0);
 const age=u.cmd?(f.t-u.cmd.t)/u.cmd.total:0,swipe=u.cmd?.k==='tail'?Math.sin(Math.PI*cap(age,0,1))*.68:0;
 for(let i=0;i<chain.length;i++){
  let b=chain[i];if(!g.saved.has(b))g.saved.set(b,b.quaternion.clone());b.quaternion.copy(rest[i]);if(!dirs[i])continue;
  const s=(i+.5)/dirs.length,phase=f.t*3.25+u.lifeRig.seed+index*.77-.92*s;
  let yaw=(.17+.30*s)*Math.sin(phase)+.22*g.weight*Math.sin(g.phase*6.283-1.1*s)-.22*s*cap(g.turn||0,-1,1)+swipe*(.45+.55*s);
  let pitch=(.035+.085*s)*Math.sin(phase*.83)+g.weight*.13*Math.sin(g.phase*6.283-.85*s);
  const desired=dirs[i].clone().applyAxisAngle(up,yaw).applyAxisAngle(right,pitch).applyQuaternion(bodyQ);
  let start=b.getWorldPosition(V()),cur=chain[i+1].getWorldPosition(V()).sub(start).normalize(),q=b.getWorldQuaternion(new THREE.Quaternion);
  const delta=new THREE.Quaternion().setFromUnitVectors(cur,desired);b.quaternion.multiply(inv.copy(q).invert().multiply(delta).multiply(q))
 }
}}
