// Field encounters remember completed meals, separately from short-lived startle responses.
function mealsWith(id){return cap(Math.floor(Number(S.fieldBond?.[id])||0),0,12)}
function fieldSatiety(id){const m=S.fieldMeals?.[id];if(!m)return 0;return cap((Number(m.full)||0)-Math.max(0,Date.now()-(Number(m.at)||0))/150000,0,1)}
function clearOffering(f){
 const w=f.watch;if(!w)return;
 if(w.fruit){exDrop(f,w.fruit.o);w.fruit=null}
 const btn=w.bar.querySelector('[data-fruit]');if(btn){btn.disabled=false;btn.textContent='放下树果'}
}
function offerFruit(f){
 const w=f.watch,u=f.p;if(f.mode!=='watch'||!u.ready||w.fruit)return;
 const size=cap(u.height*.085,.13,.36),ahead=cap((u.viewSpan||2)*.46,.85,4.4);
 let pos=null;for(const offset of [.32,-.32,.85,-.85,1.6,-1.6,Math.PI]){
  let v=u.pos.clone().add(V(Math.sin(u.face+offset),0,Math.cos(u.face+offset)).multiplyScalar(ahead+1.65));
  if(Math.hypot(v.x,v.z)>12.9||f.blocks.some(o=>Math.hypot(o.x-v.x,o.z-v.z)<o.r+.75))continue;
  pos=v;break
 }if(!pos)return;
 let o=new THREE.Group,berry=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshStandardMaterial({color:0x4162bf,roughness:.62}));berry.scale.set(.92,1,.92);o.add(berry);
 let leaf=new THREE.Mesh(new THREE.SphereGeometry(1,8,5),new THREE.MeshStandardMaterial({color:0x709947}));leaf.position.set(.22,.97,0);leaf.scale.set(.54,.12,.22);leaf.rotation.z=.32;o.add(leaf);o.scale.setScalar(size);o.position.copy(pos);o.position.y=strideFloor(f,pos.x,pos.z)+size;berry.castShadow=true;f.sc.add(o);
 let bond=mealsWith(u.d.id),caution=w.life.temper[0]==='mind'?.6:w.life.temper[0]==='forage'?-.25:0;
 w.fruit={o,pos,size,ahead,born:f.t,state:'notice',since:f.t,wait:Math.max(.38,1.75+caution-bond*.2),mouth:null};
 const btn=w.bar.querySelector('[data-fruit]');btn.disabled=true;btn.textContent='树果在这里';w.life.lastLabel='';w.intent='inspect';w.actionAt=f.t
}
function foodStep(f,u,dt,manual){
 const w=f.watch,b=w.fruit;if(!b)return false;
 const age=f.t-b.born,threat=w.life.memory.alarm>.35;
 if(manual||age>14){clearOffering(f);return false}
 if(threat&&b.state!=='wary'){b.state='wary';b.since=f.t;w.life.lastLabel=''}
 if(b.state==='wary'){
  w.bar.querySelector('[data-fruit]').textContent='暂时不敢靠近';
  if(f.t-b.since>.95)clearOffering(f);return false
 }
 let d=dst(u.pos,b.pos),dir=exDir(u.pos,b.pos),delta=Math.atan2(dir.x,dir.z)-u.face;
 u.face+=Math.atan2(Math.sin(delta),Math.cos(delta))*(1-Math.exp(-dt*3));u.socialLook=null;
 f.interest={p:b.pos,until:f.t+.3};w.intent='inspect';w.actionAt=b.born;
 if(b.state==='notice'&&age>=b.wait){b.state=fieldSatiety(u.d.id)>.78?'full':'approach';b.since=f.t}
 if(b.state==='full'){w.bar.querySelector('[data-fruit]').textContent='吃饱了，暂不进食';if(f.t-b.since>1.5){clearOffering(f);wildState(f,'rest',2);w.life.lastLabel='';w.intent=null;f.interest=null}return true}
 if(b.state==='approach'){if(d>b.ahead+.12)exMove(f,u,dir.x*dt*1.05,dir.z*dt*1.05);else{b.state='taste';b.since=f.t}}
 if(b.state==='taste'){
  const t=f.t-b.since,q=cap(t/.48,0,1);b.mouth??=u.motion?.joints('jaw','lowerjaw','lowerbeak','head')||u.poseBones?.find(x=>x.job==='head')?.n;
  const mouth=b.mouth?b.mouth.getWorldPosition(V()):bodyPoint(f,u).addScaledVector(dir,b.ahead*.65);
  b.o.position.lerpVectors(V(b.pos.x,strideFloor(f,b.pos.x,b.pos.z)+b.size,b.pos.z),mouth,q*q*(3-2*q));b.o.scale.setScalar(b.size*(1-cap((t-.4)/.65,0,1)));
  if(t>1.1){S.fieldMeals??={};S.fieldMeals[u.d.id]={at:Date.now(),full:Math.min(1,fieldSatiety(u.d.id)+.53)};S.fieldBond??={};S.fieldBond[u.d.id]=Math.min(12,mealsWith(u.d.id)+1);save();w.life.memory.trust=Math.min(1,w.life.memory.trust+.12);w.life.effort*=.55;w.life.lastLabel='';clearOffering(f);wildState(f,'rest',2.4);w.intent=null;f.interest=null;return true}
 }else b.o.position.y=strideFloor(f,b.pos.x,b.pos.z)+b.size+Math.max(0,1-age/.42)**2*.65;
 let label=b.state==='notice'?'留意树果':b.state==='approach'?'靠近树果':'尝食树果';
 if(label!==w.life.lastLabel){w.life.lastLabel=label;w.bar.querySelector('.watchBio').textContent=bodyFacts(u.d)+'　·　'+label}return true
}
