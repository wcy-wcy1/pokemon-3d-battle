function anatomyMotion(f,u,g,w,p,strength,rotate,fw,right,up){
 const id=u.d.id,a=u.cmd,k=a?.k,n=g.joints,H=u.height;
 const sin=Math.sin,pi=Math.PI;
 const load=a?sin(pi*.5*cap((f.t-a.t)/a.wind,0,1))*(1-cap((f.t-a.t-a.wind)/.12,0,1)):0;
 const t=a?cap((f.t-a.t-a.wind)/(a.total-a.wind),0,1):0,hit=sin(pi*t);
 function point(j,end,v,weight){if(!j||!end||weight<.001)return;if(!g.saved.has(j))g.saved.set(j,j.quaternion.clone());aimLimb(u,j,end,v,weight)}
 if(id===59||id===58){
  let stride=w*strength;rotate(n('spine1'),right,.09*stride*sin(p));rotate(g.head,right,-.06*stride*sin(p));
  if(a){for(const l of g.limbs){rotate(l.hip,right,(l.front?-.30:.44)*load+(l.front?.53:-.45)*hit);rotate(l.shin,right,(l.front?.14:-.30)*load)}
   rotate(n('jaw'),right,.35*(k==='bite'||k==='fang'?load:hit));rotate(g.tailRoot,right,.21*load-.16*hit);u.body.rotation.x=.18*load+.08*hit;u.body.scale.set(1,1,1)}
 }else if(id===68||id===66){
  const ready=f.mode==='live'?(.66+.31*(u.guard?.weight||0)):0;
  for(let s of ['l','r'])for(let pair of (id===68?['','2']:[''])){
   const sign=s==='l'?1:-1,j=n(s+'arm'+pair),el=n(s+'forearm'+pair),hand=n(s+'hand'+pair),wave=sin(p+(pair?pi*.65:0))*sign;
   let slot=(s==='l'?0:1)+(pair?2:0),strike=k==='barrage'?flowEnvelope(f.t-a.t-a.wind,fourFists[slot]-.095,fourFists[slot],fourFists[slot]+.135):!pair&&s===(a?.handSide<0?'l':'r')?flowEnvelope(a?f.t-a.t-a.wind:-1,-.055,.09,.32):0;
   const breath=Math.sin((u.lifeRig?.breath||0)+slot*.6),upper=!pair,lead=s==='l'?.10:-.04;
   point(j,el,V(sign*(.32-strike*.12),-.73+.69*strike+(upper?.065:0),.38+lead+strike*.85),Math.max(ready,w*.40,a?.85:0));
   point(el,hand,V(-sign*.20,(upper?.82:.49)*(1-strike)+.035*breath,.53+lead+strike*.65),Math.max(ready,w*.45,a?.96:0));rotate(j,right,.13*w*wave);
   if(ready||a)aimFightingHand(f,u,g,j,el,hand,s,pair,strike,Math.min(1,ready*.58+load+strike),rotate)
  }rotate(n('spine1'),up,.09*w*sin(p)+(k==='barrage'?.17*sin(4*pi*t)*hit:.20*hit))
 }else if(id===123){
  for(let s of ['l','r']){let sign=s==='l'?1:-1,j=n(s+'arm'),el=n(s+'forearm'),slice=k==='fury'?Math.max(0,sin(2*pi*t)*sign)*hit:s==='r'?hit:0;
   point(j,el,V(sign*(.67+.42*load-.95*slice),-.42+.62*load,.27+.75*slice),Math.max(.35*w,a?.85:0));rotate(el,up,sign*(.20*load-.57*slice));}
  u.body.rotation.z+=.11*w*sin(p*.5)+.18*hit*sin(2*pi*t);
 }else if(id===384||id===130||id===95){
  const chain=g.axis||=[];if(!chain.length)for(const name of longBodies[id]){let bone=u.body.getObjectByName(name);if(bone)chain.push(bone)}
  for(let i=1;i<chain.length;i++){let s=i/(chain.length-1),phase=p-s*5.3;
   rotate(chain[i],up,(.027+w*.070)*sin(phase)+(k==='tail'?s*.24*(hit-load):0));
   if(id===384)rotate(chain[i],right,.037*sin(phase+.9)+(k==='ascent'?.095*(load-hit)*Math.cos(s*pi):0))
  }
  rotate(g.head,right,-.055*w*sin(p));u.body.rotation.z+=.065*w*sin(p);
 }
}
