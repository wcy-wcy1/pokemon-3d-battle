// Exact damped oscillator solution. A hit changes velocity, never the current angle.
function recoilChannel(){return {p:V(),v:V()}}
function advanceRecoilChannel(c,dt,drag,hz){
 if(dt<=0)return;const decay=Math.exp(-drag*dt),co=Math.cos(hz*dt),si=Math.sin(hz*dt),k=si/hz;
 for(const axis of ['x','y','z']){const p=c.p[axis],v=c.v[axis];
  c.p[axis]=decay*(p*(co+drag*k)+v*k);c.v[axis]=decay*(v*(co-drag*k)-p*(hz*hz+drag*drag)*k)}
}
function advanceRecoil(k,now){const dt=Math.max(0,now-k.t);k.t=now;
 advanceRecoilChannel(k.chest,dt,k.drag,k.hz);advanceRecoilChannel(k.neck,dt,k.drag*.79,k.hz*.62)}
function receiveImpulse(f,u,attacker,amount,dir){
 const other=u===f.p?f.e:f.p,vector=dir?.clone()||exDir(other.pos,u.pos);if(vector.lengthSq()<.001)vector.set(-Math.sin(u.face),0,-Math.cos(u.face));vector.normalize();
 const mass=cap(Math.pow((u.d.kg||20)/25,.22),.59,2.2),amp=cap(.22+amount/Math.max(1,u.max)*.85,.22,.53)/mass;
 const k=u.recoil??={t:f.t,last:f.t,chest:recoilChannel(),neck:recoilChannel(),hz:18/Math.sqrt(mass),drag:9/Math.sqrt(mass)};
 advanceRecoil(k,f.t);k.last=f.t;k.chest.v.addScaledVector(vector,amp*k.hz).clampLength(0,13);
 k.neck.v.addScaledVector(vector,amp*k.hz*.40).clampLength(0,7)
}
function hitBend(f,u){
 const k=u.recoil;if(!k)return;advanceRecoil(k,f.t);
 if(f.t-k.last>2&&k.chest.p.lengthSq()+k.neck.p.lengthSq()<.000003){u.recoil=null;for(const m of u.motion?.softShapes||[]){m.morphTargetInfluences[2]=0;m.morphTargetInfluences[3]=0}return}
 const cy=Math.cos(u.face),sy=Math.sin(u.face);
 // Whole-body recoil is now the bounded hit envelope; retain localized neck lag.
 const g=u.motion;
 if(g?.softShapes){const h=k.neck.p;for(const m of g.softShapes){m.morphTargetInfluences[2]=cap((h.x*cy-h.z*sy)*4,-1,1);m.morphTargetInfluences[3]=cap((h.x*sy+h.z*cy)*4,-1,1)}}
 const b=g?.head||u.boundRig?.head||g?.joints('hair1','bone001');if(!b)return;
 const h=k.neck.p,axis=V(h.z,0,-h.x),angle=axis.length();if(angle<.00001)return;
 if(g){if(!g.saved.has(b))g.saved.set(b,b.quaternion.clone())}else{u.lateHead={b,q:b.quaternion.clone()}}
 const world=b.getWorldQuaternion(new THREE.Quaternion),swing=new THREE.Quaternion().setFromAxisAngle(axis.divideScalar(angle),Math.min(.28,angle));
 b.quaternion.multiply(world.clone().invert().multiply(swing).multiply(world))
}

// Fit the two oriented model boxes into the safe area of the current lens.
// Work in camera axes so circling a long body does not assume its length is its width.
function battleCamera(f,dt){
 clearHitCamera(f);
 const state=f.duelCamera??={angle:f.az,focus:V(),distance:0},blend=1-Math.exp(-dt*7);
 state.angle+=Math.atan2(Math.sin(f.az-state.angle),Math.cos(f.az-state.angle))*blend;
 const grab=f.p.cmd?.charFlight,grabAge=grab?f.t-f.p.cmd.t:0;
 const side=grab&&Math.sin(grab.yaw-state.angle)<0?-1:1;
 const revealPair=grab?.victim?.hp?flowEnvelope(grabAge,charizardTiming.grab,charizardTiming.launch-.32,charizardTiming.hidden):0;
 const surge=f.p.cmd?.megaSkill===3?f.p.cmd:null;
 const surgeAge=surge?f.t-surge.t:0;
 const shift=f.megaShift,shiftAge=shift?f.t-shift.start:0;
 const evolution=shift?flowEnvelope(shiftAge,.22,megaSequence.seal,megaSequence.end):0;
 const flight=f.megaLotusFlight;
 const casting=flight&&!flight.sent?flowEnvelope(f.t-flight.t,.05,.98,flight.wind+.12):0;
 const bloom=f.megaBloom,bloomAge=bloom?f.t-bloom.age:Infinity;
 const lotusView=flowSmooth(bloomAge/.80)*(1-flowSmooth((bloomAge-1.28)/.70));
 const swing=surge?flowEnvelope(surgeAge,.08,megaFall.peak,megaFall.end):0;
 const impact=surge?flowEnvelope(surgeAge,megaFall.crash-.13,megaFall.crash+.16,megaFall.end):0;
 const surgeSide=surge&&Math.cos(state.angle)*surge.dir.x-Math.sin(state.angle)*surge.dir.z<0?-1:1;
 const castSide=flight&&Math.sin(flight.u.face-state.angle)<0?-1:1;
 const az=state.angle+side*.34*revealPair+.30*surgeSide*swing+castSide*.23*casting+.32*evolution,aspect=Math.max(.3,f.cam.aspect),lava=f.landscape?.cast,
 age=lava?f.t-(lava.charFlight?lava.t+charizardTiming.impact:lava.t):0,
 erupt=!!lava?.magma&&lava.megaSkill!==3&&lava.u===f.p?flowSmooth(age/.54)*(1-flowSmooth((age-3.15)/.85)):0,
 pitch=(aspect<.85?.36:.26)+.25*erupt+.17*impact+.39*lotusView+.30*evolution;
 const back=V(Math.sin(az)*Math.cos(pitch),Math.sin(pitch),Math.cos(az)*Math.cos(pitch)),
 right=V(Math.cos(az),0,-Math.sin(az)),up=V().crossVectors(back,right),pts=[];
 for(const u of [f.p,f.e]){
  const capture=charizardHolding(f,u);
  if(capture&&f.t-capture.t>=charizardTiming.launch)continue;
  const cast=u.cmd?.charFlight,flightAge=cast?f.t-u.cmd.t:0;
  if(cast&&flightAge>=charizardTiming.launch){
   const carry=flowSmooth((flightAge-charizardTiming.launch)/.31);
   const base=cast.holdPos.clone().lerp(cast.landing,carry);
   base.y=strideFloor(f,base.x,base.z)+1.1;
   pts.push(base);
   const ascent=flightAge-charizardTiming.launch;
   if(ascent>0&&ascent<.34){
    const peek=flowEnvelope(ascent,0,.21,.34);
    pts.push(base.clone().add(V(0,2.6*peek,0)))
   }
   const catchDive=flowEnvelope(flightAge,charizardTiming.dive-.18,charizardTiming.dive+.10,charizardTiming.impact+.12);
   if(catchDive>.01)pts.push(base.clone().add(V(0,7.2*catchDive,0)));
   if(!cast.landed)continue;
  }
  const dim=u.frameSize||V(u.height*.72,u.height,u.height*.72),body=u.body;
  if(!body)continue;body.updateWorldMatrix(true,false);
  for(const x of [-.53,.53])for(const z of [-.53,.53])for(const y of [0,1.05])
   pts.push(V(dim.x*x,dim.y*y,dim.z*z).applyMatrix4(body.matrixWorld));
  // Keep the actual face and tail joints in frame even when an animation stretches the rest bounds.
  const mid=bodyPoint(f,u),limit=Math.max(dim.length()*1.5,1);
  for(const b of [u.motion?.head,u.motion?.tail?.at(-1)])if(b?.isObject3D){
   const pt=b.getWorldPosition(V());if(pt.distanceToSquared(mid)<limit*limit)pts.push(pt)
  }
  const a=u.cmd,mark=a?.focus||a?.psych?.center;
  if(mark){pts.push(mark);let rad=a.psych?.rad||a.r||0;pts.push(mark.clone().addScaledVector(right,rad),mark.clone().addScaledVector(right,-rad))}
 }
 if(!pts.length)return;
 if(shift&&evolution>.002){
  const {ground,ritual}=shift;
  const body=bodyPoint(f,shift.u),array=flowEnvelope(shiftAge,megaSequence.draw-.16,megaSequence.seal,megaSequence.end);
  for(const pt of pts)pt.lerp(body,evolution*.37);
  const extent=ritual.radius*1.12*array;
  for(const sign of [-1,1]){
   pts.push(ground.clone().addScaledVector(right,extent*sign));
   pts.push(ground.clone().add(V(back.x*extent*sign,0,back.z*extent*sign)));
  }
  const beam=flowEnvelope(shiftAge,megaSequence.beam,megaSequence.swap,megaSequence.end-.32);
  pts.push(body.clone().add(V(0,1.8*beam,0)));
 }
 if(surge&&swing>.002){
  const center=surge.target.clone();
  pts.push(center);
  const span=(aspect<.85?1.96:3.72)*impact;
  pts.push(center.clone().addScaledVector(right,span),center.clone().addScaledVector(right,-span));
 }
 if(surge?.ghost){
  const rise=flowSmooth((surgeAge-megaFall.crash)/.30);
  const settle=1-flowSmooth((surgeAge-megaFall.seal)/.42);
  const fullHeight=flowEnvelope(surgeAge,megaFall.crash,megaFall.crash+.42,megaFall.emerge+.70);
  pts.push(surge.ghost,surge.ghost.clone().add(V(0,Math.max(3.55*rise*settle,7.35*fullHeight),0)));
  const span=(aspect<.85?1.65:2.35)*rise*settle;
  for(const sign of [-1,1])pts.push(surge.ghost.clone().addScaledVector(right,span*sign));
  if(surge.skyClaw?.visible){
   const grip=surge.skyClaw.position,show=flowSmooth((surgeAge-megaFall.claw)/.30);
   pts.push(surge.ghost.clone().lerp(grip.clone().add(V(0,.65,0)),show));
   for(const sign of [-1,1])pts.push(grip.clone().addScaledVector(right,sign*2.38*show).add(V(0,-1.0,0)));
  }
 }
 if(bloom&&f.t-bloom.age<megaLotus.bloom){
  const reveal=flowSmooth(bloomAge/.57)*(1-flowSmooth((bloomAge-1.50)/.50));
  const center=bloom.center.clone().add(V(0,.90,0));
  for(const point of pts)point.lerp(center,lotusView*.91);
  pts.push(center);
  const span=(aspect<.85?3.75:4.10)*reveal;
  for(const sign of [-1,1]){
   pts.push(center.clone().addScaledVector(right,span*sign));
   pts.push(center.clone().addScaledVector(up,span*.66*sign));
  }
 }else if(flight?.lotus){
  const bud=flight.lotus.position.clone().add(V(0,flight.lotus.scale.y*.58,0));
  if(flight.sent){
   const travel=cap((f.t-flight.launched)/flight.flight,0,1);
   for(const point of pts)point.lerp(bud,.34*Math.sin(Math.PI*travel*.82));
   pts.push(bud,flight.target);
  }else if(casting>0){
   const focus=bodyPoint(f,flight.u).lerp(bud,.48);
   for(const point of pts)point.lerp(focus,casting*.38);
   pts.push(bud);
  }
 }
 if(erupt){const base=bodyPoint(f,f.p),mid=base.clone().lerp(lava.magma.vents.at(-1).pos,.55);
  const reveal=flowSmooth((age-.5)/.85)*erupt;
  for(const sign of [-1,1])pts.push(base.clone().lerp(mid.clone().addScaledVector(right,sign*(aspect<.85?3.1:5.9)),reveal));
  for(const v of lava.magma.vents){
  const crest=v.pos.clone();crest.y+=3.8*v.size;
  pts.push(base.clone().lerp(v.pos,erupt),base.clone().lerp(crest,erupt))
 }}
 const movie=f.celestial;
 if(movie&&movie.u===f.p&&f.t<movie.end){
  const w=flowSmooth((f.t-movie.start)/.55)*flowSmooth((movie.end-f.t)/.62);
  const base=bodyPoint(f,f.p),top=movie.center.clone();top.y+=2.1;
  pts.push(base.clone().lerp(top,w),base.clone().lerp(movie.center.clone().addScaledVector(right,2.9),w),base.clone().lerp(movie.center.clone().addScaledVector(right,-2.9),w))
 }
 const mid=v=>{let lo=Infinity,hi=-Infinity;for(const p of pts){const n=p.dot(v);lo=Math.min(lo,n);hi=Math.max(hi,n)}return (lo+hi)*.5};
 const center=right.clone().multiplyScalar(mid(right)).addScaledVector(up,mid(up)).addScaledVector(back,mid(back));
 if(!state.distance)state.focus.copy(center);else state.focus.lerp(center,blend);
 const tan=Math.tan(f.cam.fov*Math.PI/360),safeX=aspect<.85?.83:.88,safeY=.68;
 let required=0;for(const p of pts){const rel=p.clone().sub(state.focus);required=Math.max(required,rel.dot(back)+Math.max(Math.abs(rel.dot(right))/(tan*aspect*safeX),Math.abs(rel.dot(up))/(tan*safeY)))}
 const minimum=(aspect<.85?5.15:4.65)+.11*Math.min(10,dst(f.p.pos,f.e.pos));
 const want=Math.max(minimum,required+.28)*f.zoom;
 // Pull back immediately to protect newly exposed bounds; ease in as fighters converge.
 state.distance=state.distance?Math.max(want,state.distance+(want-state.distance)*(1-Math.exp(-dt*3.6))):want;
 f.cam.position.copy(state.focus).addScaledVector(back,state.distance);f.shake=Math.max(0,f.shake-dt);
 f.cam.lookAt(state.focus.x+Math.sin(f.t*115)*f.shake,state.focus.y+Math.sin(f.t*32)*(f.quake?.amp.value||0)*.48,state.focus.z);
 applyHitCamera(f)
}
