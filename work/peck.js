// Sample the skin actually influenced by the bill, not the reach of the root capsule.
function measureBill(u){
 const head=u.motion?.head;if(!head)return null;
 const start=head.getWorldPosition(V());let best=-1,choice;u.body.updateWorldMatrix(true,true);
 u.body.traverse(m=>{if(!m.isSkinnedMesh||m.userData.fuzz)return;
  const at=m.geometry.attributes,bones=m.skeleton.bones.map(b=>/beak|upperjaw|lowerjaw/i.test(b.name));
  for(let i=0;i<at.position.count;i++){let w=0;for(let j=0;j<4;j++){const k=i*4+j;if(bones[at.skinIndex.array[k]])w+=at.skinWeight.array[k]}if(w<.48)continue;
   const v=m.localToWorld(m.boneTransform(i,V().fromBufferAttribute(at.position,i))),d=v.distanceTo(start);if(d>best&&d<u.height){best=d;choice={m,i}}}
 });return choice
}
function billTip(u){
 const ref=u.billTipRef??=measureBill(u);if(!ref)return null;
 const m=ref.m;m.updateWorldMatrix(true,false);
 for(let j=0;j<4;j++){const k=ref.i*4+j;m.skeleton.bones[m.geometry.attributes.skinIndex.array[k]].updateWorldMatrix(true,false)}
 return m.localToWorld(m.boneTransform(ref.i,V().fromBufferAttribute(m.geometry.attributes.position,ref.i)))
}
function peckSetup(f,a){
 const u=a.u,bird=u.d.id===16;a.peck={bird,air:u.air,targetY:aimPoint(f,a.player?f.e:f.p,a.aim).y};a.wind=bird?.14:.19;a.total=bird?.62:.58
}
function peckStep(f,a,age){
 const u=a.u,p=a.peck,t=cap((age-a.wind)/(p.bird?.23:.19),0,1),s=t*t*(3-2*t),back=cap((age-a.wind-(p.bird?.23:.19))/.24,0,1);
 if(p.reach==null)p.reach=Math.min(p.bird?1.52:1.05,Math.max(0,dst(u.pos,a.aim)-u.height*.24));
 let travel=a.hit?(p.stop??p.reach*s)-.14*back:p.reach*s,shift=travel-(p.prev||0);p.prev=travel;exMove(f,u,a.dir.x*shift,a.dir.z*shift);
 if(p.bird){let h=cap(p.targetY-groundY(u.pos.x,u.pos.z,f.z)-u.height*.47,.12,7);u.air=THREE.MathUtils.lerp(THREE.MathUtils.lerp(p.air,h,s),flightLevel(u),back*back*(3-2*back))}
 if(age>=a.total){u.cmd=null;u.lastClip=null}
}
function peckPose(f,u,g,rotate,right){
 const a=u.cmd;if(!a?.peck)return;const t=f.t-a.t,load=cap(t/a.wind,0,1),s=cap((t-a.wind)/.22,0,1),end=cap((a.total-t)/.16,0,1),jab=s*s*(3-2*s)*end;
 rotate(g.head,right,-.22*load*(1-s)+.19*jab);rotate(g.joints('lowerjaw','lowerbeak'),right,.17*load*(1-s));
 u.body.rotation.x+=.22*jab;rotate(g.tailRoot,right,-.19*jab);if(!a.peck.bird)u.body.position.y-=u.height*.09*jab
}
function peckContact(f,u){
 const a=u.cmd;if(!a?.peck)return;let p=a.peck,tip=billTip(u),age=f.t-a.t;if(!tip)return;
 if(p.last&&!a.hit&&age>a.wind+.025&&age<a.wind+.29){let tar=a.player?f.e:f.p,y=groundY(tar.pos.x,tar.pos.z,f.z)+tar.air,center=tar.pos.clone();center.y=cap(tip.y,y+.08,y+tar.height*.90);
  const near=new THREE.Line3(p.last,tip).closestPointToPoint(center,true,V()),d=near.distanceTo(center);
  if(d<cap(tar.height*.30,.20,.83)+.065&&aerialRange(f,near,center.clone().sub(near).normalize(),d)>=d-.01){a.contact=near;strikeHit(f,a,tar);if(a.hit)p.stop=p.prev}}
 p.last=tip
}
