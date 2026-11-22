function evoFieldCast(f,a){
 const kind=a.u.d.id===135?'spark':a.u.d.id===136?'ash':'dark',duration={spark:.51,ash:.86,dark:.80}[kind];
 a.fieldCast={kind,duration};a.total=a.wind+duration+.12;a.u.swing=a.total
}
function evoRelease(f,a){
 const {kind,duration}=a.fieldCast,origin=bodyPoint(f,a.u),dir=a.dir;
 a.origin=origin;
 if(kind==='dark'){const ray=aimRay(f,origin,a.player?f.e:f.p,a.aim,a.r);a.darkDir=ray.dir;a.darkRange=ray.range}
 flare(f,duration+.12,g=>{
  g.position.copy(origin);
  if(kind==='spark'){
   for(let j=0;j<16;j++){let theta=2*Math.PI*j/16,c=Math.cos(theta),s=Math.sin(theta),zig=(k)=>Math.sin(j*11+k*7)*.045;
    const pts=Array.from({length:8},(_,k)=>{let v=k/7;return V(c*v-s*zig(k),.035*Math.cos(k*2+j),s*v+c*zig(k))});stroke(g,pts,j%3?0xffe052:0xffffdc,.008,true)}
  }else if(kind==='ash'){
   for(let j=0;j<28;j++){let hot=j%4===0,m=part(g,new THREE.IcosahedronGeometry(1,1),hot?0xffac39:j%2?0x71564e:0x9a7760,0,0,0,.6,hot);if(!hot){m.material.side=THREE.FrontSide;m.material.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 mistN;varying vec3 mistP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmistN=normalMatrix*normal;mistP=position;');
    s.fragmentShader='varying vec3 mistN;varying vec3 mistP;\n'+s.fragmentShader.replace('#include <tonemapping_fragment>','float density=smoothstep(.04,.97,abs(normalize(mistN).z));float cloud=.65+.35*sin(mistP.x*5.+sin(mistP.z*3.))*cos(mistP.y*4.);gl_FragColor.a*=density*cloud;\n#include <tonemapping_fragment>')}}
   m.rotation.set(j,j*.72,j*1.37)}
  }else{
   g.quaternion.setFromUnitVectors(V(0,0,1),a.darkDir);
   for(let j=0;j<4;j++){const arc=part(g,new THREE.TorusGeometry(1,.095,6,32,4.8),j%2?0xc991fc:0x482550);arc.rotation.z=j*1.65}
  }
 },(g,q,sec)=>{
  const t=cap(sec/duration,0,1),fade=1-cap((sec-duration+.04)/.16,0,1);
  if(kind==='spark'){
   let r=.25+t*a.r;g.children.forEach((m,i)=>{m.scale.set(r,.9+r*.22,r);m.material.opacity=fade*(.48+.48*Math.sin(32*sec+i*2.6)**2)})
  }else if(kind==='ash'){
   g.children.forEach((m,i)=>{let ang=i*2.4+t*(i%2?.7:-.55),h=(i*.618)%1,r=(.12+Math.sqrt(t)*.88)*(1.4+2.45*h),y=(.1+3.2*t)*(1-.70*h);
    m.position.set(r*Math.cos(ang),y-.35,r*Math.sin(ang));let size=(i%4===0?.18:.65)*(.3+.85*Math.sin(Math.PI*t)+t*.65);m.scale.set(size,size*(i%4===0?1.7:1.16),size);m.material.opacity=(i%4===0?.86:.38)*fade})
  }else{
   g.visible=t*a.r<a.darkRange;if(!g.visible)return;g.position.copy(origin).addScaledVector(a.darkDir,t*a.r);g.children.forEach((m,i)=>{m.position.z=-i*.24;m.scale.setScalar((.48+i*.14)*(.72+.32*Math.sin(t*Math.PI)));m.rotation.z=i*1.65+t*5*(i%2?1:-1);m.material.opacity=.92*fade})
  }
 });
 if(kind==='ash')noise(.45,.15);else if(kind==='dark')tone(82,.36,0,'triangle',.08);else tone(720,.11,0,'sawtooth',.05)
}
function evoFieldStep(f,a,target,age,dt){
 if(age<a.wind)return;if(!a.sent){a.sent=true;evoRelease(f,a)}
 const t=(age-a.wind)/a.fieldCast.duration,p=bodyPoint(f,target),offset=p.clone().sub(a.origin),dist=offset.length(),flat=dst(p,a.origin),k=a.fieldCast.kind;
 if(!a.hit&&t<=1&&aerialRange(f,a.origin,offset.clone().normalize(),dist)>=dist-.03){
  let touched=false;
  if(k==='spark'){let r=.25+t*a.r;touched=flat>=Math.max(0,(a.frontR||0)-.52)&&flat<r+.52&&Math.abs(offset.y)<1.2;a.frontR=r}
  else if(k==='ash'){let r=.78+(a.r-.78)*Math.sqrt(t);let inCloud=flat<r&&offset.y>=-.75&&offset.y<1.15+t*2.7;
   a.heat=inCloud?(a.heat||0)+dt:0;touched=a.heat>.16}
  else{let head=a.origin.clone().addScaledVector(a.darkDir,t*a.r);touched=new THREE.Line3(a.lastHead||a.origin,head).closestPointToPoint(p,true,V()).distanceTo(p)<.94;a.lastHead=head}
  if(touched){strikeHit(f,a,target);if(a.hit&&target.hp>0){if(k==='spark')target.slowUntil=Math.max(target.slowUntil||0,f.t+.65);if(k==='ash'&&target.d.type!=='火')target.scorch={left:2,next:.78,atk:a.d}}}
 }
 // Update wave position even when the previous segment was occluded.
 if(k==='dark')a.lastHead=a.origin.clone().addScaledVector(a.darkDir,Math.min(1,t)*a.r);
 if(k==='spark')a.frontR=.25+Math.min(t,1)*a.r;
 if(age>=a.total){a.u.cmd=null;a.u.lastClip=null}
}
function evoFieldPose(f,u,g,rotate,fw,right,up){
 const a=u.cmd;if(!a?.fieldCast)return;const e=a.fieldCast,age=f.t-a.t,t=cap((age-a.wind)/e.duration,0,1),load=Math.sin(cap(age/a.wind,0,1)*Math.PI*.5)*(1-t),release=Math.sin(Math.PI*t),n=g.joints;
 if(e.kind==='spark'){u.body.position.y-=u.height*.06*load;rotate(g.tailRoot,right,-.43*load);rotate(g.head,right,.15*load-.22*release)}
 if(e.kind==='ash'){rotate(g.head,right,-.26*release);rotate(n('jaw','lowerjaw'),right,.32*release);rotate(n('spine1'),right,.18*load-.21*release);rotate(g.tailRoot,right,-.21*release)}
 if(e.kind==='dark'){rotate(g.head,right,.18*load-.22*release);rotate(g.tailRoot,up,.34*load-.29*release);for(const side of ['l','r'])rotate(n(side+'ear1',side+'ear'),right,-.26*load+.18*release)}
}
