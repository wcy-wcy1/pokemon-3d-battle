// Keep the outgoing *displayed* pose at action boundaries. Decay the local
// difference instead of filtering the animation continuously (which delays contact).
function initCombatFlow(u){
 if(!u.model3d)return;const joints=[];
 u.body.traverse(b=>{if(b.isBone&&!/end|socket/i.test(b.name))joints.push(b)});
 u.flow={cmd:null,valid:false,t:0,span:0,applied:false,serial:0,baseY:0,seenY:0,offsetY:0,
  nodes:[u.body,...joints].map(b=>({b,seen:new THREE.Quaternion,base:new THREE.Quaternion,offset:new THREE.Quaternion})),
  q:new THREE.Quaternion,unit:new THREE.Quaternion}
}
function undoCombatFlow(u){
 const s=u.flow;if(!s?.applied)return;
 for(const n of s.nodes)n.b.quaternion.copy(n.base);u.body.position.y=s.baseY;s.applied=false
}
function blendCombatFlow(f,u,dt){
 const s=u.flow;if(!s)return;
 const cmd=u.cmd||null,change=cmd!==s.cmd,live=f.mode==='live'&&!f.down,active=live&&s.valid&&dt>0;
 if(change&&active){
  s.t=f.t;s.span=cmd?Math.min(.105,cmd.wind*.68):cap(.16*Math.pow((u.d.kg||24)/24,.12),.11,.23);
  s.offsetY=cap(s.seenY-u.body.position.y,-.16*u.height,.16*u.height);
  for(const n of s.nodes)n.offset.copy(n.b.quaternion).invert().multiply(n.seen).normalize()
 }
 if(!active)s.span=0;s.cmd=cmd;
 const k=s.span?cap((f.t-s.t)/s.span,0,1):1,weight=(1-k)*(1-k)*(1+2*k);
 s.baseY=u.body.position.y;
 for(const n of s.nodes){
  if(weight>.0001){n.base.copy(n.b.quaternion);n.b.quaternion.multiply(s.q.copy(s.unit).slerp(n.offset,weight))}
  n.seen.copy(n.b.quaternion)
 }
 if(weight>.0001){u.body.position.y+=s.offsetY*weight;s.applied=true}
 s.seenY=u.body.position.y;s.valid=live
}
function flowSmooth(x){x=cap(x,0,1);return x*x*(3-2*x)}
const ACTION_BUFFER=.145, ULT_COST=60, ULT_REGEN=9, ULT_COOLDOWN=4.2, ULT_BUFFER=.55;
function ultimateWait(f){return Math.max(actionWait(f,3),(ULT_COST-f.p.en)/ULT_REGEN)}
function ultimateHud(f){
 const b=f.el.querySelector('[data-a="3"]'),u=f.p,w=ultimateWait(f),free=!f.down&&!(u.sleepUntil>f.t)&&!u.flyingClub&&u.ready&&f.e.ready;
 b.disabled=!free||w>ULT_BUFFER;
 b.classList.toggle('ultReady',free&&w<=0);
 b.querySelector('small').textContent=f.buffered?.i===3?'已预输入':!free?'暂不可用':w>0?'L · '+w.toFixed(1)+'s':'L · 必杀就绪';
 b.firstChild.textContent=u.d.mega?megaSkills[3]:u.d.id===150?'断层星爆':resonanceNames[resonanceType(f,u)];
 b.setAttribute('aria-label','超级必杀 · '+b.textContent);
}
function actionWait(f,i){const a=f.p.cmd;return Math.max(f.cd[i]||0,a?a.total-(f.t-a.t):0)}
function queueOrAct(f,i,aim){
 const u=f.p,wait=i===3?ultimateWait(f):actionWait(f,i),window=i===3?ULT_BUFFER:ACTION_BUFFER;f.buffered=null;
 if(f.mode==='live'&&!f.down&&(i===3||(!f.grip&&!u.jet&&!u.volts))&&!u.flyingClub&&!(u.sleepUntil>f.t)&&
    wait>0&&wait<=window){
  f.buffered={u,i,aim:aim?.clone(),until:f.t+window+.066};return
 }
 exAct(f,i,aim)
}
function bufferedStep(f){
 const k=f.buffered;if(!k)return;
 if(k.u!==f.p||f.t>k.until||f.down||(k.i!==3&&f.grip)||f.p.sleepUntil>f.t){f.buffered=null;return}
 if(f.p.cmd||f.cd[k.i]>0||(k.i===3&&f.p.en<ULT_COST))return;f.buffered=null;exAct(f,k.i,k.aim)
}
function flowEnvelope(t,from,peak,end){return t<peak?flowSmooth((t-from)/(peak-from)):1-flowSmooth((t-peak)/(end-peak))}
const fourFists=[.065,.150,.238,.327];
function aimFightingHand(f,u,g,arm,elbow,hand,side,pair,w,close,rotate){
 if(!arm||!elbow||!hand)return;const a=u.cmd;
 // Bring the fingers over the palm before extension. Use each finger's own
 // bend plane so the upper and lower pairs of hands can have different rolls.
 const palm=hand.getWorldPosition(V()),prefix=side==='l'?'l':'r';
 for(const letter of (pair?'ghij':'bcde')){
  const j=g.joints(prefix+'finger'+letter+'1'),tip=g.joints(prefix+'finger'+letter+'2'),end=g.joints(prefix+'finger'+letter+'3');
  if(!j||!tip||!end)continue;const root=j.getWorldPosition(V()),d=tip.getWorldPosition(V()).sub(root).normalize();
  const inside=palm.clone().sub(root);inside.addScaledVector(d,-inside.dot(d));if(inside.lengthSq()<.000001)continue;
  const axis=d.clone().cross(inside.normalize()).normalize();rotate(j,axis,.58*close);rotate(tip,axis,.91*close)
 }
 if(!a||w<.001)return;const v=a.player?f.e:f.p;
 const start=arm.getWorldPosition(V()),mid=elbow.getWorldPosition(V()),len1=start.distanceTo(mid),len2=mid.distanceTo(palm);
 if(Math.min(len1,len2)<.008)return;
 const goal=bodyPoint(f,v),h=cap(v.height,.35,2.6);goal.y+=(pair?-.03:.13)*h;
 goal.addScaledVector(a.dir,-h*.22);const ray=goal.sub(start),planar=ray.clone();planar.y=0;
 if(planar.dot(a.dir)<0||Math.abs(planar.x*a.dir.z-planar.z*a.dir.x)>u.height*.52){
  ray.x=a.dir.x*len1;ray.z=a.dir.z*len1
 }
 const reach=cap(ray.length(),Math.abs(len1-len2)+.001,(len1+len2)*.976);
 const d=ray.normalize(),bend=mid.clone().sub(start);bend.addScaledVector(d,-bend.dot(d));
 if(bend.lengthSq()<.000001)return;bend.normalize();
 const along=(reach*reach+len1*len1-len2*len2)/(2*reach),want=start.clone().addScaledVector(d,along).addScaledVector(bend,Math.sqrt(Math.max(0,len1*len1-along*along)));
 function steer(j,child,to){const s=j.getWorldPosition(V()),old=child.getWorldPosition(V()).sub(s).normalize(),dest=to.sub(s).normalize(),axis=old.clone().cross(dest);
  if(axis.lengthSq()>1e-8)rotate(j,axis.normalize(),old.angleTo(dest)*w)}
 steer(arm,elbow,want);steer(elbow,hand,start.clone().addScaledVector(d,reach))
}
function fistImpact(f,a,v){
 const at=bodyPoint(f,v),h=cap(v.height,.35,2.6),lateral=(a.fist%2?.13:-.13)*h;
 at.addScaledVector(a.dir,-h*.22);at.x+=a.dir.z*lateral;at.z-=a.dir.x*lateral;at.y+=(a.fist<2?.13:-.03)*h;
 flare(f,.13,g=>{g.position.copy(at);g.quaternion.copy(f.cam.quaternion);
  for(let i=0;i<4;i++){const m=part(g,new THREE.SphereGeometry(.055,6,4),i?0xffce86:0xffffff);
   m.rotation.z=i*1.57+a.fist*.7;m.userData.r=m.rotation.z}
 },(g,q)=>g.children.forEach(m=>{const r=m.userData.r;m.position.set(-Math.sin(r)*q*.41,Math.cos(r)*q*.41,0);m.scale.set(1-q,2*(1-q),.65);m.material.opacity=1-q}))
}
function meleeFlow(f,u,g,rotate,fw,right,up){
 const a=u.cmd;if(!a||family(a.k)!=='contact'||a.dive||a.peck||turtleJ(a.k)||a.k==='irontail')return;
 const t=f.t-a.t,sec=t-a.wind,n=g.joints,side=a.handSide||1;
 const plant=flowEnvelope(t,0,a.wind,a.wind+.10),drive=flowEnvelope(sec,-.055,.092,.30),settle=flowEnvelope(sec,.13,.24,.43);
 const quad=g.kind==='sturdyQuad'||g.kind==='runner',ground=!canFly(u)&&u.air<.10&&!['flop','roll','bodyslam','pounce','quick','dragonrush','ascent'].includes(a.k);
 const hips=n('hips','waist'),chest=n('spine2','spine1','chest'),yaw=side*(-.23*plant+.28*drive-.09*settle);
 rotate(hips,up,yaw*.65);if(chest!==hips)rotate(chest,up,yaw*.8);
 rotate(chest,right,-.11*plant+.19*drive-.05*settle);
 rotate(g.head,right,.08*plant-.13*drive);rotate(g.head,up,-.24*yaw);
 if(ground){
  u.body.position.y-=u.height*(.037*plant+.018*settle);
  for(const l of g.limbs){const lead=l.right===(side>0),brace=lead?plant+settle:.72*plant-.76*drive;
   rotate(l.hip,right,(l.front?-.16:.21)*brace);rotate(l.shin,right,(l.front?.23:-.32)*brace);rotate(l.foot,right,(l.front?-.07:.11)*brace)}
 }
 if(quad){rotate(g.tailRoot,right,.14*plant-.18*drive);return}
 if(['claw','palm','slap','chop','punch'].includes(a.k)&&![66,68,123].includes(u.d.id)){
  const arm=n(side>0?'rarm':'larm',side>0?'rightarm01':'leftarm01'),fore=n(side>0?'rforearm':'lforearm',side>0?'rightarm02':'leftarm02');
  rotate(arm,up,side*(.39*plant-.56*drive+.13*settle));rotate(arm,right,-.20*plant+.29*drive);
  rotate(fore,right,.38*plant-.47*flowEnvelope(sec,-.025,.10,.27))
 }
}
// Advance along the committed line with a push-off, not a constant-speed slide.
function contactAdvance(f,a,target,t){
 const u=a.u,dist=dst(u.pos,target.pos);
 if(a.strideLength==null)a.strideLength=Math.min(Math.max(0,dist-1.05),Math.max(0,a.r-1.25));
 const along=a.strideLength*flowSmooth(t/.285),step=Math.min(Math.max(0,along-(a.pathDone||0)),Math.max(0,dist-1.05));
 a.pathDone=along;if(step>0){exMove(f,u,a.dir.x*step,a.dir.z*step);a.travel=(a.travel||0)+step}
}

// Support the turn through one grounded leg, then transfer weight to the
// catching leg. Solve with rotations only; neither leg length can change.
function braceFoot(f,u){
 const a=u.cmd,g=u.motion;if(!a||!g||canFly(u)||u.air>.055||!g.soles.length||
  !['punch','barrage','claw','palm','slap','chop','cut','bite','fang','headbutt'].includes(a.k))return;
 const age=f.t-a.t,sec=age-a.wind,catching=sec>.11,side=(a.handSide>0)!==catching;
 const leg=g.limbs.find(l=>!l.front&&l.right===side&&l.hip&&l.shin&&l.foot);
 if(!leg)return;const {hip,shin,foot}=leg,sole=g.soles.find(s=>s.end===foot);if(!sole)return;
 const window=catching?flowSmooth((sec-.11)/.055)*(1-flowSmooth((sec-.24)/.14)):
  flowSmooth(age/.065)*(1-flowSmooth((sec+.025)/.12));if(window<.001)return;
 const ankle=foot.getWorldPosition(V()),knee=shin.getWorldPosition(V()),top=hip.getWorldPosition(V());
 const len1=top.distanceTo(knee),len2=knee.distanceTo(ankle),span=len1+len2;if(Math.min(len1,len2)<.008)return;
 if(!a.stance||a.stance.foot!==foot){
  let low=Infinity;for(const local of sole.samples){const p=foot.localToWorld(local.clone());low=Math.min(low,p.y-strideFloor(f,p.x,p.z))}
  a.stance={foot,anchor:ankle.clone(),orient:foot.getWorldQuaternion(new THREE.Quaternion)};
  a.stance.anchor.y-=cap(low,-span*.13,span*.18)
 }
 const s=a.stance,offset=s.anchor.clone().sub(ankle),reach=span*.38;
 const w=window*(1-flowSmooth((offset.length()-reach)/(span*.26)));if(w<.001)return;
 const aim=ankle.clone().addScaledVector(offset,w).sub(top),dist=cap(aim.length(),Math.abs(len1-len2)+.0001,span*.998);
 aim.normalize();const pole=knee.clone().sub(top);pole.addScaledVector(aim,-pole.dot(aim));if(pole.lengthSq()<.000001)return;pole.normalize();
 const along=(dist*dist+len1*len1-len2*len2)/(2*dist),joint=top.clone().addScaledVector(aim,along).addScaledVector(pole,Math.sqrt(Math.max(0,len1*len1-along*along)));
 const target=top.clone().addScaledVector(aim,dist);
 const remember=b=>{if(!g.saved.has(b))g.saved.set(b,b.quaternion.clone())};
 const steer=(b,c,point)=>{const origin=b.getWorldPosition(V()),before=c.getWorldPosition(V()).sub(origin).normalize(),after=point.clone().sub(origin).normalize();
  const q=b.getWorldQuaternion(new THREE.Quaternion),delta=new THREE.Quaternion().setFromUnitVectors(before,after);remember(b);b.quaternion.multiply(q.clone().invert().multiply(delta).multiply(q))};
 steer(hip,shin,joint);steer(shin,foot,target);remember(foot);
 foot.quaternion.slerp(foot.parent.getWorldQuaternion(new THREE.Quaternion).invert().multiply(s.orient),w)
}
