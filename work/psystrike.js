// Camera-facing pressure lens: a dark pupil against a rotating luminous disk,
 // then a vertical fissure. The outer pixels stay transparent to the arena.
function psychicLens(g){
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},charge:{value:0},burst:{value:-1}},vertexShader:`
 varying vec2 v;void main(){v=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`
 varying vec2 v;uniform float time,charge,burst;
 void main(){vec2 p=v;float r=length(p), phi=atan(p.y,p.x),light,alpha;vec3 col;
 if(burst<0.){
 vec2 d=vec2(p.x+.48*p.y,p.y-.48*p.x);float disk=length(d*vec2(1.15,4.0));
 float halo=exp(-7.*abs(r-.29)),ring=exp(-10.*abs(disk-.71));
 float streams=.65+.35*sin(3.*phi+disk*18.-time*14.);
 light=halo+ring*streams;float pupil=1.-smoothstep(.24,.30,r);
 col=mix(vec3(.47,.08,.94),vec3(1.,.84,1.),clamp(light,0.,1.));col=mix(col,vec3(.065,.009,.11),pupil);
 alpha=max(pupil,.9*light)*charge;
 }else{
 float t=burst,warp=p.x+.08*p.y+.045*sin(p.y*14.+t*7.)*(1.-abs(p.y));
 float cut=exp(-abs(warp)*(19.+21.*t))*pow(max(0.,1.-abs(p.y)),.5);
 float rays=pow(max(0.,cos(phi*8.+.7*sin(phi*3.))),15.)*exp(-r*3.);
 light=cut+.7*rays;col=mix(vec3(.67,.12,1.),vec3(1.,.95,1.),smoothstep(.16,.76,light));
 alpha=clamp(1.8*light,0.,1.)*(1.-smoothstep(.38,1.,t));}
 alpha*=1.-smoothstep(.87,1.,r);if(alpha<.008)discard;gl_FragColor=vec4(col,alpha);
 #include <encodings_fragment>
 }`});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);g.add(mesh);return mesh
}
function lockPsystrike(f,a){
 const u=a.u,tar=u===f.p?f.e:f.p,delta=a.aim.clone().sub(u.pos);delta.y=0;delta.clampLength(0,a.r);
 const floor=u.pos.clone().add(delta);floor.y=strideFloor(f,floor.x,floor.z);
 const center=floor.clone();center.y+=dst(a.aim,tar.pos)<.85?bodyPoint(f,tar).y-strideFloor(f,tar.pos.x,tar.pos.z):.74;
 const rad=a.skill===3?3.1:2.05,snap=a.wind+.32,life=snap+.68;
 a.psych={center,rad,snap,done:false};
 const color=f.z===0?0x746b50:f.z===1?0x6b797b:0x715655;
 // Split the silhouette into a ground warning, an inward spiral and an outward impact.
 const ribbons=[],splinters=[];let seal,shock,handGlow,lens;
 flare(f,life,g=>{
  g.position.copy(floor);const ring=hoop(g,0xf5aeff,1,.036);ring.rotation.x=Math.PI/2;ring.position.y=.065;ring.scale.setScalar(rad);
  const core=part(g,new THREE.IcosahedronGeometry(.15,1),0xffdcff,0,center.y-floor.y,0,.74,true);
  for(let i=0;i<22;i++){const m=part(g,new THREE.DodecahedronGeometry(.09+(i%4)*.049),i%5?color:0xcaaeff);m.userData.phase=i*2.39996;m.userData.radius=rad*(.55+.44*((i*13)%23)/22);m.scale.set(.75,.6,1.24)}
  for(let j=0;j<2;j++){let h=hoop(g,j?0xdd9fff:0x9d8eff,1,.031);h.position.y=core.position.y;h.rotation.x=.7+j*.96}
  seal=part(g,new THREE.RingGeometry(.76,1,64),0x982df3,0,.095,0,.38);seal.rotation.x=-Math.PI/2;seal.scale.setScalar(rad);
  for(let j=0;j<3;j++){
   const pts=Array.from({length:15},(_,i)=>{let t=i/14,ang=j*2.094+t*2.65,r=rad*(1-.59*t);return V(Math.cos(ang)*r,.12+t*(center.y-floor.y+rad*.48),Math.sin(ang)*r)});
   ribbons.push(stroke(g,pts,j===1?0xffb6ff:0xaf60ff,.048*rad,true))
  }
  shock=hoop(g,0xffd8ff,1,.085);shock.rotation.x=Math.PI/2;shock.position.y=.2;shock.visible=false;
  for(let i=0;i<14;i++){const angle=i*2.39996,v=V(Math.cos(angle),.18+(i%5)*.27,Math.sin(angle)).normalize();
   let m=part(g,new THREE.OctahedronGeometry(1,0),i%3?0xe59aff:0xffefff);m.userData.v=v;m.quaternion.setFromUnitVectors(V(0,1,0),v);m.visible=false;splinters.push(m)}
  lens=psychicLens(g);
  handGlow=part(g,new THREE.OctahedronGeometry(.26),0xf4afff,0,0,0,.85,true);
 },(g,q,elapsed)=>{
  if(!a.psych.done&&u.cmd!==a){g.visible=false;return}
  const charge=cap(elapsed/a.wind,0,1),pull=cap((elapsed-a.wind)/.32,0,1),close=pull*pull*(3-2*pull),after=cap((elapsed-snap)/.68,0,1),y=center.y-floor.y;
  const burst=elapsed>=snap,out=Math.sqrt(after);
  const crown=rad*(.4+1.23*charge)*(1-close);
  lens.position.y=y+crown;lens.quaternion.copy(f.cam.quaternion);
  const lensSize=burst?rad*(1.5+out*.8):rad*(.43+charge*.95)*(1-.83*close);
  lens.scale.set(lensSize,lensSize*(burst?1.52:1),1);
  const uni=lens.material.uniforms;uni.time.value=elapsed;uni.charge.value=Math.min(1,charge*3);uni.burst.value=burst?after:-1;
  seal.material.opacity=(.32+.18*Math.sin(charge*8)**2)*(1-close);
  handGlow.position.copy(socket(f,u,'hands',1)).sub(floor);handGlow.scale.setScalar((.55+charge)*(1-close));handGlow.rotation.y=q*8;
  ribbons.forEach(m=>{m.rotation.y=charge*.9+close*2;m.scale.set(1-.92*close,(1+.85*charge)*(1-.75*close),1-.92*close);m.material.opacity=(.25+.72*charge)*(1-close)});
  shock.visible=burst;shock.scale.setScalar(rad*(.25+out*1.65));shock.material.opacity=(1-after)**2;
  splinters.forEach((m,i)=>{m.visible=burst;if(!burst)return;m.position.copy(m.userData.v).multiplyScalar(rad*(.14+out*(1.58+.1*(i%4))));m.position.y+=y;m.scale.set(.15,.66+.22*(i%3),.1).multiplyScalar(1-after);m.material.opacity=1-after});
  g.children[0].material.opacity=(.36+.40*charge)*(1-close);
  g.children[1].scale.setScalar((.2+charge*.9+close*1.5+(burst?2.4*(1-after)**3:0))*(1-after));
  for(let i=2;i<24;i++){let m=g.children[i],ang=m.userData.phase+.35*charge+.65*close,r=m.userData.radius*(1-.96*close);
   let x=Math.cos(ang)*r,z=Math.sin(ang)*r,ground=strideFloor(f,floor.x+x,floor.z+z)-floor.y;
   m.position.set(x,ground+.08+charge*(.32+.10*(i%4))+(y-ground-.5)*close,z);m.rotation.set(ang,q*4+i,charge+i*.3);m.material.opacity=(.2+.8*charge)*(1-after)}
  for(let j=24;j<26;j++){let h=g.children[j];h.scale.setScalar((rad*.65*(1-close)+.06+after*rad*.66));h.rotation.z=q*(j===24?1:-1);h.material.opacity=charge*(1-after)*.75}
 })
}
function resolvePsystrike(f,a,target){
 const s=a.psych;if(!s||s.done||f.t-a.t<s.snap)return;s.done=true;
 let p=bodyPoint(f,target),planar=dst(p,s.center),vertical=Math.abs(p.y-s.center.y);
 f.shake=Math.max(f.shake,a.skill===3?.26:.17);tone(52,.28,0,'sine',.085);tone(87,.19,0,'triangle',.085);if((planar/s.rad)**2+(vertical/(s.rad*.93))**2<=1)strikeHit(f,a,target)
}
