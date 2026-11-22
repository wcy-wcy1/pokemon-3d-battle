// World-space effects. A cast only gets an impact when its existing hit test succeeds.
const impactStyles={
 fire:[0xfa3911,0xffec86],azure:[0x1554f4,0x9eeeff],volt:[0x9353ff,0xfff598],water:[0x087cad,0xbffffa],mind:[0x7930cf,0xffbcff],
 ice:[0x4296e8,0xcfffff],leaf:[0x3fa960,0xd6ff85],stone:[0x93634d,0xffcf8d],wind:[0x65b7ad,0xebffdf],
 dragon:[0x5655dc,0x9cfff1],star:[0xc86d9c,0xffecc4],steel:[0x8ba9cd,0xf7ffff]
};
function impactStyle(a){
 if(a.k==='fault')return 'mind';
 if(a.front&&a.skill===3)return {ash:'fire',thunder:'volt',surge:'water',gale:'wind'}[a.front]||'star';
 for(const [style,list] of [
  ['volt','spark rail thunder discharge'],['water','water hydro ripple muddy waterfall'],['ice','ice blizzard'],['mind','psystrike shadow mind psychic psybeam aura dark wisps wisp'],
  ['fire','inferno burn ember vortex plume fang'],['leaf','vine solar silk silver'],['stone','rock rockfall boulders bone'],['wind','gust dive'],['dragon','ascent dragonrush'],['steel','irontail fury cut']
 ])if(list.split(' ').includes(a.k))return style;
 return 'star'
}
function impactMat(uniforms,vertexShader,fragmentShader,add=false){return new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,
 transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:add?THREE.AdditiveBlending:THREE.NormalBlending})}
const impactNoise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}`;
const planeVS='varying vec2 v;void main(){v=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const fxColor=n=>new THREE.Color(n).convertSRGBToLinear();
function burstUniform(style){const [a,b]=impactStyles[style];return {q:{value:0},lo:{value:fxColor(a)},hi:{value:fxColor(b)}}}
function fxBillboard(f,g,style,un){
 const fire=style==='fire'||style==='azure',psych=style==='mind',fs=fire?`
 vec2 st=v;st.y+=.28;st.x+=.08*sin(st.y*7.-q*11.)*st.y;
 float n=noise(st*3.5-vec2(0,q*5.))*.57+noise(st*8.-vec2(q,q*10.))*.29+noise(st*16.-q*14.)*.14;
 float body=.87-length(vec2(st.x*(1.+max(st.y,0.)*.85),st.y*.87))+(n-.5)*.71-q*.35;
 float hot=smoothstep(.04,.63,body);col=mix(lo*.30,lo,smoothstep(-.11,.18,body));col=mix(col,hi,hot);col=mix(col,${style==='azure'?'vec3(.70,.92,1.)':'vec3(1.,.99,.87)'},pow(hot,4.));
 alpha=smoothstep(-.12,.075,body)*(.82+.18*n)*(1.-smoothstep(.34,.97,q));`:psych?`
 vec2 p=vec2(v.x+.28*v.y,v.y-.28*v.x);float r=length(p),theta=atan(p.y,p.x);
 float cut=abs(p.x+.07*sin(p.y*7.-q*7.))*(1.+abs(p.y));float opening=sin(3.14159*min(1.,q*1.5));
 float seam=exp(-cut/(.018+.054*opening));
 float orbit=abs(length(vec2(p.x,p.y*2.3))-(.51-.32*q)-.049*sin(theta*3.+q*9.));
 float halo=exp(-orbit*27.)*(.59+.41*cos(theta*2.-q*7.));
 float voidCore=(1.-smoothstep(.09,.29,r))*(1.-smoothstep(.18,.62,q));
 seam*=1.-smoothstep(.35,1.,abs(p.y));col=mix(lo,hi,clamp(seam+halo,0.,1.));col=mix(col,vec3(.018,.004,.04),voidCore);
 alpha=clamp(halo+seam+voidCore,0.,1.)*(1.-smoothstep(.54,1.,q));`:`
 float r=length(v),theta=atan(v.y,v.x);float spokes=pow(abs(cos(theta*3.+.3)),19.)*exp(-r*4.);
 float glint=exp(-r*7.)+spokes;col=mix(lo,hi,clamp(glint*1.9,0.,1.));alpha=clamp(glint,0.,1.)*(1.-smoothstep(.06,.65,q));`;
 const mat=impactMat(un,planeVS,'varying vec2 v;uniform float q;uniform vec3 lo,hi;\n'+impactNoise+'\nvoid main(){vec3 col;float alpha;'+fs+
 'if(alpha<.012)discard;gl_FragColor=vec4(col,alpha);\n#include <encodings_fragment>\n}',!fire&&!psych);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);g.add(mesh);
 return q=>{mesh.quaternion.copy(f.cam.quaternion);const grow=.46+.72*(1-Math.exp(-q*11));mesh.scale.set(grow*(fire?1.12:1),grow*(fire?1.36:psych?1.30:1),1);
 mesh.position.copy(f.cam.position).sub(g.position).normalize().multiplyScalar(psych?.48:fire?.22:.12);mesh.position.y+=fire?q*.78:0}
}
// Ballistic jets use a single indexed draw; the tapered streak is extruded
// along its projected velocity rather than always pointing up the screen.
function burstStreaks(g,kind,un,rng){
 const verts=[],ends=[],seeds=[],uv=[],indices=[];const pull=kind==='mind',petal=kind==='leaf'||kind==='wind',water=kind==='water',fire=kind==='fire'||kind==='azure';
 for(let i=0,n=petal?26:38;i<n;i++){
  const t=rng()*6.283,z=pull?(rng()-.5)*1.15:water?.45+rng()*1.28:fire?.45+rng()*1.55:(rng()-.32)*1.8,run=.35+rng()*1.2,w=rng(),delay=rng()*.19;
  for(const [x,y] of [[-1,0],[1,0],[-1,1],[1,1]]){
   verts.push(0,0,0);ends.push(Math.cos(t)*run,z,Math.sin(t)*run);seeds.push(w,delay,t);uv.push(x,y)}
  const j=i*4;indices.push(j,j+1,j+2,j+1,j+3,j+2)
 }
 const geo=new THREE.BufferGeometry();for(const [k,a,n] of [['position',verts,3],['velocity',ends,3],['seed',seeds,3],['uv',uv,2]])geo.setAttribute(k,new THREE.Float32BufferAttribute(a,n));geo.setIndex(indices);
 const mat=impactMat(un,`attribute vec3 velocity,seed;uniform float q;varying vec2 st;varying float fade;void main(){
  float t=clamp((q-seed.y)/(1.-seed.y),0.,1.),end=1.-pow(1.-t,2.);vec3 p=velocity*${pull?'(1.-end)*1.95':'end*1.72'};
  ${petal||pull?'float a=t*(1.6+seed.x*2.3);p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;':''}
  p.y+=${pull?'0.':fire?'t*t*.48':'-1.65*t*t'};vec4 mv=modelViewMatrix*vec4(p,1.);
  vec3 vel=mat3(modelViewMatrix)*(velocity*${pull?'-1.':'1.'}+vec3(0.,${water?'-2.1':'-.6'}*t,0.));vec2 dir=normalize(vel.xy+vec2(.0001));
  float breadth=${petal?'.046':water?'.036':'.021'}*(.6+seed.x)*(1.-t),sz=length(modelViewMatrix[0].xyz);
  mv.xy+=sz*(vec2(-dir.y,dir.x)*uv.x*breadth+dir*(uv.y-.5)*(.12+seed.x*.29)*(1.-.72*t));
  gl_Position=projectionMatrix*mv;st=uv;fade=smoothstep(0.,.045,t)*(1.-smoothstep(.45,1.,t));}`,
 `varying vec2 st;varying float fade;uniform vec3 hi,lo;void main(){float thick=sin(st.y*3.14159);float a=smoothstep(0.,.25,thick-abs(st.x)*.77)*fade;
 if(a<.01)discard;gl_FragColor=vec4(mix(lo,hi,st.y*.68+.30*thick),a);\n#include <encodings_fragment>\n}`,!petal&&!water&&kind!=='stone');
 const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;g.add(mesh)
}
function waterCrown(g,un){
 const pos=[],uv=[],ix=[];for(let i=0;i<=80;i++)for(let j=0;j<=5;j++){const a=i/80*6.283,t=j/5;pos.push(Math.cos(a),t,Math.sin(a));uv.push(i/80,t);if(i<80&&j<5){const n=i*6+j;ix.push(n,n+6,n+7,n,n+7,n+1)}}
 const geo=new THREE.BufferGeometry;geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ix);
 const mat=impactMat(un,`uniform float q;varying vec2 st;void main(){st=uv;float angle=uv.x*6.283,crest=pow(.5+.5*sin(angle*7.+.7*sin(3.*angle)+q*3.),1.5);
 float r=.15+q*1.45+uv.y*(.33+.4*q)+.12*sin(uv.y*3.14);float h=(.47+crest*.86)*sin(3.14159*pow(q,.65))*uv.y;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position.x*r,-.27+h,position.z*r,1.);}`,
 `varying vec2 st;uniform float q;uniform vec3 hi,lo;void main(){float edge=smoothstep(.72,.99,st.y+.05*sin(st.x*150.));
 vec3 col=mix(lo,hi,edge+.18*(1.-edge));gl_FragColor=vec4(col,(.48+.47*edge)*(1.-smoothstep(.48,1.,q)));\n#include <encodings_fragment>\n}`);
 const sheet=new THREE.Mesh(geo,mat);sheet.frustumCulled=false;g.add(sheet)
}

function glacierLance(f,origin,dir,d){
 const p=[],rgb=[],ind=[],rng=seeded(337);
 const facets=[0xd6ffff,0x9bdcff,0x477ab1,0xc4edff,0x65bcea].map(fxColor);
 for(let k=0;k<8;k++){
  const from=k===0?0:rng()*.54,end=k===0?1:Math.min(1,from+.23+rng()*.39),spin=k*2.4;
  for(let face=0;face<5;face++){const base=p.length/3;
   for(const t of [0,.24,.77,1])for(const j of [0,1]){
    const v=from+t*(end-from),r=(k?.056:.11)*Math.sin(Math.PI*t)**.49,
     shift=k?(Math.sin(t*Math.PI)*.19+.21*Math.pow(t,1.3)):0,phi=spin+1.2566*(face+j);
    p.push(Math.cos(spin)*shift+Math.cos(phi)*r,Math.sin(spin)*shift+Math.sin(phi)*r,d*v);rgb.push(...facets[(face+k)%5].toArray())}
   for(let j=0;j<3;j++){const n=base+j*2;ind.push(n,n+1,n+2,n+1,n+3,n+2)}
  }
 }
 const geo=new THREE.BufferGeometry;geo.setIndex(ind);geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(rgb,3));
 const mat=ink(0xffffff,.94);mat.vertexColors=true;
 flare(f,.58,g=>{g.position.copy(origin);g.quaternion.setFromUnitVectors(V(0,0,1),dir);g.scale.z=.01;g.add(new THREE.Mesh(geo,mat));
  for(let j=0;j<12;j++){let m=part(g,new THREE.OctahedronGeometry(1),j%2?0x83d2ff:0xebffff);m.userData.t=rng();m.userData.a=rng()*6.28;m.scale.set(.048,.053,.23)}
 },(g,q)=>{g.scale.z=Math.min(1,.02+q*8);mat.opacity=1-flowSmooth((q-.38)/.6);
  for(let i=1;i<g.children.length;i++){const m=g.children[i],s=(m.userData.t+q*1.64)%1,r=.12+.27*Math.sin(Math.PI*s),a=m.userData.a+s*.84;
   m.position.set(Math.cos(a)*r,Math.sin(a)*r,d*s);m.material.opacity=mat.opacity*Math.sin(Math.PI*s)}
 })
}
function electricForks(f,g,un,rng){
 const lines=[];for(let j=0;j<7;j++){const a=j*.8976+rng()*.25,b=V(Math.cos(a)*(1.1+rng()*.65),j%3===0?.55+rng():-.28,Math.sin(a)*1.45),path=pathNoise(V(),b,.31,rng,8);
  lines.push([path,1]);const base=path[4];lines.push([pathNoise(base,base.clone().add(V(Math.sin(a)*.65,.3-rng()*.72,Math.cos(a)*.8)),.21,rng,5),.48])}
 const halo=ribbon(g,0xa88bff,160,true),core=ribbon(g,0xfff5ad,160);return q=>{
  // drawRibbon expects world coordinates; use a local camera for this scaled group.
  const cam={cam:{position:g.worldToLocal(f.cam.position.clone())}};
  drawRibbon(cam,halo,lines,.077);drawRibbon(cam,core,lines,.023);const fade=1-flowSmooth((q-.12)/.65);
  halo.material.opacity=.48*fade;core.material.opacity=.98*fade;const ext=.5+.5*flowSmooth(q/.22);
  halo.scale.setScalar(ext);core.scale.setScalar(ext)}
}
function crystalFan(g,un,rng,style){
 const rocks=[];for(let i=0;i<9;i++){let t=i*2.4,m=part(g,style==='ice'?new THREE.OctahedronGeometry(1):new THREE.DodecahedronGeometry(1),i%3?impactStyles[style][0]:impactStyles[style][1]);
 const dir=V(Math.cos(t),.55+rng(),Math.sin(t)).normalize();m.quaternion.setFromUnitVectors(V(0,1),dir);rocks.push([m,dir,.5+rng()*.4])}
 return q=>rocks.forEach(([m,d,r])=>{const grow=flowSmooth(q/.28),fade=1-flowSmooth((q-.39)/.61);m.position.copy(d).multiplyScalar(r*(.34+grow*.65+q*.34));m.position.y-=q*q*.77;
 m.scale.set(.15*r*grow,style==='ice'?r*.65*grow:r*.25*grow,.17*r*grow);m.material.opacity=fade})
}
// Sloped terrain decal; the treatment changes by element, not just by palette.
function impactMark(f,at,style,r){
 const pyro=style==='fire'||style==='azure',wet=style==='water',zap=style==='volt',mind=style==='mind';
 if(!pyro&&!wet&&!zap&&!mind)return;
 const floor=strideFloor(f,at.x,at.z);if(at.y-floor>3.4)return;
 const geo=new THREE.PlaneGeometry(r*4,r*4,12,12);geo.rotateX(-Math.PI/2);let pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+at.x,z=pos.getZ(i)+at.z;pos.setXYZ(i,x,strideFloor(f,x,z)+.033,z)}
 const un=burstUniform(style);const expr=pyro?`float n=noise(v*6.)*.55+noise(v*13.)*.22;float scar=1.-smoothstep(.29,.63,r+n*.34);
 float seam=exp(-abs(r+.07*sin(a*7.)-.34)*30.);col=mix(vec3(.025,.013,.01),lo,seam*(1.-q));alpha=scar*.77;`:wet?`
 float ring=exp(-abs(r-.13-q*.72)*40.)+.55*exp(-abs(r-q*.68)*45.);col=mix(lo,hi,min(1.,ring));alpha=ring*.81;`:zap?`
 float crack=abs(sin(a*6.+.51*sin(r*24.+a*3.)+.24*sin(r*65.)));float limb=(1.-smoothstep(.03,.23,crack));
 col=mix(lo,hi,1.-crack);alpha=limb*(1.-smoothstep(.1,.91,r))*smoothstep(r-.07,r+.04,.14+q*3.);`:`
 float ripple=exp(-abs(r-(1.-q)*.73)*31.);col=mix(lo,hi,ripple);alpha=.71*ripple;`;
 const mat=impactMat(un,planeVS,'varying vec2 v;uniform float q;uniform vec3 lo,hi;\n'+impactNoise+'\nvoid main(){float r=length(v),a=atan(v.y,v.x);vec3 col;float alpha;'+expr+'alpha*=1.-smoothstep(.53,1.,q);if(alpha<.012)discard;gl_FragColor=vec4(col,alpha);\n#include <encodings_fragment>\n}',!pyro);
 mat.polygonOffset=true;mat.polygonOffsetFactor=-2;flare(f,pyro?2.2:wet?1.3:.82,g=>{g.add(new THREE.Mesh(geo,mat));g.userData.mark=style},(_,q)=>un.q.value=q)
}
function elementalBurst(f,a,at,style,r){
 const rng=seeded((f.t*800|0)+a.u.d.id*73),un=burstUniform(style),steps=[];
 flare(f,style==='volt'?.70:(style==='fire'||style==='azure')?1.01:.84,g=>{
  g.position.copy(at);g.scale.setScalar(r);g.userData.burst=style;
  steps.push(fxBillboard(f,g,style,un));burstStreaks(g,style,un,rng);
  if(style==='water')waterCrown(g,un);if(style==='volt')steps.push(electricForks(f,g,un,rng));
  if(style==='ice'||style==='stone')steps.push(crystalFan(g,un,rng,style));
 },(g,q)=>{un.q.value=q;for(const s of steps)s(q)});
 impactMark(f,at,style,r);
 // Reuse one short-lived illumination envelope; no new light per particle.
 const light=f.burstLamp;light.position.copy(at);light.color.copy(fxColor(impactStyles[style][1]));light.distance=5+r*2.6;
 light.userData.birth=f.t;light.userData.power=2.5+r*1.55;light.intensity=light.userData.power
}
function illuminateBurst(f){
 const light=f.burstLamp;
 if(!light)return;
 const age=f.t-(light.userData.birth??-Infinity);
 light.intensity=age>.75?0:light.userData.power*Math.exp(-age*8);
 megaInfernoLight(f,light);
}
function skillBurst(f,a,v){
 if(a.fist!=null){
  if(a.fist===3)pressureBreak(f,a,v);
  return
 }
 if(!a.skill||a.k==='song')return;
 if(a.u.lastBurst?.k===a.k&&f.t-a.u.lastBurst.t<.48)return;
 a.u.lastBurst={k:a.k,t:f.t};elementalBurst(f,a,bodyPoint(f,v),impactStyle(a),cap(.74+v.height*.26,.83,1.7)*(a.skill===3?1.65:1))
}
function pressureBreak(f,a,v){
 const pt=bodyPoint(f,v),size=cap(.8+v.height*.21,.85,1.5),dir=a.dir.clone().normalize();
 const pos=[],uv=[],ix=[];for(let shell=0;shell<3;shell++)for(let blade=0;blade<4;blade++){
  const first=pos.length/3;for(let j=0;j<=14;j++)for(let k=0;k<=3;k++){
   const t=j/14,h=k/3,ang=blade*Math.PI*.5+t*1.25+shell*.42,r=(.22+.65*h)*(.91+.09*Math.sin(ang*4.));
   pos.push(Math.cos(ang)*r,Math.sin(ang)*r,shell*.49+.48*(1.-h*h));uv.push(t,h);
   if(j<14&&k<3){let n=first+j*4+k;ix.push(n,n+4,n+5,n,n+5,n+1)}
  }
 }
 const geo=new THREE.BufferGeometry;geo.setIndex(ix);geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const un=burstUniform('star'),mat=impactMat(un,'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 'varying vec2 v;uniform float q;void main(){float rim=smoothstep(.65,1.,v.y);float op=(.13+.87*rim)*sin(v.x*3.14159)*(1.-q);gl_FragColor=vec4(mix(vec3(.54,.24,.31),vec3(1.,.92,.65),rim),op);\n#include <encodings_fragment>\n}',true);
 flare(f,.41,g=>{g.userData.finisher=true;g.position.copy(pt);g.quaternion.setFromUnitVectors(V(0,0,1),dir);g.add(new THREE.Mesh(geo,mat));g.scale.setScalar(.15)},(g,q)=>{
  const p=1-(1-q)**3;g.position.copy(pt).addScaledVector(dir,p*.43);g.scale.set(size*(.16+p),size*(.16+p),size*(.33+p));un.q.value=q})
}
// Use the same simulation clock as the weather front (or Mewtwo's stone collapse).
// A moving annulus on the actual terrain leaves the silhouettes in its center clear.
function groundOverture(f,a){
 const fault=a.k==='fault',core=fault?a.focus:a.u.pos,style=impactStyle(a),R=fault?5.2:12;
 const geom=new THREE.PlaneGeometry(R*2,R*2,36,36);geom.rotateX(-Math.PI/2);
 const pos=geom.attributes.position;for(let i=0;i<pos.count;i++){
  const x=pos.getX(i)+core.x,z=pos.getZ(i)+core.z;pos.setXYZ(i,x,strideFloor(f,x,z)+.045,z)}
 const un=burstUniform(style);un.front={value:0};un.wake={value:0};
 const pattern=fault||style==='fire'||style==='volt'?`
  float n=noise(v*14.)*.6+noise(v*32.)*.4;float f=abs(sin(a*${fault?'9.':'7.'}+(n-.5)*2.55+r*2.));
  float vein=exp(-f*13.)+.25*exp(-f*3.);float branches=exp(-abs(sin(a*15.-n*4.+r*8.))*22.);
  mask=vein+.46*branches;edge=vein;`:style==='water'?`
  vec2 p=v*16.;p+=vec2(sin(p.y*.61+q*3.),cos(p.x*.73-q*4.));
  float lace=abs(sin(p.x+p.y*.35+q*3.)+cos(p.y-p.x*.39-q*4.));
  mask=exp(-lace*8.)+.19*exp(-lace*1.9);edge=mask;`:`
  float spiral=.5+.5*cos(a*5.+r*18.-q*8.+sin(a*2.));mask=pow(spiral,6.);edge=pow(spiral,18.);`;
 const mat=impactMat(un,planeVS,'varying vec2 v;uniform vec3 hi,lo;uniform float q,front,wake;\n'+impactNoise+
 `\nvoid main(){float r=length(v),a=atan(v.y,v.x);float mask,edge;${pattern}
 float wave=exp(-abs(r-front)*12.),trail=exp(-abs(r-front)*4.);float alpha=(wave*.78+trail*.27)*mask*wake*(1.-smoothstep(.86,1.,r));
 if(alpha<.01)discard;gl_FragColor=vec4(mix(lo,hi,clamp(edge*wave,0.,1.)),alpha);\n#include <encodings_fragment>\n}`,true);
 mat.polygonOffset=true;mat.polygonOffsetFactor=-3;flare(f,fault?faultEnd:a.wind+1.38,g=>{g.add(new THREE.Mesh(geom,mat));g.userData.overture=style},
 (g,q,t)=>{if(!a.sent&&a.u.cmd!==a){g.visible=false;return}un.q.value=q;
 const fire=fault?faultSnap:a.wind,release=t-fire;un.front.value=release<0?(fault?.9:.47)*(1-flowSmooth(t/fire))+.045:
  .045+.90*Math.min(1,release/(fault?.56:.90));un.wake.value=release<0?flowSmooth(t/.19)*.75:1-flowSmooth((release-(fault?.49:.78))/.55)})
}

// Two sampled edges from the posed tail describe a swept blade even on a miss.
function steelWake(f,a,tip){
 let trail=a.steelWake;
 if(!trail){
  const geom=new THREE.BufferGeometry,n=28,raw=new Float32Array(n*6),uv=[],ix=[];
  for(let j=0;j<n;j++){uv.push(j/(n-1),0,j/(n-1),1);if(j<n-1){const k=j*2;ix.push(k,k+1,k+2,k+1,k+3,k+2)}}
  geom.setAttribute('position',new THREE.BufferAttribute(raw,3).setUsage(THREE.DynamicDrawUsage));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.setIndex(ix);
  const un={fade:{value:1}},mat=impactMat(un,'varying vec2 st;void main(){st=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  'varying vec2 st;uniform float fade;void main(){float blade=smoothstep(.57,.94,st.y);vec3 col=mix(vec3(.40,.53,.85),vec3(1.,.98,.83),blade);float op=st.x*st.x*(.17+.8*blade+.18*sin(st.y*12.)*sin(st.y*12.));gl_FragColor=vec4(col,op*fade);\n#include <encodings_fragment>\n}',true);
  trail=a.steelWake={samples:[],geom,n,raw};
  flare(f,.54,g=>{const m=new THREE.Mesh(geom,mat);m.frustumCulled=false;g.add(m);g.userData.steel=true},(_,q,t)=>{un.fade.value=1-flowSmooth((f.t-(trail.last??f.t))/.14)})
 }
 const root=a.u.body.getObjectByName('Tail1_30');if(!root)return;
 trail.last=f.t;const inner=tip.clone().lerp(root.getWorldPosition(V()),.64);
 const s=trail.samples;s.push({at:f.t,tip:tip.clone(),inner});while(s.length>1&&s[1].at<f.t-.12)s.shift();
 for(let j=0;j<trail.n;j++){const p=s[Math.round((s.length-1)*j/(trail.n-1))];p.inner.toArray(trail.raw,j*6);p.tip.toArray(trail.raw,j*6+3)}
 trail.geom.attributes.position.needsUpdate=true
}

// Remember where the projectile actually travelled, including wind deflection.
// The end unspools in place when the projectile is removed by a hit or cover.
function missileWake(f,shot){
 if(shot.skill!==1)return;
 const style=impactStyle(shot),un=burstUniform(style),n=22,lanes=(style==='mind'||style==='water')?2:1;
 const buf=new Float32Array(n*lanes*6),uv=[],idx=[],hist=[{p:shot.o.position.clone(),t:f.t}],decay=style==='mind'?.27:.20;
 for(let k=0;k<lanes;k++)for(let j=0;j<n;j++){const i=2*(k*n+j);uv.push(j/(n-1),0,j/(n-1),1);if(j<n-1)idx.push(i,i+1,i+2,i+1,i+3,i+2)}
 const geo=new THREE.BufferGeometry;geo.setIndex(idx);geo.setAttribute('position',new THREE.BufferAttribute(buf,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 const mat=impactMat(un,'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 `varying vec2 v;uniform vec3 hi,lo;uniform float q;void main(){float edge=1.-abs(2.*v.y-1.);float bands=.6+.4*sin(v.x*24.-q*12.);vec3 col=mix(lo,hi,pow(edge,3.)*(.4+.6*v.x));
 gl_FragColor=vec4(col,smoothstep(0.,.6,edge)*v.x*(.40+.49*bands));\n#include <encodings_fragment>\n}`,style!=='mind'&&style!=='stone');
 let last=f.t,dead=false;
 flare(f,shot.life+decay,g=>{let m=new THREE.Mesh(geo,mat);m.frustumCulled=false;g.add(m);g.visible=false;g.userData.missileWake=style},g=>{
  if(!shot.o.parent)dead=true;
  if(!dead){last=f.t;hist.push({p:shot.o.position.clone(),t:f.t})}
  while(hist.length>1&&hist[1].t<f.t-decay)hist.shift();
  g.visible=hist.length>1&&f.t-last<decay;if(!g.visible)return;
  const remaining=1-cap((f.t-last)/decay,0,1),head=hist.at(-1).p,axis=V().crossVectors(shot.v,f.cam.position.clone().sub(head)).normalize(),up=axis.clone().cross(shot.v).normalize();
  un.q.value=shot.age;for(let j=0;j<n;j++){
   const v=j/(n-1),at=hist[0].t+v*(last-hist[0].t);let i=1;while(i<hist.length-1&&hist[i].t<at)i++;
   const a=hist[i-1],b=hist[i],p=a.p.clone().lerp(b.p,cap((at-a.t)/Math.max(.0001,b.t-a.t),0,1));
   for(let k=0;k<lanes;k++){const theta=(1-v)*7.4+last*8.+k*Math.PI,w=(style==='fire'?.24:style==='mind'?.14:.11)*v*remaining;
    let center=p.clone();if(lanes===2)center.addScaledVector(up,Math.cos(theta)*.24*v).addScaledVector(axis,Math.sin(theta)*.24*v);
    center.clone().addScaledVector(axis,-w).toArray(buf,(k*n+j)*6);center.addScaledVector(axis,w).toArray(buf,(k*n+j)*6+3)}
  }geo.attributes.position.needsUpdate=true
 })
}
