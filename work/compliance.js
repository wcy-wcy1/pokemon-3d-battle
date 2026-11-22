// Passive follow-through in radians. Only rotations are layered onto the authored pose.
function buildCompliance(u){
 const id=u.d.id,rigid=[7,9,74,76,95,131,123].includes(id),long=[10,95,130,384].includes(id);
 const f=u.flex={parts:[],rest:[],yaw:u.face,x:u.pos.x,z:u.pos.z,air:u.air||0,vx:0,vz:0,vy:0,hurt:0,started:false};
 const lookup=new Map;
 u.body.traverse(b=>{
  if(!b.isBone||/end|socket/i.test(b.name))return;
  let k=b.name.toLowerCase().replace(/^\d+\s+/,'').replace(/_\d+$/,'').replace(/_/g,'');
  let type=/^(?:l|r|left|right)ear\d*$/.test(k)?'ear':/^tail\d*$/.test(k)?'tail':/^bone\d+$/.test(k)&&id===95?'link':/^spine\d*$/.test(k)&&!rigid&&id!==25?'spine':null;
  if(!type)return;
  const limit=type==='ear'?(rigid?.055:.16):type==='tail'?(long?.057:rigid?.055:.14):type==='link'?.032:long?.055:.045;
  let parent=b.parent,prev;while(parent){prev=lookup.get(parent);if(prev?.type===type)break;prev=null;parent=parent.parent}
  const tip=prev?prev.depth+1:0,omega=cap((type==='ear'?22:type==='spine'?21:17)*Math.pow(Math.max(u.d.kg,2)/35,-.085)/(1+.07*Math.min(tip,5)),8,30);
  const node={b,type,prev,depth:tip,limit,omega,p:0,r:0,pv:0,rv:0,q:new THREE.Quaternion};lookup.set(b,node);f.parts.push(node)
 });
}
function undoCompliance(u){if(!u.flex)return;for(const n of u.flex.rest)n.b.quaternion.copy(n.q);u.flex.rest.length=0}
function passiveMotion(u,dt){
 const f=u.flex;if(!f||dt<=0)return;
 const a=u.air||0,h=u.flinch||0,dx=u.pos.x-f.x,dz=u.pos.z-f.z,da=a-f.air;
 const yaw=Math.atan2(Math.sin(u.face-f.yaw),Math.cos(u.face-f.yaw));
 const reset=!f.started||Math.hypot(dx,dz)>2.5||dt>.12;
 const vx=reset?0:dx/dt,vz=reset?0:dz/dt,vy=reset?0:da/dt;
 const forward=(vx-f.vx)*Math.sin(u.face)+(vz-f.vz)*Math.cos(u.face);
 const kick=cap(Math.max(0,h-f.hurt)*3,0,1);
 const pitch=reset?0:cap(-forward*.14-(vy-f.vy)*.095+kick,-1,1);
 const turn=reset?0:cap(-yaw/.60,-1,1);
 Object.assign(f,{started:true,x:u.pos.x,z:u.pos.z,air:a,yaw:u.face,vx,vz,vy,hurt:h});
 const steps=Math.ceil(dt*120),ds=dt/steps;
 const right=V(Math.cos(u.face),0,-Math.sin(u.face)),up=V(0,1,0),inv=new THREE.Quaternion,axis=V(),q=new THREE.Quaternion;
 for(const n of f.parts){
  if(reset)n.p=n.r=n.pv=n.rv=0;
  const gain=n.prev?.38:1,w=n.omega;
  n.pv+=pitch*n.limit*w*1.8*gain;n.rv+=turn*n.limit*w*1.9*gain;
  const breath=n.type==="spine"&&!n.prev?.009*Math.sin(u.lifeRig?.breath||0):0;
  const pp=n.prev?n.prev.p/n.prev.limit*n.limit*.78:breath,rr=n.prev?n.prev.r/n.prev.limit*n.limit*.78:0;
  for(let i=0;i<steps;i++){n.pv+=((pp-n.p)*w*w-1.42*w*n.pv)*ds;n.rv+=((rr-n.r)*w*w-1.42*w*n.rv)*ds;n.p=cap(n.p+n.pv*ds,-n.limit,n.limit);n.r=cap(n.r+n.rv*ds,-n.limit,n.limit)}
  if(Math.abs(n.p)+Math.abs(n.r)<.0001)continue;
  n.q.copy(n.b.quaternion);f.rest.push(n);n.b.getWorldQuaternion(inv).invert();
  n.b.quaternion.multiply(q.setFromAxisAngle(axis.copy(right).applyQuaternion(inv),n.p)).multiply(q.setFromAxisAngle(axis.copy(up).applyQuaternion(inv),n.r))
 }
}
