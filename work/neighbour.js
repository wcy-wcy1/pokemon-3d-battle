// Nearby wildlife uses the biome's resident model, with no combat ticks or HP changes.
function resetNeighbour(f){
 let w=f.watch,u=f.p,e=f.e,spacing=2.5+.45*(u.height||db[u.d.id].meters*FIELD_UNITS_PER_METER)+(e.height||2)*.35;
 e.pos.copy(u.pos).add(V(-.83,0,-.56).multiplyScalar(Math.min(spacing,9)));e.face=.8;e.air=0;e.drive=0;
 w.near={state:'notice',since:f.t,until:f.t+1.1,nextSense:f.t,seen:false,point:e.pos.clone(),home:e.pos.clone(),last:u.pos.clone(),trust:.1,blend:0,nextLook:f.t+1.2};
 u.socialLook=e.socialLook=null;if(e.root)e.root.visible=w.neighbours!==false
}
function neighbourStep(f,dt,manual){
 const w=f.watch,n=w.near,u=f.p,e=f.e;if(!n||!e.ready)return;
 e.root.visible=w.neighbours!==false;if(!e.root.visible){u.socialLook=e.socialLook=null;return}
 const dist=dst(e.pos,u.pos),space=cap(.40*(e.height+u.height),1.1,8),otherSpeed=u.drive||0,prev=e.pos.clone();
 const transition=(state,seconds)=>{n.state=state;n.since=f.t;n.until=f.t+seconds};
 if(f.t>=n.nextSense){
  n.nextSense=f.t+.19;n.seen=dist<13&&unobscured(f,bodyPoint(f,e),bodyPoint(f,u));if(n.seen)n.last.copy(u.pos);
  if(n.seen&&n.state!=='yield'&&(dist<space*.89||dist<space+2.6&&(otherSpeed>5.6||w.life.state==='retreat'||u.d.kg>e.d.kg*6&&dist<space+1.55))){
   transition('yield',1.25);n.trust=Math.max(0,n.trust-.12)
  }else if(f.t>n.until){
   if(n.state==='yield'||!n.seen){transition('browse',2.7);n.point.copy(n.home).add(V(Math.cos(f.t)*1.5,0,Math.sin(f.t)*1.5))}
   else if(n.state==='notice'&&dist>space+.9){transition('approach',2.25+n.trust)}
   else if(n.state==='approach'||n.state==='notice'){transition('together',3.6);n.trust=Math.min(1,n.trust+.12)}
   else{transition('notice',.8)}
  }
 }
 let go=0,dest=n.last;if(n.state==='approach'&&dist>space+.55)go=.95;if(n.state==='yield')go=-2.0;if(n.state==='browse'){dest=n.point;if(dst(e.pos,dest)>.48)go=.65}
 let dir=exDir(e.pos,dest);if(!dir.lengthSq())dir.set(Math.sin(e.face),0,Math.cos(e.face));if(go<0)dir.negate();
 let yaw=Math.atan2(dir.x,dir.z),delta=Math.atan2(Math.sin(yaw-e.face),Math.cos(yaw-e.face));e.face+=delta*(1-Math.exp(-dt*(go<0?8:3.8)));
 if(go){let v=dir.multiplyScalar(Math.abs(go)*cap((f.t-n.since+.06)/.32,.12,1));fieldSteer(f,e,v,1,dt,{side:1})}
 let gap=dst(e.pos,u.pos);if(gap<space*.72&&Math.abs(e.air-u.air)<(e.height+u.height)*.45){let away=exDir(u.pos,e.pos);if(!away.lengthSq())away.set(1,0,0);let push=Math.min(dt*4,space*.72-gap);exMove(f,e,away.x*push,away.z*push)}
 e.drive=dt?dst(prev,e.pos)/dt:0;airStep(f,e,dt);e.socialLook=n.seen&&n.state!=='browse'?n.last:null;
 u.socialLook=n.seen&&!manual&&!w.intent&&n.state!=='browse'&&f.t>=n.nextLook?e.pos:null;
 if(u.socialLook&&['listen','rest'].includes(w.life.state)){let d=exDir(u.pos,e.pos),a=Math.atan2(d.x,d.z)-u.face;u.face+=Math.atan2(Math.sin(a),Math.cos(a))*(1-Math.exp(-dt*.8))}
 actorTick(f,e,dt,cap(e.drive/2,0,1))
}
function neighbourCamera(f,dt){
 let w=f.watch,n=w.near,e=f.e,u=f.p;if(!n||!e.ready)return;
 n.blend+=((w.neighbours!==false&&dst(u.pos,e.pos)<13?1:0)-n.blend)*(1-Math.exp(-dt*3));if(n.blend<.002)return;
 let a=bodyPoint(f,u),b=bodyPoint(f,e),mid=a.clone().lerp(b,.5),sep=a.distanceTo(b),
 radius=Math.max(sep*.5+(Math.max(u.viewSpan||2,e.viewSpan||2))*.48,1.4),
 offset=f.cam.position.clone().sub(a),sine=Math.sin(Math.atan(Math.tan(f.cam.fov*Math.PI/360)*Math.min(1,f.cam.aspect))),
 distance=Math.max(offset.length(),radius/sine*1.12);
 f.cam.position.lerp(mid.clone().addScaledVector(offset.normalize(),distance),n.blend);
 f.cam.lookAt(a.lerp(mid,n.blend))
}
