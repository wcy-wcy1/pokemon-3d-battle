function megaUnlocked(){return (S.owned[MEGA_X]||0)>0}

function megaCardFace(d){
 return '<div class="megaFoil"><div class="spread"><span class="badge">UR</span><label>MEGA 进化</label></div>'+
  '<h3>'+esc(d.name)+'</h3><div class="megaPortrait"><img class="artwin" src="'+img(d.id)+'" alt=""></div>'+
  '<div class="spread megaCardType"><small>MEGA X</small><small>火／龙</small></div>'+
  '<div class="move">硬爪</div><label>喷火龙专用</label></div>'
}

function megaCollection(view){
 if(view==='dex'&&((only&&!megaUnlocked())||(filter!=='全部'&&filter!=='UR')||
    (typeFilter!=='全部'&&!['火','龙'].includes(typeFilter))))return '';
 return '<div class="megaArchive"><h3>进化卡</h3><button class="entry megaEntry" onclick="inspect('+MEGA_X+')" style="--r:#81e7ff">'+
  '<img src="'+img(MEGA_X)+'" alt=""><span><strong>Mega 喷火龙 X</strong><label>UR · '+(megaUnlocked()?'已收集 ×'+S.owned[MEGA_X]:'未收集')+'</label></span></button></div>'
}

function inspectMegaCard(){
 chord(4);
 $('#detail').innerHTML='<div class="holo"><div class="card megaCard" style="--r:#81e7ff">'+megaCardFace(db[MEGA_X])+
  '</div></div><p>'+ (megaUnlocked()?'已收集 × '+S.owned[MEGA_X]:'尚未收集')+' · '+bodyFacts(db[MEGA_X])+'</p>'+
  (megaUnlocked()?'<div class="actions"><button class="primary" onclick="modal.close();exOpen(2,[6,25,9])">喷火龙体验队</button></div>':'');
 modal.showModal();
}

function fieldLineup(override){
 if(override)return override;
 const current=S.team.filter(id=>db[id]&&!db[id].evolution).slice(0,3);
 const recent=S.last.filter(id=>db[id]&&!db[id].evolution).sort((a,b)=>rank(db[b])-rank(db[a]));
 for(const id of recent)if(current.length<3&&!current.includes(id))current.push(id);
 for(const id of [6,25,9])if(current.length<3&&!current.includes(id))current.push(id);
 return current;
}

function megaBattleData(base){
 return {...base,mega:true,name:db[MEGA_X].name,kg:db[MEGA_X].kg,
  atk:Math.round(base.atk*1.22),move:megaSkills[1]};
}

const megaSkills={0:'裂空龙爪',1:'苍莲爆',3:'苍龙镇狱'};
const megaLotus={gather:.44,form:.80,throw:1.54,land:.35,bloom:2.0,r:2.8};
const megaFall={lift:.27,peak:.91,crash:1.27,emerge:1.78,crest:2.89,claw:2.89,seal:3.68,end:4.40};

function startMegaSkill(f,u,skill,aim){
 if(!Object.hasOwn(megaSkills,skill))return false;
 const dir=exDir(u.pos,aim);
 if(dir.lengthSq()<.001)dir.set(Math.sin(u.face),0,Math.cos(u.face));
 u.face=Math.atan2(dir.x,dir.z);
 const a=u.cmd={u,d:u.d,k:['claw','plume','','dragonrush'][skill],megaSkill:skill,skill,
  t:f.t,wind:skill===0?.18:skill===1?megaLotus.throw:megaFall.crash,
  total:skill===0?.56:skill===1?megaLotus.throw+.48:megaFall.end,
  dir,aim:aim.clone(),origin:u.pos.clone(),air:u.air,c:0x439aff,player:u===f.p,power:u.d.atk};
 u.swing=a.total;
 if(skill===0)megaClawTrails(f,a);
 if(skill!==0){
  a.target=aim.clone();
  a.target.y=0;
  a.target.clampLength(0,13.1);
  a.target.y=groundY(a.target.x,a.target.z,f.z);
 }
 if(skill===1){
  const reach=exDir(u.pos,a.target);
  if(dst(u.pos,a.target)>9.6)a.target.copy(u.pos).addScaledVector(reach,9.6);
  a.target.y=strideFloor(f,a.target.x,a.target.z)+.12;
  a.r=megaLotus.r;
  a.flight=cap(1.12+dst(u.pos,a.target)*.12,1.42,2.24);
  megaLotusCast(f,a);
 }
 if(skill===3){
  a.r=3.40;
  u.vel.set(0,0,0);
  megaGroundFX(f,a.target,a.total,a.r,'target',()=>u.cmd===a&&!a.sent);
 }
 if(skill!==0)exSay(f,megaSkills[skill],skill===1?megaLotus.throw:1.15);
 tone(skill===0?275:skill===1?192:92,.17,0,'triangle',.045);
 return true;
}

function stepMegaSkill(f,a,age){
 const u=a.u,target=a.player?f.e:f.p;
 if(a.megaSkill===0){
  const ground=groundY(target.pos.x,target.pos.z,f.z)-groundY(u.pos.x,u.pos.z,f.z);
  const reachAir=Math.max(.18,target.air+ground+(target.height-u.height)*.34);
  const lower=flowSmooth(age/.17)*(1-flowSmooth((age-.42)/.14));
  u.air=a.air+(reachAir-a.air)*lower;
  const push=1.25*flowSmooth((age-.045)/.19)+.57*flowSmooth((age-.27)/.13);
  const drift=push-(a.push||0);
  a.push=push;
  const clear=cap(dst(u.pos,target.pos)-.86,0,drift);
  exMove(f,u,a.dir.x*clear,a.dir.z*clear);
  for(const [index,time] of [.18,.34].entries()){
   if(age<time||age>time+.085||((a.clawHits||0)&(1<<index)))continue;
   if(!(a.lastClaw>=time)){
    a.lastClaw=time;
    noise(2.8,.075);
    tone(index===0?435:330,.12,0,'sawtooth',.032);
   }
   if(meleeOverlap(f,u,target)&&dst(u.pos,target.pos)<2.05&&target.inv<=0&&exDir(u.pos,target.pos).dot(a.dir)>-.25){
    const reach=bodyPoint(f,u),line=bodyPoint(f,target).sub(reach),distance=line.length();
    if(aerialRange(f,reach,line.normalize(),distance)<distance-.03)continue;
    a.clawHits=(a.clawHits||0)|(1<<index);
    exHurt(f,target,a.power*(time<.2?.39:.47),a.d,false,a.dir,.58,false);
    elementalBurst(f,a,bodyPoint(f,target),'azure',index===0?.54:.78)
   }
  }
 }else if(a.megaSkill===1){
  if(age>=megaLotus.gather&&!a.gathering){
   a.gathering=true;
   tone(72,.73,0,'triangle',.062);
   noise(.8,.36);
  }
  if(age>=megaLotus.form&&!a.formed){
   a.formed=true;
   tone(143,.62,0,'sine',.07);tone(286,.57,.15,'triangle',.037);
  }
  if(age>=a.wind&&!a.sent){
   a.origin=megaLotusHands(a);
   a.launched=f.t;
   a.sent=true;
   if(a.player)f.cd[1]=Math.max(f.cd[1],a.flight+megaLotus.land+.42);
   noise(1.85,.23);tone(224,.45,0,'triangle',.058);tone(336,.40,.08,'sine',.031);
  }
 }else{
  const {lift,peak,crash}=megaFall;
  if(age<peak){
   const q=flowSmooth((age-lift)/(peak-lift));
   const load=Math.sin(Math.PI*flowSmooth(age/lift));
   u.air=Math.max(.14,a.air-.36*load)+q*7.6;
  }else if(age<crash){
   const q=cap((age-peak)/(crash-peak),0,1);
   const previous=bodyPoint(f,u);
   u.pos.copy(a.origin).lerp(a.target,q*q*(2-q));u.pos.y=0;
   u.air=(a.air+7.6)*(1-q*q);
   const move=bodyPoint(f,u).sub(previous);
   if(move.lengthSq()>.0001)(a.flightDir??=V()).copy(move.normalize());
  }else if(!a.sent){
   a.sent=true;u.pos.copy(a.target);u.pos.y=0;u.air=.14;
   a.victim=megaAreaHit(f,target,a.target,a.r,3.2)?target:null;
   a.mark=a.victim?.megaScorch?.until>f.t?a.victim.megaScorch:null;
   a.powerup=a.mark?1.32:1;
   beginLandscape(f,a);
   megaHellscape(f,a);
   f.megaFlash=f.t;
   megaImpactDebris(f,a.target,a.powerup);
   startQuake(f,a,a.target,true);
   f.shake=Math.max(f.shake,a.mark?.39:.30);
   navigator.vibrate?.(70);
   tone(51,.52,0,'triangle',.13);
   noise(.67,.30);
  }else{
   u.air=.14;
   if(a.ghost)u.face=Math.atan2(a.ghost.x-u.pos.x,a.ghost.z-u.pos.z);
   if(age>=megaFall.emerge+.085&&a.firstHand&&!a.breached){
    a.breached=true;
    megaImpactDebris(f,a.firstHand,.48,12,.30);
    noise(.73,.16);
   }
   if(age>=megaFall.claw&&!a.skyClaw){
    megaSkyClaw(f,a);
    tone(62,.60,0,'triangle',.081);noise(1.18,.34);
   }
   if(age>=megaFall.seal&&!a.sealed){
    a.sealed=true;
    startQuake(f,a,a.target,true);
    megaImpactDebris(f,a.ghost,.59,17,.72);
    f.shake=Math.max(f.shake,.22);
    tone(48,.32,0,'triangle',.12);noise(1.4,.23);
   }
   if(age>=a.total-.13&&a.victim&&!a.hit){
    a.hit=true;
    if(a.mark&&a.mark===target.megaScorch){target.megaScorch=null;exSay(f,'苍焰印记 · 引爆',1.2)}
    else exSay(f,'苍龙镇狱 · 封印',.8);
    if(target===a.victim)exHurt(f,target,a.power*2.65*a.powerup,a.d,true,exDir(u.pos,target.pos),.72,false);
   }
  }
 }
 if(age>=a.total&&u.cmd===a){u.cmd=null;u.lastClip=null}
}

function megaAreaHit(f,u,center,radius,height){
 return u.hp>0&&u.inv<=0&&dst(center,u.pos)<=radius&&strideFloor(f,u.pos.x,u.pos.z)+u.air-center.y<height;
}

function megaGroundFX(f,origin,duration,radius,kind,guard=null,track=null){
 const geo=new THREE.PlaneGeometry(radius*2.52,radius*2.52,26,26);
 geo.rotateX(-Math.PI/2);
 const at=geo.attributes.position,local=at.array.slice(),opacity={value:0},age={value:0};
 const stamp=track?.pos.clone();
 const stampY=stamp?strideFloor(f,stamp.x,stamp.z):0;
 const pin=()=>{const center=track?.pos||origin;
  for(let i=0;i<at.count;i++){
   const x=local[i*3]+center.x,z=local[i*3+2]+center.z;
   at.setXYZ(i,x,strideFloor(f,x,z)+.055,z);
  }
  at.needsUpdate=true;
 };
 const presets={target:0,ring:1,mark:2};
 const mat=impactMat({opacity,age,kind:{value:presets[kind]}},planeVS,`
  varying vec2 v;uniform float opacity,age,kind;
  void main(){
   float r=length(v),a=atan(v.y,v.x);
   float rough=.033*sin(a*11.+age*11.)+.027*sin(a*23.-age*8.);
   float hot=0.,alpha=0.;
   if(kind<.5){
    float ticks=smoothstep(.25,.73,abs(sin(a*12.)));
    float ring=exp(-abs(r-.785)*78.);float dial=exp(-abs(r-.68)*58.);
    alpha=ring*.72+dial*ticks*.37+exp(-r*7.)*.28;
    hot=ring*.75+dial*ticks*.24;
   }else if(kind<1.5){
    float front=.075+.755*min(1.,age/.86),rim=r-front+rough;
    float mantle=exp(-pow(rim*11.,2.))*(.55+.45*sin(a*12.+r*32.-age*17.));
    hot=exp(-pow(rim*34.,2.));
    alpha=(.79*hot+.54*mantle)*(1.-smoothstep(.63,1.,age));
   }else{
    hot=exp(-abs(r-.65)*30.);
    alpha=hot*(1.-smoothstep(.82,1.,age))*(.54+.40*sin(age*31.));
   }
   vec3 blue=mix(vec3(.028,.23,.94),vec3(.53,.91,1.),clamp(hot,0.,1.));
   gl_FragColor=vec4(blue,alpha*opacity);
   #include <encodings_fragment>
  }`,true);
 mat.polygonOffset=true;mat.polygonOffsetFactor=-2;
 pin();
 flare(f,duration,g=>{
  const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;g.add(mesh);
  g.userData.megaFX=kind;
 },(g,q)=>{
  g.visible=!guard||guard();
  if(track&&g.visible){
   g.position.set(track.pos.x-stamp.x,strideFloor(f,track.pos.x,track.pos.z)-stampY,track.pos.z-stamp.z);
  }
  age.value=q;
  opacity.value=kind==='target'?(.82+.18*Math.sin(q*18)):1
 });
}

function megaClawTrails(f,a){
 const count=12;
 for(const [side,time] of [['l',.18],['r',.34]]){
  const claw=a.u.motion.joints(side+'hand');
  const wrist=a.u.motion.joints(side+'forearm');
  if(!claw||!wrist)continue;
  const positions=new Float32Array(count*6),uv=[],indices=[],history=[];
  for(let i=0;i<count;i++){
   uv.push(i/(count-1),0,i/(count-1),1);
   const j=i*2;
   if(i<count-1)indices.push(j,j+1,j+2,j+1,j+3,j+2);
  }
  const geo=new THREE.BufferGeometry;
  geo.setIndex(indices);
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const opacity={value:0};
  const material=impactMat({opacity},
   'varying vec2 s;void main(){s=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',`
   varying vec2 s;uniform float opacity;
   void main(){
    float glint=exp(-pow((s.y-.80)*9.,2.));
    float web=sin(s.y*12.)*.20+.80;
    float alpha=smoothstep(0.,.34,s.x)*sin(3.14159*s.y)*opacity*web;
    gl_FragColor=vec4(mix(vec3(.025,.23,.82),vec3(.58,.94,1.),glint),alpha);
    #include <encodings_fragment>
   }`,true);
  flare(f,time+.31,g=>{
   g.userData.megaFX='claw';
   const swipe=new THREE.Mesh(geo,material);swipe.frustumCulled=false;g.add(swipe);g.visible=false;
  },(g,_,age)=>{
   if(age>=time-.096&&age<time+.11&&a.u.cmd===a){
    const toe=claw.getWorldPosition(V()),from=wrist.getWorldPosition(V());
    const reach=toe.clone().sub(from).normalize();
    history.push([toe.clone().addScaledVector(reach,-.08),toe.addScaledVector(reach,.54)]);
    if(history.length>count)history.shift();
   }
   g.visible=history.length>1;
   if(!g.visible)return;
   for(let i=0;i<count;i++){
    const n=i*(history.length-1)/(count-1),j=Math.floor(n),next=history[Math.min(j+1,history.length-1)];
    for(let edge=0;edge<2;edge++)history[j][edge].clone().lerp(next[edge],n-j).toArray(positions,i*6+edge*3);
   }
   geo.attributes.position.needsUpdate=true;
   opacity.value=1-flowSmooth((age-time-.11)/.20);
  });
 }
}

function megaImpactDebris(f,origin,power,count=38,spread=2.4){
 const initial=seeded((f.t*991)|0),pieces=[],palette=[0x2b344a,0x354962,0x585d70];
 const life=1.23,geometry=new THREE.IcosahedronGeometry(1,0);
 const mat=new THREE.MeshStandardMaterial({roughness:.88,flatShading:true,color:0xffffff});
 const rocks=new THREE.InstancedMesh(geometry,mat,count);
 const pose=new THREE.Object3D;
 for(let i=0;i<rocks.count;i++){
  const dir=i*2.4,jitter=.5+initial(),start=V(Math.cos(dir),0,Math.sin(dir)).multiplyScalar(spread*(.125+initial()));
  start.add(origin);start.y=strideFloor(f,start.x,start.z)+.05;
  pieces.push({start,dir,jitter,lift:(2.0+initial()*3.8)*power,size:.07+initial()*.22,spin:(initial()-.5)*13});
  rocks.setColorAt(i,new THREE.Color(palette[i%palette.length]).convertSRGBToLinear());
 }
 rocks.frustumCulled=false;
 flare(f,life,g=>{g.add(rocks);g.userData.megaFX='debris'},(_,q,age)=>{
  for(let i=0;i<pieces.length;i++){
   const p=pieces[i];
   const x=p.start.x+Math.cos(p.dir)*age*p.jitter*2.5,z=p.start.z+Math.sin(p.dir)*age*p.jitter*2.5;
   const floor=strideFloor(f,x,z);
   pose.position.set(x,Math.max(floor+.06,p.start.y+age*p.lift-5.1*age*age),z);
   pose.rotation.set(p.spin*age,p.dir+p.spin*.4*age,.84*age);
   pose.scale.setScalar(p.size*(1-flowSmooth((q-.63)/.37)));
   pose.updateMatrix();rocks.setMatrixAt(i,pose.matrix);
  }
  rocks.instanceMatrix.needsUpdate=true;
 });
}

function megaSkyburst(f,origin,power,life,guard,dir){
 const pos=[],uv=[],jet=[],idx=[],random=seeded((f.t*767)|0),rows=24,sides=18;
 for(let i=0;i<16;i++){
  const main=i<3,a=i*2.39996,ring=main?0:2.15+random()*5.5;
  const height=main?11.6-i*1.26:1.1+random()*2.1;
  const width=main?1.67-i*.51:.32+random()*.25,delay=main?i*.027:.19+(i-3)*.041;
  const offset=V(origin.x+Math.sin(a)*ring,0,origin.z+Math.cos(a)*ring);
  offset.y=strideFloor(f,offset.x,offset.z);
  const start=pos.length/3;
  for(let y=0;y<=rows;y++)for(let x=0;x<=sides;x++){
   pos.push(offset.x,offset.y,offset.z);uv.push(x/sides,y/rows);
   jet.push(main?-i-1:a,height*Math.sqrt(power),width,delay);
   if(x<sides&&y<rows){
    const k=start+y*(sides+1)+x;
    idx.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1)
   }
  }
 }
 const geo=new THREE.BufferGeometry;
 geo.setIndex(idx);
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('jet',new THREE.Float32BufferAttribute(jet,4));
 const t={value:0},seal={value:megaFall.seal-megaFall.crash};
 const mat=impactMat({t,seal,behind:{value:new THREE.Vector2(dir.x,dir.z)}},`
  attribute vec4 jet;uniform float t,seal;uniform vec2 behind;varying vec2 s;varying float temperature,clock,column;
  void main(){
   s=uv;float a=uv.x*6.283185,y=uv.y;
   column=jet.x<0.?1.:0.;
   clock=max(0.,t-jet.w);float rise=smoothstep(.0,.35,clock);
   float press=smoothstep(seal-.06,seal+.39,t);
   float flare=exp(-pow((t-seal)*13.,2.));
   float reveal=smoothstep(.39,.66,t)*(1.-smoothstep(seal-.36,seal-.03,t));
   float pulse=.82+.18*sin(clock*13.+jet.x);
   temperature=rise*(1.-press)*pulse*mix(.69,.98-reveal*.80,column);
   float bend=y*y*(.13+.27*rise);
   float stream=y*20.-clock*21.+jet.x;
   float fray=1.+.22*sin(a*3.+stream)+.14*sin(a*6.-stream*1.29);
   float base=exp(-y*19.)*.26;
   float profile=pow(1.-y,.55)*(.69+.31*sin(3.14159*y)) + base;
   float r=jet.z*profile*fray*(.69+.42*rise+.36*flare)*(1.-.61*press)*(1.-.35*reveal*column);
   vec2 offset=vec2(cos(a),sin(a))*r+vec2(sin(jet.x),cos(jet.x))*bend*jet.y*mix(.42,.16,column);
   offset+=behind*reveal*column*(.58+.36*y);
   float top=rise*(1.-.91*press)*(1.-.36*reveal*column);
   vec3 p=position+vec3(offset.x,y*jet.y*top*(.93+.07*pulse),offset.y);
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  }`,`
  varying vec2 s;varying float temperature,clock,column;
  void main(){
   float a=s.x*6.283185;
   float lift=s.y*20.-clock*30.;
   float tongues=sin(a*5.+lift*.42+1.22*sin(lift*.56+a*3.))*.58+
     sin(a*11.-lift*.78+1.36*sin(lift*.4-a*2.))*.28+sin(a*17.+lift*1.6)*.14;
   float strength=smoothstep(-.56,.57,tongues+.56-s.y*.44);
   float filament=smoothstep(.35,.83,tongues)*(1.-s.y*.62);
   float alpha=strength*temperature*(1.-smoothstep(.76,1.,s.y));
   vec3 blue=mix(vec3(.013,.042,.48),vec3(.025,.28,1.0),strength*.87);
   blue=mix(blue,vec3(.66,.94,1.0),filament*.91);
   gl_FragColor=vec4(blue,alpha*(.33+column*.12+filament*.28));
   #include <encodings_fragment>
  }`,true);
 flare(f,life,g=>{
  const mesh=new THREE.Mesh(geo,mat);
  mesh.frustumCulled=false;
  g.add(mesh);g.userData.megaFX='skyburst';
 },(g,_,age)=>{g.visible=guard();t.value=age});
}

function megaWeatherLight(f){
 const from=f.megaFlash;
 const age=from==null?2:f.t-from;
 const surge=f.p.cmd?.megaSkill===3?f.p.cmd:null;
 const anticipation=surge&&!surge.sent?.22*flowSmooth((f.t-surge.t-.20)/.68):0;
 const release=surge?.sent&&age<megaFall.end-megaFall.crash?
  (.40+.35*Math.exp(-age*6))*(1-flowSmooth((age-(megaFall.seal-megaFall.crash))/.52)):0;
 const shade=Math.max(anticipation,release);
 if(!shade&&!f.megaTint)return;
 f.megaTint=shade>0;
 if(!shade){f.sun.color.setHex(0xffebcb);return}
 f.sun.color.setRGB(1-.59*shade,.83+.10*shade,.63+.37*shade);
 f.sun.intensity*=1-.62*shade;
 f.sky.uniforms.storm.value=Math.max(f.sky.uniforms.storm.value,shade*.74);
 if(shade){
  f.sc.fog.color.r*=1-.42*shade;
  f.sc.fog.color.g*=1-.13*shade;
  f.sc.fog.color.b=Math.min(1,f.sc.fog.color.b+.11*shade);
 }
}

function megaTypeMultiplier(type,strong,resist){
 if(['地面','岩石','龙'].includes(type))return strong;
 if(['火','草','电','虫','钢'].includes(type))return resist;
 return 1;
}

function turnMegaButton(b,u){
 if(!megaUnlocked()||u.id!==6)return '';
 const disabled=b.busy||b.done||b.megaUsed||!u.life;
 return '<button class="rift" data-turn-mega '+(disabled?'disabled ':'')+'onclick="turnMega()">'+
  (u.mega?'Mega X':b.megaUsed?'Mega 已用':'Mega 进化')+'</button>';
}

function turnMega(){
 const b=battle,u=b?.player[b.p];
 if(!megaUnlocked()||!b||b.busy||b.done||b.megaUsed||u.id!==6||!u.life)return;
 b.megaUsed=true;
 b.player[b.p]={...megaBattleData(u),power:u.power*1.22,armor:u.armor*.87};
 b.log.push('喷火龙超级进化为 Mega 喷火龙 X！');
 chord(4);
 fightUI();
}

function canMega(f){
 const u=f.p;
 return megaUnlocked()&&u?.d.id===6&&!f.megaUsed&&!f.megaShift&&f.mode==='live'&&!f.down&&
  u.hp>0&&u.ready&&!u.cmd&&!f.grip&&!(u.sleepUntil>f.t)
}

function megaHud(f){
 const b=f.el.querySelector('[data-mega]');
 if(!b)return;
 b.hidden=!megaUnlocked()||f.p.d.id!==6||!!f.megaShift||f.megaUsed;
 b.disabled=!canMega(f);
}

function bindMegaCard(f){
 const b=f.el.querySelector('[data-mega]');
 b.innerHTML='<small>UR</small><img src="'+img(MEGA_X)+'" alt=""><b>MEGA X</b>';
 b.title='M · Mega 进化';
 b.setAttribute('aria-label','使用 Mega 喷火龙 X 进化卡');
 f.on(b,'click',()=>activateMega(f));
}

const megaSequence={arrive:.96,cardEnd:1.53,draw:1.22,seal:2.67,beam:2.81,swap:3.43,dissolve:4.03,end:5.45};

function activateMega(f){
 if(!canMega(f))return;
 const u=f.p,layout=f.el.getBoundingClientRect(),button=f.el.querySelector('[data-mega]'),rect=button.getBoundingClientRect();
 const card=document.createElement('div');
 card.className='megaFlightCard';
 card.setAttribute('aria-hidden','true');
 card.innerHTML='<div class="card megaFlightFront">'+megaCardFace(db[MEGA_X])+'</div>'+
  '<div class="megaFlightBack"><i></i><b>MEGA X</b></div>';
 f.el.append(card);
 const shift=f.megaShift={u,start:f.t,swapped:false,card,sourceX:rect.left-layout.left+rect.width/2,
  sourceY:rect.top-layout.top+rect.height/2,sourceWidth:rect.width,cover:{value:0},breakup:{value:0},
  altitude:u.air,ground:V(u.pos.x,strideFloor(f,u.pos.x,u.pos.z),u.pos.z)};
 shift.light=megaLight(f);
 shift.ritual=megaRitual(f,shift);
 f.el.classList.add('megaEvolving');
 megaPaintModel(f,u);
 f.buffered=null;
 exSay(f,'',0);
 u.inv=Math.max(u.inv,megaSequence.end+.2);
 u.vel.set(0,0,0);
 tone(300,.35,0,'sine',.045);
 megaHud(f);
 megaRender(f);
}

function finishMegaShift(f,shift){
 shift.cover.value=0;
 shift.card.remove();
 exDrop(f,shift.light.mesh);
 exDrop(f,shift.ritual.group);
 if(shift.particles)exDrop(f,shift.particles.mesh);
 f.el.classList.remove('megaEvolving');
 f.megaShift=null;
}

function tickMega(f){
 const shift=f.megaShift;
 if(!shift)return;
 const {u}=shift,age=f.t-shift.start;
 if(f.p!==u||!u.hp){finishMegaShift(f,shift);return}
 const {draw,seal,beam,swap,dissolve,end}=megaSequence;
 const descend=flowSmooth((age-.62)/(draw-.62)),lift=flowSmooth((age-beam)/.71);
 const settle=flowSmooth((age-dissolve)/(end-dissolve));
 u.air=shift.altitude*(1-descend)+.06*descend+.62*lift*(1-settle);
 u.vel.set(0,0,0);
 if(age>=draw&&!shift.tracing){
  shift.tracing=true;
  tone(146,.56,0,'sine',.05);tone(220,.80,.29,'triangle',.036);tone(330,.65,.67,'sine',.038);
 }
 if(age>=seal&&!shift.sealed){
  shift.sealed=true;
  tone(88,.62,0,'triangle',.10);tone(587,.53,.12,'sine',.05);noise(.85,.28);
 }
 if(age>=swap&&!shift.swapped){
  shift.swapped=true;
  u.d=megaBattleData(u.d);
  f.megaUsed=true;
  exModel(f,u);
 }
 if(age>=dissolve&&u.ready&&!shift.revealing){
  shift.revealing=true;
  shift.particles=megaParticles(f,u);
  chord(4);
 }
 if(age>=end&&u.ready){
  finishMegaShift(f,shift);
  exSay(f,'Mega 喷火龙 X',1);
  exHUD(f,true)
 }
}

function megaLight(f){
 const alpha={value:0};
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{alpha},
  vertexShader:`varying vec2 flareUV;void main(){flareUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 flareUV;uniform float alpha;
  void main(){
   vec2 p=flareUV*2.-1.;
   float d=length(p);
   float veil=exp(-d*d*3.2)*(1.-smoothstep(.68,1.,d));
   gl_FragColor=vec4(mix(vec3(.42,.71,1.),vec3(1.),exp(-d*d*10.)),veil*alpha);
   #include <encodings_fragment>
  }`
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);
 mesh.visible=false;
 mesh.renderOrder=8;
 f.sc.add(mesh);
 return {mesh,alpha}
}

function megaRitual(f,shift){
 const radius=cap(shift.u.viewSpan*.84,2.75,4.10);
 const {ground}=shift,geometry=new THREE.PlaneGeometry(radius*2.52,radius*2.52,32,32);
 geometry.rotateX(-Math.PI/2);
 const positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i)+ground.x,z=positions.getZ(i)+ground.z;
  positions.setY(i,strideFloor(f,x,z)-ground.y+.087);
 }
 const trace={value:0},energy={value:0},opacity={value:0},time={value:0},height={value:0};
 const circle=new THREE.Mesh(geometry,impactMat({trace,energy,opacity,time},planeVS,`
  varying vec2 v;uniform float trace,energy,opacity,time;
  vec2 point(float angle){return vec2(cos(angle),sin(angle))*.734;}
  float stroke(vec2 p,vec2 a,vec2 b,float completion){
   vec2 axis=b-a;float t=clamp(dot(p-a,axis)/dot(axis,axis),0.,completion);
   return length(p-a-axis*t);
  }
  void main(){
   float r=length(v),angle=atan(v.y,v.x),ink=0.,halo=0.;
   for(int i=0;i<6;i++){
    float edge=float(i);
    float a=mod(edge,3.)*2.094395+step(2.5,edge)*3.141593-1.570796;
    float q=clamp(trace*6.-edge,0.,1.);
    vec2 start=point(a),finish=point(a+2.094395);
    float d=stroke(v,start,finish,q),on=step(.001,q);
    ink=max(ink,(1.-smoothstep(.005,.013,d))*on);
    float head=length(v-mix(start,finish,q));
    halo+=on*(exp(-d*36.)*.30+exp(-head*42.)*(1.-step(.999,q))*.9);
   }
   float orbit=step(mod(angle+6.283185,6.283185)/6.283185,min(1.,trace*2.1));
   float outer=(exp(-abs(r-.876)*215.)+.57*exp(-abs(r-.962)*215.))*orbit;
   float ticks=exp(-abs(r-.925)*48.)*pow(abs(sin(angle*27.)),19.);
   float diamonds=max(0.,1.-abs(r-.883)*36.-abs(sin(angle*3.+1.570796))*11.);
   float pulse=exp(-abs(r-.90+mod(time*1.52,1.)*.83)*34.)*energy;
   float rad=.085*exp(-r*r*4.8)*energy;
   vec3 color=mix(vec3(.085,.44,.97),vec3(.68,.93,1.),clamp(ink+outer*.56+energy*.29,0.,1.));
   gl_FragColor=vec4(color,opacity*(ink*.92+halo+outer*.70+orbit*(ticks*.46+diamonds*.58)+pulse*.42+rad));
   #include <encodings_fragment>
  }`,true));
 circle.material.polygonOffset=true;circle.material.polygonOffsetFactor=-3;
 circle.frustumCulled=false;circle.renderOrder=12;
 const columnGeo=new THREE.CylinderGeometry(1,1,1,48,16,true);
 const column=new THREE.Mesh(columnGeo,impactMat({energy,time,height},`
  varying vec2 s;varying vec3 n,eye;uniform float time,height;
  void main(){
   s=uv;
   float w=1.+.028*sin(uv.x*37.699+uv.y*13.-time*12.)+.024*sin(uv.x*81.681-uv.y*17.+time*15.);
   vec3 p=vec3(position.x*w,(position.y+.5)*height,position.z*w);
   vec4 camera=modelViewMatrix*vec4(p,1.);
   eye=-camera.xyz;n=normalMatrix*normal;
   gl_Position=projectionMatrix*camera;
  }`,`
  varying vec2 s;varying vec3 n,eye;uniform float energy,time,height;
  void main(){
   float angle=s.x*6.283185;
   float drift=sin(angle*9.+s.y*2.9-time*4.1);
   float flutes=pow(.5+.5*sin(angle*19.+s.y*4.+drift*.85),7.);
   float fibers=pow(.5+.5*sin(angle*39.-s.y*9.+time*7.),14.);
   float rim=pow(1.-abs(dot(normalize(n),normalize(eye))),3.6);
   float surge=pow(.5+.5*cos(s.y*10.-time*10.+drift*.32),6.);
   float foot=exp(-s.y*height*3.4),fade=1.-smoothstep(.66,1.,s.y);
   vec3 light=mix(vec3(.052,.39,.94),vec3(.67,.92,1.),clamp(flutes*.86+rim*.44+foot*.83,0.,1.));
   gl_FragColor=vec4(light,energy*fade*(.042+flutes*.23+fibers*.11+rim*.21+surge*.070+foot*.35));
   #include <encodings_fragment>
  }`,true));
 column.scale.set(radius*.66,1,radius*.66);
 column.frustumCulled=false;column.renderOrder=11;
 const sparks=blueEmbers(132);
 const group=new THREE.Group();group.add(circle,column,sparks.points);group.position.copy(ground);
 group.visible=false;f.sc.add(group);
 return {group,column,sparks,radius,trace,energy,opacity,time,height};
}

function drawMegaRitual(ritual,age){
 const {group,column,sparks,radius,trace,energy,opacity,time,height}=ritual;
 const {draw,seal,beam,dissolve,end}=megaSequence;
 group.visible=age>=draw;
 if(!group.visible)return;
 trace.value=cap((age-draw)/(seal-draw),0,1);
 time.value=age;
 const fade=1-flowSmooth((age-dissolve-.25)/(end-dissolve-.25));
 const rise=flowSmooth((age-beam)/.64);
 energy.value=rise*fade;
 opacity.value=flowSmooth((age-draw)/.14)*fade;
 column.visible=energy.value>.006;
 height.value=.14+8.4*rise;
 const sparkEnergy=flowSmooth((age-seal+.15)/.34)*fade;
 sparks.points.visible=sparkEnergy>.01;
 if(!sparks.points.visible)return;
 for(let i=0;i<sparks.pos.count;i++){
  const angle=i*2.39996+age*(.70+(i%5)*.19);
  const q=(i*.618033+age*(.47+(i%7)*.047))%1;
  const r=radius*(.54+(i%11)*.043)*(1-q*.40);
  sparks.pos.setXYZ(i,Math.sin(angle)*r,.12+q*height.value*.80,Math.cos(angle)*r);
  sparks.weight.setX(i,Math.sin(Math.PI*q)*sparkEnergy*(.45+(i%6)*.09));
 }
 sparks.pos.needsUpdate=sparks.weight.needsUpdate=true;
}

function megaPaintModel(f,u){
 const shift=f.megaShift;
 if(shift?.u!==u)return;
 const {cover,breakup}=shift,materials=new Set();
 u.body.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.material?.isMeshStandardMaterial||!mesh.visible||materials.has(mesh.material))return;
  const mat=mesh.material,previous=mat.onBeforeCompile,key=mat.customProgramCacheKey();
  materials.add(mat);
  mat.customProgramCacheKey=()=>key+'|mega-silhouette';
  mat.onBeforeCompile=(shader,renderer)=>{
   previous.call(mat,shader,renderer);
   Object.assign(shader.uniforms,{megaCover:cover,megaBreakup:breakup});
   shader.fragmentShader='uniform float megaCover,megaBreakup;\n'+shader.fragmentShader.replace('#include <tonemapping_fragment>',`
    if(megaCover>.001){
     vec3 cell=floor(bp*54.);
     float grain=fract(sin(dot(cell,vec3(23.1,41.7,11.9)))*43758.5);
     float height=clamp(bp.y*.72,.0,1.);
     float threshold=grain*.69+(1.-height)*.31;
     float coating=(1.-smoothstep(threshold-.04,threshold+.08,megaBreakup))*megaCover;
     float line=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.15);
     float light=max(0.,dot(normal,normalize(vec3(-.47,.72,.35))));
     vec3 mask=mix(vec3(.28,.46,.69),vec3(2.75,3.45,4.1),max(line,.42+.58*light));
     float releasing=exp(-abs(megaBreakup-threshold)*24.)*step(.003,megaBreakup);
     gl_FragColor.rgb=mix(gl_FragColor.rgb,mask,coating)+releasing*line*vec3(.42,1.2,2.1)*megaCover;
    }
    #include <tonemapping_fragment>
   `);
  };
  mat.needsUpdate=true;
 });
}

function megaParticles(f,u){
 const rng=seeded(7804),surfaces=[];
 u.root.updateMatrixWorld(true);
 u.body.traverse(m=>{if(m.isMesh&&!m.userData.megaAura&&m.visible&&m.geometry.attributes.position){m.skeleton?.update();surfaces.push(m)}});
 if(!surfaces.length)return null;
 const count=960,positions=[],velocities=[],profiles=[];
 const center=bodyPoint(f,u);
 for(let i=0;i<count;i++){
  const mesh=surfaces[i%surfaces.length],attr=mesh.geometry.attributes.position;
  const n=Math.floor(rng()*attr.count),p=V().fromBufferAttribute(attr,n);
  if(mesh.isSkinnedMesh)mesh.boneTransform(n,p);
  p.applyMatrix4(mesh.matrixWorld);
  positions.push(...p.toArray());
  const radial=p.clone().sub(center).normalize();
  radial.multiplyScalar(.43+rng()*1.38);
  radial.y+=.65+rng()*1.22;
  velocities.push(...radial.toArray());
  profiles.push((1-cap((p.y-u.root.position.y)/u.height,0,1))*.37+rng()*.38,.015+rng()*.032)
 }
 const geo=new THREE.BufferGeometry;
 geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geo.setAttribute('burstVelocity',new THREE.Float32BufferAttribute(velocities,3));
 geo.setAttribute('burstProfile',new THREE.Float32BufferAttribute(profiles,2));
 const uniforms={elapsed:{value:0},viewport:{value:f.el.clientHeight}};
 const mat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:`uniform float elapsed,viewport;attribute vec3 burstVelocity;attribute vec2 burstProfile;varying float alive;
  void main(){
   float local=elapsed-burstProfile.x,t=max(0.,local);
   alive=step(0.,local)*smoothstep(0.,.082,t)*(1.-smoothstep(.31,.67,t));
   vec3 direction=burstVelocity;direction.x+=.4*sin(t*6.+position.z*5.);
   vec4 p=modelViewMatrix*vec4(position+direction*t+vec3(0.,t*t*.75,0.),1.);
   gl_PointSize=clamp(viewport*burstProfile.y/max(.5,-p.z)*(1.-.46*t),1.5,12.);
   gl_Position=projectionMatrix*p;
  }`,
  fragmentShader:`varying float alive;
  void main(){
   float r=length(gl_PointCoord-.5)*2.;
   float alpha=(1.-smoothstep(.13,1.,r))*alive;
   if(alpha<.009)discard;
   gl_FragColor=vec4(mix(vec3(.18,.65,1.),vec3(1.),1.-r*r),alpha);
   #include <encodings_fragment>
  }`
 });
 const mesh=new THREE.Points(geo,mat);
 mesh.frustumCulled=false;mesh.renderOrder=9;
 f.sc.add(mesh);
 return {mesh,uniforms};
}

function megaRender(f){
 const shift=f.megaShift;
 if(!shift||!f.cam)return;
 const {u,card,light}=shift,age=f.t-shift.start;
 const center=bodyPoint(f,u), {arrive,cardEnd,beam,swap,dissolve}=megaSequence;
 f.cam.updateMatrixWorld();
 if(card.isConnected){
  if(age>=cardEnd)card.remove();
  else{
   const p=center.clone().project(f.cam);
   const top=center.clone().add(V(0,u.height*.66,0)).project(f.cam);
   const across=V(1,0,0).applyQuaternion(f.cam.quaternion);
   const left=center.clone().addScaledVector(across,-u.viewSpan*.57).project(f.cam);
   const right=center.clone().addScaledVector(across,u.viewSpan*.57).project(f.cam);
   const w=f.el.clientWidth,h=f.el.clientHeight,travel=flowSmooth(age/arrive);
   const x=shift.sourceX+(cap((p.x+1)*w/2,w*.23,w*.77)-shift.sourceX)*travel;
   const y=shift.sourceY+(cap((1-p.y)*h/2,h*.27,h*.70)-shift.sourceY)*travel-Math.sin(Math.PI*travel)*h*.12;
   const target=cap(Math.max(Math.abs(top.y-p.y)*h*.74,(right.x-left.x)*w*.40),Math.min(152,w*.45),Math.min(280,w*.69,h*.43));
   const blur=flowSmooth((age-arrive)/(cardEnd-arrive));
   const scale=(shift.sourceWidth+(target-shift.sourceWidth)*travel)/216*(1-.12*blur);
   const turn=360*travel+12*blur,roll=-24*Math.sin(Math.PI*travel)-9*blur;
   const back=turn>90&&turn<270,face=turn-(back?180:turn>=270?360:0);
   card.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) perspective(720px) scale(${scale}) rotate(${roll}deg) rotateX(${14*Math.sin(Math.PI*travel)}deg) rotateY(${face}deg)`;
   card.classList.toggle('showBack',back);
   card.style.opacity=String(1-blur);
   card.style.setProperty('--foil-x',`${(travel*155-28)%155}%`);
   card.style.setProperty('--foil-angle',`${116+77*travel}deg`);
  }
 }
 drawMegaRitual(shift.ritual,age);
 shift.cover.value=flowSmooth((age-beam-.11)/(swap-beam-.15));
 shift.breakup.value=cap((age-dissolve)/1.06,0,1)*1.10;
 light.mesh.position.copy(center);
 light.mesh.quaternion.copy(f.cam.quaternion);
 const width=Math.min(3.8,Math.max(1.3,u.viewSpan*.64));
 light.mesh.scale.set(width,u.height*1.15,1);
 const bloom=flowEnvelope(age,beam+.06,swap-.07,dissolve+.54);
 light.alpha.value=bloom*.64;
 light.mesh.visible=bloom>.005;
 if(shift.particles){
  shift.particles.uniforms.elapsed.value=age-dissolve;
  shift.particles.uniforms.viewport.value=f.r.domElement.height
 }
}

const megaSurface=`
 float azure=smoothstep(.025,.17,base.b-base.r);
 float ebony=(1.-smoothstep(.13,.35,lum))*(1.-azure);
 float horn=smoothstep(.27,.62,lum)*(1.-azure);
 float iris=smoothstep(.10,.36,base.r-base.g)*(1.-azure)*smoothstep(.69,.81,bp.y);
 float scaleEdge=smoothstep(.21,.65,detail.r);
 float crest=smoothstep(.46,.89,bp.y);
 vec3 graphite=mix(vec3(.013,.017,.025),vec3(.056,.066,.088),mottle*.62+crest*.21);
 graphite*=.86+.23*scaleEdge;
 diffuseColor.rgb=mix(diffuseColor.rgb,graphite,ebony*.92);
 float striation=sin(91.*bp.x+54.*bp.y+19.*bp.z+3.*sin(bp.x*21.+bp.z*15.));
 float membrane=azure*MEGA_WING;
 float chest=azure*(1.-MEGA_WING);
 vec3 wing=mix(vec3(.012,.031,.089),vec3(.033,.14,.29),.14+.77*mottle);
 wing*=.84+.19*smoothstep(.04,.25,lum)+.075*striation;
 vec3 underside=mix(vec3(.049,.19,.32),vec3(.15,.48,.64),.25+.62*mottle);
 float plate=sin(bp.y*107.+5.1*bp.z+4.6*bp.x*bp.x);
 underside*=.91+.12*plate;
 diffuseColor.rgb=mix(diffuseColor.rgb,wing,membrane*.81);
 diffuseColor.rgb=mix(diffuseColor.rgb,mix(underside,base,.30),chest*.67);
 diffuseColor.rgb=mix(diffuseColor.rgb,base*vec3(.69,.72,.74),horn*.82);
 diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.47,.070,.052),iris*.74);
 relief=mix(relief,.5+.075*striation,membrane*.85);
 relief=mix(relief,.5+.11*plate,chest*.58);
 relief=mix(relief,.5,horn*.75+iris*.22);
`;

function sculptMegaCharizard(geometry){
 const p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const neck=flowSmooth((y-3.75)/.65)*(1-flowSmooth((y-4.9)/.65));
  const shoulder=neck*(1-flowSmooth((Math.abs(x)-.72)/1.45));
  const crown=flowSmooth((y-6.08)/.78)*(1-flowSmooth((z-1.15)/.95));
  p.setXYZ(i,x*(1+.055*shoulder+.075*crown),y+.14*crown,z-.21*crown);
 }
 p.needsUpdate=true;
 geometry.computeBoundingSphere()
}

// The alternate character is a static GLB. Weight its existing geometry around
// anatomical joints so the original combat pose system can drive the new form.
function rigMegaCharizard(scene){
 scene.updateMatrixWorld(true);
 const meshes=[];
 scene.traverse(m=>{
  if(!m.isMesh)return;
  m.geometry.applyMatrix4(m.matrixWorld);
  sculptMegaCharizard(m.geometry);
  meshes.push(m)
 });
 const tailSection=meshes[0].geometry.attributes.position;
 const tipCenter=V();
 let tipVertices=0,tailEnd=Infinity;
 for(let i=0;i<tailSection.count;i++)if(Math.abs(tailSection.getX(i))<2.5)tailEnd=Math.min(tailSection.getZ(i),tailEnd);
 for(let i=0;i<tailSection.count;i++){
  const x=tailSection.getX(i),y=tailSection.getY(i),z=tailSection.getZ(i);
  if(z>tailEnd+.24||Math.abs(x)>2.5)continue;
  tipCenter.x+=x;tipCenter.y+=y;tipCenter.z+=z;tipVertices++;
 }
 if(tipVertices)tipCenter.divideScalar(tipVertices);
 else tipCenter.set(0,2.46,-7.30);
 const skinned=new THREE.Group,spine=[];
 function bone(name,x,y,z,parent=null){
  const joint=new THREE.Bone;
  joint.name=name;
  joint.position.set(x,y,z);
  if(parent){joint.position.sub(parent.rest);parent.joint.add(joint)}
  else skinned.add(joint);
  const ref={joint,rest:V(x,y,z),index:spine.length};
  spine.push(ref);return ref
 }
 const hips=bone('Hips',0,2.81,-.18),chest=bone('Spine2',0,4.16,.28,hips);
 const neck=bone('Neck1',0,4.83,.73,chest),neck2=bone('Neck2',0,5.29,1.07,neck);
 const head=bone('Head',0,5.90,1.82,neck2);
 bone('EndHead',0,6.04,2.92,head);
 const jaw=bone('Jaw',0,5.45,2.38,head);
 const tail=[];
 let prev=hips;
 for(const [i,[y,z]] of [[2.49,-.92],[2.10,-1.76],[1.69,-2.71],[1.46,-3.70],[1.49,-4.74],[1.72,-5.69],[2.11,-6.63]].entries()){
  prev=bone('Tail'+(i+1),0,y,z,prev);
  tail.push(prev);
 }
 const tailTip=bone('EndTail7',tipCenter.x,tipCenter.y,tipCenter.z,prev);
 const sides=[-1,1].map(sign=>{
  const p=sign>0?'L':'R',arm=bone(p+'Arm',sign*.93,4.33,.48,chest);
  const elbow=bone(p+'ForeArm',sign*1.88,4.10,.72,arm);
  const hand=bone(p+'Hand',sign*3.02,4.12,.95,elbow);
  const thigh=bone(p+'Thigh',sign*.84,2.69,.05,hips);
  const shin=bone(p+'Leg',sign*1.39,1.25,.22,thigh);
  const foot=bone(p+'Foot',sign*1.45,.47,1.06,shin);
  const wing=bone(p+'Feeler1',sign*1.0,4.26,-.63,chest);
  const mid=bone(p+'Feeler2',sign*2.83,5.43,-1.36,wing);
  const tip=bone(p+'Feeler3',sign*4.69,5.98,-1.63,mid);
  return {arms:[chest,arm,elbow,hand],legs:[hips,thigh,shin,foot],wings:[wing,mid,tip]}
 });
 skinned.updateMatrixWorld(true);
 const skeleton=new THREE.Skeleton(spine.map(v=>v.joint));
 const point=V();
 for(const [layer,source] of meshes.entries()){
  const geometry=source.geometry,pos=geometry.attributes.position;
  const membrane=layer===2||layer===3;
  source.material.userData.megaMembrane=membrane;
  const indices=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
  for(let i=0;i<pos.count;i++){
   point.fromBufferAttribute(pos,i);
   const x=Math.abs(point.x),{y,z}=point,side=sides[point.x>0?1:0];
   const distribution=new Map;
   const add=(bones,strength)=>{
    if(strength<=.0001)return;
    const mass=bones.map(bone=>1/Math.pow(.33+point.distanceToSquared(bone.rest),1.85));
    const total=mass.reduce((a,b)=>a+b,0);
    bones.forEach((bone,j)=>distribution.set(bone.index,(distribution.get(bone.index)||0)+strength*mass[j]/total))
   };
   if(membrane){
    const flex=flowSmooth((x-.78)/1.1);
    add(side.wings,flex);
    add([chest,side.wings[0]],1-flex);
   }else{
    const tailWeight=flowSmooth((-z-.62)/.90)*(1-flowSmooth((x-1.14)/.75))*(1-flowSmooth((y-3.08)/.59));
    const tailTipWeight=1-flowSmooth((z-tailEnd-.25)/.65);
    const headWeight=flowSmooth((y-4.72)/.91);
    const jawWeight=flowSmooth((z-2.27)/.58)*(1-flowSmooth((y-5.48)/.30));
    const armWeight=flowSmooth((x-.77)/.52)*flowSmooth((y-2.91)/.69);
    const legWeight=flowSmooth((x-.28)/.58)*(1-flowSmooth((y-2.30)/.65));
    const trunk=(1-tailWeight)*(1-tailTipWeight);
    add([tail.at(-1),tailTip],tailTipWeight);
    add([hips,...tail],tailWeight*(1-tailTipWeight));
    add([neck,neck2,head],trunk*headWeight*(1-jawWeight));
    add([head,jaw],trunk*headWeight*jawWeight);
    const body=trunk*(1-headWeight);
    add(side.arms,body*armWeight);
    add(side.legs,body*(1-armWeight)*legWeight);
    add([hips,chest,neck,neck2],body*(1-armWeight)*(1-legWeight));
   }
   const nearest=[...distribution].sort((a,b)=>b[1]-a[1]).slice(0,4);
   const sum=nearest.reduce((n,b)=>n+b[1],0);
   nearest.forEach(([index,w],j)=>{indices[i*4+j]=index;weights[i*4+j]=w/sum});
  }
  geometry.setAttribute('skinIndex',new THREE.BufferAttribute(indices,4));
  geometry.setAttribute('skinWeight',new THREE.BufferAttribute(weights,4));
  const mesh=new THREE.SkinnedMesh(geometry,source.material);
  mesh.name=source.name;mesh.frustumCulled=false;
  skinned.add(mesh);mesh.bind(skeleton,skeleton.bones[0].parent.matrixWorld);
 }
 return skinned;
}
