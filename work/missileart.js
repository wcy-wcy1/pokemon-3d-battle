// A tapered ribbon retains its silhouette side-on; width and pigment follow the stroke.
function moveRibbon(g,count,path,width,colors){
 const pos=[],rgb=[],ix=[],a=new THREE.Color(colors[0]).convertSRGBToLinear(),b=new THREE.Color(colors[1]).convertSRGBToLinear();
 for(let i=0;i<=count;i++){const t=i/count,p=path(t),w=width(t),c=a.clone().lerp(b,t);
  for(const side of [-1,1]){pos.push(p.x+side*w.x,p.y+side*w.y,p.z+side*w.z);rgb.push(c.r,c.g,c.b)}
  if(i<count){let j=i*2;ix.push(j,j+1,j+2,j+1,j+3,j+2)}}
 const geo=new THREE.BufferGeometry;geo.setIndex(ix);geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(rgb,3));
 let mat=ink(0xffffff,.91);mat.vertexColors=true;const m=new THREE.Mesh(geo,mat);g.add(m);return m
}
function signatureMissile(g,a){
 let k=a.k;if(!a.skill)return false;
 const tau=Math.PI*2;
 if(k==='silver'){ // Scales shed from butterfly wings, grouped into two wing-shaped streams.
  for(const side of [-1,1])for(let j=0;j<12;j++){const t=j/11,ang=t*3.85,r=.17+.46*Math.sin(t*Math.PI);
   let m=part(g,new THREE.OctahedronGeometry(1),j%3?0xcccbe8:0xf6efc6,side*(.14+r*Math.sin(ang)),r*Math.cos(ang),.38-t*1.02);
   m.scale.set(.10,.041,.14);m.rotation.set(ang,.3,side*ang)}
 }else if(k==='gust'||k==='vortex'){
  let fire=k==='vortex';for(let j=0;j<(fire?3:2);j++){const phase=j*tau/(fire?3:2),angle=t=>phase+t*(fire?8.3:3.7);
   moveRibbon(g,35,t=>{let ang=angle(t),r=fire?.12+.44*t:.28+.42*Math.sin(t*Math.PI);return V(Math.cos(ang)*r,Math.sin(ang)*r,.49-t*1.43)},t=>V(0,0,.13*Math.sin(Math.PI*t)),fire?[0xffd65a,0xf15c1c]:[0xc8f3e5,0x669b86])}
 }else if(k==='ripple'){
  let ball=part(g,new THREE.IcosahedronGeometry(.30,2),0x51b9df,0,0,0,.55);
  for(let j=0;j<3;j++){let h=hoop(g,j===0?0xf2ffff:0x71ddee,.33+j*.11,.024);h.rotation.x=.35;h.position.z=.17-j*.32}
 }else if(k==='muddy'){
  for(let j=0;j<3;j++)moveRibbon(g,28,t=>V((t-.5)*1.52,(.20+j*.10)*Math.sin(t*Math.PI)+.08*Math.sin(t*9+j),Math.sin(t*Math.PI)*.37-j*.25),t=>V(0,Math.sin(Math.PI*t)*(.15-j*.026),.045*Math.sin(Math.PI*t)),j===0?[0x9a8a61,0xc7c09a]:[0x68513a,0xa48c62]);
  for(let j=0;j<7;j++){let h=part(g,new THREE.DodecahedronGeometry(.065),0x795e44,(j-3)*.21,.2+.14*Math.sin(j*2.4),-.33);h.scale.y=.62}
 }else if(k==='wisps'||k==='ember'){
  const fox=k==='wisps';for(let j=0;j<(fox?5:3);j++){const ang=j*2.4,r=fox?.42:.17;
   let m=part(g,new THREE.SphereGeometry(1,9,7),fox?0x9b6eff:0xe55219,Math.cos(ang)*r,Math.sin(ang)*r,-j*.08);m.scale.set(.14,.15,.29);
   let flame=part(g,new THREE.ConeGeometry(.118,.49,8),fox?0x7150bd:0xffa329,m.position.x,m.position.y,m.position.z-.26);flame.rotation.x=-Math.PI*.47;
   let core=part(g,new THREE.IcosahedronGeometry(.081),fox?0xe4ccff:0xffdc67,m.position.x,m.position.y,m.position.z+.19)}
 }else if(k==='shadow'||k==='aura'||k==='mind'){
  let shadow=k==='shadow',mind=k==='mind';let ball=part(g,new THREE.IcosahedronGeometry(shadow?.38:.25,2),shadow?0x21132c:mind?0xab88d6:0x99dffd);
  for(let j=0;j<(mind?2:3);j++){let phase=j*2.3;
   moveRibbon(g,30,t=>{let ang=t*tau+phase,r=(shadow?.43:mind?.42:.30)+.065*Math.sin(t*15+phase);return V(Math.cos(ang)*r,Math.sin(ang)*r,.26*Math.sin(ang+phase)-(mind?0:t*.53))},t=>V(0,0,(shadow?.13:.065)*Math.sin(t*Math.PI)),shadow?[0x572b68,0xb365cc]:mind?[0xfbaacb,0xc182df]:[0x4e99ce,0xdefff5])}
 }else return false;return true
}
