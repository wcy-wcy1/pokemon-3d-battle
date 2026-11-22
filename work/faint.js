// Capture support points in the final living pose; use them while the frozen rig settles.
function faintStart(f,u,mine){clearGrip(f);
 clearHitPose(u);u.hitFeedback=null;
 if(f.down)return;
 const held=f.p.cmd?.charFlight?.victim||f.e.cmd?.charFlight?.victim;
 if(held){
  held.air=Math.min(held.air,canFly(held)?flightLevel(held):1.3);
  held.body.visible=true
 }
 const other=mine?f.e:f.p,away=exDir(other.pos,u.pos),side=(away.x*Math.cos(u.face)-away.z*Math.sin(u.face))<0?-1:1;
 for(const actor of [u,other]){
  stopPower(f,actor);
  if(actor.cmd?.charFlight&&!actor.cmd.charFlight.landed){
   actor.air=Math.min(actor.air,flightLevel(actor));
   actor.body.visible=true
  }
  if(actor===u&&actor.charizard)actor.charizard.group.visible=false;
  actor.cmd=null;actor.swing=0;actor.drive=0;actor.vel.set(0,0,0)
 }
 f.hold=false;
 u.body.updateWorldMatrix(true,true);const inv=u.body.matrixWorld.clone().invert(),points=[],v=V();
 u.body.traverse(m=>{if(!m.isMesh||m.userData.fuzz||m.name==='Living fur tips')return;const pos=m.geometry.attributes.position;if(!pos)return;
 // Keep extrema for multiple roll angles so tails, paws or wings can touch first.
 let support=Array.from({length:12},()=>({v:V(),y:Infinity}));
 for(let i=0;i<pos.count;i+=Math.max(1,Math.floor(pos.count/680))){v.fromBufferAttribute(pos,i);if(m.isSkinnedMesh)m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld).applyMatrix4(inv);
  for(let j=0;j<support.length;j++){let angle=(j-5.5)*.23,h=v.y*Math.cos(angle)+v.x*Math.sin(angle);if(h<support[j].y){support[j].y=h;support[j].v.copy(v)}}}
 points.push(...support.filter(s=>Number.isFinite(s.y)).map(s=>s.v))
 });
 let kind=u.motion?.kind,tilt=kind==='serpent'?.31:kind==='float'?.53:[7,9,76].includes(u.d.id)?.57:kind==='runner'||kind==='sturdyQuad'?.87:1.09;
 f.down={u,mine,side,points,tilt,age:0,baseY:u.body.position.y,roll:u.body.rotation.z,pitch:u.body.rotation.x,h:u.air||0,slide:away,landed:false};
 exSay(f,u.d.name+'失去了战斗能力',1.7);exHUD(f,true)
}
function faintStep(f,dt){
 const s=f.down,u=s.u,other=s.mine?f.e:f.p;if(s.age===0){for(const shot of f.shots){if(shot.restore)endClub(shot);exDrop(f,shot.o)}f.shots.length=0} s.age+=dt;let t=s.age,smooth=x=>{x=cap(x,0,1);return x*x*(3-2*x)};
 const fall=smooth((t-.055)/.64),rest=t>.69?Math.sin((t-.69)*18)*Math.exp(-(t-.69)*10):0;
 if(t<.28)exMove(f,u,s.slide.x*dt*.76*(1-t/.28),s.slide.z*dt*.76*(1-t/.28));
 u.air=Math.max(0,s.h-8.5*t*t);u.root.position.set(u.pos.x,groundY(u.pos.x,u.pos.z,f.z)+u.air,u.pos.z);
 u.body.rotation.z=s.roll*(1-fall)+s.side*s.tilt*(fall+.055*rest);
 u.body.rotation.x=s.pitch*(1-fall)+.13*fall;u.body.position.y=s.baseY;
 u.body.updateWorldMatrix(true,false);let lowest=Infinity,v=V();for(const pt of s.points){v.copy(pt).applyMatrix4(u.body.matrixWorld);lowest=Math.min(lowest,v.y-strideFloor(f,v.x,v.z)-u.air)}
 if(Number.isFinite(lowest))u.body.position.y-=lowest*smooth(t/.18);
 if(!s.landed&&t>.39&&u.air<.02){s.landed=true;placeTrack(f,u,u.pos,1.5)}
 if(t>.18&&u.lifeRig){let l=u.lifeRig;for(const slot of l.slots){if(slot.mouth)continue;let n=expressionFrame(u,slot,'blink');slot.tx.offset.set(slot.base.x+(n%slot.cols-slot.tile%slot.cols)/slot.cols,slot.base.y+(Math.floor(n/slot.cols)-Math.floor(slot.tile/slot.cols))/slot.rows)}for(const m of l.pupils)m.visible=false}
 placePatch(f,u);if(f.trail)f.trail.clock.value=f.t;
 if(other.ready){airStep(f,other,dt);actorTick(f,other,dt,0)}animateFX(f,dt);stepLocalFX(f,dt);tickImpactFX(f,dt);f.windTime.value=f.t;clearHitCamera(f);applyHitCamera(f);
 if(t>=Math.max(1.18,Math.sqrt(s.h/8.5)+.48)){f.down=null;finishFaint(f,u,s.mine)}
}
