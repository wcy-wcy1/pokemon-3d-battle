function mewPalm(f,a){
 const bone=a.u.motion?.joints(a.side>0?'righthand':'lefthand');
 return bone?bone.getWorldPosition(V()):socket(f,a.u,'hands',a.side)
}
function preparePalm(f,a){
 const u=a.u;
 a.side=u.lastPalmAt!=null&&f.t-u.lastPalmAt<.94?-u.lastPalmSide:1;
 u.lastPalmSide=a.side;u.lastPalmAt=f.t;a.wind=.15;a.total=.43;u.swing=a.total;
 flare(f,a.wind+.05,g=>{
  for(let i=0;i<3;i++){const arc=part(g,new THREE.TorusGeometry(.21,.015,5,18,1.48),i===1?0xf8dfff:0xb583fc);arc.rotation.z=i*2.094}
 },(g,q)=>{g.visible=u.cmd===a;if(!g.visible)return;g.position.copy(mewPalm(f,a));g.quaternion.copy(f.cam.quaternion);g.rotateZ(a.side*q*1.5);g.scale.setScalar(1.3-.86*q);for(const m of g.children)m.material.opacity=Math.sin(q*Math.PI)})
}
function palmPose(f,u,g,rotate,fw,right,up){
 const a=u.cmd,p=f.t-a.t,side=a.side>0?'right':'left',direction=a.side,load=Math.sin(Math.PI*.5*cap(p/a.wind,0,1)),snap=cap((p-a.wind+.035)/.095,0,1),rest=1-cap((p-.235)/.19,0,1),n=g.joints;
 rotate(n(side+'arm01'),up,direction*(.32*load-.79*snap)*rest);rotate(n(side+'arm01'),right,(-.42*load-.18*snap)*rest);
 rotate(n(side+'arm02'),right,(.49*load-.73*snap)*rest);rotate(n(side+'hand'),fw,direction*(-.36*load+.7*snap)*rest);rotate(g.head,right,-.06*snap*rest)
}
function sendPalm(f,a,target){
 const origin=mewPalm(f,a),dir=aimRay(f,origin,target,a.aim,a.r).dir,root=new THREE.Group,spin=new THREE.Group;
 root.position.copy(origin);root.quaternion.setFromUnitVectors(V(0,0,1),dir);root.add(spin);f.sc.add(root);
 for(let i=0;i<3;i++){let h=hoop(spin,i===0?0xfff6ff:0xc49aff,.37-i*.065,.032-i*.005);h.position.z=-i*.2;h.material.opacity=.94-i*.21}
 let core=part(spin,new THREE.SphereGeometry(.105,12,8),0xffffff,0,0,0,.88,true);core.scale.z=1.9;
 const sp=14;f.shots.push({...a,o:root,spin,v:dir,sp,life:a.r/sp,size:.26,age:0,hit:false});
 tone(a.side>0?560:680,.085,0,'sine',.048)
}
function palmContact(f,a,t){
 beginGrip(f,a,t);const spot=bodyPoint(f,t).addScaledVector(a.v,-.18);
 flare(f,.20,g=>{g.position.copy(spot);g.quaternion.copy(f.cam.quaternion);g.rotateZ(a.side*.55);for(let i=0;i<2;i++){let h=hoop(g,i?0xffecff:0xc292ff,1,.035);h.rotation.y=.37}},(g,q)=>g.children.forEach((m,i)=>{let r=.11+Math.sqrt(q)*(.68-i*.2);m.scale.set(r,.52*r,r);m.material.opacity=(1-q)**1.4}));
 tone(178,.1,0,'triangle',.06)
}
