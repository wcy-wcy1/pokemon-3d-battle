function resonanceType(f,u){
 const type=u.d.type;
 return type==='电'?'thunder':['水','冰'].includes(type)?'surge':['火','岩石','地面'].includes(type)?'ash':['超能','飞行','草','虫'].includes(type)?'gale':wxMaps[f.z][0]
}
const resonanceNames={thunder:'天地引雷',surge:'怒海回潮',ash:'地脉喷发',gale:'万象风眼'};
function startResonance(f,u,aim){
 if(u.d.id===150)return startFault(f,u,aim);
 const front=resonanceType(f,u),isCharizard=u.d.id===6;
 const wind=isCharizard?charizardTiming.eruption:front==='ash'?1.95:.76;
 const a=u.cmd={k:'resonance',front,u,d:u.d,player:u===f.p,skill:3,aim:aim.clone(),dir:exDir(u.pos,aim),wind,total:wind+1.16,t:f.t,c:wxDefs[front].rgb,power:u.d.atk*2.55,r:12};
 u.face=Math.atan2(a.dir.x,a.dir.z);u.swing=a.total;
 if(isCharizard){startCharizardFlight(f,a);return true}
 u.playNative?.('attack');beginLandscape(f,a);if(!a.magma){celestialCast(f,a);groundOverture(f,a);ultimateTell(f,a)}startQuake(f,a,u.pos);tone(112,wind,0,'triangle',.07);exSay(f,'自然共鸣 · '+resonanceNames[front],1.45);return true
}
function resonanceStep(f,a,age){
 if(a.charFlight)charizardFlightStep(f,a,age);
 if(a.u.cmd!==a)return;
 if(age<a.wind)return;
 if(a.magma){
  releaseMagma(f,a);
  if(a.u.cmd===a)magmaContact(f,a,age);
  if(age>=a.total&&a.u.cmd===a){a.u.cmd=null;a.u.lastClip=null}
  return
 }
 if(!a.sent){
  a.sent=true;a.origin=a.magma?.origin||a.u.pos.clone();a.prev=0;
  const w=f.wx;wxClear(f);Object.assign(w,{phase:'active',type:a.front,left:8,next:.4,dir:a.dir.x<0?-1:1});wxPaint(f,true);
  exSay(f,resonanceNames[a.front]+' · '+wxDefs[a.front].n+'笼罩战场',2);tone(64,.42,0,'triangle',.10);
  resonanceSpectacle(f,a);
  const base=a.origin,n=80,buf=new Float32Array((n+1)*6),indices=[];
  for(let i=0;i<n;i++){let j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2)}
  const geo=new THREE.BufferGeometry;geo.setAttribute('position',new THREE.BufferAttribute(buf,3));geo.setIndex(indices);
  flare(f,1.1,g=>{let sheet=part(g,geo,a.c,0,0,0,.6,true);sheet.frustumCulled=false;
   for(let j=0;j<26;j++){let m=part(g,new THREE.OctahedronGeometry(1),a.front==='gale'?(j%2?0xa8c970:0x756859):a.front==='ash'?(j%2?0xff983a:0x6e5149):a.c);m.rotation.z=j}
  },(g,q,elapsed)=>{let r=.1+12*Math.min(1,elapsed/.9),fade=1-cap((elapsed-.73)/.37,0,1);
   for(let j=0;j<=n;j++){let ang=j/n*Math.PI*2,c=Math.cos(ang),s=Math.sin(ang),x=base.x+c*r,z=base.z+s*r,h=strideFloor(f,x,z),crest=(a.front==='surge'?1.55:a.front==='ash'?.92:.60)*(.72+.26*Math.sin(ang*7-q*11));buf.set([x,h+.05,z,x-c*.52,h+crest,z-s*.52],j*6)}
   geo.attributes.position.needsUpdate=true;g.children[0].material.opacity=.64*fade;
   for(let j=1;j<g.children.length;j++){let m=g.children[j],ang=j*2.4+(a.front==='gale'?q*.95:0),x=base.x+Math.cos(ang)*r,z=base.z+Math.sin(ang)*r;m.position.set(x,strideFloor(f,x,z)+.35+Math.sin(Math.PI*q)*(1+j%4*.55),z);m.rotation.x=q*7+j;m.scale.set(.14,.19+j%3*.1,.10);m.material.opacity=fade}
  });
  if(a.front==='thunder')wxLightning(f,a.origin)
 }
 const r=Math.min(12,(age-a.wind)*12/.9),target=a.player?f.e:f.p,d=dst(a.origin,target.pos);
 if(!a.hit&&d>=a.prev-.55&&d<=r+.55&&(target.air||0)<3.2)strikeHit(f,a,target);a.prev=r;
 if(age>=a.total){a.u.cmd=null;a.u.lastClip=null}
}

function releaseMagma(f,a){
 if(a.sent)return;
 a.sent=true;a.origin=a.magma.origin;
 wxClear(f);
 Object.assign(f.wx,{phase:'active',type:a.front,left:8,next:.4,dir:a.dir.x<0?-1:1});
 wxPaint(f,true);
 startQuake(f,a,a.magma.vents[0].pos,true);
 f.shake=Math.max(.14,f.shake);
 exSay(f,'地脉喷发 · 火山灰暴',1.5);
 tone(64,.42,0,'triangle',.10)
}

// Build a single animated surface per front. Each strip has a distinct silhouette
// in world space; UVs carry flow independently of the expanding damage boundary.
function resonanceSpectacle(f,a){
 const kind=a.front,base=a.origin,verts=[],uv=[],idx=[];
 function strip(steps,lanes,point){
  const first=verts.length/3;
  for(let j=0;j<=steps;j++)for(let k=0;k<=lanes;k++){
   let t=j/steps,v=k/lanes,p=point(t,v);verts.push(...p);uv.push(t,v);
   if(j<steps&&k<lanes){let n=first+j*(lanes+1)+k;idx.push(n,n+1,n+lanes+1,n+1,n+lanes+2,n+lanes+1)}
  }
 }
 const tau=Math.PI*2;
 if(kind==='gale'){
  for(let i=0;i<7;i++)strip(80,2,(t,v)=>{let b=t*tau*(1.28+i%2*.22)+i*2.4,r=.55+4*t*t+.28*Math.sin(t*9+i),y=t*7.8+(v-.5)*(.32+.94*t)*Math.sin(Math.PI*t);return [Math.cos(b)*r+.75*t*t,y,Math.sin(b)*r]})
 }else if(kind==='surge'){
  for(let i=0;i<5;i++)strip(56,14,(t,v)=>{let b=i*tau/5+(t-.5)*1.32,arch=v*2.36,peak=.42+.58*Math.sin(t*Math.PI),r=4.4+1.5*Math.sin(arch)+.22*Math.sin(9*t+i)*v;return [Math.cos(b)*r,peak*(1-Math.cos(arch))*2.06,Math.sin(b)*r]})
 }else if(kind==='ash'){
  for(let i=0;i<24;i++)strip(34,2,(t,v)=>{let ang=i*2.4,r=.47+(1.4+(i%5)*.68)*t,side=(v-.5)*(.33+.38*(1-t))*Math.sin(Math.PI*t)**.4;return [Math.cos(ang)*r-Math.sin(ang)*side, .1+(3.3+i%5)*4*t*(1-t),Math.sin(ang)*r+Math.cos(ang)*side]})
 }else{
  for(let i=0;i<7;i++){let ang=i*2.4,bx=Math.cos(ang)*(i?4:0),bz=Math.sin(ang)*(i?4:0);
   const fork=(n,branch)=>strip(n,2,(t,v)=>{let j=Math.round(t*n),s=Math.sin(t*Math.PI),w=(v-.5)*(branch?.13:.31)*(1-.55*t);
    return [bx+t*(branch?2.6:1.4)+Math.sin(j*41+i)*s*(branch?.43:.89)+w,(branch?2.65:0)+t*(branch?3.1:10.8),bz+Math.cos(j*21+i)*s*.59+w*.35]});fork(13,false);fork(7,true)}
 }
 const g0=new THREE.BufferGeometry;g0.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g0.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g0.setIndex(idx);
 const colors={gale:[0x439e8e,0xc7fff4],thunder:[0x7552ff,0xfff4a5],surge:[0x006baf,0xbcffff],ash:[0xcb2910,0xffda65]}[kind];
 const uniforms={t:{value:0},alpha:{value:0},low:{value:new THREE.Color(colors[0]).convertSRGBToLinear()},high:{value:new THREE.Color(colors[1]).convertSRGBToLinear()}};
 const mat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,vertexShader:`varying vec2 st;void main(){st=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 st;uniform float t,alpha;uniform vec3 low,high;
 void main(){float flow=.5+.5*sin(st.x*36.-t*10.+sin(st.y*9.+st.x*19.)*2.);
 float rim=`+(kind==='surge'?'smoothstep(.65,.98,st.y+.07*flow)':kind==='thunder'?'1.-smoothstep(.13,.45,abs(st.y-.5))':'pow(flow,3.)*.7+.3*smoothstep(.75,.99,st.y)')+`;
 gl_FragColor=vec4(mix(low,high,rim),alpha*(.50+.50*max(rim,flow)));
 #include <encodings_fragment>
 }`});
 flare(f,kind==='thunder'?1.05:1.85,g=>{g.position.set(base.x,strideFloor(f,base.x,base.z),base.z);g.add(new THREE.Mesh(g0,mat))},(g,q,t)=>{
  const rise=1-Math.exp(-t*8),fade=1-cap((q-.60)/.40,0,1);uniforms.t.value=t;uniforms.alpha.value=fade*.94;
  if(kind==='gale'){g.rotation.y=t*3.6;g.scale.set(.62+.43*rise,.14+.86*rise,.62+.43*rise)}
  if(kind==='surge'){let r=.35+Math.min(t/.9,1)*1.83;g.scale.set(r,(.28+rise*.96)*(.42+.58*fade),r);g.rotation.y=t*.15}
  if(kind==='ash'){let r=.42+rise*.97;g.scale.set(r,(.08+.98*rise)*(.44+.56*fade),r);g.position.y-=.72*(1-fade)}
  if(kind==='thunder'){g.scale.y=.95+.05*Math.cos(15*t);uniforms.alpha.value*=.75+.25*Math.cos(13*t)}
 })
}
// Surface displacement only: collision heights and aiming remain stable.
function seismicFloor(f,mat){
 const amp={value:0},phase={value:0},origin={value:new THREE.Vector2()};
 f.quake={amp,phase,origin};const old=mat.onBeforeCompile,key=mat.customProgramCacheKey();
 mat.customProgramCacheKey=()=>key+'|surface-tremor-v1';
 mat.onBeforeCompile=function(s,r){old.call(this,s,r);Object.assign(s.uniforms,{qAmp:amp,qPhase:phase,qCenter:origin});
 s.vertexShader='uniform float qAmp,qPhase; uniform vec2 qCenter;\n'+s.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
 vec2 qr=position.xz-qCenter;float qd=length(qr);vec2 qdir=qr/max(.001,qd);
 float env=1.-smoothstep(2.,13.,qd),w=qd*2.1-qPhase*19.,h=qAmp*env;
 float disp=h*(sin(w)+.28*sin(w*1.7+1.));
 objectNormal.xz-=qdir*h*2.1*(cos(w)+.476*cos(w*1.7+1.));`).replace('#include <begin_vertex>',`#include <begin_vertex>
 transformed.y+=disp;transformed.xz+=qdir*h*.30*cos(w);`)}
}
function startQuake(f,a,pt,impact=false){
 const q=f.quake;if(!q)return;q.a=a;q.start=f.t;q.hit=impact;q.origin.value.set(pt.x,pt.z);q.phase.value=.035;q.amp.value=impact?.21:.13
}
function tickQuake(f){
 const q=f.quake;if(!q?.a)return;let t=f.t-q.start,a=q.a;
 let env=q.hit?Math.exp(-t*6):(.68+.32*Math.sin(Math.PI*Math.min(1,t/.55)))*Math.exp(-Math.max(0,t-.42)*3.8);
 if((!q.hit&&a.u.cmd!==a)||t>(q.hit?.82:1.40)){q.a=null;q.amp.value=0;return}
 q.phase.value=t+.035;q.amp.value=(q.hit?.23:.16)*env
}
