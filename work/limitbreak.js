// World-space double exposure: the actual live skeleton is projected through a
// second transform. The projection owns its material, never the actor's mesh data.
const celestialPal={
 thunder:[0x3e2285,0x9870ff,0xffeb91],surge:[0x092967,0x08abc2,0xd4fffa],
 ash:[0x5e152d,0xfa5622,0xffdf87],gale:[0x134956,0x41d2a9,0xcfffbe],
 fault:[0x291448,0xa15afe,0xffd7ff]
};
const phenomenon={
 thunder:`float arc=a+0.11*sin(r*23.+a*8.-T*3.)+0.034*sin(r*69.-T*6.);
 float bolt=abs(sin(arc*6.+r*1.8));line=exp(-bolt*(18.+14.*r))*(.38+.62*smoothstep(.22,.65,r));
 mist=.45*n+.46*exp(-abs(r-.53-n*.12)*7.); core=.45*exp(-r*5.);`,
 surge:`float spiral=a*3.+r*19.-T*2.8+1.4*n;float wave=.5+.5*sin(spiral);
 line=pow(wave,10.)*(.36+.64*n)+.34*pow(.5+.5*sin(spiral*2.+n*9.),12.);
 mist=.25+.60*wave*n; core=.68*exp(-pow((r-.17)*12.,2.));`,
 ash:`float limb=.43+.038*sin(a*9.+T*2.)+.026*sin(a*16.-T*2.)+.12*n;
 float plume=exp(-abs(r-limb)*10.);line=exp(-abs(r-.428)*99.)+.74*plume*pow(.5+.5*sin(a*24.-r*22.+n*6.),3.);
 mist=plume*(.7+.52*n)+.22*n; core=1.-smoothstep(.41,.435,r);`,
 gale:`float ribbon=sin(a*2.+r*9.-T*1.5+1.9*n);line=exp(-abs(ribbon)*11.)*(.4+.6*n);
 mist=.68*pow(.5+.5*ribbon,2.)*(.45+.55*sin(a*12.+r*26.+n*8.)*.5+.275)+.21*n;core=.76*exp(-abs(r-.16)*14.);`,
 fault:`float disk=length(vec2(p.x+p.y*.28,(p.y-p.x*.22)*3.2));
 float streak=.53+.47*sin(disk*86.-T*7.+n*6.);
 line=exp(-abs(r-.31)*62.)+.82*exp(-abs(disk-.60)*8.)*streak;
 mist=.68*exp(-abs(disk-.67)*5.)+.36*exp(-abs(r-.37)*10.)+.19*n;core=1.-smoothstep(.27,.31,r);`
};
function celestialSky(kind,un){
 return new THREE.ShaderMaterial({uniforms:un,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 vertexShader:`varying vec2 coord;void main(){coord=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec2 coord;uniform float time,alpha;uniform vec3 dark,tint,hot;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 void main(){vec2 p=coord;float r=length(p);if(r>=1.)discard;float a=atan(p.y,p.x),T=time;
 vec2 v=p*3.2+vec2(.15*T,-.21*T);float n=noise2(v)*.55+noise2(v*2.1)*.30+noise2(v*4.3)*.15;
 float line=0.,mist=0.,core=0.;`+phenomenon[kind]+`
 float rim=(1.-smoothstep(.66,1.,r));vec3 rgb=mix(dark,tint,clamp(mist,0.,1.));rgb=mix(rgb,hot,clamp(line,0.,1.));
 `+(['ash','fault'].includes(kind)?'rgb=mix(rgb,dark*.27,core*(1.-clamp(line,0.,1.)));':'rgb=mix(rgb,hot,core*.65);')+`
 gl_FragColor=vec4(rgb,rim*alpha*clamp(.22+mist*.76+line+core,.0,.97));
 #include <encodings_fragment>
 }`})
}
function echoModel(g,u,un,anchor,az){
 if(!u.model3d)return;
 const srcRoot=u.root,base=V(),origin=new THREE.Matrix4(),proj=new THREE.Matrix4(),spin=new THREE.Matrix4();
 const copies=[];
 u.body.traverse(src=>{
  if(!src.isMesh||!src.userData.speciesSurface||!src.visible||src.userData.fuzz||/fur tips|guard hairs|outline|contour/i.test(src.name)||!src.geometry.attributes.normal)return;
  const skin=src.material?.map,paint=!!(skin&&src.geometry.attributes.uv);
  const EchoMesh=src.isSkinnedMesh?THREE.SkinnedMesh:THREE.Mesh;
  const c=new EchoMesh(src.geometry,new THREE.ShaderMaterial({
   uniforms:{...un,skin:{value:skin},uvMat:{value:skin?.matrix}},defines:paint?{ECHO_PAINT:1}:{},skinning:!!src.isSkinnedMesh,transparent:true,depthWrite:false,side:THREE.FrontSide,
   vertexShader:`varying vec3 norm,eye,world;varying vec2 inkUV;uniform mat3 uvMat;
   #include <skinning_pars_vertex>
   void main(){
   #ifdef ECHO_PAINT
   inkUV=(uvMat*vec3(uv,1.)).xy;
   #endif
   #include <skinbase_vertex>
   #include <beginnormal_vertex>
   #include <skinnormal_vertex>
   #include <begin_vertex>
   #include <skinning_vertex>
   vec4 mv=modelViewMatrix*vec4(transformed,1.);norm=normalize(normalMatrix*objectNormal);eye=-mv.xyz;world=(modelMatrix*vec4(transformed,1.)).xyz;
   gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`varying vec3 norm,eye,world;varying vec2 inkUV;uniform sampler2D skin;uniform vec3 dark,tint,hot;uniform float time,echo;
   void main(){vec3 n=normalize(norm);float rim=pow(1.-abs(dot(n,normalize(eye))),2.);
   float sun=max(0.,dot(n,normalize(vec3(-.47,.70,.45))));
   float s=world.y*5.-time*3.+sin(world.x*2.6+world.z*1.6)*1.4;
   float vein=exp(-abs(sin(s))*15.);
   vec3 c=mix(dark,tint,.22+.65*sun);c=mix(c,hot,clamp(rim*1.2+vein*.27+.15*sun,0.,1.));
   #ifdef ECHO_PAINT
   vec4 paint=texture2D(skin,inkUV);if(paint.a<.20)discard;
   float pigment=dot(paint.rgb,vec3(.30,.56,.14));
   c=mix(c*.18,c,smoothstep(.05,.63,pigment));c+=.34*paint.rgb*paint.rgb*(.38+.62*sun);
   #endif
   gl_FragColor=vec4(c,echo*(.77+.20*rim));
   #include <encodings_fragment>
   }`
  }));
  c.userData.borrowedGeometry=true;c.frustumCulled=false;c.matrixAutoUpdate=false;if(src.isSkinnedMesh){c.bindMode='detached';c.skeleton=src.skeleton}c.renderOrder=2;
  c.onBeforeRender=()=>{if(src.isSkinnedMesh){c.bindMatrix.copy(src.bindMatrix);c.bindMatrixInverse.copy(src.bindMatrixInverse)}c.matrixWorld.multiplyMatrices(proj,src.matrixWorld)};
  g.add(c);copies.push(c)
 });
 return (rise,t)=>{
  const alive=u.root===srcRoot;
  for(const c of copies)c.visible=alive;
  if(!alive)return;
  srcRoot.getWorldPosition(base);
  const size=(3.65+.42*rise)/Math.max(.15,u.viewSpan||u.height);
  origin.makeTranslation(-base.x,-base.y,-base.z);spin.makeRotationY(az+.64-u.face);
  proj.makeScale(size,size,size).multiply(spin).multiply(origin);
  proj.elements[12]+=anchor.x;proj.elements[13]+=anchor.y+.22*Math.sin(t*2.);proj.elements[14]+=anchor.z
 }
}
function celestialCast(f,a){
 const kind=a.k==='fault'?'fault':a.front,pal=celestialPal[kind],u=a.u;
 const un={time:{value:0},alpha:{value:0},echo:{value:0}};
 ['dark','tint','hot'].forEach((k,i)=>un[k]={value:new THREE.Color(pal[i]).convertSRGBToLinear()});
 const az=f.duelCamera?.angle??f.az,back=V(Math.sin(az),0,Math.cos(az)),right=V(Math.cos(az),0,-Math.sin(az));
 const side=right.dot(a.dir)>=0?-1:1,anchor=u.pos.clone().addScaledVector(back,-2.5).addScaledVector(right,1.55*side);
 anchor.y=strideFloor(f,anchor.x,anchor.z)+.48;
 const center=anchor.clone().addScaledVector(back,-2.4);center.y+=3.15;
 const duration=kind==='fault'?3.3:2.55,movie=f.celestial={start:f.t,end:f.t+duration,u,center};
 let wall,updateEcho,light;
 flare(f,duration,g=>{
  g.userData.celestial=kind;g.visible=false;
  wall=new THREE.Mesh(new THREE.PlaneGeometry(9.4,9.4),celestialSky(kind,un));wall.position.copy(center);wall.rotation.y=az;wall.renderOrder=-1;g.add(wall);
  updateEcho=echoModel(g,u,un,anchor,az);light=f.celestialLight;
  if(!light){light=f.celestialLight=new THREE.PointLight(0xffffff,0,17,1.3);f.sc.add(light)}
  light.position.copy(anchor);light.position.y+=2.8;light.color.setHex(pal[1])
 },(g,q,t)=>{
  if(u!==f.p||!a.sent&&u.cmd!==a)movie.cancelled=true;
  if(movie.cancelled){g.visible=false;if(f.celestial===movie){light.intensity=0;f.celestial=null}return}
  const rise=flowSmooth(t/.54),fade=1-flowSmooth((q-.62)/.38),crest=Math.exp(-Math.pow((t-(kind==='fault'?faultSnap:a.wind))/.24,2));
  g.visible=true;un.time.value=t;un.alpha.value=rise*fade;un.echo.value=rise*fade;
  wall.scale.setScalar(.57+.43*rise+.09*crest+.09*q);updateEcho?.(rise,t);
  if(f.celestial===movie)light.intensity=q>.94?0:rise*fade*(2+crest*4.5)
 })
}
