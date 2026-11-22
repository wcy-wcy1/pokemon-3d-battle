const diveEase=x=>{x=cap(x,0,1);return x*x*(3-2*x)};
function beginBirdDive(f,a){
 const u=a.u,t=a.player?f.e:f.p,pt=aimPoint(f,t,a.aim);a.wind=.40;a.total=1.36;
 const d=Math.min(a.r,Math.max(.72,dst(u.pos,a.aim)));
 a.dive={entry:u.air,y:pt.y,reach:d,exit:1.65,progress:0,start:u.pos.clone(),prev:null};
}
function birdDiveStep(f,a,t,dt,target){
 const u=a.u,b=a.dive;let hold=cap(t/a.wind,0,1),s=cap((t-a.wind)/.53,0,1),out=cap((t-a.wind-.53)/.43,0,1);
 const progress=b.reach*(1-Math.cos(Math.PI*.5*s))+b.exit*Math.sin(out*Math.PI*.5);
 const pitch=diveEase(s),peak=b.entry+.63,low=Math.max(.12,b.y-groundY(u.pos.x,u.pos.z,f.z)-u.height*.43);
 u.air=t<a.wind?b.entry+.63*diveEase(hold):THREE.MathUtils.lerp(THREE.MathUtils.lerp(peak,low,pitch),flightLevel(u),diveEase(out));
 let step=progress-b.progress;b.progress=progress;
 if(step>0&&!b.blocked){let from=bodyPoint(f,u),allowed=aerialRange(f,from,a.dir,step+.14);
  if(allowed<step+.13)b.blocked=true;exMove(f,u,a.dir.x*Math.min(step,Math.max(0,allowed-.14)),a.dir.z*Math.min(step,Math.max(0,allowed-.14)))}
 if(step>.002&&!b.blocked&&b.before&&dst(u.pos,b.before)<step*.25)b.blocked=true;
 if(b.blocked){b.abort??={t,height:u.air};u.air=THREE.MathUtils.lerp(b.abort.height,flightLevel(u),diveEase((t-b.abort.t)/.38))}
 b.before=u.pos.clone();
 const point=bodyPoint(f,u).addScaledVector(a.dir,u.height*.18);point.y-=u.height*.12;
 if(!b.blocked&&s>.18&&!a.hit&&b.prev){const center=bodyPoint(f,target),near=new THREE.Line3(b.prev,point).closestPointToPoint(center,true,V()),r=cap(target.height*.28,.20,1)+u.height*.18;
  if(near.distanceTo(center)<r&&aerialRange(f,near,center.clone().sub(near).normalize(),near.distanceTo(center))>=near.distanceTo(center)-.015)strikeHit(f,a,target)}
 if(!a.sent&&t>=a.wind){a.sent=true;noise(.30,.12)}
 b.prev=point;if(t>=a.total){u.cmd=null;u.lastClip=null}
}
function birdDivePose(f,u,g,rotate,fw,right,up){
 const t=f.t-u.cmd.t,bank=Math.sin(Math.PI*cap(t/.46,0,1)),fold=diveEase((t-.25)/.25)*(1-diveEase((t-.75)/.24)),brake=Math.sin(Math.PI*cap((t-.82)/.48,0,1));
 for(const w of g.wings){let side=w.right?1:-1;rotate(w.bone,up,side*.76*fold);rotate(w.tip,fw,-side*.60*fold);rotate(w.bone,fw,side*(.31*bank+.49*brake))}
 rotate(g.tailRoot,right,-.21*fold+.23*brake);rotate(g.head,right,-.19*fold+.08*brake);
 u.body.rotation.z+=.31*bank;u.body.rotation.x+=.46*fold-.31*brake;
}
