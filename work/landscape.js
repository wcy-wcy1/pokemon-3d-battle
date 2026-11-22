// A single distance/arrival atlas per battlefield. The terrain samples the same
// fracture network that locates the vents. It never changes movement/collision.
const lavaN=512,lavaLife=11.4;
function landscapeFloor(f,mat){
 const bytes=new Uint8Array(lavaN*lavaN*4),tex=new THREE.DataTexture(bytes,lavaN,lavaN,THREE.RGBAFormat);
 tex.magFilter=tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;tex.needsUpdate=true;
 const un={landMap:{value:tex},landBox:{value:new THREE.Vector3(0,0,1)},landAge:{value:0},landMode:{value:0},landSource:{value:new THREE.Vector2()},landFade:{value:1},landHeat:{value:1},landBlue:{value:0}};
 f.landscape={tex,bytes,un};const old=mat.onBeforeCompile,key=mat.customProgramCacheKey();
 mat.customProgramCacheKey=()=>key+'|geologic-front-1';
 const decl='uniform sampler2D landMap; uniform vec3 landBox; uniform float landAge,landMode,landFade,landHeat,landBlue; uniform vec2 landSource; varying vec2 landXZ;\n';
 mat.onBeforeCompile=function(s,r){old.call(this,s,r);Object.assign(s.uniforms,un);
 s.vertexShader=decl+s.vertexShader.replace('#include <project_vertex>',`landXZ=position.xz;
 if(landMode>.5 && landMode<1.5){
  vec2 xy=(position.xz-landBox.xy)*landBox.z;vec2 m=texture2D(landMap,xy).rg;
  float open=smoothstep(m.g*.66,m.g*.66+.22,landAge)*landFade;
  transformed.y+=open*(.16*exp(-pow((m.r-.31)*6.,2.))*smoothstep(.03,.23,m.r)-.28*smoothstep(.45,.98,m.r));
 }
 #include <project_vertex>`);
 s.fragmentShader=decl+`
 // Distorted cell borders remain incandescent as rough rafts of basalt cool.
 float clinker(vec2 p){vec2 i=floor(p),f=fract(p);float near1=8.,near2=8.;
 for(int j=-1;j<=1;j++)for(int k=-1;k<=1;k++){vec2 n=vec2(float(j),float(k)),v=i+n;
 vec2 jitter=fract(sin(vec2(dot(v,vec2(129.7,231.5)),dot(v,vec2(35.1,97.4))))*4375.3);
 vec2 d=n+.18+.64*jitter-f;float ds=dot(d,d);near2=min(near2,max(near1,ds));near1=min(near1,ds);}
 return sqrt(near2)-sqrt(near1);}
 `+s.fragmentShader.replace('#include <tonemapping_fragment>',`
 if(landMode>.5){
  vec2 xy=(landXZ-landBox.xy)*landBox.z;float t=landAge;
  if(landMode<1.5 && all(greaterThanEqual(xy,vec2(0.))) && all(lessThanEqual(xy,vec2(1.)))){
   vec2 m=texture2D(landMap,xy).rg;
   float open=smoothstep(m.g*.66,m.g*.66+.19,t);
   float seep=smoothstep(.43+m.g*1.15,.86+m.g*1.10,t);
   float cool=landHeat;
   float edge=m.r+.043*sin(landXZ.x*16.+sin(landXZ.y*9.))*sin(landXZ.y*21.);
   float cavity=smoothstep(.45-.22*open,.62-.23*open,edge)*open;
   float melt=smoothstep(.89-.44*seep,.98-.42*seep,edge)*seep*cool;
   float plate=sin(landXZ.x*5.+sin(landXZ.y*4.+t*.76))+cos(landXZ.y*7.-t*1.6+sin(landXZ.x*5.7));
   float crust=smoothstep(.32,1.37,plate+.94*(1.-cool));
   float stream=sin(m.g*42.-t*5.+landXZ.y*2.)*.5+.5;
   vec3 rock=mix(gl_FragColor.rgb*.34,mix(vec3(.026,.010,.009),vec3(.008,.014,.028),landBlue),cavity);
   vec2 advect=landXZ*3.15+vec2(.16*t,-.12*t)+.29*vec2(sin(landXZ.y*4.+t*.6),sin(landXZ.x*4.5-t*.7));
   float cells=clinker(advect),fresh=smoothstep(.70,.98,m.r)*seep*cool;
   float island=smoothstep(.09+.10*fresh,.26+.16*fresh,cells)*(.68+.32*crust);
   float hot=seep*cool*(.45+.55*fresh)*(.65+.35*stream);
   vec3 lava=mix(mix(vec3(.52,.024,.002),vec3(.012,.14,.64),landBlue),
    mix(vec3(2.7,.73,.042),vec3(.14,.67,1.95),landBlue),hot);
   vec3 basalt=mix(vec3(.12,.019,.01),vec3(.014,.074,.16),landBlue);
   lava=mix(lava,mix(gl_FragColor.rgb*.24,basalt,cool*.56),island*(1.-.16*fresh));
   float fade=landFade;
   gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(rock,lava,melt),smoothstep(.075,.30,edge)*open*fade);
   gl_FragColor.rgb+=mix(vec3(.35,.045,.001),vec3(.007,.071,.25),landBlue)*smoothstep(.07,.34,edge)*seep*cool*(1.-melt);
  }else if(landMode>1.5){
   vec2 d=landXZ-landSource;float rad=length(d),ang=atan(d.y,d.x);
   float passed=smoothstep(.0,.20,t-.76-rad*.075)*(1.-smoothstep(3.1,5.1,t))*(1.-smoothstep(10.,12.,rad));
   if(landMode<2.5){float sheen=pow(.5+.5*sin(rad*8.-t*4.+sin(ang*8.)*.4),8.);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(.40,.61,.74)+vec3(.015,.085,.13)*sheen,passed*.85);
   }else if(landMode<3.5){float burn=exp(-abs(sin(ang*6.+rad*.72+sin(rad*4.+ang*3.)*.41))*16.);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,gl_FragColor.rgb*.20+vec3(.12,.05,.32)*exp(-max(0.,t-1.4)*3.),passed*burn);
   }else{float drift=pow(.5+.5*sin(ang*3.+rad*3.7-t*2.4),9.);gl_FragColor.rgb*=1.-.40*drift*passed;}
  }
 }
 #include <tonemapping_fragment>`)}
}
function beginLandscape(f,a){
 const s=f.landscape;if(!s)return;
 const previous=s.cast;
 const blue=a.megaSkill===3,magma=blue||a.front==='ash';
 const reuse=magma&&previous?.keepLava&&previous.sent&&previous.u===a.u&&s.cooledAt==null;
 a.keepLava=a.d.id===6&&magma;
 s.cooledAt=null;
 if(!reuse)s.surfaceStart=f.t;
 s.cast=a;s.un.landAge.value=f.t-s.surfaceStart;s.un.landSource.value.set(a.u.pos.x,a.u.pos.z);
 s.un.landMode.value=magma?1:{surge:2,thunder:3,gale:4}[a.front];
 s.un.landBlue.value=+blue;
 s.un.landFade.value=s.un.landHeat.value=1;
 if(s.lamp)s.lamp.intensity=0;
 if(magma){
  if(reuse){
   const nodes=previous.magma.nodes,nearest=[...nodes].sort((p,q)=>dst(p,a.aim)-dst(q,a.aim));
   const target=nearest[0];
   const side=nearest.filter(p=>dst(p,target)>1.4&&dst(p,target)<4.6);
   const vents=[...side.slice(0,2),target].map((pos,i,all)=>({pos,size:i===all.length-1?1.17:.68,delay:i*.14}));
   a.magma={origin:a.u.pos.clone(),nodes,vents,next:3.25,round:0,spouts:[]};
   s.lamp.position.copy(target);s.lamp.position.y+=1.15;
  }else a.magma=bakeFissure(f,a);
  s.lamp.color.setHex(blue?0x1e7eff:0xff761b);
  if(!blue)lavaFountains(f,a,a.magma.vents,a.wind-(f.t-a.t));
  a.magma.next=Math.max(a.magma.next,blue?a.total+.4:a.wind+1.45);
 }
}
function activeVolcano(f){
 const s=f.landscape,a=s?.cast;
 return !!(a?.keepLava&&a.megaSkill!==3&&a.sent&&s.cooledAt==null&&a.u===f.p&&a.u.hp>0)
}
function tickLandscape(f){
 const s=f.landscape,a=s?.cast;if(!a)return;const t=f.t-a.t;
 if(a.keepLava&&(a.sent||a.impactCommitted)&&(a.u!==f.p||a.u.hp<=0)&&s.cooledAt==null){
  s.cooledAt=f.t;a.magma.spouts.length=0;
  if(a.megaSkill!==3&&f.wx.type==='ash')f.wx.left=Math.min(f.wx.left,.3)
 }
 const cooling=s.cooledAt==null?0:f.t-s.cooledAt;
 if((!a.sent&&!a.impactCommitted&&a.u.cmd!==a)||cooling>=1.65||!a.keepLava&&t>=(a.magma?lavaLife:5.1)){
  s.un.landMode.value=0;s.cast=null;if(s.lamp)s.lamp.intensity=0;return
 }
 s.un.landAge.value=f.t-s.surfaceStart;
 if(a.impactCommitted&&!a.sent&&s.cooledAt==null&&t>=a.wind)releaseMagma(f,a);
 s.un.landFade.value=a.keepLava?1-flowSmooth((cooling-.25)/1.40):1-flowSmooth((t-9.3)/2.1);
 s.un.landHeat.value=a.keepLava?1-flowSmooth(cooling/.95):1-flowSmooth((t-8.65)/2.05);
 if(a.magma&&a.sent&&s.cooledAt==null&&f.mode==='live'&&!f.down)aftermathVents(f,a,t);
 if(a.magma&&s.lamp){
  const initial=flowSmooth((t-.52)/1.25)*(1-flowSmooth((t-2.75)/1.95));
  const pulse=2.1+5.2*Math.exp(-Math.pow((t-a.wind-.27)/.48,2));
  s.lamp.intensity=(a.megaSkill===3?.52:initial*pulse+(a.keepLava?.58:0))*s.un.landFade.value
 }
}
function bakeFissure(f,a){
 const s=f.landscape,buf=s.bytes;buf.fill(0);
 const rng=seeded(5931+f.z*31+Math.floor(a.t*13)),dir=a.dir.clone();if(dir.lengthSq()<.01)dir.set(0,0,-1);
 const collapse=a.charFlight||a.megaSkill===3;
 const right=V(-dir.z,0,dir.x),origin=a.u.pos.clone(),dist=collapse?6.1:cap(dst(origin,a.aim),1.1,11.8);
 if(a.charFlight)dir.negate();
 const point=(d,w)=>origin.clone().addScaledVector(dir,d).addScaledVector(right,w);
 const trunk=[point(0,0)];for(let j=1;j<=11;j++)trunk.push(point(dist*j/11,j===11?0:(rng()-.5)*.89));
 const lines=[],vents=[];function add(p,q,w,at,end){lines.push({p,q,w,at,end})}
 for(let i=0;i<11;i++)add(trunk[i],trunk[i+1],.70+.21*Math.sin(i*.31),i/14,(i+1)/14);
 function branch(start,angle,len,w,at,end,n){
  const result=[start],normal=right.clone().multiplyScalar(Math.cos(angle)).addScaledVector(dir,-Math.sin(angle));
  for(let i=1;i<=n;i++){const k=i/n;const p=start.clone().addScaledVector(dir,k*len*Math.cos(angle)).addScaledVector(right,k*len*Math.sin(angle)).addScaledVector(normal,(rng()-.5)*.63);
   add(result.at(-1),p,w*(1-.47*k),at+(end-at)*(i-1)/n,at+(end-at)*k);result.push(p)}return result
 }
 for(let i=0;i<8;i++){
  const j=[2,3,4,6,7,8,10,11][i],sign=i%2?1:-1,ang=sign*(.67+rng()*.73);
  const arm=branch(trunk[j],ang,2.1+rng()*1.6,.56,j/14,Math.min(1,j/14+.28),5);
  branch(arm[2],ang+sign*.76,1.05+rng()*.55,.33,j/14+.14,j/14+.30,3);
  if(i===2||i===5)vents.push({pos:arm[3],size:.68,delay:i===2?0:.14})
 }
 vents.push({pos:collapse?origin.clone():trunk.at(-1),size:1.17,delay:.28});
 const nodes=basaltPlates(f,origin,lines,add,rng,trunk);
 for(const v of vents){v.pos.y=strideFloor(f,v.pos.x,v.pos.z);add(v.pos,v.pos,1.25*v.size,.69,.69)}
 let minX=Infinity,minZ=Infinity,maxX=-Infinity,maxZ=-Infinity;
 for(const {p,q} of lines)for(const k of [p,q]){minX=Math.min(minX,k.x);maxX=Math.max(maxX,k.x);minZ=Math.min(minZ,k.z);maxZ=Math.max(maxZ,k.z)}
 minX-=1.8;minZ-=1.8;const span=Math.max(maxX-minX,maxZ-minZ)+1.8,unit=span/lavaN;
 s.un.landBox.value.set(minX,minZ,1/span);
 for(const {p,q,w,at,end} of lines){
  const x0=cap(Math.floor((Math.min(p.x,q.x)-w-minX)/unit),0,lavaN-1),x1=cap(Math.ceil((Math.max(p.x,q.x)+w-minX)/unit),0,lavaN-1),
   y0=cap(Math.floor((Math.min(p.z,q.z)-w-minZ)/unit),0,lavaN-1),y1=cap(Math.ceil((Math.max(p.z,q.z)+w-minZ)/unit),0,lavaN-1),dx=q.x-p.x,dz=q.z-p.z,dd=dx*dx+dz*dz;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const rx=minX+(x+.5)*unit-p.x,rz=minZ+(y+.5)*unit-p.z,k=dd?cap((rx*dx+rz*dz)/dd,0,1):0;
   const val=Math.round(255*(1-Math.hypot(rx-dx*k,rz-dz*k)/w)),idx=(y*lavaN+x)*4;
   if(val>buf[idx]){buf[idx]=val;buf[idx+1]=Math.round(255*cap(at+(end-at)*k,0,1))}
  }
 }
 s.tex.needsUpdate=true;
 if(!s.lamp){s.lamp=new THREE.PointLight(0xff761b,0,12,1.4);f.sc.add(s.lamp)}
 s.lamp.position.copy(vents[2].pos);s.lamp.position.y+=1.15;
 return {origin,vents,nodes,next:3.25,round:0,spouts:[]}
}
function magmaContact(f,a,age){
 for(const vent of a.magma.vents){const t=age-a.wind-vent.delay;if(t<0||t>.42)continue;
  if(!vent.opened){vent.opened=true;if(vent.size>1){startQuake(f,a,vent.pos,true);tone(52,.43,0,'triangle',.10);noise(.23,.12);f.shake=Math.max(.20,f.shake)}}
  const target=a.player?f.e:f.p;if(!a.hit&&dst(target.pos,vent.pos)<1.95*vent.size&&(target.air||0)<3.4*vent.size)strikeHit(f,a,target)
 }
}
function lavaFountains(f,a,jets=a.magma.vents,delay=a.wind,secondary=false){
 const seed=331+Math.round(f.t*1000),rng=seeded(seed),positions=[],uv=[],velocity=[],shape=[],indices=[];
 const gravity=13,rows=32,sides=12;
 for(const v of jets)for(let j=0;j<8;j++){
  const angle=j*2.4+rng()*.45,sideSpeed=(j?1.2+rng()*1.7:.38)*v.size;
  const speed=(j?4.5+rng()*2.8:9.4)*Math.sqrt(v.size),width=v.size*(j?.078+rng()*.083:.43);
  const start=v.delay+(j?rng()*.14:0),pulse=(j?.16+rng()*.16:.36)*(secondary?.8:1);
  const first=positions.length/3;
  for(let row=0;row<=rows;row++)for(let k=0;k<=sides;k++){
   positions.push(v.pos.x,v.pos.y-.035,v.pos.z);
   uv.push(row/rows,k/sides);
   velocity.push(Math.cos(angle)*sideSpeed,speed,Math.sin(angle)*sideSpeed,start);
   shape.push(width,pulse,j);
   if(row<rows&&k<sides){
    const n=first+row*(sides+1)+k;
    indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1)
   }
  }
 }
 const geo=new THREE.BufferGeometry;
 geo.setIndex(indices);
 geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('launch',new THREE.Float32BufferAttribute(velocity,4));
 geo.setAttribute('jetShape',new THREE.Float32BufferAttribute(shape,3));
 const blue=a.megaSkill===3,un={elapsed:{value:-1},gravity:{value:gravity},landBlue:{value:+blue}};
 const palette=blue?[0x1d3457,0x90dbff,0x2f84f5]:[0x542a22,0xffa244,0xf65b19];
 const mat=new THREE.ShaderMaterial({uniforms:un,side:THREE.DoubleSide,extensions:{derivatives:true},
 vertexShader:`attribute vec4 launch;attribute vec3 jetShape;
 uniform float elapsed,gravity;varying vec3 viewPos;varying vec4 liquid;
 void main(){
  float age=elapsed-launch.w, flight=2.*launch.y/gravity;
  float from=max(0.,age-jetShape.y),to=min(flight,age);
  float t=mix(from,max(from,to),uv.x),angle=uv.y*6.2831853;
  float birth=age-t;
  vec3 p=launch.xyz*t; p.y-=.5*gravity*t*t;
  vec3 tangent=normalize(launch.xyz-vec3(0.,gravity*t,0.));
  vec3 across=normalize(cross(tangent,vec3(0.,0.,1.)));
  vec3 around=cross(tangent,across);
  float endCap=sqrt(max(.002,smoothstep(0.,.050,birth)*smoothstep(0.,.071,jetShape.y-birth)));
  float lump=.85+.19*sin(t*24.-birth*34.+angle*3.+jetShape.z)+.09*cos(angle*5.-t*41.);
  float r=jetShape.x*endCap*lump*(1.-.57*t/flight);
  p+=(across*cos(angle)+around*sin(angle))*r;
  p.x+=.14*sin(t*7.+birth*27.)*t;
  vec4 view=modelViewMatrix*vec4(position+p,1.);
  viewPos=view.xyz;liquid=vec4(t,angle,birth,to-from);
  gl_Position=projectionMatrix*view;
 }`,
 fragmentShader:`varying vec3 viewPos;varying vec4 liquid;uniform float landBlue;
 void main(){
  if(liquid.w<.002)discard;
  vec3 normal=normalize(cross(dFdx(viewPos),dFdy(viewPos)));
  vec3 eye=normalize(-viewPos),light=normalize(vec3(-.41,.78,.46));
  float facing=max(0.,dot(normal,light));
  float spec=pow(max(0.,dot(normal,normalize(eye+light))),17.);
  float swirl=sin(liquid.y*4.+liquid.x*24.-liquid.z*29.+sin(liquid.x*32.+liquid.y*3.)*1.2);
  float grain=sin(liquid.y*8.-liquid.x*47.+liquid.z*61.)*.5+.5;
  float crust=smoothstep(.18,.92,swirl+.22*grain+liquid.x*.47);
  vec3 hot=mix(mix(vec3(.61,.036,.005),vec3(.019,.15,.59),landBlue),
   mix(vec3(2.7,.61,.055),vec3(.34,1.02,2.5),landBlue),.46+.47*facing);
  vec3 skin=mix(vec3(.13,.033,.024),vec3(.012,.046,.12),landBlue)*(.48+.52*facing);
  vec3 col=mix(hot,skin,crust*.81)+spec*mix(vec3(.92,.29,.13),vec3(.21,.52,.92),landBlue);
  gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <encodings_fragment>
 }`});
 const qt=new THREE.Quaternion,mt=new THREE.Matrix4,upAxis=V(0,1,0),heading=V(),sz=V(),pos=V(),drops=[];
 let spray,splashes;
 const dropletCount=jets.length*(secondary?38:60);
 flare(f,delay+2.35,g=>{
  g.userData.volcanic=true;const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;g.add(mesh);g.visible=false;
  spray=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({roughness:.43,emissive:blue?0x1558e5:0xd93005,emissiveIntensity:.58}),dropletCount);
  spray.frustumCulled=false;g.add(spray);
  splashes=new THREE.InstancedMesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:blue?0x379bff:0xea511a,depthWrite:false,transparent:true,opacity:.72,polygonOffset:true,polygonOffsetFactor:-3}),dropletCount);
  splashes.frustumCulled=false;g.add(splashes);
  for(let i=0;i<dropletCount;i++){
   const v=jets[i%jets.length],angle=rng()*Math.PI*2,vel=(.65+rng()*3.6)*Math.sqrt(v.size);
   const dx=vel*Math.cos(angle),dz=vel*Math.sin(angle),vy=(2.7+rng()*6.9)*Math.sqrt(v.size);
   const size=(.019+rng()**2*.123)*v.size,base=v.pos.clone().addScaledVector(V(Math.cos(angle),0,Math.sin(angle)),rng()*.20*v.size);
   base.y+=.06+rng()*.18*v.size;
   let impact=.035;
   for(;impact<1.85;impact+=.022){
    const x=base.x+dx*impact,z=base.z+dz*impact,y=base.y+vy*impact-.5*gravity*impact*impact;
    if(impact>vy/gravity&&y<=strideFloor(f,x,z))break
   }
   const x=base.x+dx*impact,z=base.z+dz*impact,landing=V(x,strideFloor(f,x,z)+.04,z);
   drops.push({base,launch:v.delay+.035+rng()*.43,dx,dz,vy,size,impact,landing});
   spray.setColorAt(i,new THREE.Color(palette[i%5===0?0:i%3===1?1:2]))
  }
 },(g,q,t)=>{
  const elapsed=t-delay;
  g.visible=a.sent&&elapsed>=0&&f.landscape.cast===a&&f.landscape.cooledAt==null;
  if(!g.visible)return;
  un.elapsed.value=elapsed;
  for(let i=0;i<drops.length;i++){
   const d=drops[i],age=elapsed-d.launch;
   const scale=age>0&&age<d.impact?d.size*flowSmooth(age/.034):0;
   pos.copy(d.base);
   if(scale){pos.x+=d.dx*age;pos.z+=d.dz*age;pos.y+=age*(d.vy-.5*gravity*age)}
   const speed=heading.set(d.dx,d.vy-gravity*age,d.dz).length();
   qt.setFromUnitVectors(upAxis,heading.divideScalar(Math.max(.01,speed)));
   sz.set(scale,scale*(1+Math.min(2,speed*.19)),scale);
   spray.setMatrixAt(i,mt.compose(pos,qt,sz));
   const landed=age-d.impact;
   const spread=landed>=0&&landed<.38?d.size*(1+landed*14)*(1-flowSmooth((landed-.12)/.26)):0;
   splashes.setMatrixAt(i,mt.compose(d.landing,qt.identity(),sz.set(spread,1,spread*.70)))
  }
  spray.instanceMatrix.needsUpdate=true;splashes.instanceMatrix.needsUpdate=true
 })
}
function magmaShore(f){
 const s=f.landscape,mat=f.water.material,old=mat.onBeforeCompile;
 mat.onBeforeCompile=function(shader,r){old.call(this,shader,r);Object.assign(shader.uniforms,s.un);
 shader.fragmentShader='uniform sampler2D landMap;uniform vec3 landBox;uniform float landAge,landMode,landHeat,landFade;\n'+shader.fragmentShader.replace('#include <encodings_fragment>',`
 if(landMode>.5&&landMode<1.5){
 vec2 uv=(p.xz-landBox.xy)*landBox.z;
 if(all(greaterThan(uv,vec2(0.)))&&all(lessThan(uv,vec2(1.)))){
 vec2 bed=texture2D(landMap,uv).rg;float hot=smoothstep(.45+bed.g*1.14,.95+bed.g*1.14,landAge)*landHeat*landFade;
 float steam=smoothstep(.12,.44,bed.r)*hot;
 gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.75,.77,.74),steam*(1.-smoothstep(.31,.62,bed.r)));
 gl_FragColor.a*=1.-.94*smoothstep(.30,.57,bed.r)*hot;
 }}
 #include <encodings_fragment>`)}
}
// Clip a jittered set of basalt plates against one another; each shared edge
// becomes one connected, irregular fissure rather than a set of concentric rings.
function basaltPlates(f,origin,lines,add,rng,trunk){
 const edge=20,sites=[],nodes=[],seen=new Set;
 for(let z=0;z<8;z++)for(let x=0;x<8;x++)sites.push(V(-edge+(x+.14+.72*rng())*5,0,-edge+(z+.14+.72*rng())*5));
 const arrival=p=>Math.min(.99,.17+dst(p,origin)*.036);
 for(const site of sites){
  let poly=[V(-edge,0,-edge),V(edge,0,-edge),V(edge,0,edge),V(-edge,0,edge)];
  for(const n of sites){if(n===site)continue;const dx=n.x-site.x,dz=n.z-site.z,c=(n.x*n.x+n.z*n.z-site.x*site.x-site.z*site.z)*.5,next=[];
   for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],a=p.x*dx+p.z*dz-c,b=q.x*dx+q.z*dz-c;
    if(a<=0)next.push(p);if((a<0)!==(b<0))next.push(p.clone().lerp(q,a/(a-b)))
   }poly=next
  }
  for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],len=dst(p,q);
   if(len<.25||Math.abs((p.x+q.x)*.5)>edge-.02||Math.abs((p.z+q.z)*.5)>edge-.02)continue;
   const key=[p,q].map(v=>Math.round(v.x*100)+':'+Math.round(v.z*100)).sort().join('/');if(seen.has(key))continue;seen.add(key);
   const n=Math.max(2,Math.ceil(len/.68)),nx=(q.z-p.z)/len,nz=(p.x-q.x)/len,thick=.35+rng()*.42;
   let prev=p;for(let j=1;j<=n;j++){
    const u=j/n,k=(rng()-.5)*.55*Math.sin(Math.PI*u),v=p.clone().lerp(q,u);v.x+=nx*k;v.z+=nz*k;
    add(prev,v,thick*(.84+.26*rng()),arrival(prev),arrival(v));
    if(j===Math.ceil(n/2)&&Math.hypot(v.x,v.z)<13.2)nodes.push(v.clone());
    prev=v
   }
  }
 }
 // Suture the fault beneath the caster and the locked target to nearby plate seams.
 for(const v of [trunk[0],trunk[5],trunk[11]]){
  const n=nodes.reduce((best,x)=>!best||dst(v,x)<dst(v,best)?x:best,null);if(n)add(v,n,.60,arrival(v)*.7,arrival(n))
 }
 for(const n of nodes)n.y=strideFloor(f,n.x,n.z);
 return nodes
}
function aftermathVents(f,a,t){
 const m=a.magma;
 m.spouts=m.spouts.filter(v=>t-v.at<4);
 if(t>=m.next&&(a.keepLava||t<9.4)&&m.nodes.length){
  const round=m.round++,rng=seeded(Math.floor(a.t*263)+round*73+f.z*923+87),near=round%3!==1;
  const score=p=>Math.min(dst(p,f.p.pos),dst(p,f.e.pos));
  const shortlist=m.nodes.filter(n=>!m.spouts.some(o=>dst(n,o.pos)<2.7)&&(!near||score(n)<5.8));
  const pool=shortlist.length?shortlist:m.nodes,point=pool[Math.floor(rng()*pool.length)];
  const v={pos:point.clone(),size:(near?.54:.69)+rng()*.19,delay:0,at:t+.62,hit:false};
  m.spouts.push(v);m.next=t+.86+rng()*.46;
  lavaFountains(f,a,[v],.62,true);warnBoil(f,a,v)
 }
 for(const v of m.spouts){
  const age=t-v.at;if(age<0||age>.34||v.hit)continue;
  if(!v.popped){v.popped=true;if(dst(f.p.pos,v.pos)<6.3)noise(.10,.052)}
  const enemy=a.player?f.e:f.p;
  if(!enemy.inv&&dst(enemy.pos,v.pos)<v.size*1.47&&(enemy.air||0)<2.22*v.size){
   v.hit=true;exHurt(f,enemy,a.d.atk*.32,a.d,true,exDir(v.pos,enemy.pos),.25,false);
   if(f.down)return
  }
 }
}
function warnBoil(f,a,v){
 const bubbles=[],rng=seeded(Math.round((v.pos.x+21)*87+(v.pos.z+21)*491));
 const sphere=new THREE.SphereGeometry(1,9,6),D=new THREE.Object3D;
 let group;
 flare(f,.69,g=>{
  const mat=new THREE.MeshBasicMaterial({color:a.megaSkill===3?0x58c1ff:0xff9b32,transparent:true,opacity:.92});
  group=new THREE.InstancedMesh(sphere,mat,7);group.frustumCulled=false;g.add(group);g.position.copy(v.pos);
  for(let i=0;i<7;i++){const an=i*2.4;bubbles.push([Math.cos(an)*(.14+rng()*.47),Math.sin(an)*(.14+rng()*.47),rng(),.14+rng()*.10])}
 },(g,q)=>{
  g.visible=f.landscape.cast===a;if(!g.visible)return;
  bubbles.forEach(([x,z,phase,sz],i)=>{const k=(q*1.7+phase)%1;
   const scale=sz*Math.sin(Math.PI*k)*flowSmooth(q/.28)*v.size;D.position.set(x,.023+k*k*.18,z);
   D.scale.set(scale,scale*(.50+.65*k),scale);D.updateMatrix();group.setMatrixAt(i,D.matrix)
  });group.instanceMatrix.needsUpdate=true
 })
}
