function terrainCast(f,a){
 const key=a.k,rock=key==='rock'||key==='rockfall',single=key==='rock',target=a.player?f.e:f.p;
 const p=a.u.pos.clone().addScaledVector(a.dir,Math.min(a.r,dst(a.u.pos,a.aim)));p.y=strideFloor(f,p.x,p.z);
 const z=a.terrainCast={p,pieces:[],key,rock};const n=rock?(single?1:7):1;
 for(let i=0;i<n;i++){let theta=i*2.39996,r=i?Math.sqrt(i/6)*1.7:0,x=p.x+Math.cos(theta)*r,v=p.z+Math.sin(theta)*r;
  z.pieces.push({x,z:v,floor:strideFloor(f,x,v),r:rock?(single?.76:.54):key==='thunder'?1.14:1.30,
   top:Math.max(4.7,bodyPoint(f,target).y-p.y+1.2)+(rock?i%3*.65:key==='thunder'?4:0),delay:rock?i*.048:0})}
 a.total=a.wind+(rock?1.18:key==='thunder'?.42:.86);a.u.swing=a.total;
 flare(f,a.total+.06,g=>{for(let b of z.pieces){
  const node=new THREE.Group;node.position.set(b.x,b.floor,b.z);g.add(node);
  const ring=hoop(node,key==='thunder'?0xffe58b:rock?0xcfaa78:0x9adfea,b.r,.023);ring.rotation.x=Math.PI/2;ring.position.y=.065;
  const shape=new THREE.Group;node.add(shape);
  if(rock){const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(b.r),new THREE.MeshStandardMaterial({color:single?0x826e57:0x685a50,flatShading:true,roughness:.97,transparent:true}));shape.add(stone);stone.rotation.z=b.x*.87;stone.scale.set(1,.82+(Math.cos(b.z))*.08,1.18)}
  else if(key==='thunder'){
   for(let j=0;j<3;j++)stroke(shape,Array.from({length:12},(_,i)=>V(i&&i<11?.28*Math.sin(i*9+j):0,b.top*i/11,i&&i<11?.22*Math.cos(i*4+j):0)),j?0xffdc43:0xfffcdf,j?.038:.09,true)
  }else{
   let wall=part(shape,new THREE.CylinderGeometry(b.r*.84,b.r*.35,b.top,22,3,true),0x3885a1,0,b.top*.5,0,.44);wall.userData.opacity=.44;
   for(let j=0;j<5;j++)stroke(shape,Array.from({length:14},(_,i)=>{let t=i/13,ang=t*5.5+j*1.257,r=(.32+.60*t)*b.r;return V(Math.cos(ang)*r,t*b.top,Math.sin(ang)*r)}),j%2?0x6dbbd1:0xa9d6dd,.075,false)
  }
 }},(g,q)=>{const age=f.t-a.t;if(!a.sent&&a.u.cmd!==a){g.visible=false;return}z.pieces.forEach((b,i)=>{
  const node=g.children[i],shape=node.children[1],s=terrainPhase(a,b,age);node.children[0].material.opacity=s.local<0?.40+.43*cap(age/a.wind,0,1):s.fade*.34;
  shape.visible=rock||s.local>=0;shape.position.y=rock?s.y:0;shape.rotation.y=rock?i+age*1.8:key==='waterfall'?age*3:0;
  if(key==='waterfall')shape.scale.y=Math.max(.001,s.y/b.top);
  for(let m of shape.children)m.material.opacity=rock?s.fade*cap(age/.16,0,1):s.fade*(m.userData.opacity??1)
 })})
}
function terrainPhase(a,b,age){
 const local=age-a.wind-b.delay;
 if(a.terrainCast.rock){let t=cap(local/.64,0,1);return {local,y:b.r*.60+(b.top-b.r*.60)*(1-t*t),fade:1-cap((local-.64)/.24,0,1)}}
 if(a.k==='waterfall')return {local,y:b.top*cap(local/.53,0,1),fade:1-cap((local-.54)/.24,0,1)};
 return {local,y:b.top,fade:1-cap(local/.19,0,1)}
}
function terrainCastStep(f,a,target,age,dt){
 const z=a.terrainCast;if(age>=a.wind&&!a.sent){a.sent=true;castSound(a.k,'zone')}
 for(const b of z.pieces){
  const s=terrainPhase(a,b,age),old=terrainPhase(a,b,age-dt);
  if(a.hit||s.local<0)continue;let foot=groundY(target.pos.x,target.pos.z,f.z)+target.air-b.floor,head=foot+target.height;
  if(Math.hypot(target.pos.x-b.x,target.pos.z-b.z)>b.r+cap(target.height*.18,.11,.55))continue;
  const struck=z.rock?s.local<=.64+dt&&s.y-b.r<=head&&old.y+b.r>=foot:
   a.k==='thunder'?old.local<=0&&foot<b.top&&head>=0:s.local<=.54&&foot<=s.y&&head>=0;
  if(struck){a.v=V(0,a.k==='waterfall'?1:-1,0);strikeHit(f,a,target)}
 }
 if(age>=a.total){a.u.cmd=null;a.u.lastClip=null}
}
