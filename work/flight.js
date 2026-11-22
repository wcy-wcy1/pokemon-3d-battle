// Flight shares the same vertical coordinate as jumping. Positions in u.pos remain planar.
const skySpecies=new Set([6,12,16,18,92,123,130,144,145,146,149,150,151,384]);
function canFly(u){return skySpecies.has(u.d.id)}
function flightLevel(u){return (u.highFlight?3.9:1.9)+Math.min(1.2,(u.height||2)*.23)}
function bodyPoint(f,u){return V(u.pos.x,groundY(u.pos.x,u.pos.z,f.z)+(u.air||0)+(u.height||2)*.52,u.pos.z)}
function aimPoint(f,target,aim){if(dst(target.pos,aim)<.85)return bodyPoint(f,target);return V(aim.x,groundY(aim.x,aim.z,f.z)+.22,aim.z)}
function airStep(f,u,dt){
 if(f.megaShift?.u===u)return;
 if(u.cmd?.dive||u.cmd?.peck?.bird||u.cmd?.megaSkill===0||u.cmd?.megaSkill===3||u.cmd?.charFlight&&!u.cmd.sent||charizardHolding(f,u))return;
 if(!canFly(u)){verticalStep(u,dt);return}
 const other=u===f.p?f.e:f.p,a=u.cmd;let base=flightLevel(u),h=base;
 if(f.mode==='watch'&&u===f.p&&['approach','taste'].includes(f.watch?.fruit?.state))h=.18;
 if(a&&family(a.k)==='contact'&&other?.ready){let t=f.t-a.t-a.wind;
  if(t>-.12){let hitY=bodyPoint(f,other).y-groundY(u.pos.x,u.pos.z,f.z)-(u.height||2)*.48;
   let k=cap((t+.12)/.23,0,1);k*=cap((.52-t)/.14,0,1);k=k*k*(3-2*k);
   h=base+(cap(hitY,.20,7)-base)*k}}
 u.air+=(h-u.air)*(1-Math.exp(-dt*(a&&family(a.k)==='contact'?18:4.5)));
}
function aerialRange(f,start,dir,range){
 let best=range;
 for(const b of f.blocks){let dx=start.x-b.x,dz=start.z-b.z,A=dir.x**2+dir.z**2,B=dx*dir.x+dz*dir.z,D=B*B-A*(dx*dx+dz*dz-b.r*b.r);
  if(A<1e-7||D<0)continue;let first=Math.max(0,(-B-Math.sqrt(D))/A),last=Math.min(best,(-B+Math.sqrt(D))/A);if(first>last)continue;
  let top=groundY(b.x,b.z,f.z)+(b.h??4);
  if(start.y+dir.y*first<=top)best=first;else if(dir.y<0&&start.y+dir.y*last<=top)best=Math.min(best,(top-start.y)/dir.y)
 }return best
}
function aimRay(f,start,target,aim,max){let end=aimPoint(f,target,aim),dir=end.clone().sub(start).normalize(),range=aerialRange(f,start,dir,max);return {dir,range,end}}
function meleeOverlap(f,a,b){
 const feet=u=>groundY(u.pos.x,u.pos.z,f.z)+(u.air||0);
 const ay=feet(a),by=feet(b);
 return ay+a.height*.10<=by+b.height*.92+.30&&by+b.height*.10<=ay+a.height*(a.cmd?.k==="bash"?.62:.92)+.30
}

