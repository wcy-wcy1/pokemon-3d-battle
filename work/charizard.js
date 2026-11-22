const charizardTiming={grab:.42,launch:1.42,hidden:1.93,dive:2.93,impact:3.29,eruption:4.20};

const charizardSurface=`
 float membrane=smoothstep(.022,.16,base.b-base.r)*smoothstep(.018,.09,base.g-base.r);
 float orange=smoothstep(.07,.25,base.r-base.g)*smoothstep(.10,.32,base.g-base.b);
 float belly=smoothstep(.015,.10,base.g-base.b)*(1.-smoothstep(.065,.24,base.r-base.g))*smoothstep(.22,.62,lum);
 float mouth=smoothstep(.020,.13,base.b-base.g)*(1.-membrane);
 float dorsal=smoothstep(.30,.86,bp.y);
 float stripe=sin(bp.y*36.+bp.z*23.+3.2*sin(bp.z*8.)+3.5*abs(bp.x));
 float speckles=smoothstep(.60,.89,detail.g);
 float rimScale=smoothstep(.19,.57,detail.r);
 vec3 copper=mix(vec3(.27,.062,.012),vec3(.74,.224,.035),mottle*.68+.29*(1.-dorsal));
 copper*=.84+.15*rimScale+.065*stripe*dorsal-.16*speckles;
 vec3 parchment=mix(vec3(.30,.185,.090),vec3(.73,.52,.27),smoothstep(.20,.70,lum)*(.62+.25*mottle));
 float folds=sin(bp.x*71.+bp.y*49.+2.*sin(bp.z*38.))*.58+sin(bp.y*125.+bp.z*48.)*.42;
 vec3 wing=mix(vec3(.016,.067,.074),vec3(.070,.24,.247),mottle*.53+.26);
 wing*=.76+.37*smoothstep(.055,.38,lum)+folds*.10;
 diffuseColor.rgb=mix(diffuseColor.rgb,mix(copper,base,.12),orange);
 diffuseColor.rgb=mix(diffuseColor.rgb,parchment,belly*.93);
 diffuseColor.rgb=mix(diffuseColor.rgb,wing,membrane);
 diffuseColor.rgb=mix(diffuseColor.rgb,base*vec3(.66,.47,.45),mouth*.55);
 relief=mix(relief,.50+.05*folds,membrane*.85);
 relief=mix(relief,.50+.09*sin(bp.y*76.+bp.z*7.),belly*.62);
`;
const charizardEyes=`
 float iris=smoothstep(.021,.16,base.b-base.r);
 float orange=smoothstep(.07,.25,base.r-base.g)*smoothstep(.10,.32,base.g-base.b);
 vec3 eyeColor=mix(vec3(.016,.075,.088),vec3(.113,.38,.42),smoothstep(.045,.42,lum));
 vec3 eyeRidge=mix(vec3(.28,.062,.013),vec3(.55,.151,.022),mottle*.56+.22);
 diffuseColor.rgb=mix(diffuseColor.rgb,eyeRidge,orange);
 diffuseColor.rgb=mix(diffuseColor.rgb,base*mix(.49,.81,smoothstep(.025,.66,lum)),(1.-orange)*(1.-iris));
 diffuseColor.rgb=mix(diffuseColor.rgb,eyeColor,iris);
 relief=mix(.5,relief,orange*.65);
`;

function startCharizardFlight(f,a){
 const u=a.u,target=a.player?f.e:f.p;
 const approach=target.pos.clone().sub(u.pos);
 const reach=Math.max(0,Math.min(11,approach.length()-.68));
 if(approach.lengthSq()>.001)a.dir.copy(approach).normalize();
 else if(a.dir.lengthSq()<.001)a.dir.set(Math.sin(u.face),0,Math.cos(u.face));
 const rush=u.pos.clone().addScaledVector(a.dir,reach);
 const landing=a.aim.clone();
 landing.y=0;
 landing.clampLength(0,13.1);
 for(const b of f.blocks){
  const offset=V(landing.x-b.x,0,landing.z-b.z),distance=offset.length(),radius=b.r+.58;
  if(distance>=radius)continue;
  if(distance<.001)offset.copy(a.dir).negate();
  landing.set(b.x,0,b.z).addScaledVector(offset.normalize(),radius).clampLength(0,13.1)
 }
 const yaw=Math.atan2(a.dir.x,a.dir.z);
 a.charFlight={start:u.pos.clone(),rush,landing,target,air:u.air,yaw,landed:false};
 u.face=yaw;
 u.vel.set(0,0,0);
 tone(82,.94,0,'triangle',.08);
 exSay(f,'喷火龙 · 地脉喷发',1.1)
}

function charizardSpin(a,age){
 const c=charizardTiming;
 const dive=cap((age-c.dive)/(c.impact-c.dive),0,1);
 return a.charFlight.yaw+Math.PI*6*dive**2.35
}

function charizardInversion(age){
 const c=charizardTiming;
 return flowSmooth((age-c.dive)/.145)*(1-flowSmooth((age-c.impact)/.23))
}

function charizardHoldProfile(u,v){
 const localJoint=(actor,names,fallback)=>{
  const bone=actor.motion?.joints(...names);
  return bone?actor.body.worldToLocal(bone.getWorldPosition(V())):fallback;
 };
 const chest=localJoint(u,['spine2','chest'],V(0,u.height*.53,u.height*.43));
 const torso=localJoint(v,['spine2','chest','spine1','hips'],V(0,v.height*.47,0));
 const halfWidth=cap(Math.min(v.frameSize?.x*.29||v.height*.24,v.height*.26),.058,.45);
 const halfDepth=cap(Math.min(v.frameSize?.z*.18||v.height*.23,v.height*.24),.055,.42);
 const torsoInArms=chest.clone();
 torsoInArms.x=0;
 torsoInArms.y=Math.max(chest.y-.06,torso.y+.025);
 torsoInArms.z+=u.height*.105+halfDepth;
 return {torso,torsoInArms,halfWidth,halfDepth};
}

function placeCharizardVictim(f,a,age){
 const s=a.charFlight,v=s.victim,u=a.u;
 const tip=charizardInversion(age),yaw=charizardSpin(a,age);
 s.pose=new THREE.Euler(Math.PI*tip,yaw,0,'YXZ');
 const hold=flowSmooth((age-charizardTiming.grab)/.12);
 const {torso,torsoInArms}=s.holdProfile;
 const local=torsoInArms.clone().add(V(torso.x,-torso.y,torso.z)).applyEuler(s.pose);
 const goal=u.pos.clone().add(local);
 v.pos.set(s.grabbedAt.x+(goal.x-s.grabbedAt.x)*hold,0,s.grabbedAt.z+(goal.z-s.grabbedAt.z)*hold);
 v.air=Math.max(0,s.victimAir+(u.air+local.y+groundY(u.pos.x,u.pos.z,f.z)-groundY(v.pos.x,v.pos.z,f.z)-s.victimAir)*hold);
 s.heldTorso=torso.clone().applyAxisAngle(V(0,1,0),Math.PI).applyEuler(s.pose)
  .add(V(v.pos.x,groundY(v.pos.x,v.pos.z,f.z)+v.air,v.pos.z));
 v.face=yaw+Math.PI
}

function charizardFlightStep(f,a,age){
 const u=a.u,s=a.charFlight,c=charizardTiming;
 if(s.landed){u.air=u.height*.80*charizardInversion(age);return}
 if(age<c.grab){
  const progress=flowSmooth(age/c.grab),desired=s.start.clone().lerp(s.rush,progress);
  u.air=s.air+((s.target.air||0)-s.air)*progress;
  exMove(f,u,desired.x-u.pos.x,desired.z-u.pos.z);
  return
 }
 if(!s.victim){
  const v=s.target;
  if(v!== (a.player?f.e:f.p)||!v.hp||v.inv>0||dst(u.pos,v.pos)>1.55||
    Math.abs(bodyPoint(f,u).y-bodyPoint(f,v).y)>u.height*.75+v.height*.38){
   u.cmd=null;u.lastClip=null;
   exSay(f,'抓取落空',.9);return
  }
  s.victim=v;s.grabbedAt=v.pos.clone();s.victimAir=v.air;
  s.holdProfile=charizardHoldProfile(u,v);
  s.holdPos=u.pos.clone();s.holdAir=u.air;
  stopPower(f,v);v.cmd=null;v.swing=0;v.vel.set(0,0,0);
  charizardImpactShadow(f,a);
  tone(115,.12,0,'triangle',.09)
 }
 if(age<c.launch){
  u.air=s.holdAir*(1-flowSmooth((age-c.grab)/.56));
  u.pos.copy(s.holdPos);
 }else if(age<c.hidden){
  const ascent=(age-c.launch)/(c.hidden-c.launch);
  u.pos.copy(s.holdPos);
  u.air=.16+14*ascent**1.85;
  if(!s.lifted){s.lifted=true;noise(.25,.13);exFx(f,s.holdPos,0xf69037,1.35)}
 }else if(age<c.dive){
  u.pos.copy(s.landing);u.air=14.16;
 }else if(age<c.impact){
  const descent=(age-c.dive)/(c.impact-c.dive);
  u.pos.copy(s.landing);
  u.air=u.height*.80*charizardInversion(age)+14.16*(1-descent**1.10);
  if(!s.diving){s.diving=true;noise(.25,.14);tone(108,.28,0,'sawtooth',.06)}
 }else{
  s.landed=true;u.pos.copy(s.landing);u.air=u.height*.80;u.highFlight=false;
  placeCharizardVictim(f,a,c.impact);
  const victim=s.victim;s.victim=null;
  a.impactCommitted=true;beginLandscape(f,a);
  startQuake(f,a,s.landing,true);
  f.shake=Math.max(f.shake,.37);
  exFx(f,s.landing,0xff9f43,3.2);
  tone(43,.55,0,'triangle',.15);noise(.38,.20);navigator.vibrate?.(58);
  exSay(f,'地脉破裂',1);
  victim.air=0;victim.vy=0;
  exHurt(f,victim,a.power*.64,a.d,true,a.dir,.75,false);
  return
 }
 placeCharizardVictim(f,a,age)
}

function charizardHolding(f,u){
 const own=f.p.cmd,opponent=f.e.cmd;
 if(own?.charFlight?.victim===u)return own;
 if(opponent?.charFlight?.victim===u)return opponent;
 return null
}

function charizardBuried(f,u){
 const a=u.cmd?.charFlight?u.cmd:charizardHolding(f,u);if(!a)return false;
 const age=f.t-a.t,c=charizardTiming;
 return age>=c.hidden&&age<c.dive
}

function charizardGrabArms(f,u,g,rotate){
 const a=u.cmd,hold=a.charFlight,{halfWidth,halfDepth}=hold.holdProfile;
 const grip=flowSmooth((f.t-a.t-charizardTiming.grab)/.12);
 const right=V(1,0,0).applyEuler(hold.pose),forward=V(0,0,1).applyEuler(hold.pose);
 const up=V(0,1,0).applyEuler(hold.pose);
 for(const side of ['l','r']){
  const shoulder=g.joints(side+'arm'),elbow=g.joints(side+'forearm'),hand=g.joints(side+'hand');
  if(!shoulder||!elbow||!hand)continue;
  const sign=side==='l'?1:-1;
  const start=shoulder.getWorldPosition(V()),mid=elbow.getWorldPosition(V()),paw=hand.getWorldPosition(V());
  const upper=start.distanceTo(mid),lower=mid.distanceTo(paw);
  if(Math.min(upper,lower)<.01)continue;
  const contact=hold.heldTorso.clone().addScaledVector(right,sign*halfWidth*.87)
   .addScaledVector(forward,Math.min(.08,halfDepth*.56)).addScaledVector(up,-.045);
  const reach=contact.sub(start),span=cap(reach.length(),Math.abs(upper-lower)+.001,(upper+lower)*.995);
  reach.normalize();
  const elbowOut=right.clone().multiplyScalar(sign).addScaledVector(up,-.68);
  elbowOut.addScaledVector(reach,-elbowOut.dot(reach)).normalize();
  const along=(span*span+upper*upper-lower*lower)/(2*span);
  const bend=Math.sqrt(Math.max(0,upper*upper-along*along));
  const elbowGoal=start.clone().addScaledVector(reach,along).addScaledVector(elbowOut,bend);
  const handGoal=start.clone().addScaledVector(reach,span);
  const steer=(joint,child,point)=>{
   const origin=joint.getWorldPosition(V());
   const current=child.getWorldPosition(V()).sub(origin).normalize(),desired=point.clone().sub(origin).normalize();
   const axis=current.clone().cross(desired);
   if(axis.lengthSq()>.00001)rotate(joint,axis.normalize(),current.angleTo(desired)*grip)
  };
  steer(shoulder,elbow,elbowGoal);
  steer(elbow,hand,handGoal)
 }
}

function charizardImpactShadow(f,a){
 const c=charizardTiming,center=a.charFlight.landing.clone(),geo=new THREE.PlaneGeometry(1,1,14,14).rotateX(-Math.PI/2);
 const weight={value:0};
 const mat=new THREE.ShaderMaterial({
  uniforms:{weight},transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,
  vertexShader:`varying vec2 disc;void main(){disc=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 disc;uniform float weight;
  void main(){
   float r=length(disc);
   float core=(1.-smoothstep(.56,.99,r))*weight,fringe=exp(-pow((r-.81)*16.,2.))*weight*.27;
   gl_FragColor=vec4(mix(vec3(.018,.010,.012),vec3(.27,.040,.009),fringe),core+fringe);
   #include <encodings_fragment>
  }`
 });
 const mesh=new THREE.Mesh(geo,mat);
 mesh.frustumCulled=false;mesh.renderOrder=4;
 const points=geo.attributes.position,coords=Array.from({length:points.count},(_,i)=>[points.getX(i),points.getZ(i)]);
 flare(f,c.impact-c.grab+.17,g=>{g.add(mesh);g.visible=false;g.userData.grabShadow=true},g=>{
  const t=f.t-a.t;
  g.visible=a.u.cmd===a&&t>=c.hidden-.12&&t<c.impact+.11;
  if(!g.visible)return;
  const size=flowSmooth((t-c.hidden+.12)/(c.impact-c.hidden+.12)),diameter=.57+size*5.1;
  weight.value=(.47+.26*size)*(1-flowSmooth((t-c.impact)/.105));
  for(const [i,[px,pz]] of coords.entries()){
   const x=center.x+px*diameter,z=center.z+pz*diameter*.76;
   points.setXYZ(i,x,strideFloor(f,x,z)+.052,z)
  }
  points.needsUpdate=true
 })
}

function charizardVictimPose(f,u){
 const capture=charizardHolding(f,u);if(!capture)return;
 const pose=capture.charFlight.pose;if(!pose)return;
 u.body.rotation.set(pose.x,pose.y+Math.PI,0,'YXZ');
 u.body.position.y=0;
 u.body.visible=!charizardBuried(f,u)
}

function charizardTail(f,u,g,rotate,right,up,dt,cues){
 const rig=u.charizard,chain=rig.tailMotionChain;
 const v=dt>0&&rig.tailAir!=null?cap((u.air-rig.tailAir)/dt,-14,14):0;
 rig.tailAir=u.air;
 const decay=1-Math.exp(-dt*4.7);
 rig.tailTurn+=(cap((g.turn||0)*1.42+(g.side||0)*g.weight*.25,-1,1)-rig.tailTurn)*decay;
 rig.tailHeave+=(cap(v/8,-1,1)-rig.tailHeave)*decay;
 const swing=f.t*(2.85+g.weight*.6);
 const yaw=-rig.tailTurn*.22+Math.sin(swing)*(.072+.026*g.weight);
 const pitch=-.13*rig.tailHeave-.05*cues.thrust+.07*cues.drop+.15*cues.compression;
 for(const [i,joint] of rig.tail.entries()){
  const state=chain[i],prior=chain[i-1];
  const targetYaw=prior?.yaw??yaw,targetPitch=prior?.pitch??pitch;
  const follow=1-Math.exp(-dt*(i===0?15:11.8));
  state.yaw+=(targetYaw-state.yaw)*follow;
  state.pitch+=(targetPitch-state.pitch)*follow;
  const flex=.61+i*.15;
  rotate(joint,up,flex*state.yaw+.046*flex*Math.sin(swing-i*.70));
  rotate(joint,right,flex*state.pitch+.035*flex*Math.sin(.89*swing-i*.53-.87));
 }
}

function charizardPose(f,u,g,rotate,fw,right,up,dt){
 const rig=u.charizard;if(!rig)return;
 const a=u.cmd,cast=a?.charFlight,c=charizardTiming,t=cast?f.t-a.t:0;
 const lift=cast?flowSmooth((t-c.grab)/.61)*(1-flowSmooth((t-c.launch)/.26)):0;
 const lookUp=cast?flowSmooth((t-c.grab)/.61)*(1-flowSmooth((t-c.hidden)/.15)):0;
 const climb=cast?flowSmooth((t-c.launch)/.24):0;
 const drop=cast?flowSmooth((t-c.dive+.06)/.15)*(1-flowSmooth((t-c.impact)/.22)):0;
 const compression=cast?flowEnvelope(t,c.impact-.02,c.impact+.09,c.impact+.42):0;
 const thrust=climb*(1-flowSmooth((t-c.hidden)/.3));
 const strain=lift+thrust+drop;
 const age=a?f.t-a.t:0;
 const megaDive=a?.megaSkill===3?flowEnvelope(age,megaFall.peak-.08,megaFall.crash-.06,megaFall.crash+.24):0;
 charizardTail(f,u,g,rotate,right,up,dt,{thrust,drop:drop+megaDive,compression});
 if(a?.megaSkill===3){
  const load=flowEnvelope(age,0,megaFall.lift*.67,megaFall.lift+.12);
  const rise=flowEnvelope(age,megaFall.lift,megaFall.lift+.23,megaFall.peak);
  const dive=flowEnvelope(age,megaFall.peak-.14,megaFall.crash-.08,megaFall.crash+.23);
  const land=flowEnvelope(age,megaFall.crash-.04,megaFall.crash+.095,megaFall.crash+.43);
  const faceOff=flowEnvelope(age,megaFall.emerge,megaFall.crest,megaFall.seal);
  const raise=flowEnvelope(age,megaFall.crest-.27,megaFall.seal-.16,megaFall.seal+.03);
  const press=flowEnvelope(age,megaFall.seal-.12,megaFall.seal,megaFall.end);
  const banking=flowEnvelope(age,megaFall.lift+.04,megaFall.peak-.07,megaFall.crash-.08);
  const bankSign=Math.sin(f.az-u.face)>=0?1:-1;
  u.body.rotation.order='YXZ';
  u.body.rotation.x=.24*load-.46*rise+1.34*dive+.23*land-.13*raise+.34*press;
  u.body.rotation.z=bankSign*.44*banking;
  u.body.position.y-=u.height*(.078*load+.13*land+.11*press);
  rotate(g.joints('spine2'),right,.14*load-.16*rise+.26*land+.19*press);
  rotate(g.joints('neck1'),right,-.18*rise+.20*dive-.21*land);
  rotate(g.head,right,-.32*rise+.23*dive-.25*land-.23*faceOff+.15*press);
  rotate(g.joints('jaw'),right,.19*rise+.15*land+.19*faceOff);
  for(const wing of rig.wings){
   const sweep=.24*load+.68*rise*Math.sin(age*19-wing.delay)-.53*dive+.42*land-.39*raise+.75*press;
   rotate(wing.bone,fw,wing.sign*sweep*(.58+.42*wing.fade));
   rotate(wing.bone,up,wing.sign*wing.fade*(-.47*dive+.21*land));
  }
  for(const [side,sign] of [['l',1],['r',-1]]){
   const arm=g.joints(side+'arm'),elbow=g.joints(side+'forearm');
   rotate(arm,fw,-sign*(.57+.28*raise-.19*press));
   rotate(arm,up,-sign*(.12+.32*faceOff+.41*press));
   rotate(arm,right,-.36*rise+.52*dive-.46*land-.54*raise+.68*press);
   rotate(elbow,right,-.52*raise+.63*press);
  }
  for(const leg of g.limbs){
   rotate(leg.hip,right,.17*load-.30*rise+.46*dive-.28*land);
   rotate(leg.shin,right,-.33*load+.26*rise-.46*dive+.37*land);
  }
  return
 }
 if(!cast){
  const battle=f.mode==='live',breath=Math.sin(u.lifeRig.breath);
  const focus=battle&&f.e?.ready&&u.cmd;
  rotate(g.joints('spine2'),right,.032*breath-(focus?.07:0));
  rotate(g.joints('neck2'),right,.058*breath-(battle?.065:.02));
  rotate(g.head,right,.025*breath+(focus?.14:.055));
  rotate(g.joints('jaw'),right,.055*Math.max(0,breath)+(focus?.09:0));
  if(u.d.mega){
   const first=a?.megaSkill===0?flowEnvelope(age,.055,.202,.318):0;
   const second=a?.megaSkill===0?flowEnvelope(age,.245,.361,.554):0;
   const lotus=a?.megaSkill===1;
   const draw=lotus?flowEnvelope(age,.02,.39,.81):0;
   const gather=lotus?flowSmooth((age-.37)/.62)*(1-flowSmooth((age-a.wind+.19)/.35)):0;
   const liftBud=lotus?flowEnvelope(age,.83,1.31,a.wind+.12):0;
   const recoil=lotus?flowEnvelope(age,a.wind-.18,a.wind+.055,a.total):0;
   rotate(g.joints('hips'),up,.16*(second-first));
   rotate(g.joints('spine2'),up,.37*(second-first)-.08*gather+.17*recoil);
   rotate(g.joints('spine2'),right,-.22*draw+.16*gather-.26*liftBud+.28*recoil);
   rotate(g.joints('neck1'),right,-.31*draw+.23*gather-.22*liftBud-.09*recoil);
   rotate(g.joints('jaw'),right,.24*draw+.075*gather+.24*recoil);
   u.body.rotation.z+=.13*(first-second);
   u.body.rotation.x+=.15*Math.max(first,second)+.19*gather-.18*liftBud+.15*recoil;
   u.body.position.y-=u.height*(.065*Math.max(first,second)+.12*gather-.07*liftBud);
   for(const [side,sign] of [['l',1],['r',-1]]){
    rotate(g.joints(side+'arm'),fw,-sign*(.58-.095*g.weight+.045*breath));
    rotate(g.joints(side+'forearm'),up,sign*(.33+.055*breath));
    if(a?.megaSkill===0){
     const age=f.t-a.t,contact=side==='l'?.18:.34;
     const windup=flowEnvelope(age,contact-.15,contact-.073,contact-.012);
     const slash=side==='l'?first:second;
     rotate(g.joints(side+'arm'),up,sign*(.43*windup-1.02*slash));
     rotate(g.joints(side+'arm'),right,.37*windup-.83*slash);
     rotate(g.joints(side+'forearm'),up,sign*(.26*windup-.58*slash));
    }
    if(lotus){
     rotate(g.joints(side+'arm'),fw,sign*(.62*draw-.20*gather-.23*liftBud+.18*recoil));
     rotate(g.joints(side+'arm'),up,sign*(.46*draw-.86*gather-.68*recoil));
     rotate(g.joints(side+'arm'),right,.25*draw-.45*gather-.78*liftBud-.82*recoil);
     rotate(g.joints(side+'forearm'),up,-sign*(.94*gather+.43*liftBud-.24*recoil));
     rotate(g.joints(side+'forearm'),right,-.66*gather-.38*liftBud+.52*recoil);
     rotate(g.joints(side+'hand'),right,-.24*gather-.21*liftBud+.34*recoil);
    }
   }
   for(const wing of rig.wings){
    const delay=wing.delay*.07,at=age-delay;
    const press=a?.megaSkill===1?flowEnvelope(at,a.wind-.055,a.wind+.103,a.wind+.64):0;
    rotate(wing.bone,fw,wing.sign*(-.62*draw+.33*gather-.27*liftBud+.66*press)*(.55+.45*wing.fade));
    rotate(wing.bone,up,wing.sign*(first-second)*.18*wing.fade);
   }
  }
  for(const wing of rig.wings){
   const flap=Math.sin(f.t*(4.8+g.weight*2.1)-wing.delay);
   const amplitude=u.d.mega?.19+.11*wing.fade:.29;
   rotate(wing.bone,fw,wing.sign*amplitude*flap);
   if(u.d.mega)rotate(wing.bone,up,wing.sign*(.074+.042*flap)*wing.fade);
  }
  return
 }
 u.body.rotation.order='YXZ';
 const rush=1-flowSmooth((t-c.grab+.12)/.23);
 if(t<c.hidden){
  u.body.rotation.x=0;
  u.body.rotation.z=0
 }else{
  u.body.rotation.y=charizardSpin(a,t);
  u.body.rotation.x=Math.PI*charizardInversion(t)+.17*compression;
  u.body.rotation.z=0
 }
 u.body.rotation.x+=.32*rush;
 if(cast.victim)u.body.position.y=0;
 else u.body.position.y-=u.height*(.055*lift+.14*compression);
 rotate(g.joints('neck1'),right,-.23*lookUp+.18*compression);
 rotate(g.joints('neck2'),right,-.22*lookUp+.11*drop);
 rotate(g.joints('neck3'),right,-.12*lookUp);
 rotate(g.head,right,-.27*lookUp+.12*drop);
 rotate(g.joints('jaw'),right,.26*lift+.12*compression);
 for(const wing of rig.wings){
  const sweep=lift*(.26+.22*Math.sin(t*5-wing.delay))+thrust*.50*Math.sin(t*31-wing.delay)-drop*.46;
  rotate(wing.bone,fw,wing.sign*sweep*(u.d.mega?.62+.38*wing.fade:1));
  rotate(wing.bone,up,wing.sign*(.13*lift-.30*drop)*wing.fade)
 }
 for(const leg of g.limbs){
  rotate(leg.hip,right,.35*lift-.40*thrust+.30*drop-.21*compression);
  rotate(leg.shin,right,-.46*lift+.33*thrust-.29*drop+.39*compression);
 }
 if(cast.victim)charizardGrabArms(f,u,g,rotate);
 else for(const arm of g.arms)rotate(arm,right,.21*strain-.32*compression-.47*rush);
}

function charizardFireEnvelope(parent,mega){
 const uniforms={time:{value:0},ignite:{value:0},tail:{value:0},eye:{value:V()},blue:{value:mega?1:0}};
 const material=new THREE.ShaderMaterial({
  uniforms,transparent:true,depthWrite:false,
  vertexShader:`varying vec3 local;void main(){local=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 local;
  uniform float time,ignite,tail,blue;uniform vec3 eye;
  float hash(vec3 p){p=fract(p*.3183099+vec3(.11,.27,.43));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float noise3(vec3 p){
   vec3 i=floor(p),v=fract(p);v=v*v*(3.-2.*v);
   return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),v.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),v.x),v.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),v.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),v.x),v.y),v.z);
  }
  void main(){
   vec3 dir=normalize(local-eye);
   vec3 exitFace=mix(vec3(-1.),vec3(1.),step(vec3(0.),dir));
   vec3 distances=abs(exitFace-local)/max(abs(dir),vec3(.0001));
   const int steps=${mega?8:20};
   float end=min(min(distances.x,distances.y),distances.z),stepSize=end/float(steps);
   vec3 color=vec3(0.);float opacity=0.;
   for(int i=0;i<steps;i++){
    vec3 p=local+dir*(float(i)+.5)*stepSize;
    p.y=p.y*(1.+tail*.5)-tail*.5;
    ${mega?'if(dot(p.xz,p.xz)>1.06)continue;':''}
    float y=p.y*.5+.5;
    vec3 stream=p*vec3(4.3,2.7,4.3);
    stream.y+=time*(tail>.05?5.5+tail*.9:-5.2);
    stream.xz+=vec2(sin(4.*p.y+time*4.),cos(4.*p.y+time*3.8))*.76;
    float detail=${mega?'noise3(stream)*.82+.09+.09*sin(dot(stream,vec3(2.3,3.1,2.6)))':'noise3(stream)*.78+noise3(stream*2.3)*.22'};
    float angle=atan(p.z,p.x);
    float licks=sin(angle*7.+p.y*4.8-time*6.+detail*3.1);
    vec2 drift=vec2(sin(p.y*6.+time*4.),cos(p.y*7.+time*4.4))*.10*y;
    float r=length(p.xz+drift);
    float wall=(.66+.16*sin(y*3.9))*(1.-.61*smoothstep(.50,1.,y))+.17*licks+.2*(detail-.5);
    float sheet=1.-smoothstep(.040,.24,abs(r-wall));
    float tip=.83+.19*licks+(detail-.47)*.25;
    float tongues=smoothstep(.33,.71,detail+.13*(1.-y))*sheet;
    float litFront=1.-smoothstep(.82+.21*ignite,1.19+.21*ignite,y+(detail-.5)*.26);
    litFront*=smoothstep(y-.14,y+.12,ignite*1.26);
    float rim=(1.-smoothstep(.88,.998,length(p)))*smoothstep(.015,.17,y)*(1.-smoothstep(tip-.23,tip,y));
    float core=(tongues*.80+sheet*.075)*litFront*rim;
    float trailU=clamp((-p.y-.28)/(.72+tail),0.,1.);
    float taper=.77*pow(1.-trailU,.66);
    vec2 eddy=vec2(sin(p.y*7.+time*12.),cos(p.y*6.+time*10.))*.11*trailU;
    float wakeR=length(p.xz+eddy)/max(.025,taper);
    float wakeBody=1.-smoothstep(.22,1.12,wakeR+.20*licks+.19*(detail-.5));
    float strands=smoothstep(.28,.79,detail+.18*sin(angle*8.+p.y*7.-time*8.));
    float wake=step(.03,tail)*smoothstep(.17,.67,-p.y)*(1.-smoothstep(.52,1.,trailU))*wakeBody*(.33+.67*strands);
    vec3 emberGrid=vec3(p.x*16.,p.y*12.+time*19.,p.z*16.);
    float emberSeed=hash(floor(emberGrid));
    vec3 emberCell=(fract(emberGrid)-.5)*vec3(1.8,.74,1.8);
    float sparks=step(.945,emberSeed)*(1.-smoothstep(.12,.33,length(emberCell)));
    sparks*=step(.03,tail)*smoothstep(.20,.59,trailU)*(1.-smoothstep(.80,1.,trailU))
       *smoothstep(.55,.95,wakeR)*(1.-smoothstep(1.30,2.30,wakeR))*.70;
    float alpha=clamp(max(core,max(wake,sparks))*stepSize*4.65*ignite,0.,.96);
    float heat=smoothstep(.29,.81,detail+.16*(1.-y));
    vec3 fire=mix(vec3(.50,.018,.003),vec3(2.55,.36,.012),heat);
    fire=mix(fire,vec3(3.0,1.24,.18),smoothstep(.74,1.,heat)*.63);
    fire=mix(fire,vec3(.86,.052,.008),smoothstep(.25,.92,trailU)*.65);
    fire=mix(fire,vec3(4.2,1.10,.13),smoothstep(.03,.25,sparks));
    vec3 azure=mix(vec3(.009,.10,.63),vec3(.15,1.18,3.3),heat);
    azure=mix(azure,vec3(1.60,3.0,4.3),max(smoothstep(.73,.99,heat),smoothstep(.02,.24,sparks)));
    fire=mix(fire,azure,blue);
    color+=fire*alpha*(1.-opacity);
    opacity+=alpha*(1.-opacity);
   }
   if(opacity<.008)discard;
   gl_FragColor=vec4(color/opacity,opacity*.90);
   #include <tonemapping_fragment>
   #include <encodings_fragment>
  }`
 });
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),material);
 mesh.visible=false;mesh.renderOrder=6;
 mesh.onBeforeRender=(_renderer,_scene,camera)=>{
  uniforms.eye.value.copy(camera.position);
  mesh.worldToLocal(uniforms.eye.value)
 };
 parent.add(mesh);
 return {mesh,uniforms}
}

function bindCharizard(f,u){
 if(u.d.id!==6||!u.motion)return;
 const get=u.motion.joints,tip=get('endtail7','tail7');if(!tip)return;
 const group=new THREE.Group;
 u.root.add(group);
 const geo=new THREE.PlaneGeometry(2,1).translate(0,.5,0);
 const clock={value:0},power={value:1},blue={value:u.d.mega?1:0};
 const mat=new THREE.ShaderMaterial({uniforms:{clock,power,blue},side:THREE.DoubleSide,transparent:true,depthWrite:false,
 vertexShader:`varying vec2 uvFlame;void main(){uvFlame=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float clock,power,blue;varying vec2 uvFlame;
 float hash(vec2 p){return fract(sin(dot(p,vec2(43.18,157.64)))*43758.54);}
 float noise2(vec2 p){
  vec2 b=floor(p),r=fract(p);r=r*r*(3.-2.*r);
  return mix(mix(hash(b),hash(b+vec2(1.,0.)),r.x),mix(hash(b+vec2(0.,1.)),hash(b+vec2(1.,1.)),r.x),r.y);
 }
 void main(){
  float y=uvFlame.y,x=uvFlame.x*2.-1.;
  vec2 advect=vec2(x*3.,y*6.-clock*4.);
  float curl=noise2(advect*.74+vec2(8.,2.))-.5;
  float eddies=noise2(advect)*.58+noise2(advect*2.2+clock*.18)*.28+noise2(advect*4.7)*.14;
  float plume=1.-length(vec2((x+curl*y*.84)*(.82+.82*y),y*.97))-.37*y;
  float fuel=plume+(eddies-.49)*(.45+.61*y);
  float opacity=smoothstep(.065,.275,fuel)*(1.-smoothstep(.74,.99,y))*smoothstep(0.,.10,y);
  if(opacity<.014)discard;
  float heat=smoothstep(.14,.67,fuel)*(1.-.83*y);
  vec3 amber=vec3(.82,.099,.008),gold=vec3(1.90,.49,.036);
  vec3 flame=mix(amber,gold,smoothstep(.06,.38,heat));
  flame=mix(flame,vec3(3.05,1.40,.32),smoothstep(.26,.68,heat));
  vec3 azure=mix(vec3(.02,.09,.55),vec3(.38,2.0,3.9),smoothstep(.03,.53,heat));
  flame=mix(flame,azure,blue);
  gl_FragColor=vec4(flame,opacity*power);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
 }`});
 const flames=[{bone:tip,width:.33,height:.96,group:new THREE.Group}];
 for(const [name,width,height] of [['hips',.36,.78],['spine2',.40,.95],['head',.29,.76],['lhand',.22,.52],['rhand',.22,.52],['lfeeler2',.19,.55],['rfeeler2',.19,.55]]){
  const bone=get(name);if(bone)flames.push({bone,width,height,group:new THREE.Group})
 }
 for(const [i,source] of flames.entries()){
  group.add(source.group);
  if(u.d.mega&&i===0)continue;
  for(let j=0;j<3;j++){
   const flame=new THREE.Mesh(geo,mat);flame.rotation.y=j*Math.PI/3+i;
   flame.renderOrder=5;source.group.add(flame)
  }
 }
 const envelope=charizardFireEnvelope(group,u.d.mega);
 const megaAura=u.d.mega?createMegaAura(u,group,geo,mat):null;
 const firelight=new THREE.PointLight(u.d.mega?0x2aa7ff:0xff722a,0,4.5,1.7);
 group.add(firelight);
 u.body.traverse(m=>{if(m.isMesh&&['Material_15','Material_16'].includes(m.material?.name))m.visible=false});
 const tail=Array.from({length:7},(_,i)=>get('tail'+(i+1))).filter(Boolean),wings=[];
 for(const side of ['l','r'])for(let i=1;i<=3;i++){
  const bone=get(side+'feeler'+i);
  if(bone)wings.push({bone,sign:side==='l'?1:-1,delay:i*.33,fade:1/i})
 }
 const tailMotionChain=tail.map(()=>({yaw:0,pitch:0}));
 u.charizard={group,flames,clock,power,tail,wings,envelope,firelight,megaAura,tailMotionChain,tailTurn:0,tailHeave:0,tailLast:V(),tailMotion:V(),tailReady:false};
}

function createMegaAura(u,parent,geometry,material){
 const group=new THREE.Group;
 parent.add(group);
 const mouth=Array.from({length:3},(_,i)=>{
  const flame=new THREE.Group;
  group.add(flame);
  for(let j=0;j<2;j++){
   const mesh=new THREE.Mesh(geometry,material);
   mesh.rotation.y=j*Math.PI/2+i;
   mesh.renderOrder=5;
   flame.add(mesh);
  }
  return flame;
 });
 const uniforms={fireTime:{value:0},strength:{value:0}};
 const skinFire=new THREE.ShaderMaterial({
  uniforms,skinning:true,transparent:true,depthWrite:false,
  vertexShader:`attribute vec3 animalCoord;
  varying vec3 site,viewNormal,sight;
  uniform float fireTime,strength;
  #include <skinning_pars_vertex>
  void main(){
   #include <beginnormal_vertex>
   #include <skinbase_vertex>
   #include <skinnormal_vertex>
   #include <begin_vertex>
   #include <skinning_vertex>
   site=animalCoord;
   float wave=sin(site.x*27.+site.z*36.+site.y*12.-fireTime*13.);
   float fold=sin(site.z*18.-site.x*22.+site.y*19.-fireTime*10.);
   float fuel=smoothstep(-.76,1.05,wave+.49*fold);
   float zone=smoothstep(.08,.21,site.y)*(1.-smoothstep(.75,.94,site.y));
   transformed+=objectNormal*(.07+.46*fuel)*zone*strength;
   transformed.y+=fuel*zone*strength*.78;
   vec4 view=modelViewMatrix*vec4(transformed,1.);
   sight=-view.xyz;viewNormal=normalize(normalMatrix*objectNormal);
   gl_Position=projectionMatrix*view;
  }`,
  fragmentShader:`uniform float fireTime,strength;varying vec3 site,viewNormal,sight;
  float curl(vec3 p){return sin(p.x*1.7+p.y*1.15+sin(p.z*2.0+p.y*.70));}
  void main(){
   vec3 p=site*vec3(21.,17.,24.);p.y-=fireTime*16.;
   float roll=curl(p)+.48*curl(p*1.9+vec3(4.,1.,7.));
   float hot=smoothstep(.32,1.21,roll);
   float tongue=smoothstep(-.15,.85,roll);
   float skinAngle=abs(dot(normalize(viewNormal),normalize(sight)));
   float edge=pow(1.-skinAngle,1.5);
   float mask=smoothstep(.085,.22,site.y)*(1.-smoothstep(.75,.93,site.y));
   float alpha=mask*strength*tongue*(.23+.66*edge+.12*hot);
   if(alpha<.012)discard;
   vec3 blue=mix(vec3(.02,.12,1.1),vec3(.065,.78,2.25),hot);
   blue=mix(blue,vec3(.41,1.35,2.35),hot*edge*.64);
   gl_FragColor=vec4(blue,alpha);
   #include <tonemapping_fragment>
   #include <encodings_fragment>
  }`
 });
 const surfaces=[];
 u.body.traverse(m=>{
  if(m.isSkinnedMesh&&m.geometry.attributes.animalCoord&&['Object_2','Object_3','Object_6'].includes(m.name))surfaces.push(m)
 });
 const shell=surfaces.map(source=>{
  const flame=new THREE.SkinnedMesh(source.geometry,skinFire);
  flame.userData.borrowedGeometry=true;
  flame.userData.megaAura=true;
  flame.frustumCulled=false;
  flame.renderOrder=5;
  source.add(flame);
  flame.bind(source.skeleton,source.bindMatrix);
  flame.visible=false;
  return flame
 });
 if(!shell.length)skinFire.dispose();
 return {group,shell,uniforms,mouth};
}

function updateMegaAura(f,u,rig,wrapping){
 const aura=rig.megaAura;
 if(!aura)return;
 const age=f.megaShift?.u===u?f.t-f.megaShift.start:null;
 const emerge=age==null?1:flowSmooth((age-megaSequence.dissolve-.35)/.59);
 const strength=emerge*(1-wrapping);
 aura.group.visible=strength>.03;
 for(const shell of aura.shell)shell.visible=aura.group.visible;
 aura.uniforms.fireTime.value=f.t;
 aura.uniforms.strength.value=strength;
 if(!aura.group.visible)return;
 const yaw=u.body.rotation.y,t=f.t;
 const snout=u.motion.joints('endhead','head');
 const head=(snout?snout.getWorldPosition(V()):bodyPoint(f,u)).sub(u.root.position);
 const up=V(0,1,0),side=V(Math.cos(yaw),0,-Math.sin(yaw)),forward=V(Math.sin(yaw),0,Math.cos(yaw));
 const breath=((t+u.lifeRig.seed*.31)%2.85);
 for(const [i,flame] of aura.mouth.entries()){
  const time=breath-i*.086,glow=time>=0&&time<.59?Math.sin(Math.PI*time/.59)*strength:0;
  flame.visible=glow>.035;
  if(!flame.visible)continue;
  flame.position.copy(head).addScaledVector(forward,.038+time*.82).addScaledVector(side,(i-1)*.090*(1+time));
  flame.position.y+=-.027+time*.21+.035*Math.sin(t*21+i);
  flame.quaternion.setFromUnitVectors(up,forward.clone().multiplyScalar(.77).add(V(0,.57,0)).normalize());
  flame.scale.set(glow*.12,glow*(.40+.26*time),glow*.12);
 }
}

function charizardFireStep(f,u,dt){
 const rig=u.charizard;if(!rig)return;
 const hidden=charizardBuried(f,u);
 u.body.visible=!hidden;rig.group.visible=!hidden&&u.hp>0;
 if(!rig.group.visible){rig.tailReady=false;rig.firelight.intensity=0;return}
 const a=u.cmd,c=charizardTiming,t=a?.charFlight?f.t-a.t:0;
 if(a?.charFlight&&t>=c.grab&&t<c.hidden){
  u.body.rotation.x=0;
  u.body.rotation.z=0
 }
 const charge=a?.charFlight?flowSmooth(t/.46)*(1-flowSmooth((t-c.impact)/.65)):0;
 const rising=!!a?.charFlight&&t>=c.launch&&t<c.hidden;
 const diving=!!a?.charFlight&&t>=c.dive&&t<c.impact;
 const speeding=rising||diving;
 const hold=a?.charFlight,victim=hold?.victim;
 const wrapping=victim?flowSmooth((t-c.grab-.09)/.45):0;
 const separateFlames=hold?.landed?flowSmooth((t-c.impact-.06)/.37):1-wrapping;
 const progress=speeding?cap((t-(rising?c.launch:c.dive))/(rising?c.hidden-c.launch:c.impact-c.dive),0,1):0;
 const speed=rising?14*1.85*progress**.85/(c.hidden-c.launch):diving?14.16*1.10*progress**.10/(c.impact-c.dive):0;
 const flightBlend=flowSmooth(speed/46)*flowSmooth(progress/.24);
 const evolving=f.megaShift?.u===u?f.megaShift.cover.value*(1-flowSmooth(f.megaShift.breakup.value)):0;
 rig.clock.value=f.t;
 const up=V(0,1,0),direction=V(),tip=V();
 for(const [i,source] of rig.flames.entries()){
  const strength=(i===0?separateFlames:hold?.landed?0:charge*separateFlames)*(1-evolving);
  source.group.visible=strength>.025;
  if(!source.group.visible){if(i===0)rig.tailReady=false;continue}
  source.bone.getWorldPosition(tip);source.group.position.copy(tip).sub(u.root.position);
  if(i===0){
   if(rig.tailReady&&dt>0)rig.tailMotion.lerp(tip.clone().sub(rig.tailLast).divideScalar(dt).clampLength(0,9),1-Math.exp(-dt*9));
   else rig.tailMotion.set(0,0,0);
   rig.tailLast.copy(tip);rig.tailReady=true
  }
  direction.set(-.12*(f.wind?.value||0),1,0);
  if(i===0)direction.addScaledVector(rig.tailMotion,-.13);
  if(speeding){direction.y=t<c.hidden?-.94:1.5;direction.x-=Math.sin(u.face)*.64;direction.z-=Math.cos(u.face)*.64}
  if(direction.lengthSq()<.02)direction.copy(up);
  source.group.quaternion.setFromUnitVectors(up,direction.normalize());
  const flicker=.94+.10*Math.sin(f.t*16+i)+.075*Math.sin(f.t*27-i*.9);
  const baseSize=i===0?(1+charge*.42)*Math.max(.69,u.height*.45):Math.max(.86,u.height*.73);
  const scale=baseSize*strength;
  source.group.scale.set(source.width*scale*flicker,source.height*scale*(speeding?1.55:1)*flicker,source.width*scale*flicker)
 }
 const tail=rig.flames[0].group;
 rig.firelight.position.copy(tail.position).y+=.38;
 rig.firelight.position.lerp(direction.set(0,u.height*.69,0),charge*.81);
 rig.firelight.intensity=(.46+3.4*charge)*(1+.14*Math.sin(f.t*21))*(1-evolving);
 const {mesh,uniforms}=rig.envelope;
 const plunge=a?.megaSkill===3&&!a.sent?flowSmooth((f.t-a.t-megaFall.peak+.11)/.22):0;
 mesh.visible=wrapping>.01||plunge>.02;
 if(plunge>.02){
  mesh.position.set(0,u.height*.52+plunge*.93,0);
  mesh.quaternion.setFromUnitVectors(V(0,1,0),a.flightDir||V(0,-1,0));
  if(a.flightDir)mesh.position.addScaledVector(a.flightDir,-plunge*.24);
  mesh.scale.set(u.height*.63,u.height*(.79+.58*plunge),u.height*.74);
  uniforms.time.value=f.t;
  uniforms.ignite.value=plunge;
  uniforms.tail.value=plunge*1.64;
 }else if(mesh.visible){
  const chest=u.motion.joints('spine2','chest');
  const center=chest?chest.getWorldPosition(tip):bodyPoint(f,u);
  mesh.position.copy(center).lerp(hold.heldTorso,.44).sub(u.root.position);
  mesh.quaternion.setFromEuler(hold.pose);
  const size=.80+.20*wrapping,bulk=cap(victim.height*.25,0,.66);
  const radiusY=Math.max(u.height,victim.height*.78)*.75*size,trail=flightBlend*(diving?5.6:4.9);
  if(speeding){
   const travelUp=diving?-1:1;
   mesh.quaternion.setFromEuler(new THREE.Euler(diving?Math.PI:0,hold.pose.y,0,'YXZ'));
   mesh.position.y-=travelUp*trail*.50;
  }
  mesh.scale.set((u.height*.55+bulk)*size,radiusY+trail*.50,(u.height*.70+bulk)*size);
  uniforms.time.value=f.t;
  uniforms.ignite.value=wrapping;
  uniforms.tail.value=trail/radiusY
 }
 const chargeLotus=megaLotusCharge(f,u);
 updateMegaAura(f,u,rig,Math.max(wrapping,plunge,chargeLotus*.985));
 if(a?.megaSkill===1&&!a.sent&&a.lotus){
  a.lotus.position.copy(megaLotusHands(a));
  rig.firelight.position.copy(a.lotus.position).sub(u.root.position);
  rig.firelight.intensity=(1.8+.45*Math.sin(f.t*19))*chargeLotus;
 }
}
