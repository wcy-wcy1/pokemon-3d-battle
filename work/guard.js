// Alertness follows time and the space between the fighters, not a movement key.
// Keep the state continuous so casts, sprinting and hit recovery can take over.
function readGuard(f,u,dt){
 const foe=u===f.p?f.e:f.p;
 const state=u.guard??={weight:0,side:0,kind:u.d.id===25?'runner':u.motion?.kind||'walker'};
 let want=0,lateral=0;
 if(f.mode==='live'&&!f.down&&foe?.ready&&foe.hp>0&&!(u.sleepUntil>f.t)){
  const dx=foe.pos.x-u.pos.x,dz=foe.pos.z-u.pos.z,dist=Math.hypot(dx,dz),r=4.2+cap((foe.height+u.height)*.43,.5,3.5);
  const near=cap((r+3.5-dist)/3.5,0,1),rate=u.drive||0;
  want=near*near*(3-2*near)*(1-cap(rate/5,0,1))*(u.cmd||u.volts||u.jet||f.grip?.v===u ? .05 : 1)*(1-cap((u.flinch||0)*3,0,1));
  lateral=cap((dx*Math.cos(u.face)-dz*Math.sin(u.face))/Math.max(.5,dist),-1,1)
 }
 const mass=cap(Math.pow((u.d.kg||20)/28,.10),.77,1.35);
 state.weight+=(want-state.weight)*(1-Math.exp(-dt*(u.cmd?17:6.8)/mass));state.side+=(lateral-state.side)*(1-Math.exp(-dt*6))
}
function guardBones(u,g,rotate,fw,right,up){
 const {weight:w,side:s,kind}=u.guard;if(w<.003)return;
 const quad=kind==='runner'||kind==='sturdyQuad',heavy=kind==='heavy';
 if(quad||heavy||kind==='walker'){
  for(const l of g.limbs){let sign=l.right?-1:1;rotate(l.hip,right,(l.front?-.14:.14)*w);rotate(l.shin,right,(l.front?.23:-.22)*w);rotate(l.foot,right,(l.front?-.09:.08)*w);if(!quad)rotate(l.hip,fw,sign*.062*w)}
  if(!quad)for(let i=0;i<2;i++){rotate(g.arms[i],right,-(heavy?.28:.19)*w);rotate(g.arms[i],fw,(i?1:-1)*.10*w)}
  rotate(g.head,right,-(quad?.10:.064)*w)
 }else if(kind==='flyer'){
  for(const wing of g.wings){let sign=wing.right?1:-1;rotate(wing.bone,fw,sign*.16*w);rotate(wing.tip,right,-.10*w)}
 }else if(kind==='serpent'){
  for(let i=0;i<g.tail.length;i++)rotate(g.tail[i],up,Math.sin(i*.63+.7)*.022*w)
 }else if(kind==='authored'){for(const side of ['left','right'])rotate(g.joints(side+'arm01'),right,-.16*w)}
 rotate(g.head,up,s*.19*w);rotate(g.tailRoot,right,.09*w)
}
function guardTorso(u){
 const g=u.guard,w=g.weight;if(w<.003)return;
 const quad=g.kind==='runner'||g.kind==='sturdyQuad',heavy=g.kind==='heavy';
 u.body.rotation.x+=(quad?.09:heavy?.052:g.kind==='flyer'?.064:.034)*w;
 u.body.rotation.z-=g.side*(g.kind==='flyer'?.085:.032)*w;
}
