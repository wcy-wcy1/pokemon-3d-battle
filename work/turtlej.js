function turtleJ(k){return k==='shellcheck'||k==='curlwhip'}
function turtleTiming(a){let heavy=a.k==='shellcheck';a.wind=heavy?.26:.14;a.total=heavy?.77:.56}
function turtleStep(f,a,t,dt,target){
 const u=a.u,heavy=a.k==='shellcheck',p=cap((t-a.wind)/(heavy?.29:.22),0,1),ease=p*p*(3-2*p);
 // Fixed travel along the committed direction. A sidestep is never tracked.
 const progress=(heavy?1.85:.60)*ease,step=Math.max(0,progress-(a.path||0));a.path=progress;
 if(step&&(!heavy||!a.hit))exMove(f,u,a.dir.x*step,a.dir.z*step);
 if(heavy&&!a.hit&&p>0&&p<1){let shoulder=u.pos.clone().addScaledVector(a.dir,u.height*.30),d=dst(shoulder,target.pos),toward=exDir(u.pos,target.pos),space=dst(u.pos,target.pos);
  if(d<cap(target.height*.28,.18,.9)+u.height*.25&&meleeOverlap(f,u,target)&&toward.dot(a.dir)>.08&&limitRay(f,u.pos,a.dir,space)>=space-.02){
   strikeHit(f,a,target);if(a.hit){a.stop=t;let shove=cap(.65*Math.sqrt(u.d.kg/target.d.kg),.23,1.7);target.shellShove={dir:a.dir.clone(),distance:shove,t:f.t,last:0}}
  }}
 if(t>=a.total)u.cmd=null
}
function turtlePose(f,u,g,rotate,right,up){
 const a=u.cmd;if(!a||!turtleJ(a.k))return;
 const age=f.t-a.t,heavy=a.k==='shellcheck',p=cap((age-a.wind)/(heavy?.29:.22),0,1),s=x=>{x=cap(x,0,1);return x*x*(3-2*x)},wind=s(age/a.wind),turn=s(p),release=1-s((age-a.wind-(heavy?.29:.22))/(heavy?.22:.20)),n=g.joints;
 if(heavy){
  const brace=wind*release,drive=Math.sin(Math.PI*p);u.body.rotation.y+=(-.43*wind+1.62*turn)*release;
  u.body.rotation.x+=.13*brace+.13*drive;u.body.position.y-=u.height*(.036*brace+.018*drive);
  rotate(n('neck'),right,.30*brace);rotate(n('waist'),up,.23*brace);for(const side of ['l','r']){rotate(n(side+'arm'),right,.39*brace);rotate(n(side+'leg'),right,(side==='r'?-.22:.19)*brace)}
 }else{
  u.body.rotation.y+=-.49*wind+turn*(Math.PI*2+.49);
  for(let i=1;i<=3;i++){let phase=s((p-(i-1)*.12)/.76);rotate(n('tail'+i),up,(-.20*wind+.47*Math.sin(Math.PI*phase))*release)}
 }
}
function curlContact(f,u){
 const a=u.cmd;if(a?.k!=='curlwhip')return;const t=f.t-a.t;if(t<a.wind-.03||t>a.wind+.26)return;
 const joint=u.motion?.joints('tail3');if(!joint)return;let tip=joint.getWorldPosition(V()),target=a.player?f.e:f.p;
 if(a.tip&&!a.hit&&t>a.wind){const floor=groundY(target.pos.x,target.pos.z,f.z)+target.air,center=target.pos.clone();center.y=cap(tip.y,floor+.08,floor+target.height*.84);
  let closest=new THREE.Line3(a.tip,tip).closestPointToPoint(center,true,V()),d=closest.distanceTo(center);
  if(d<cap(target.height*.29,.21,.85)+.11&&aerialRange(f,closest,center.clone().sub(closest).normalize(),d)>=d-.01)strikeHit(f,a,target)}
 a.tip=tip
}
function turtleImpact(f,a,target){
 const heavy=a.k==='shellcheck',spot=bodyPoint(f,target);spot.addScaledVector(a.dir,-cap(target.height*.17,.06,.4));
 tone(heavy?84:324,heavy?.15:.07,0,'triangle',heavy?.075:.045);
 flare(f,heavy?.29:.22,g=>{g.position.copy(spot);for(let i=0;i<(heavy?8:5);i++){
  const m=part(g,new THREE.IcosahedronGeometry(heavy?.074:.045,0),heavy?0xc5b59d:i%2?0x96e6fa:0xf4fcff);
  m.userData.v=V(a.dir.x*(.2+i%3*.27)+Math.sin(i*2.4)*.54,.23+i%4*.22,a.dir.z*(.2+i%3*.27)+Math.cos(i*2.4)*.54)
 }},(g,t)=>{for(let m of g.children){m.position.copy(m.userData.v).multiplyScalar(t*.92);m.position.y-=t*t*.65;m.material.opacity=1-t}})
}

function settleShellPush(f,u){
 const kick=u.shellShove;if(!kick)return;const t=cap((f.t-kick.t)/.23,0,1),distance=kick.distance*(1-(1-t)**3),step=distance-kick.last;kick.last=distance;
 exMove(f,u,kick.dir.x*step,kick.dir.z*step);if(t===1)u.shellShove=null
}
