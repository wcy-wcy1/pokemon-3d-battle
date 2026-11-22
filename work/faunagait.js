// Locomotion uses actor-space axes: imported rigs disagree on local joint axes.
const fieldGaits={
 sturdyQuad:[1,3,79],runner:[37,38,58,59,133,134,135,136,197],
 heavy:[9,68,76,80,113,143],walker:[4,7,26,35,39,52,54,65,66,94,104],
 flyer:[6,12,16,18,123,144,145,146],float:[63,74,92,151],swimmer:[129,131],
 serpent:[10,95,130,384],authored:[149,150]
};
function buildFieldGait(u){
 if(!u.model3d||u.d.id===25)return;
 let kind=Object.keys(fieldGaits).find(k=>fieldGaits[k].includes(u.d.id))||'walker';
 const g=u.motion={kind,phase:0,weight:0,speed:0,limbs:[],wings:[],tail:[],saved:new Map,soles:[]};
 // Mild allometry: same species keeps its rate across different camera scales.
 g.cadence=cap(Math.pow(u.d.meters/.9,-.18)*Math.pow(u.d.kg/24,-.055),.63,1.50);
 g.inertia=cap(Math.pow(u.d.kg/24,.24),.65,1.95);
 const bones=new Map;u.body.traverse(b=>{if(b.isMesh||!b.name)return;const n=b.name.replace(/^\d+[ _-]*/,'').replace(/_\d+$/,'').replace(/_/g,'').toLowerCase();bones.set(n,b)});
 const get=(...keys)=>keys.map(k=>bones.get(k)).find(Boolean);
 g.joints=get;g.head=get('head','neck1');g.tailRoot=get('tail1','tail');g.arms=[get('larm','lupperarm'),get('rarm','rupperarm')];
 const quad=['sturdyQuad','runner'].includes(kind),flies=kind==='flyer';
 for(let side of ['l','r']){
  for(let front of (quad?[false,true]:[false])){
   let key=s=>side+s,hip=get(key(front?'arm':'thigh')),shin=get(key(front?'forearm':'leg')),foot=get(key(front?'hand':'foot'));
   if(hip)g.limbs.push({hip,shin,foot,front,right:side==='r'});
  }
  if(flies&&u.d.id===12){for(let tag of ['a','b','c']){let bone=get(side+'feeler'+tag+'1');if(bone)g.wings.push({bone,right:side==='r',tip:null})}}else if(flies&&u.d.id!==123){let wing=get(side+'wing1',side+'wing',side+'upperarm',side+'arm',side+'shoulder')||[...bones.values()].find(n=>new RegExp('(?:^|_)'+side+'wing','i').test(n.name));if(wing)g.wings.push({bone:wing,right:side==='r',tip:get(side+'forearm',side+'wing2')})}
 }
 const isChain=kind==='serpent'||kind==='swimmer';if(isChain){for(let [name,bone] of bones){if(/^(tail\d+|bone\d+|spine\d+)$/.test(name))g.tail.push(bone)}g.tail.sort((a,b)=>depth(a)-depth(b));function depth(n){let d=0;while(n.parent){d++;n=n.parent}return d}}
 // Sample the underside of each authored foot. Retain low points from front/back
 // and either edge so that toes, rather than joint origins, define contact.
 if(!['flyer','swimmer','serpent','float','authored'].includes(kind)){
  u.root.updateMatrixWorld(true);
  for(const limb of g.limbs){let end=limb.foot;if(!end)continue;let best=new Array(5).fill(Infinity),samples=[];
   let belongs=new Set;end.traverse(n=>belongs.add(n));
   u.body.traverse(m=>{let at=m.geometry?.attributes,coord=at?.animalCoord;if(!coord||!m.isSkinnedMesh)return;
    const match=m.skeleton.bones.map(b=>belongs.has(b));if(!match.some(Boolean))return;
    for(let i=0;i<coord.count;i++){let w=0;for(let j=0;j<4;j++)if(match[at.skinIndex.array[4*i+j]])w+=at.skinWeight.array[4*i+j];if(w<.28)continue;
     let x=coord.getX(i),y=coord.getY(i),z=coord.getZ(i);
     for(let [j,val] of [y,y+x*.28,y-x*.28,y+z*.32,y-z*.32].entries()){if(val>=best[j])continue;best[j]=val;
      samples[j]=end.worldToLocal(u.body.localToWorld(V(x,y,z).multiplyScalar(u.height||2)))}
    }});
   if(samples.length)g.soles.push({end,samples});
  }
  if(!g.soles.length){
   const low=[Infinity,Infinity,Infinity,Infinity,Infinity],pts=[];
   u.body.traverse(m=>{const at=m.geometry?.attributes.animalCoord;if(!at)return;for(let i=0;i<at.count;i++){let x=at.getX(i),y=at.getY(i),z=at.getZ(i);
    for(let [j,c] of [y,y+.28*x,y-.28*x,y+.28*z,y-.28*z].entries())if(c<low[j]){low[j]=c;pts[j]=V(x,y,z).multiplyScalar(u.height||2)}
   }});if(pts.length)g.soles.push({end:u.body,samples:pts})
  }
 }
}
function restoreFieldGait(u){const g=u.motion;if(!g)return;for(const [b,q] of g.saved)b.quaternion.copy(q);g.saved.clear()}
function stepFieldGait(f,u,dt,walk){
 const g=u.motion;if(!g)return;
 const kind=g.kind,H=u.height||2,quad=kind==='runner'||kind==='sturdyQuad',heavy=kind==='heavy'||kind==='sturdyQuad';
 const drive=g.measured??(u===f.p?(u.drive||0):(walk?3.1:0)),active=drive>.09&&!u.jet;
 g.weight+=((active?cap(drive/1.55,0,1):0)-g.weight)*(1-Math.exp(-dt*10/g.inertia));g.speed+=(drive-g.speed)*(1-Math.exp(-dt*7/g.inertia));
 const w=g.weight,strength=cap(g.speed/8,0,1),pace=heavy?.82:quad?1.43:1.26;
 g.phase=(g.phase+dt*g.cadence*(pace+strength*(heavy?.72:1.15)))%1;
 const p=g.phase*2*Math.PI,fw=V(Math.sin(u.face),0,Math.cos(u.face)),right=V(fw.z,0,-fw.x),up=V(0,1,0);
 function rotate(b,axis,angle){if(!b||Math.abs(angle)<.0001)return;if(!g.saved.has(b))g.saved.set(b,b.quaternion.clone());let q=b.getWorldQuaternion(new THREE.Quaternion),d=new THREE.Quaternion().setFromAxisAngle(axis,angle);b.quaternion.multiply(q.clone().invert().multiply(d).multiply(q))}
 guardBones(u,g,rotate,fw,right,up);animateSilhouette(f,u,g,w,p,strength,rotate,fw,right,up,dt);
 wildBody(f,u,g,rotate,fw,right,up);
 speciesDetail(f,u,g,w,p,strength,rotate,fw,right,up);
 lullabyPose(f,u,g,rotate,fw,right);
 castingAccent(f,u,g,rotate,fw,right,up);
 meleeFlow(f,u,g,rotate,fw,right,up);anatomyMotion(f,u,g,w,p,strength,rotate,fw,right,up);
 peckPose(f,u,g,rotate,right);volleyPose(f,u,g,rotate,fw,right,up);evoFieldPose(f,u,g,rotate,fw,right,up);frontPose(f,u,g,rotate,fw,right);turtlePose(f,u,g,rotate,right,up);
 if(f.grip?.u===u)gripArmPose(f,u,g,rotate);
 if(u.d.id===1&&u.currentAnim&&!u.cmd)return;
 if(kind==='authored'){if(active&&!u.cmd&&u.currentAnim)u.currentAnim.setEffectiveTimeScale(cap(g.cadence*(.95+.32*strength),.72,1.26));return}
 if(u.d.id===6){
  charizardPose(f,u,g,rotate,fw,right,up,dt);
  if(u.cmd?.charFlight)return
 }
 if(u.cmd?.dive){birdDivePose(f,u,g,rotate,fw,right,up);return}
 if(kind==='flyer'){const flap=Math.sin(p),glide=1-.60*strength,dive=u.cmd&&family(u.cmd.k)==='contact'?cap((flightLevel(u)-u.air)/flightLevel(u),0,1):0;
  for(const a of g.wings){let sign=a.right?-1:1;rotate(a.bone,fw,sign*((.34+glide*.24)*flap*(1-dive)-dive*.35));rotate(a.tip,fw,sign*.16*Math.sin(p-.7))}
  u.body.position.y+=H*(.10+.055*Math.sin(p-.8))*(u.cmd?.25:1);u.body.rotation.z+=cap(g.turn||0,-1,1)*w*.22;u.body.rotation.x+=w*.12+dive*.36;return}
 if(kind==='float'||kind==='swimmer'||kind==='serpent'){
  const swim=kind!=='float';if(![95,130,384].includes(u.d.id))for(let i=0;i<g.tail.length;i++)rotate(g.tail[i],up,Math.sin(p-i*.49)*(.026+w*.075));
  u.body.rotation.y+=swim?Math.sin(p)*w*.075:0;u.body.rotation.z+=swim?.045*Math.sin(p)*w:.04*Math.sin(p*.7);
  if(kind==='float')u.body.position.y+=H*(.12+.04*Math.sin(f.t*2.3));else u.body.position.y+=H*.022*Math.sin(p)*w;return
 }
 if(w<.003)return;
 const gallop=quad&&!heavy?cap((g.speed-3.7)/2.8,0,1):0;
 for(let {hip,shin,foot,front,right:r} of g.limbs){
  const side=r?.5:0,phase=g.phase+side+(quad&&front?.5:0);
  // Blend a diagonal trot into paired hind push-off and a staggered fore catch.
  let trot=Math.cos(phase*2*Math.PI),run=Math.cos((g.phase+(r?.10:0)+(front?.46:0))*2*Math.PI);
  let swing=trot+(run-trot)*gallop,heel=Math.max(0,-Math.sin(phase*2*Math.PI))*(1-gallop)+Math.max(0,-Math.sin((g.phase+(r?.10:0)+(front?.46:0))*2*Math.PI))*gallop;
  let step=(heavy?.22:quad?.39:.34)*(1+.50*strength)*w;
  rotate(hip,fw,-swing*step*(g.side||0)*.75);rotate(hip,right,swing*step*(g.forward??1));rotate(shin,right,(front?-1:1)*heel*step*.78);rotate(foot,right,-swing*step*.52);
 }
 if(!quad&&!u.jet&&!u.cmd){for(let i=0;i<2;i++)rotate(g.arms[i],right,(i?1:-1)*Math.cos(p)*w*(heavy?.19:.34))}
 if(quad)rotate(g.tailRoot,up,w*(.08+.07*strength)*Math.sin(p-.74));
 rotate(g.head,right,-.055*w*gallop*Math.cos(p));rotate(g.head,fw,-Math.sin(p)*(heavy?.038:.017)*w);
 u.body.rotation.z+=Math.sin(p)*(heavy?.056:.022)*w;
 u.body.rotation.x+=w*((heavy?.035:.07)+.08*gallop+.027*gallop*Math.cos(p));
 let lowest=Infinity;
 for(const {end,samples} of g.soles){end.updateWorldMatrix(true,false);for(const pt of samples){let v=V().copy(pt).applyMatrix4(end.matrixWorld);lowest=Math.min(lowest,v.y-strideFloor(f,v.x,v.z)-(u.air||0))}}
 if(Number.isFinite(lowest)&&(!u.cmd||(!canFly(u)&&!['bodyslam','pounce','quick','flop','dragonrush'].includes(u.cmd.k)))&&!u.jet){const flight=quad?H*.051/g.inertia*gallop*Math.max(0,-Math.cos(2*p)):!g.limbs.length?H*(heavy?.023:.062)*Math.sin(p)**2:0;u.body.position.y+=w*cap(flight-lowest,-H*.30,H*.30)}
}
