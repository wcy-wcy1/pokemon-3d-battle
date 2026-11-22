function gripOutline(f,u){
 const fade={value:0},viewport={value:new THREE.Vector2()},mat=new THREE.ShaderMaterial({skinning:true,side:THREE.BackSide,transparent:true,depthWrite:false,uniforms:{fade,viewport},vertexShader:`
 #include <common>
 #include <skinning_pars_vertex>
 uniform vec2 viewport;
 void main(){
 #include <beginnormal_vertex>
 #include <skinbase_vertex>
 #include <skinnormal_vertex>
 #include <begin_vertex>
 #include <skinning_vertex>
 #include <project_vertex>
 vec2 n=(projectionMatrix*vec4(normalMatrix*objectNormal,0.)).xy;
 gl_Position.xy+=n/max(length(n),.0001)*3.8/viewport*gl_Position.w;
 }`,fragmentShader:'uniform float fade;void main(){gl_FragColor=vec4(.95,.97,1.,fade);}'});
 const hulls=[],meshes=[];u.body.traverse(m=>{if(m.isSkinnedMesh&&!m.userData.fuzz&&!/fur tips/i.test(m.name))meshes.push(m)});
 for(const m of meshes){const geo=m.geometry.attributes.normal?m.geometry:m.geometry.clone();if(!geo.attributes.normal)geo.computeVertexNormals();const h=new THREE.SkinnedMesh(geo,mat);h.bindMode=m.bindMode;h.bind(m.skeleton,m.bindMatrix);h.frustumCulled=false;h.matrixAutoUpdate=false;m.parent.add(h);hulls.push([m,h])}
 return {update(v){fade.value=v;viewport.value.set(f.r.domElement.clientWidth||640,f.r.domElement.clientHeight||360);for(const [m,h] of hulls){h.matrix.copy(m.matrix);h.matrixWorldNeedsUpdate=true;h.visible=m.visible}},clear(){for(const [m,h] of hulls){h.parent?.remove(h);if(h.geometry!==m.geometry)h.geometry.dispose()}mat.dispose()}}
}
function gripLift(kg){const mass=cap(Number(kg)||25,.1,1000);
 return {rise:cap(2.55*Math.pow(10/mass,.29),.7,3.3),duration:cap(.85*Math.pow(mass/10,.14),.64,1.5)}}
const GRIP_SWEEP=.18, GRIP_DETACH=.14;
function gripEase(x){x=cap(x,0,1);return x*x*(3-2*x)}
function gripYaw(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
function gripFacing(f){
 const g=f.grip;if(!g)return;
 let d=exDir(g.u.pos,g.v.pos),angle=Math.atan2(d.x,d.z);
 if(g.phase==='thrown'){
  const sec=f.t-g.release;if(sec>.34)return;
  angle=g.startYaw+gripYaw(g.startYaw,Math.atan2(g.dir.x,g.dir.z))*gripEase(sec/.21)
 }
 g.u.face=angle
}
function beginGrip(f,a,victim){
 if(f.grip||f.down||!victim.hp||a.u!==f.p||victim!==f.e)return;
 const g=f.grip={u:a.u,v:victim,side:a.side||1,t:f.t,startAir:victim.air||0,lift:gripLift(victim.d.kg),phase:'mark',glow:gripOutline(f,victim)};
 victim.cmd=null;victim.vel.set(0,0,0);victim.vy=0;stopPower(f,victim);g.glow.update(0);exSay(f,'念力命中 · 正在托起',1.4)
}
function clearGrip(f){const g=f?.grip;if(!g)return;f.grip=null;g.glow.clear();if(g.arrow)exDrop(f,g.arrow);g.v.vy=0;if(g.drag&&f.r.domElement.hasPointerCapture?.(g.drag.id))f.r.domElement.releasePointerCapture(g.drag.id)}
function gripStep(f,dt){
 const g=f.grip;if(!g)return;const v=g.v;if(g.u!==f.p||v!==f.e||!v.hp||!g.u.hp){clearGrip(f);return}
 let t=f.t-g.t,lift=cap((t-.42)/g.lift.duration,0,1),w=lift*lift*(3-2*lift);
 if(g.phase!=='thrown'){
  g.liftProgress=w;g.glow.update(Math.min(.96,t/.56));v.air=g.startAir+g.lift.rise*w;
  if(lift===1&&g.phase==='mark'){g.phase='held';exSay(f,'念力悬停 · 在场地按住左键，向想甩出的方向拖动并松开',4.8)}
  if(t>7)clearGrip(f);return
 }
 // Keep the victim suspended through anticipation. Integrate only the part of the
 // simulation step after the palm releases, even at a low frame rate.
 const sec=f.t-g.launch;if(sec<=0)return;
 const step=g.speed*(Math.exp(-Math.max(0,sec-dt)*1.85)-Math.exp(-sec*1.85))/1.85;exMove(f,v,g.dir.x*step,g.dir.z*step);
 v.air=Math.max(0,g.air+2.9*sec-8.5*sec*sec);g.glow.update(Math.max(0,1-sec*2.5));
 if(!v.air||sec>1.5){exFx(f,v.pos,0xe4ddff,.9);clearGrip(f)}
}
function wireGrip(f){
 const c=f.r.domElement;
 function point(g,e){const dx=e.clientX-g.drag.x,dy=e.clientY-g.drag.y,len=Math.hypot(dx,dy);
 const right=V(1,0,0).applyQuaternion(f.cam.quaternion);right.y=0;right.normalize();const forward=V(right.z,0,-right.x);
 return {len,dir:right.multiplyScalar(dx).addScaledVector(forward,-dy).normalize()}}
 f.on(c,'pointermove',e=>{const g=f.grip;if(!g?.drag||g.drag.id!==e.pointerId)return;const p=point(g,e);
 if(!g.arrow){g.arrow=new THREE.ArrowHelper(V(1,0,0),V(),1,0xf2dbff);f.sc.add(g.arrow)}
 g.arrow.visible=p.len>=10;if(!g.arrow.visible)return;g.arrow.position.copy(bodyPoint(f,g.v));g.arrow.setDirection(p.dir);g.arrow.setLength(cap(p.len*.025,.7,3),.38,.22)});
 f.on(c,'pointerup',e=>{const g=f.grip;if(!g?.drag||g.drag.id!==e.pointerId)return;const p=point(g,e);g.drag=null;if(g.arrow)g.arrow.visible=false;
 if(p.len<14||f.mode!=='live')return;g.phase='thrown';g.dir=p.dir;g.speed=cap(9+p.len*.05,10,19);g.release=f.t;g.startYaw=g.u.face;g.launch=f.t+GRIP_DETACH;g.air=g.v.air;tone(350,.14,0,'triangle',.07);exSay(f,'念力投掷',.7)});
 for(const ev of ['pointercancel','lostpointercapture'])f.on(c,ev,e=>{const g=f.grip;if(g?.drag?.id===e.pointerId){g.drag=null;if(g.arrow)g.arrow.visible=false}})
}
function gripArmPose(f,u,rig,rotate){
 const grip=f.grip;if(!grip||grip.u!==u)return;
 const prefix=grip.side<0?'left':'right',joint=s=>rig.joints(prefix+s);
 const arm=joint('arm01'),elbow=joint('arm02'),wrist=joint('hand'),finger=joint('middle01');if(!arm||!elbow||!wrist)return;
 const age=f.t-grip.t,release=grip.phase==='thrown',sec=release?f.t-grip.release:0;
 const ease=gripEase;
 const weight=ease(age/.18)*(1-ease((sec-.25)/.26));if(weight<=0)return;
 const target=bodyPoint(f,grip.v),lift=grip.liftProgress||0;
 const torso=rig.joints('spine2','spine1','waist'),up=V(0,1,0),forward=V(Math.sin(u.face),0,Math.cos(u.face)),across=V(forward.z,0,-forward.x);
 const twist=release?gripYaw(grip.startYaw,Math.atan2(grip.dir.x,grip.dir.z)):0;
 rotate(torso,up,weight*cap(twist,-1.4,1.4)*.27*Math.sin(Math.PI*ease(sec/.33)));
 rotate(torso,across,weight*(-.10*lift+(release?.22*Math.sin(Math.PI*ease(sec/.33)):0)));
 const shoulder=arm.getWorldPosition(V()),to=target.clone().sub(shoulder).normalize();
 // A low initial reach opens into a lifted palm on the same clock as the victim.
 const heading=to.clone();heading.y-=.19*(1-lift);heading.y+=.28*lift;heading.normalize();
 if(release){if(!grip.releaseAim)grip.releaseAim=heading.clone();const from=grip.releaseAim,end=grip.dir.clone();end.y=.11;
  const yaw=Math.atan2(from.x,from.z),delta=Math.atan2(Math.sin(Math.atan2(end.x,end.z)-yaw),Math.cos(Math.atan2(end.x,end.z)-yaw));
  const s=ease(sec/GRIP_SWEEP),phi=yaw+s*delta;heading.set(Math.sin(phi),from.y*(1-s)+.11*s+.23*Math.sin(Math.PI*s),Math.cos(phi)).normalize()}
 function align(b,child,dir,amount){if(!child)return;const curr=child.getWorldPosition(V()).sub(b.getWorldPosition(V())).normalize(),axis=curr.clone().cross(dir),dot=cap(curr.dot(dir),-1,1);
  if(axis.lengthSq()<1e-8){if(dot>0)return;axis.crossVectors(curr,Math.abs(curr.y)<.9?V(0,1,0):V(1,0,0))}
  rotate(b,axis.normalize(),Math.acos(dot)*amount)}
 const upper=heading.clone();upper.y-=.31*(release?.5:1);upper.normalize();
 align(arm,elbow,upper,weight);align(elbow,wrist,heading,weight);
 const point=release?heading:target.sub(wrist.getWorldPosition(V())).normalize();align(wrist,finger,point,weight)
}
