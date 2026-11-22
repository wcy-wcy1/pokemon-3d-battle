// Field observation shares battle weather rendering, but its fronts never inflict damage.
function habitatWeather(f,dt){
 const w=f.wx;w.left-=dt;
 if(w.left<=0){
  if(w.phase==='calm'){w.phase='warning';w.left=3}
  else if(w.phase==='warning'){w.phase='active';w.left=13;w.front=(w.front||0)+1}
  else if(w.phase==='active'){w.phase='clearing';w.left=4}
  else{w.phase='calm';w.power=0;w.left=14+Math.random()*9;w.dir*=-1;w.type=wxMaps[f.z].find(k=>k!==w.type)||w.type}
 }
 weatherSurface(f,dt);if(f.water)f.water.position.y=-.03+.06*Math.sin(f.t*.65)+.12*(w.type==='surge'?w.power:0);
 const label=f.watch.bar.querySelector('[data-sky]'),name={thunder:'雷雨',surge:'涨潮',ash:'扬灰',gale:'阵风'}[w.type];
 const txt=w.phase==='calm'?'晴间多云':w.phase==='warning'?name+'将至':w.phase==='clearing'?'天气转缓':name;
 if(label.textContent!==txt)label.textContent=txt
}
function respondToFront(f,u,manual){
 const w=f.wx,life=f.watch.life;
 if(manual||f.watch.fruit||w.phase!=='active'||life.front===w.front||w.power<.55||f.t<life.manualUntil||['retreat','inspect'].includes(life.state))return;
 life.front=w.front;
 const aquatic=fieldTemper(u)[0]==='water',wave=w.type==='surge',stone=['岩石','地面'].includes(u.d.type);
 let goal=null,state='shelter';
 if(wave&&aquatic){goal=habitatPoint(f,u,life);state='shore'}
 else if(w.type==='ash'&&stone)return;
 else if(w.type==='gale'&&canFly(u)){goal=u.pos.clone().add(V(-w.dir*3.5,0,.4));state='upwind'}
 else{
  let best=Infinity;
  for(const b of f.blocks){let v=V(b.x+w.dir*(b.r+.95),0,b.z),d=dst(u.pos,v);if(d<best&&Math.hypot(v.x,v.z)<12.8){best=d;goal=v}}
 }
 if(!goal)return;life.target.copy(goal);wildState(f,state,Math.min(8,2+dst(u.pos,goal)));f.watch.intent=null
}
function coatWeather(f,u,dt){
 const l=u.lifeRig;if(!l?.wet)return;
 const rain=['thunder','surge'].includes(f.wx?.type)?f.wx.power:0;
 const d=l.drying??={soaked:false,active:-1,until:-1};
 // Retain water between a passing rain band and a free moment to shake it off.
 if(rain>.55)d.soaked=true;
 if(d.soaked&&rain<.13&&familyOf(u.d.id)==='fur'&&!u.cmd&&!u.volts&&!u.jet&&u.drive<2&&!f.watch?.fruit&&u.flinch<=0){
  d.active=f.t;d.until=f.t+.70;d.soaked=false
 }
 const shaking=f.t<d.until;
 let speed=rain>l.wet.value?.82:shaking?2.7:.13;l.wet.value+=(rain-l.wet.value)*(1-Math.exp(-dt*speed));
 if(shaking){
  const q=cap((f.t-d.active)/.70,0,1),envelope=Math.sin(Math.PI*q)**2,angle=.125*envelope*Math.sin(q*8*Math.PI);
  u.body.rotation.z+=angle;
  if(u.d.id!==25){let head=u.lifeRig.groups.head?.find(x=>/head/i.test(x.n.name));if(head)head.n.rotateZ(-.55*angle)}
  if(!d.shed&&q>.18){d.shed=true;waterBeads(f,u)}
 }else d.shed=false
}
function waterBeads(f,u){
 let pool=f.beads;if(!pool){const size=56,a=new Float32Array(size*3),geo=new THREE.BufferGeometry;a.fill(-300);geo.setAttribute('position',new THREE.BufferAttribute(a,3).setUsage(THREE.DynamicDrawUsage));let o=new THREE.Points(geo,new THREE.PointsMaterial({color:0xcde8ed,size:.045,transparent:true,opacity:.78,depthWrite:false}));o.frustumCulled=false;f.sc.add(o);pool=f.beads={a,o,slots:new Array(size),next:0}}
 const p=bodyPoint(f,u),h=u.height;for(let j=0;j<18;j++){let a=j*2.399,r=cap(h*.25,.14,.95),i=pool.next++%pool.slots.length;pool.slots[i]={t:f.t,p:p.clone().add(V(Math.cos(a)*r,(Math.random()-.36)*r,Math.sin(a)*r)),v:V(Math.cos(a)*(1.4+Math.random()),1+Math.random()*1.6,Math.sin(a)*2)}}
}
function driftBeads(f){
 const pool=f.beads;if(!pool)return;
 for(let i=0;i<pool.slots.length;i++){const b=pool.slots[i];if(!b)continue;let t=f.t-b.t,k=3*i;
  if(t>.55){pool.slots[i]=null;pool.a[k+1]=-300;continue}
  pool.a[k]=b.p.x+b.v.x*t;pool.a[k+1]=b.p.y+b.v.y*t-5*t*t;pool.a[k+2]=b.p.z+b.v.z*t
 }pool.o.geometry.attributes.position.needsUpdate=true
}

