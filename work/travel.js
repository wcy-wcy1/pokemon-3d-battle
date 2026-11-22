// Weight transfer during an action. The simulation keeps its original aim and hit windows.
function castMobility(f,u){if(u.cmd?.dive)return 0;
 const a=u.cmd;if(!a)return 1;
 if(a.megaSkill===3||a.charFlight&&!a.sent)return 0;
 if(a.megaSkill===1)return a.sent?.78:.24;
 if(u.d.id===25)return .28;
 const age=f.t-a.t,wind=cap(age/a.wind,0,1),release=cap((age-a.wind)/(a.total-a.wind),0,1);
 const smooth=x=>x*x*(3-2*x),fam=family(a.k),pounce=/rush|pounce|dive|quick|ascent|tackle/.test(a.k);
 let brace=pounce?.82:fam==='contact'?.52:canFly(u)?.78:fam==='beam'?.34:.65;
 if(a.skill===3)brace*=.82;
 return 1-(1-brace)*smooth(wind)*(1-smooth(cap((release-.30)/.70,0,1)));
}
function travelStep(f,u,m,sp,dt){
 if(u.d.id===25){exMove(f,u,m.x*dt*sp,m.z*dt*sp);return}
 const v=u.vel,w=u.motion?.inertia||1,k=(m.lengthSq()?13:20)/Math.sqrt(w);
 v.lerp(V(m.x*sp,0,m.z*sp),1-Math.exp(-k*dt));if(u.jet||v.lengthSq()<.0001)v.set(0,0,0);
 exMove(f,u,v.x*dt,v.z*dt)
}
function readTravel(f,u,dt){
 if(u.d.id===25||!u.motion)return;
 const g=u.motion,dx=u.pos.x-(g.lastX??u.pos.x),dz=u.pos.z-(g.lastZ??u.pos.z);
 g.lastX=u.pos.x;g.lastZ=u.pos.z;if(dt<=0)return;
 let distance=Math.hypot(dx,dz);if(distance>2.5)distance=0;
 if(f.mode==='live'){g.measured=Math.min(16,distance/dt);
 const forward=distance>.002?(dx*Math.sin(u.face)+dz*Math.cos(u.face))/distance:1;
 const side=distance>.002?(dx*Math.cos(u.face)-dz*Math.sin(u.face))/distance:0;
 const t=1-Math.exp(-dt*16);
 g.forward=(g.forward??1)+(forward-(g.forward??1))*t;g.side=(g.side||0)+(side-(g.side||0))*t;
 }else{g.measured=null;g.forward=1;g.side=0}
}
function motionFacing(u,dt){
 if(!u.motion)return u.face;
 const g=u.motion,old=g.heading??u.face;
 const d=Math.atan2(Math.sin(u.face-old),Math.cos(u.face-old));
 const rate=u.cmd?Math.max(18,3.9/u.cmd.wind):12/Math.sqrt(g.inertia);
 g.heading=old+d*(1-Math.exp(-dt*rate));g.turn=d;return g.heading
}
