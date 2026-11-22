function megaLotusHands(a){
 const {u,dir}=a,left=u.motion.joints('lhand'),right=u.motion.joints('rhand');
 const base=u.root.position.clone().add(V(0,u.height*.61,0)).addScaledVector(dir,u.height*.63);
 if(!left||!right)return base;
 const palm=left.getWorldPosition(V()).lerp(right.getWorldPosition(V()),.5);
 return palm.lerp(base,.25).addScaledVector(dir,.23).add(V(0,.07,0));
}

function megaLotusCharge(f,u){
 const a=u.cmd;
 if(a?.megaSkill!==1)return 0;
 const age=f.t-a.t;
 return flowSmooth((age-megaLotus.gather)/(a.wind-.19-megaLotus.gather))*(1-flowSmooth((age-a.wind)/.38));
}

// One curved surface per petal, with staggered rings opening on the GPU.
function blueLotus(){
 const positions=[],uv=[],petal=[],indices=[],rows=18,cols=8;
 for(const [ring,count,length,spread] of [[0,6,.54,.24],[1,9,.84,.33],[2,12,1.12,.35]]){
  for(let i=0;i<count;i++){
   const angle=(i+.5*(ring%2))*2*Math.PI/count,base=positions.length/3;
   for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){
    positions.push(0,0,0);uv.push(x/cols,y/rows);petal.push(angle,ring,length,spread);
    if(x<cols&&y<rows){
     const k=base+y*(cols+1)+x;
     indices.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);
    }
   }
  }
 }
 const geo=new THREE.BufferGeometry();
 geo.setIndex(indices);
 geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('petal',new THREE.Float32BufferAttribute(petal,4));
 const open={value:0},clock={value:0},alpha={value:1};
 const mat=impactMat({open,clock,alpha},`
  attribute vec4 petal;uniform float open,clock;varying vec2 s;varying float layer;
  void main(){
   s=uv;layer=petal.y;float t=uv.y,w=uv.x*2.-1.;
   float unfold=smoothstep(.055*(2.-layer),.73+.12*(2.-layer),open);
   float a=petal.x+.09*sin(petal.x*3.+t*4.)*unfold;
   float width=petal.w*pow(max(.0001,sin(3.14159*t)),.8)*(1.+.095*sin(clock*9.+petal.x*2.+t*5.));
   float arc=sin(t*3.14159);
   float bud=.09*(1.-t)+(.29+layer*.042)*pow(max(.0,arc),.86)+.016*t;
   float bloom=(.10+t*(.93+layer*.15)+.07*arc)*petal.z;
   float r=mix(bud,bloom,unfold)-abs(w)*width*.20;
   float h=mix(t*(1.06-layer*.055),petal.z*(t*.21+sin(t*2.6)*.35+pow(t,4.)*.24),unfold);
   h+=(.115*w*w+.023*sin(clock*11.+t*9.+petal.x))*arc*unfold;
   vec2 xz=vec2(cos(a),sin(a))*r+vec2(-sin(a),cos(a))*(w*width*mix(.55,1.,unfold));
   gl_Position=projectionMatrix*modelViewMatrix*vec4(xz.x,h,xz.y,1.);
  }`,`
  uniform float clock,alpha;varying vec2 s;varying float layer;
  void main(){
   float w=abs(s.x*2.-1.),t=s.y;
   float flicker=.5+.5*sin(t*19.-clock*13.+s.x*4.+layer);
   float fil=exp(-abs(w-.08*sin(t*11.))*15.);
   float lip=exp(-abs(w-.91)*20.)*smoothstep(.12,.48,t);
   float current=t*21.-clock*13.;
   float tongue=sin(w*11.+current*.72+1.6*sin(current*.53+layer))
    *.61+sin(w*24.-current*1.43+layer)*.39;
   float folds=smoothstep(.24,.96,tongue)*(.33+.26*t);
   float heat=clamp(fil*.72+lip*.69+exp(-t*9.)*.91+folds,0.,1.);
   float colorBand=.5+.5*sin(layer*2.1+t*3.+s.x*1.5);
   vec3 base=mix(vec3(.12,.023,.49),vec3(.013,.29,.85),colorBand*.81+flicker*.16);
   vec3 color=mix(base,vec3(.53,.93,1.),heat);
   float edge=1.-smoothstep(.95,1.,w);
   gl_FragColor=vec4(color,alpha*edge*smoothstep(0.,.075,t)*(1.-smoothstep(.94,1.,t))*(.45+heat*.47));
   #include <encodings_fragment>
  }`,false);
 const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;mesh.renderOrder=8;
 return {mesh,open,clock,alpha};
}

function blueEmbers(count){
 const geo=new THREE.BufferGeometry(),pos=new THREE.BufferAttribute(new Float32Array(count*3),3),weight=new THREE.BufferAttribute(new Float32Array(count),1);
 geo.setAttribute('position',pos.setUsage(THREE.DynamicDrawUsage));
 geo.setAttribute('weight',weight.setUsage(THREE.DynamicDrawUsage));
 const points=new THREE.Points(geo,impactMat({},
  'attribute float weight;varying float w;void main(){w=weight;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp((1.+10.*w)*5./-p.z,1.,12.);gl_Position=projectionMatrix*p;}',
  `varying float w;void main(){
   float r=length(gl_PointCoord-.5)*2.;
   gl_FragColor=vec4(mix(vec3(.035,.39,1.),vec3(.58,.93,1.),exp(-r*r*8.)),w*pow(max(0.,1.-r),1.6));
   #include <encodings_fragment>
  }`,true));
 points.frustumCulled=false;points.renderOrder=9;
 return {points,pos,weight};
}

function megaLotusCast(f,a){
 const flower=blueLotus(),sparks=blueEmbers(135),hand=V(),p=V();
 const parts=['tail7','spine2','lhand','neck2','lthigh','rthigh'];
 const sources=parts.map(name=>a.u.motion.joints(name)),origins=parts.map(()=>V());
 const contact=a.target.clone().add(V(0,.46,0)),right=V(a.dir.z,0,-a.dir.x);
 const arc=(q,point)=>{
  const glide=q+.18*Math.sin(Math.PI*q)/Math.PI;
  point.copy(a.origin).lerp(contact,glide).addScaledVector(right,.23*Math.sin(Math.PI*q));
  point.y+=.71*Math.sin(Math.PI*q);
  return point;
 };
 f.megaLotusFlight=a;
 flare(f,a.wind+a.flight+megaLotus.land+.15,g=>{
  g.add(flower.mesh,sparks.points);g.visible=false;g.userData.megaFX='lotusCast';
  a.lotus=flower.mesh;
 },(g,_,age)=>{
  const owner=a.player?f.p:f.e;
  const active=owner===a.u&&owner.hp>0&&(a.sent||owner.cmd===a);
  g.visible=active&&!a.hit;
  if(!g.visible){
   if(f.megaLotusFlight===a)f.megaLotusFlight=null;
   return;
  }
  const elapsed=a.sent?f.t-a.launched:0,progress=cap(elapsed/a.flight,0,1);
  if(a.sent&&elapsed>=a.flight+megaLotus.land&&f.mode==='live'){
   a.hit=true;g.visible=false;
   if(f.megaLotusFlight===a)f.megaLotusFlight=null;
   megaLotusDetonate(f,a);
   return;
  }
  const charge=flowSmooth((age-megaLotus.gather)/(a.wind-.2-megaLotus.gather));
  const form=flowSmooth((age-megaLotus.form)/(a.wind-.13-megaLotus.form));
  const hover=flowSmooth((elapsed-a.flight)/megaLotus.land);
  if(a.sent){arc(progress,hand);hand.y+=.15*Math.sin(Math.PI*hover)}
  else hand.copy(megaLotusHands(a));
  flower.mesh.position.copy(hand);
  flower.mesh.rotation.set(.06+.12*Math.sin(progress*Math.PI),age*2.1,.11*Math.sin(elapsed*2.8));
  flower.mesh.scale.setScalar((.06+.90*form)*(1+.16*hover));
  flower.alpha.value=form;
  flower.open.value=0;
  flower.clock.value=f.t;
  sparks.points.visible=charge>.04;
  if(!a.sent)sources.forEach((b,i)=>b?b.getWorldPosition(origins[i]):origins[i].copy(a.u.root.position).add(V(0,a.u.height*.55,0)));
  for(let i=0;i<sparks.pos.count;i++){
   const q=(i/23+age*1.35)%1,angle=i*2.39996+q*6;
   let strength;
   if(a.sent){
    const delay=i/sparks.pos.count*.44;
    arc(Math.max(0,progress-delay),p);
    const curl=.09+delay*.80+.14*hover;
    p.x+=Math.cos(angle+elapsed*3)*curl;p.z+=Math.sin(angle+elapsed*3)*curl;
    p.y+=.22+.38*Math.sin(angle)*delay;
    strength=(1-delay/.47)*(1-flowSmooth((delay-progress)*6))*.86;
   }else{
    p.copy(origins[i%parts.length]).lerp(hand,q);
    const sweep=(.34+.23*form)*Math.sin(Math.PI*q);
    p.set(p.x+Math.cos(angle)*sweep,p.y+sweep*.85,p.z+Math.sin(angle)*sweep);
    strength=charge*Math.sin(Math.PI*q);
   }
   sparks.pos.setXYZ(i,p.x,p.y,p.z);sparks.weight.setX(i,strength);
  }
  sparks.pos.needsUpdate=sparks.weight.needsUpdate=true;
 });
}

function megaLotusBloom(f,a){
 const flower=blueLotus(),sparks=blueEmbers(105),origin=a.target;
 f.megaBloom={center:origin,age:f.t};
 const phase={value:0},aspect={value:f.cam.aspect},center={value:new THREE.Vector2()},projected=V();
 const wave=new THREE.Mesh(new THREE.PlaneGeometry(2,2),impactMat({phase,aspect,center},
  'varying vec2 p;void main(){p=position.xy;gl_Position=vec4(p,0.,1.);}',`
  uniform float phase,aspect;uniform vec2 center;varying vec2 p;
  void main(){
   vec2 d=p-center;d.x*=aspect;float r=length(d),a=atan(d.y,d.x);
   float surge=clamp(phase/.84,0.,1.);
   float circle=surge*(max(1.,aspect)+1.35);
   float lobes=.07*sin(a*7.+r*11.)+.04*sin(a*13.-r*8.);
   float dist=r-circle+lobes;
   float rim=exp(-pow(dist*12.,2.));
   float wake=exp(-pow((dist+.18+.29*surge)*7.,2.));
   float trail=exp(-abs(dist+.12)*3.2);
   float rays=pow(max(0.,.55*sin(a*13.+r*5.)+.45*sin(a*23.-r*6.)),3.);
   float hot=exp(-r*1.64)*exp(-pow((phase-.035)*13.,2.));
   float fade=smoothstep(.01,.10,phase)*(1.-smoothstep(.47,.91,phase));
   vec3 blue=mix(vec3(.18,.045,.71),vec3(.19,.76,1.),clamp(rim*.82+hot,0.,1.));
   gl_FragColor=vec4(blue,fade*(.72*rim+.22*wake+.19*trail+.27*rays*trail)+hot*.75);
   #include <encodings_fragment>
  }`,true));
 wave.material.depthTest=false;wave.frustumCulled=false;wave.renderOrder=16;
 flare(f,megaLotus.bloom,g=>{
  g.position.copy(origin);g.userData.megaFX='lotusBloom';g.add(flower.mesh,sparks.points,wave);
 },(_,q,age)=>{
  const size=1.06+2.80*flowSmooth(age/.74);
  flower.mesh.scale.setScalar(size);
  flower.mesh.position.y=.46*(1-flowSmooth(age/.66));
  flower.mesh.rotation.y=.68*age;
  flower.open.value=cap(age/.98,0,1);
  flower.clock.value=f.t;
  flower.alpha.value=1-flowSmooth((q-.67)/.33);
  phase.value=age;aspect.value=f.cam.aspect;
  projected.copy(origin).add(V(0,.7,0)).project(f.cam);
  center.value.set(cap(projected.x,-.9,.9),cap(projected.y,-.8,.8));
  for(let i=0;i<sparks.pos.count;i++){
   const angle=i*2.39996,launch=(i%11)*.028,t=Math.max(0,age-launch);
   const speed=2.7+(i%17)*.24,spread=t*speed,rise=t*(3.5+(i%9)*.5)-4.1*t*t;
   sparks.pos.setXYZ(i,Math.cos(angle)*spread,Math.max(.09,rise),Math.sin(angle)*spread);
   sparks.weight.setX(i,flowSmooth(t/.065)*(1-flowSmooth((t-.17)/.79)));
  }
  sparks.pos.needsUpdate=sparks.weight.needsUpdate=true;
 });
}

function megaLotusDetonate(f,a){
 megaLotusBloom(f,a);
 elementalBurst(f,a,a.target,'azure',1.67);
 megaGroundFX(f,a.target,.90,a.r*1.17,'ring');
 noise(.68,.38);tone(49,.54,0,'triangle',.13);tone(98,.36,.04,'sine',.068);
 f.shake=Math.max(f.shake,.24);
 const target=a.player?f.e:f.p;
 if(!megaAreaHit(f,target,a.target,a.r,2.65))return;
 const mark=target.megaScorch={until:f.t+5};
 exHurt(f,target,a.power*1.28,a.d,true,exDir(a.target,target.pos),1,false);
 megaGroundFX(f,a.target,5,1.04,'mark',()=>target.hp>0&&target.megaScorch===mark,target);
}

function megaHellscape(f,a){
 const life=megaFall.end-megaFall.crash;
 const guard=()=>a.u.cmd===a;
 const origin=a.target;
 const center=a.ghost=origin.clone().addScaledVector(a.dir,2.72);
 center.y=strideFloor(f,center.x,center.z);
 megaSkyburst(f,center,a.powerup,life,guard,a.dir);
 megaDemon(f,a,guard);
}

function megaInfernoLight(f,light){
 const a=f.p.cmd;
 if(a?.megaSkill!==3||!a.ghost)return;
 const {crash,emerge,seal,end}=megaFall,age=f.t-a.t;
 light.position.copy(a.ghost).y+=2;
 light.color.setHex(0x208aff);
 light.distance=14;
 light.intensity=(3.8+2.2*Math.sin(age*37)**2)*flowEnvelope(age,crash,emerge,end)+
  3.2*flowEnvelope(age,seal-.09,seal,end);
}

function megaSkyClaw(f,a){
 const {claw,seal,end}=megaFall,fade={value:0},clock={value:0};
 const mat=impactMat({fade,clock},`
  varying vec3 n,p,look;
  void main(){p=position;vec4 v=modelViewMatrix*vec4(position,1.);n=normalMatrix*normal;look=-v.xyz;gl_Position=projectionMatrix*v;}
 `,`
  varying vec3 n,p,look;uniform float fade,clock;
  void main(){
   vec3 normal=normalize(n);
   float rim=pow(1.-abs(dot(normal,normalize(look))),2.25);
   float flow=sin(p.y*7.+clock*16.+1.6*sin(p.x*8.+p.z*5.));
   float braid=smoothstep(.25,.94,flow+.24*sin(p.z*15.-clock*9.));
   float relief=.14+.86*max(0.,dot(normal,normalize(vec3(-.52,.55,.68))));
   vec3 dense=mix(vec3(.005,.009,.029),vec3(.023,.085,.18),relief);
   vec3 fire=mix(vec3(.028,.25,.82),vec3(.29,.84,1.),rim*.61+braid*.39);
   gl_FragColor=vec4(mix(dense,fire,clamp(rim*.74+braid*.22,0.,1.)),fade*(.85+.12*rim));
   #include <encodings_fragment>
  }`);
 const nails=impactMat({fade},`
  varying vec3 n,eye;
  void main(){vec4 p=modelViewMatrix*vec4(position,1.);eye=-p.xyz;n=normalMatrix*normal;gl_Position=projectionMatrix*p;}
 `,`
  uniform float fade;varying vec3 n,eye;
  void main(){vec3 normal=normalize(n);
   float rim=pow(1.-abs(dot(normal,normalize(eye))),1.8);
   float light=max(0.,dot(normal,normalize(vec3(-.4,.7,.62))));
   vec3 enamel=mix(vec3(.034,.081,.18),vec3(.36,.64,.81),light);
   gl_FragColor=vec4(mix(enamel,vec3(.71,.96,1.),rim),fade*.97);
   #include <encodings_fragment>
  }`);
 const hand=new THREE.Group(),ball=new THREE.SphereGeometry(1,20,12);
 const plate=new THREE.IcosahedronGeometry(1,0);
 const add=(parent,geo,material,x,y,z,sx,sy,sz)=>{
  const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);
  m.renderOrder=11;parent.add(m);return m;
 };
 const tube=(parent,points,radius,material,tip)=>{
  const path=new THREE.CatmullRomCurve3(points),rows=20,sides=11;
  const geo=new THREE.TubeGeometry(path,rows,radius,sides,false),pos=geo.attributes.position;
  const v=V();
  for(let i=0;i<=rows;i++){
   const q=i/rows,center=path.getPointAt(q),taper=tip?Math.pow(1-q,.65):.74+.26*Math.sin(Math.PI*q);
   for(let j=0;j<=sides;j++){
    const k=i*(sides+1)+j;
    v.fromBufferAttribute(pos,k).lerp(center,1-taper);pos.setXYZ(k,v.x,v.y,v.z);
   }
  }
  geo.computeVertexNormals();
  return add(parent,geo,material,0,0,0,1,1,1);
 };
 add(hand,ball,mat,0,0,0,1.48,.59,.91).rotation.z=-.12;
 tube(hand,[V(0,.17,-.54),V(.13,.76,-1.04),V(.25,1.76,-1.38),V(.30,3.25,-1.75)],.87,mat,true);
 for(const side of [-1,1]){
  for(let i=0;i<3;i++){
   const m=add(hand,plate,mat,side*(.43+.19*i),.28+i*.13,-.01-.41*i,.50-.058*i,.26,.49);
   m.rotation.set(.18+i*.12,side*.48,side*.23);
  }
  tube(hand,[V(side*.99,.21,-.28),V(side*1.18,.43,-.66),V(side*1.05,.83,-1.01)],.23,nails,true);
 }
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.67;
  const m=add(hand,plate,mat,x,.34,.40-Math.abs(x)*.14,.43,.31,.58);
  m.rotation.set(.18,-x*.27,-x*.21);
 }
 const fire=blueEmbers(100),seed=seeded(8063),embers=Array.from({length:100},()=>[seed(),seed(),seed()]);
 const digits=[];
 for(const [i,x,length] of [[0,-1.04,1.54],[1,-.33,1.78],[2,.40,1.68],[3,1.08,1.32],[4,-1.31,1.03]]){
  const thumb=i===4,sign=Math.sign(x),splay=(thumb?.60:.31)*sign;
  const root=new THREE.Group(),joint=new THREE.Group();
  root.position.set(x,-.21,thumb?-.29:.61-(Math.abs(x)*.17));hand.add(root);
  joint.position.set(splay*.51,-length*.55,.23);root.add(joint);
  tube(root,[V(),V(splay*.22,-.29,.16),joint.position.clone()],thumb?.34:.26,mat,false);
  add(joint,plate,mat,0,.012,.022,.32,.29,.34).rotation.y=sign*.31;
  tube(joint,[V(0,.045,.04),V(splay*.22,-length*.31,.19),V(splay*.02,-length*.56,.05),
   V(-splay*.48,-length*.70,-.38)],thumb?.25:.28,nails,true);
  digits.push({root,joint,splay,thumb});
 }
 const bearing=Math.atan2(-a.dir.x,-a.dir.z);
 const center=a.ghost.clone().addScaledVector(a.dir,-.32);
 const view=Math.atan2(f.cam.position.x-center.x,f.cam.position.z-center.z);
 const swivel=Math.atan2(Math.sin(view-bearing),Math.cos(view-bearing))*.62;
 a.skyClaw=flare(f,end-claw+.03,g=>{
  g.add(hand,fire.points);g.visible=false;g.userData.megaFX='skyClaw';
 },(g,_,elapsed)=>{
  const age=f.t-a.t,approach=flowSmooth((age-claw-.09)/(seal-claw-.09));
  const down=flowSmooth((age-seal)/.43);
  const grip=flowSmooth((age-seal+.10)/.36);
  g.visible=a.u.cmd===a;
  g.position.copy(center).add(V(0,8.25-3.96*approach-2.82*down,0));
  g.rotation.set(-.26+.25*approach,bearing+swivel*(1-.21*approach),-.17*(1-approach));
  g.scale.setScalar(.91+.27*flowSmooth(elapsed/.32)-.14*down);
  digits.forEach(({root,joint,splay,thumb})=>{
   root.rotation.set(-.31+.11*approach+.58*grip,0,splay*(.96-.76*grip));
   joint.rotation.x=.06+.66*grip;
   if(thumb)root.rotation.y=.55-.63*grip;
  });
  fade.value=flowSmooth(elapsed/.21)*(1-flowSmooth((age-end+.27)/.27));
  clock.value=f.t;
  for(const [i,[seed,angle,spread]] of embers.entries()){
   const q=(seed+elapsed*(.78+spread*.45))%1,turn=angle*Math.PI*2+q*4.8;
   const r=(.32+spread*.85)*(1-q*.58);
   fire.pos.setXYZ(i,Math.cos(turn)*r+.34*q,.25+3.9*q,Math.sin(turn)*r-.63-1.43*q);
   fire.weight.setX(i,fade.value*Math.sin(Math.PI*q)*(.37+.58*spread));
  }
  fire.pos.needsUpdate=fire.weight.needsUpdate=true;
 });
}

function megaDemon(f,a,guard){
 const {crash,emerge,crest,seal,end}=megaFall,body=new THREE.Group();
 const spiritMat=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  vertexShader:`varying vec3 n,p,look;void main(){p=position;vec4 v=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);look=-v.xyz;gl_Position=projectionMatrix*v;}`,
  fragmentShader:`
   varying vec3 n,p,look;uniform float time;
   void main(){
    float rim=pow(1.-abs(dot(normalize(n),normalize(look))),2.);
    float currents=.5+.5*sin(p.y*15.+1.75*sin(p.x*12.+p.z*7.)-time*13.);
    vec3 normal=normalize(n);
    float relief=pow(max(0.,dot(normal,normalize(vec3(-.47,.83,.23)))),1.5);
    float erosion=pow(currents,8.)*.18;
    vec3 bone=mix(vec3(.007,.012,.020),vec3(.25,.33,.40),relief*(1.-erosion));
    gl_FragColor=vec4(bone+vec3(.034,.16,.28)*rim*(.60+.40*currents),1.);
    #include <encodings_fragment>
   }`
 });
 const cavity=new THREE.MeshBasicMaterial({color:0x020407,side:THREE.DoubleSide});
 const hornMat=new THREE.MeshStandardMaterial({color:0x111c2a,roughness:.70});
 const ell=(parent,geo,mat,x,y,z,sx,sy,sz)=>{
  const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;
 };
 const poly=new THREE.IcosahedronGeometry(1,1);
 const claw=new THREE.ConeGeometry(1,1,7);
 const segment=(parent,geo,material,from,to,width,depth=width)=>{
  const dir=to.clone().sub(from),mid=from.clone().lerp(to,.5);
  const m=ell(parent,geo,material,mid.x,mid.y,mid.z,width,dir.length()*(geo===claw?1:.64),depth);
  m.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());
  return m;
 };
 const curved=(parent,points,radius,material,taper=false)=>{
  const curve=new THREE.CatmullRomCurve3(points),geo=new THREE.TubeGeometry(curve,14,radius,7,false);
  if(taper){
   const pos=geo.attributes.position;
   for(let i=0;i<=14;i++){
    const center=curve.getPointAt(i/14),width=(1-i/14)**.68;
    for(let j=0;j<=7;j++){
     const k=i*8+j,v=V().fromBufferAttribute(pos,k).lerp(center,1-width);
     pos.setXYZ(k,v.x,v.y,v.z);
    }
   }
   geo.computeVertexNormals();
  }
  const mesh=new THREE.Mesh(geo,material);parent.add(mesh);return mesh;
 };
 const spine=ell(body,poly,spiritMat,0,.62,-.28,.23,1.18,.24);
 spine.rotation.x=-.09;
 const head=new THREE.Group();head.position.set(0,1.74,.36);body.add(head);
 ell(head,poly,spiritMat,0,.17,-.11,.59,.60,.50);
 ell(head,poly,spiritMat,0,.23,.22,.47,.42,.27);
 const nasal=new THREE.Shape();
 nasal.moveTo(0,.13);nasal.quadraticCurveTo(.11,-.005,.098,-.08);
 nasal.lineTo(.026,-.062);nasal.lineTo(0,-.028);nasal.lineTo(-.026,-.062);
 nasal.lineTo(-.098,-.08);nasal.quadraticCurveTo(-.11,-.005,0,.13);
 ell(head,new THREE.ShapeGeometry(nasal),cavity,0,-.15,.502,1,1,1);
 ell(head,poly,spiritMat,0,-.27,.26,.39,.17,.32);
 const jaw=new THREE.Group();jaw.position.set(0,-.27,.03);head.add(jaw);
 curved(jaw,[V(-.39,0,-.06),V(-.31,-.32,.37),V(0,-.38,.55),V(.31,-.32,.37),V(.39,0,-.06)],.077,spiritMat);
 for(let i=0;i<9;i++){
  const x=(i-4)*.074,z=.57-x*x*.94,long=i===1||i===7?.19:.095;
  segment(head,claw,spiritMat,V(x,-.29,z),V(x*.96,-.29-long,z+.018),.041);
  if(i%2===0)segment(jaw,claw,spiritMat,V(x,-.36,z-.05),V(x,-.265,z-.035),.030);
 }
 const arms=[];
 for(const sign of [-1,1]){
  const socket=new THREE.Shape();
  socket.moveTo(sign*.09,.083);
  socket.bezierCurveTo(sign*.18,.12,sign*.33,.25,sign*.43,.19);
  socket.bezierCurveTo(sign*.51,.14,sign*.45,-.042,sign*.34,-.079);
  socket.bezierCurveTo(sign*.23,-.129,sign*.12,-.058,sign*.09,.083);
  const hollow=ell(head,new THREE.ShapeGeometry(socket),cavity,0,0,.478,1,1,1);
  hollow.rotation.y=-sign*.22;
  curved(head,[V(sign*.08,.10,.493),V(sign*.20,.16,.55),V(sign*.35,.257,.489),V(sign*.48,.189,.36)],.052,spiritMat,true);
  curved(head,[V(sign*.155,-.062,.464),V(sign*.29,-.112,.484),V(sign*.44,-.071,.414),V(sign*.53,.025,.27)],.056,spiritMat);
  curved(head,[V(sign*.43,.43,-.07),V(sign*.72,.63,-.27),V(sign*.97,1.05,-.28),
   V(sign*.96,1.37,-.07),V(sign*.80,1.48,.14)],.24,hornMat,true);
  curved(head,[V(sign*.51,.07,-.22),V(sign*.70,.20,-.43),V(sign*.89,.43,-.45)],.15,hornMat,true);
  for(let i=0;i<4;i++){
   const y=1.29-i*.24,w=.65-i*.105;
   curved(body,[V(sign*.09,y,-.29),V(sign*w,y-.085,-.21),V(sign*w,y-.14,.26),V(sign*.19,y-.18,.49)],.075-i*.008,spiritMat);
  }
  curved(body,[V(sign*.26,1.52,.08),V(sign*.68,1.45,.12),V(sign*.98,1.63,-.14)],.16,spiritMat,true);
  const limb=new THREE.Group(),hand=new THREE.Group();
  const upper=ell(limb,poly,spiritMat,0,0,0,.14,1,.145),forearm=ell(limb,poly,spiritMat,0,0,0,.105,1,.11);
  const ulna=ell(limb,poly,spiritMat,0,0,0,.073,1,.073),joint=ell(limb,poly,spiritMat,0,0,0,.18,.14,.17);
  limb.add(hand);
  ell(hand,poly,spiritMat,0,0,.11,.29,.117,.27);
  segment(hand,poly,spiritMat,V(-sign*.22,0,.02),V(-sign*.39,-.075,.25),.059);
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.138,root=V(x,0,.20),knuckle=V(x*1.37,-.035,.39+.04*(1-Math.abs(i-1.5)));
   segment(hand,poly,spiritMat,root,knuckle,.063);
   ell(hand,poly,spiritMat,knuckle.x,knuckle.y,knuckle.z,.063,.058,.061);
   segment(hand,claw,spiritMat,knuckle,knuckle.clone().add(V(x*.43,-.09,.25)),.064);
  }
  arms.push({sign,limb,hand,upper,forearm,ulna,joint,plant:V(sign*(sign<0?1.21:1.06),0,sign<0?1.52:.83)});
 }
 const up=V(0,1,0),delta=V(),shoulder=V(),elbow=V(),wrist=V(),offset=V();
 const poseBone=(m,from,to)=>{
  delta.copy(to).sub(from);m.position.copy(from).lerp(to,.5);m.scale.y=delta.length()*.64;
  m.quaternion.setFromUnitVectors(up,delta.normalize());
 };
 flare(f,end-crash,g=>{
  g.position.copy(a.ghost);
  const bearing=Math.atan2(-a.dir.x,-a.dir.z);
  g.rotation.y=bearing+.70*Math.sign(Math.sin(f.az-bearing));
  g.add(body,...arms.map(arm=>arm.limb));g.visible=false;g.userData.megaFX='demon';
  g.updateMatrixWorld(true);
  arms.forEach((arm,i)=>{
   const ground=g.localToWorld(arm.plant.clone());
   arm.plant.y=strideFloor(f,ground.x,ground.z)-a.ghost.y+.115;
   if(i===0)a.firstHand=ground.setY(a.ghost.y+arm.plant.y);
  });
 },(g,_,elapsed)=>{
  const age=crash+elapsed,rise=flowSmooth((age-emerge-.42)/(crest-emerge-.42)),sink=flowSmooth((age-seal+.025)/.44);
  g.visible=guard()&&age>=emerge&&sink<.999;if(!g.visible)return;
  const reach=flowEnvelope(age,emerge+.35,emerge+.67,crest+.12);
  const collapse=flowSmooth((age-seal+.04)/.22);
  body.position.set(0,-3.38+3.36*rise-2.34*sink,-.35+.44*rise);
  body.scale.set(1+.15*collapse,1-.50*collapse,1+.10*collapse);
  body.rotation.x=.22+.62*reach+.61*collapse;
  head.rotation.x=-.54*reach+.42*collapse;
  head.rotation.z=.10*Math.sin(elapsed*7)*(1-collapse);
  jaw.rotation.x=.13+.31*reach+.22*collapse;
  body.updateMatrix();
  arms.forEach((arm,i)=>{
   const start=emerge+i*.39;
   const breach=flowSmooth((age-start)/.16),brace=flowSmooth((age-start-.13)/.24);
   const sweep=(1-brace)*breach;
   wrist.copy(arm.plant);wrist.y+=-.73*(1-breach)+.65*sweep-1.07*sink;
   wrist.z-=.32*(1-brace);
   shoulder.set(arm.sign*.63,1.33,-.14).applyMatrix4(body.matrix);
   elbow.copy(shoulder).lerp(wrist,.56).add(offset.set(arm.sign*(.32+.26*brace),-.20+.31*rise,-.19));
   arm.hand.position.copy(wrist);arm.hand.rotation.set(-1.35*sweep+.59*collapse,arm.sign*.18,arm.sign*.19*sweep);
   arm.joint.position.copy(elbow);
   poseBone(arm.upper,shoulder,elbow);poseBone(arm.forearm,elbow,wrist);
   offset.set(arm.sign*.12,.008,0);elbow.add(offset);wrist.add(offset);
   poseBone(arm.ulna,elbow,wrist);
  });
  spiritMat.uniforms.time.value=f.t;
 });
}
