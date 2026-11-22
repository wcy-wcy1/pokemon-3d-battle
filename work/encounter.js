// Perception is sampled, not read every graphics frame. A hidden opponent leaves a last seen position.
function encounterMind(f,e){
 if(e.mind)return e.mind;
 const style=fieldTemper(e)[0],contact=family(choreo[e.d.id].k)==='contact';
 return e.mind={style,bold:contact||[6,68,76,130,149,384].includes(e.d.id),side:e.d.id%2?1:-1,last:e.pos.clone().multiplyScalar(.4),next:0,seen:false,threat:false,noticed:-10,responded:false,restUntil:0,restCd:0,hp:e.hp,decision:'search',target:V(),held:0}
}
function unobscured(f,a,b){let v=b.clone().sub(a),d=v.length();return d<.001||aerialRange(f,a,v.multiplyScalar(1/d),d)>=d-.04}
function senseEncounter(f,e,p,m){
 if(f.t<m.next)return;
 m.next=f.t+.12+(e.d.id%6)*.015;
 const seen=unobscured(f,bodyPoint(f,e),bodyPoint(f,p));m.seen=seen;
 if(seen)m.last.copy(p.pos);
 const danger=seen&&!!(p.volts?.q>.32||p.jet?.phase==='pump'||(p.cmd&&p.cmd.wind>.25&&f.t-p.cmd.t<p.cmd.wind));
 if(danger&&!m.threat){m.noticed=f.t;m.responded=false}
 m.threat=danger;
 if(m.hp-e.hp>0&&e.hp/e.max<.46&&f.t>m.restCd){m.restUntil=f.t+(m.bold?.55:1.25);m.restCd=f.t+4}
 m.hp=e.hp;
}
function fieldSteer(f,e,dir,speed,dt,m){
 if(e.slowUntil>f.t)speed*=.57;let best=null,bestScore=-Infinity;
 for(const angle of [0,.52*m.side,-.52*m.side,1.02*m.side,-1.02*m.side,1.55*m.side,-1.55*m.side]){
  let v=dir.clone().applyAxisAngle(V(0,1,0),angle),probe=e.pos.clone().addScaledVector(v,1.7),score=Math.cos(angle);
  let edge=Math.hypot(probe.x,probe.z);if(edge>12.95)score-=3*(edge-12.95);
  for(const b of f.blocks){if((e.air||0)>(b.h??4)+.1)continue;let current=Math.hypot(e.pos.x-b.x,e.pos.z-b.z),gap=Math.hypot(probe.x-b.x,probe.z-b.z);if(gap<current)score-=Math.max(0,b.r+1.25-gap)*3}
  if(score>bestScore){best=v;bestScore=score}
 }
 const before=e.pos.clone(),rate=(m.decision==="escape"?32:16)/Math.pow(cap(e.d.kg,3,300)/30,.095);e.vel.lerp(best.multiplyScalar(speed),1-Math.exp(-rate*dt));exMove(f,e,e.vel.x*dt,e.vel.z*dt);if(dt)e.vel.copy(e.pos).sub(before).multiplyScalar(1/dt);return e.vel.length()>.1?1:0
}
function encounterStep(f,e,p,dt){
 const m=encounterMind(f,e);senseEncounter(f,e,p,m);f.nextAttack-=dt;
 const pr=choreo[e.d.id],d=dst(e.pos,m.last),dir=exDir(e.pos,m.last);
 if(!dir.lengthSq())dir.set(Math.sin(e.face),0,Math.cos(e.face));
 const across=V(-dir.z*m.side,0,dir.x*m.side);let action='engage',move,speed=3.1;
 const hazard=[f.wx?.ring?.pos,...(f.haz||[]).map(h=>h.point)].find(v=>v&&dst(e.pos,v)<2.65);
 if(hazard){action='escape';move=exDir(hazard,e.pos);if(move.lengthSq()<.1)move=across;speed=4.6}
 else if(!m.seen){action='search';move=dir.clone().multiplyScalar(d<1.2?.12:.66).addScaledVector(across,.85).normalize()}
 else if(f.t<m.restUntil){action='regroup';move=dir.clone().multiplyScalar(-.88).addScaledVector(across,.47).normalize()}
 else{
  if(m.threat&&!m.responded&&f.t-m.noticed>.20&&!(m.bold&&d<pr.r*.82)){
   m.responded=true;m.held=f.t+.62;m.side*=-1;
  }
  if(f.t<m.held){action='sidestep';move=across;speed=4.5}
 }
 e.face=Math.atan2(dir.x,dir.z);m.decision=action;
 if(move)return fieldSteer(f,e,move,speed,dt,m);
 const ranged=k=>['beam','missile'].includes(family(k))||['thunder','rockfall','blizzard','psystrike','waterfall'].includes(k);
 let pick=d<3&&(f.seq||0)%2===1?0:1;
 if(!canFly(e)&&p.air-e.air>1.6){if(ranged(pr.k))pick=1;else if(ranged(pr.b))pick=0}
 const reach=pick?pr.r:family(pr.b)==='contact'?3:8;
 if(f.nextAttack<=0&&d<=reach+.65){f.seq=(f.seq||0)+1;if(pick&&e.d.id===25)manualVolts(f,e,m.last);else if(pick&&e.d.id===9)pressurize(f,e,m.last);else newCast(f,e,pick,m.last);
  m.decision='attack';f.nextAttack=1.25+pr.w+.26*(2-f.wave);return 0}
 const desired=Math.min(m.bold?4:7,reach*(m.bold?.46:.72)),rad=cap((d-desired)*.85,-.85,1);
 move=dir.clone().multiplyScalar(rad).addScaledVector(across,.42*Math.sin(f.t*.80+e.d.id));
 return fieldSteer(f,e,move,3.1,dt,m)
}
