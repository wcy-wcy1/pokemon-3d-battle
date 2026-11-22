// Pose accents use the actual joints of each imported animal, never a scaled skeleton.
function speciesDetail(f,u,g,w,p,v,rot,fw,right,up){
 const id=u.d.id,n=g.joints,l=u.lifeRig;if(!l)return;
 const sin=Math.sin,t=f.t,h=u.flinch>.02?cap(u.flinch*4,0,1):0;
 const a=u.cmd,wind=a?cap((t-a.t)/a.wind,0,1):0,release=a?cap((t-a.t-a.wind)/(a.total-a.wind),0,1):0;
 const brace=wind*(1-cap(release*4,0,1)),fire=sin(Math.PI*release),b=sin(l.breath);
 const jaw=n('jaw','lowerjaw','lowerbeak'),neck=n('neck','neck1'),sides=['l','r'];
 if(familyOf(id)==='feather'||id===6||id===149||id===12){
  // Inner wing leads. Outer feathers lag the downstroke; head stabilises as the shoulders rise.
  const flap=sin(p-.8),glide=1-.55*v;
  for(let i=0;i<2;i++){let s=sides[i],sign=i?-1:1;rot(n(s+'forearm2',s+'wing2',s+'wingex',(i?'right':'left')+'wing02'),fw,sign*.19*glide*flap);
   for(let j=1;j<=4;j++)rot(n(s+'hairb'+j,s+'feelerb'+j),right,.058*sin(p-.45*j)+.035*v)}
  rot(neck,right,-.085*flap-.10*brace);rot(jaw,right,.07*(.5+.5*b)+.23*fire);
  if(id===144)for(let j=2;j<18;j++)rot(n('tail'+j),up,.027*sin(t*3-j*.28))
 }else if([1,3,10,123].includes(id)){
  for(let s of sides)for(let j=1;j<=4;j++){let two=String(j).padStart(2,'0');rot(n(s+'feelerc'+two,s+'feelera'+j,s+'feelerb'+j),right,.06*sin(p-.58*j)+.12*brace-.15*fire)}
  rot(n('feelera1','feeler'),fw,.06*b+.11*w*sin(p));rot(neck,right,.10*brace-.13*fire);rot(jaw,right,.19*fire)
 }else if([7,9,79,80,4,54,129,130,384].includes(id)){
  let water=[129,130].includes(id);
  rot(neck,right,.04*b+.15*brace-.13*fire);rot(jaw,right,(water?.14:.06)*(.5+.5*b)+.25*fire+.13*h);
  for(let s of sides){const sign=s==='l'?1:-1;rot(n(s+'feeler1',s+'feelera1'),fw,sign*(.065*sin(p-.6)+.1*fire));if(id===129)rot(n(s+'arm'),fw,sign*(.15+.20*w)*sin(p-.55))}
 }else if([63,65,66,68,74,76,94,104,150].includes(id)){
  const mental=[63,65,94,150].includes(id);
  for(let s of sides){let sign=s==='l'?1:-1;
   rot(n(s+'hand',(s==='l'?'left':'right')+'hand'),fw,sign*((mental?.15:.065)*b+.24*brace-.22*fire));
   for(let d of ['a','b','c','d'])rot(n(s+'finger'+d+'1',(s==='l'?'left':'right')+'finger'+d+'01'),right,.055*b+.23*brace-(mental?.24:.09)*fire)}
  rot(jaw,right,.04*(1+b)+.19*fire);rot(g.head,right,.09*brace-.08*fire+.08*h)
 }else if(id===95){rot(n('bone013'),up,.035*sin(p-.8)-.085*brace);rot(n('bone014'),right,.05*b-.10*fire)}
 if([26,37,38,39,52,58,133,134,135,136,151,197].includes(id)){
  const ears=id===135?.20:id===134?.065:.12;
  for(const side of sides){const sign=side==='l'?1:-1;rot(n(side+'ear1',side+'ear'),up,sign*(ears*l.gaze+.13*brace-.07*h));rot(n(side+'feeler1',side+'feelera1'),fw,sign*.065*sin(p+.6*sign))}
  if(id===39)rot(n('hair1'),right,.15*b+.14*fire);
  if(id===134)rot(n('neck','head'),right,.045*sin(p-.5)-.08*brace);
  if(id===151)rot(n('tail1'),right,.06*b);
 }
 if(g.softShapes)for(const m of g.softShapes){m.morphTargetInfluences[0]=b*(.62+.38*l.energy);m.morphTargetInfluences[1]=sin(p+.28)*w+.48*brace-.67*fire}
}
function attachSoftShapes(u){
 if(![35,92,113,131,143].includes(u.d.id)||!u.motion)return;const id=u.d.id,g=u.motion;g.softShapes=[];
 u.body.updateWorldMatrix(true,true);const inv=u.body.matrixWorld.clone().invert(),bounds=new THREE.Box3;
 u.body.traverse(m=>{let coord=m.geometry?.attributes.animalCoord;if(coord)for(let i=0;i<coord.count;i++)bounds.expandByPoint(V().fromBufferAttribute(coord,i))});
 let sz=bounds.getSize(V()),mid=bounds.getCenter(V());
 u.body.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh)return;let geo=m.geometry,at=geo.attributes.animalCoord;if(!at||geo.morphAttributes.position?.length)return;
  const local=new THREE.Matrix3().setFromMatrix4(inv.clone().multiply(m.matrixWorld)).invert(),morph=[[],[],[],[]],H=u.height;
  for(let i=0;i<at.count;i++){
   const x=2*(at.getX(i)-mid.x)/(sz.x||1),y=(at.getY(i)-bounds.min.y)/(sz.y||1),z=2*(at.getZ(i)-mid.z)/(sz.z||1),bell=(v,c,r)=>Math.exp(-((v-c)**2)/(r*r));
   const belly=bell(y,.45,.22),tip=cap((Math.abs(x)-.43)/.57,0,1),base=V(x*.014*belly,.006*belly,z*.018*belly),act=V();
   if(id===131){base.multiplyScalar(.26);act.y=tip*tip*bell(y,.22,.24)*.08;act.z=x*tip*.032;act.x=.024*bell(y,.81,.22)}
   else if(id===92){let edge=cap((Math.hypot(x,z)-.52)/.6,0,1);base.set(x*.037*edge,.022*edge*Math.sin(x*4),z*.045*edge);act.set(.056*edge*Math.sin(y*7),edge*.055*Math.sin(z*3.2+x*2),0)}
   else{act.y=tip*tip*(id===143?.045:.065)*Math.sign(x);act.x=(id===35?.046:.024)*y*y;act.z=.018*belly}
   // Delayed local shear: feet stay planted, soft upper tissue follows the impact.
   const lag=id===131?.13*bell(y,.82,.21):id===92?.11*(.36+.64*tip):.105*y*y;
   ;[base,act,V(lag,0,0),V(0,0,lag)].forEach((v,j)=>morph[j].push(...v.multiplyScalar(H).applyMatrix3(local).toArray()))
  }
  geo.morphTargetsRelative=true;geo.morphAttributes.position=morph.map(v=>new THREE.Float32BufferAttribute(v,3));m.updateMorphTargets();m.material.morphTargets=true;m.material.needsUpdate=true;g.softShapes.push(m)
 });
}
