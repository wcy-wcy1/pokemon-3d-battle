// Luminous flow lives in the beam's local forward axis. Shader noise is continuous in time.
function flowingBreath(f,a,origin,dir,dist){
 const solar=a.k==='solar',wide=a.skill===3?1.42:1,d=Math.max(.08,dist);
 const geo=new THREE.CylinderGeometry(solar?.14:.68,solar?.085:.10,d,24,12,true);geo.rotateX(Math.PI/2);geo.translate(0,0,d/2);
 const uniforms={age:{value:0},solar:{value:solar?1:0}};
 const mat=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
 vertexShader:`varying vec2 st;uniform float age,solar;void main(){st=uv;vec3 p=position;float t=uv.y;
 float pulse=sin(t*24.-age*31.)*.12+sin(t*13.+uv.x*12.56-age*22.)*.12;
 p.xy*=1.+pulse*(1.-solar);p.x+=t*t*(1.-solar)*.22*sin(t*10.-age*14.);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:impactNoise+`\nvarying vec2 st;uniform float age,solar;
 void main(){float p=st.y,u=st.x*6.283;
 float thread=.5+.5*sin(u*5.+p*27.-age*28.+2.*sin(u*2.+p*16.-age*13.));
 if(solar<.5){vec2 uvw=vec2(cos(u)*.9+sin(u)*.55+p*1.3,p*5.-age*7.);float eddy=noise(uvw*1.9)*.57+noise(uvw*4.1)*.30+noise(uvw*8.)*.13;thread=smoothstep(.19,.76,eddy);}
 float end=1.-smoothstep(.74,1.,p);float glow=smoothstep(.12,.85,thread);
 vec3 c=mix(mix(vec3(1.,.07,.009),vec3(1.,.82,.19),glow*(1.-.53*p)),mix(vec3(.45,1.,.13),vec3(1.,1.,.69),thread),solar);
 gl_FragColor=vec4(c,(.25+.64*glow)*mix(end,1.,solar)*(1.-smoothstep(.55,1.,age)));
 #include <encodings_fragment>
 }`});
 flare(f,solar?.48:.58,g=>{g.position.copy(origin);g.quaternion.setFromUnitVectors(V(0,0,1),dir);g.add(new THREE.Mesh(geo,mat));g.scale.set(wide,wide,.015);
 for(let j=0;j<(solar?8:18);j++){let m=part(g,solar?new THREE.OctahedronGeometry(.07):new THREE.IcosahedronGeometry(.085,0),solar?0xf4ffe2:j%3?0xff9025:0xffdc77,0,0,0,.9,true);m.userData.phase=j*.618%1}},
 (g,t)=>{uniforms.age.value=t;g.scale.z=Math.min(1,.02+t*9);for(let i=1;i<g.children.length;i++){let m=g.children[i],q=(m.userData.phase+t*1.6)%1,ang=i*2.4+q*(solar?8:3),r=solar?.17:.10+.56*q;m.position.set(Math.cos(ang)*r,Math.sin(ang)*r,q*d);m.scale.set(.6,.6,solar?3.2:1.7);m.material.opacity=(1-q)*(1-t)}})
}
function moveTell(f,a){
 const u=a.u,k=a.k,fam=family(k),fire=['inferno','burn','ember','plume','fang'].includes(k),size=cap(u.height*.24,.22,.85),style=choreo[u.d.id].a;
 if(a.skill===1&&['thunder','rock','rockfall','waterfall'].includes(k)){terrainCast(f,a);return}
 if(a.skill===1&&k==='boulders'){rockVolleyTell(f,a);return}
 if(a.skill===1&&[135,136,197].includes(u.d.id)){evoFieldCast(f,a);return}
 if(a.skill===1&&[144,145,146].includes(u.d.id)){frontTell(f,a);return}
 if(a.skill===3)ultimateTell(f,a);
 if(k==='psystrike'){lockPsystrike(f,a);return}if(k==='song'||fam==='contact'&&!fire)return; // the limb's anticipation is the telegraph
 flare(f,a.wind,g=>{for(let i=0;i<10;i++){let leaf=k==='solar'||k==='vine',m=part(g,leaf?new THREE.SphereGeometry(1,6,3):new THREE.OctahedronGeometry(1),leaf?(i%2?0xadeda0:0xffed99):fire?(i%2?0xff611d:0xffc761):a.c);m.scale.set(.048,.09,.033);m.rotation.z=i}g.visible=false},(g,t)=>{g.visible=u.cmd===a;if(!g.visible)return;g.position.copy(socket(f,u,style));g.rotation.y=u.face;for(let i=0;i<10;i++){let m=g.children[i],ang=i*2.4+t*(fire?.8:2.3),r=(1-t)*size*1.95+.035;m.position.set(Math.cos(ang)*r,fire?size*(1-t)*Math.sin(ang)-.10:Math.sin(ang)*r,fire?(1-t)*size*1.3:Math.sin(ang*1.3)*r*.65);m.material.opacity=Math.sin(Math.PI*t)*.85}})
}
function bladeSweep(f,a){
 const u=a.u,H=cap(u.height,.8,5),dual=a.k==='fury';
 for(const sign of dual?[-1,1]:[1]){
 let geo=new THREE.BufferGeometry,buf=new Float32Array(18*6),ix=[];for(let j=0;j<17;j++){let k=2*j;ix.push(k,k+1,k+2,k+1,k+3,k+2)}geo.setIndex(ix);geo.setAttribute('position',new THREE.BufferAttribute(buf,3));
 flare(f,.32,g=>{let start=socket(f,u,'hands',sign);g.position.copy(start);g.rotation.y=u.face;let m=new THREE.Mesh(geo,ink(0xa4ffb6,.9,true));m.frustumCulled=false;g.add(m)},(g,t)=>{let h=cap(t*1.8-(sign<0?.18:0),0,1);for(let j=0;j<18;j++){let q=Math.max(0,h-(1-j/17)*.55),theta=-1.15+q*2.55;for(let s=0;s<2;s++){let rad=H*(.28+.11*s*Math.sin(Math.PI*j/17));let off=(j*2+s)*3;buf[off]=sign*Math.sin(theta)*rad;buf[off+1]=(.52-q)*H*.40;buf[off+2]=Math.cos(theta)*rad}}geo.attributes.position.needsUpdate=true;g.children[0].material.opacity=(1-t)*.95})
 }
}
function specialImpact(f,a,u){
 let fire=['inferno','burn','ember','plume','fang'].includes(a.k),frost=['ice','blizzard'].includes(a.k),bind=['vine','silk'].includes(a.k),sun=a.k==='solar',blade=['cut','fury'].includes(a.k);
 if(!fire&&!frost&&!bind&&!sun&&!blade)return false;
 let p=bodyPoint(f,u),rad=cap(u.height*.26,.22,1);
 if(u.hp>0&&a.skill&&fire&&u.d.type!=='火')u.scorch={left:2,next:.78,atk:a.d};
 if(u.hp>0&&a.skill&&(frost||bind))u.slowUntil=f.t+(frost?1.7:1.15);
 if(a.skill)return true;
 flare(f,fire?.82:.48,g=>{g.position.copy(p);for(let j=0;j<12;j++){let m=part(g,frost?new THREE.ConeGeometry(.09,.42,4):new THREE.OctahedronGeometry(.08),fire?(j%2?0xffad32:0xff5320):frost?0xa3edff:bind?0x99c975:sun?0xf6ffa1:0xeaffde);m.rotation.z=j;}},
 (g,t)=>g.children.forEach((m,j)=>{let ang=j*2.4,r=rad*(.3+t);m.position.set(Math.cos(ang)*r,Math.sin(ang)*r*.5+(fire?t*t*1.05:0),Math.sin(j*4.7)*r);m.scale.set(.8,blade?2.6:fire?1.8:1,.8);m.material.opacity=1-t}));return true
}
function skillAftermath(f,dt){
 for(const u of [f.p,f.e]){let s=u.scorch;if(!s)continue;
 if(f.wx?.phase==='active'&&['surge','thunder'].includes(f.wx.type)){u.scorch=null;continue}
 s.left-=dt;s.next-=dt;if(s.next<=0&&s.left>0){s.next+=.78;exHurt(f,u,Math.max(2,s.atk.atk*.085),null,false);if(f.down)return}if(s.left<=0)u.scorch=null}
}
function castingAccent(f,u,g,rotate,fw,right,up){
 if(u.d.id===104){let n=g.joints,s=u.flyingClub,catchAge=f.t-(u.catchAt??-5),reach=s?.phase==='back'?.56:0;rotate(n('rarm'),right,-reach+.22*Math.max(0,1-catchAge/.20));if(u.cmd?.k==='bone'){let cmd=u.cmd,q=cap((f.t-cmd.t)/cmd.wind,0,1),swing=Math.sin(Math.PI*cap((f.t-cmd.t-cmd.wind)/.34,0,1));rotate(n('spine1'),up,-.35*q*(1-swing)+.42*swing);rotate(n('rarm'),up,-.65*q*(1-swing)+.75*swing);rotate(n('rforearm'),right,.42*q*(1-swing)-.52*swing)}}
 let a=u.cmd;if(!a)return;let age=f.t-a.t,load=cap(age/a.wind,0,1)*(1-cap((age-a.wind)/.12,0,1)),fire=Math.sin(Math.PI*cap((age-a.wind)/(a.total-a.wind),0,1)),n=g.joints;
 if(['inferno','burn','ember','water','ice'].includes(a.k)){rotate(n('neck','neck1'),right,-.16*load+.12*fire);rotate(n('jaw','lowerbeak'),right,.23*load+.33*fire);u.body.rotation.x+=.08*load-.09*fire}
 if(a.k==='mewpalm')palmPose(f,u,g,rotate,fw,right,up);
 if(a.k==='fault'){let hold=Math.sin(Math.PI*.5*cap(age/.72,0,1))*(1-cap((age-faultSnap)/.42,0,1));rotate(n('rightarm01'),up,-.76*hold);rotate(n('rightarm01'),right,-.60*hold);rotate(n('rightarm02'),right,.29*hold);rotate(n('righthand'),fw,.42*hold);rotate(g.head,right,.09*hold)}
 if(a.k==='psystrike'){for(let s of ['left','right']){let sign=s==='left'?1:-1;rotate(n(s+'arm01',s+'upperarm',s+'arm'),right,-.26*load+.17*fire);rotate(n(s+'hand'),fw,sign*(.31*load-.37*fire))}rotate(g.head,right,.10*load-.12*fire)}
 if(a.k==='solar'){rotate(n('spine1'),right,-.11*load+.13*fire);rotate(n('feelera1','feeler'),right,-.32*load+.20*fire);for(let leg of g.limbs)rotate(leg.shin,right,(leg.front?-.11:.16)*load)}
}
function contactBeat(f,a,target,t){
 if(a.k==='barrage'){
  const slot=fourFists.findIndex(stamp=>t>=stamp&&t<stamp+.079);if(slot<0||(a.punches||0)&(1<<slot)||target.inv>0)return;
  a.punches=(a.punches||0)|(1<<slot);strikeHit(f,{...a,hit:false,power:a.power*.25,energyShare:.25,fist:slot},target);return
 }
 if(a.k!=='fury')return strikeHit(f,a,target);
 const beat=t<.225?1:2;if((a.blades||0)&beat)return;
 a.blades=(a.blades||0)|beat;
 strikeHit(f,{...a,hit:false,power:a.power*.57},target)
}
function castSound(k,fam){if(k==='song'||k==='mewpalm')return;if(k==='psystrike'){tone(310,.25,0,'sine',.039);tone(318,.25,0,'sine',.039);return}
 if(['inferno','burn','ember','plume'].includes(k)){noise(.55,.20);tone(96,.26,0,'sawtooth',.038)}
 else if(k==='solar'){tone(523,.21,0,'sine',.05);tone(1046,.29,.045,'triangle',.044)}
 else if(['cut','fury','claw'].includes(k)){noise(1.8,.055);if(k==='fury')tone(690,.065,.13,'triangle',.042)}
 else if(['ice','blizzard'].includes(k)){for(let i=0;i<3;i++)tone(1080+i*370,.13,i*.036,'sine',.035)}
 else{tone(fam==='beam'?540:fam==='pulse'?139:fam==='zone'?95:190,.17,0,fam==='beam'?'triangle':'sine',.075);if(fam==='contact'||fam==='zone')noise(.62,.1)}
}
// The ultimate tell follows its caster; the impact belongs to the actual hit position.
function ultimateTell(f,a){
 const u=a.u,r=cap((u.height||1)*.55,1.15,3.3),release=.46;
 flare(f,a.wind+release,g=>{
  g.userData.ultimate='cast';
  for(let i=0;i<5;i++){const pts=Array.from({length:17},(_,j)=>{let v=j/16,angle=i*Math.PI*.4+v*2.3;return V(Math.cos(angle)*(1-.73*v),v*1.75,Math.sin(angle)*(1-.73*v))});stroke(g,pts,i%2?a.c:0xffe7a7,.034,true)}
  for(let j=0;j<2;j++){let m=hoop(g,j?a.c:0xffdc78,1,j?.065:.024);m.rotation.x=Math.PI/2}
 },(g,q,age)=>{if(!a.sent&&u.cmd!==a){g.visible=false;return}
  const wind=cap(age/a.wind,0,1),t=cap((age-a.wind)/release,0,1);
  g.position.copy(bodyPoint(f,u));g.position.y-=cap(u.height*.28,.1,.9);
  g.rotation.y=wind*1.7+t*2;
  g.children.forEach((m,i)=>{if(i<5){let w=r*(1.35-.72*wind+1.35*Math.sqrt(t));m.scale.set(w,r*(.4+wind+.85*t),w);m.material.opacity=(.35+.6*wind)*(1-t)**2}
   else{m.scale.setScalar(r*(1.3-.48*wind+Math.sqrt(t)*(i===5?2.4:1.55)));m.position.y=i===5?.02:.1;m.material.opacity=(.45+.45*wind)*(1-t)}})
 })
}
