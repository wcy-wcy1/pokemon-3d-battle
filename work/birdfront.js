function birdSocket(f,u,sign){
 const side=sign<0?'l':'r',j=u.motion?.joints;
 const b=!sign?j?.('endjaw','jaw','head'):j?.(side+'hand1',side+'hand',side+'feelere2');
 const mid=bodyPoint(f,u),v=b?.getWorldPosition(V());if(v&&v.distanceTo(mid)<u.viewSpan*1.15)return v;
 // Moltres has both an export rig and a render rig. Resolve a real skinned wing vertex
 // when the named joint is in authoring space rather than arena space.
 const cache=u.frontTips??={},cached=cache[side];
 const world=(m,i)=>{m.updateWorldMatrix(true,false);return m.localToWorld(m.boneTransform(i,V().fromBufferAttribute(m.geometry.attributes.position,i)))};
 if(cached){const point=world(cached.m,cached.i);if(point.distanceTo(mid)<u.viewSpan*1.15)return point}
 let best=null,score=0;const axis=V(Math.cos(u.face),0,-Math.sin(u.face)).multiplyScalar(sign);
 u.body.traverse(m=>{if(!m.isSkinnedMesh||!sign||!m.geometry.attributes.position)return;const count=m.geometry.attributes.position.count;
 for(let i=0;i<count;i+=Math.max(1,Math.ceil(count/180))){let pt=world(m,i),d=pt.clone().sub(mid),w=d.dot(axis);if(d.length()<u.viewSpan*1.15&&w>score){best={m,i,pt};score=w}}});
 if(best){cache[side]=best;return best.pt}return socket(f,u,sign?'wings':'beak',sign)
}
function frontTell(f,a){
 const u=a.u,id=u.d.id,target=a.player?f.e:f.p,point=aimPoint(f,target,a.aim);
 let delta=point.clone().sub(bodyPoint(f,u)).clampLength(0,a.r);a.frontPoint=bodyPoint(f,u).add(delta);
 if(id===144){
  a.total=a.wind+1.06;u.swing=a.total;
  flare(f,a.total,g=>{g.position.copy(a.frontPoint);let edge=hoop(g,0x95e8ff,2.1,.025);edge.rotation.x=Math.PI/2;edge.position.y=strideFloor(f,g.position.x,g.position.z)-g.position.y+.06;
   for(let i=0;i<36;i++){let m=part(g,new THREE.OctahedronGeometry(.10+i%3*.025),i%4?0xc3f4ff:0x86c4fa);m.scale.set(.55,1.75,.55)}
  },(g,q,t)=>{if(u.cmd!==a&&!a.sent){g.visible=false;return}let strength=cap(t/a.wind,0,1),fade=cap((a.total-t)/.25,0,1);
   for(let i=1;i<g.children.length;i++){let m=g.children[i],h=(i*.618+t*(.4+.6*strength))%1,ang=i*2.4+t*(2+2*strength),r=(1.15+.9*h)*(.68+.32*strength);
    m.position.set(r*Math.cos(ang),-.40+1.95*h,r*Math.sin(ang));m.rotation.set(.65,ang,ang*.6);m.material.opacity=strength*fade*(.35+.65*Math.sin(Math.PI*h))}
   g.children[0].material.opacity=.65*fade});return
 }
 for(const side of id===145?[0]:[-1,1]){
  flare(f,a.wind,g=>{for(let j=0;j<3;j++){let m=hoop(g,id===145?(j?0xffe658:0xfcfcff):(j?0xffa447:0xff5523),.27+j*.09,.026);m.rotation.y=j*1.04}},(g,q)=>{g.visible=u.cmd===a;g.position.copy(birdSocket(f,u,side));g.scale.setScalar(.22+q*.95);g.rotation.z=q*3})}
}
function frontRelease(f,a){
 if(a.k==='blizzard')return;
 const rail=a.k==='rail',shared={hit:false};
 for(const side of rail?[0]:[-1,1]){
  const src=birdSocket(f,a.u,side),dir=a.frontPoint.clone().sub(src).normalize(),o=new THREE.Group,spin=new THREE.Group;o.add(spin);f.sc.add(o);o.position.copy(src);o.quaternion.setFromUnitVectors(V(0,0,1),dir);
  if(rail){let core=part(spin,new THREE.IcosahedronGeometry(.24,1),0xfff9bc);core.scale.z=1.5;
   for(let j=0;j<3;j++){let h=hoop(spin,j===1?0xffffff:0xffd429,.31-j*.033,.033);h.rotation.y=j*1.05;h.position.z=-.15*j}
   stroke(spin,[V(0,0,-.16),V(.12,.07,-.47),V(-.09,-.06,-.63),V(0,0,-1)],0xfbda55,.045,true)
  }else{for(let j=0;j<7;j++){let m=part(spin,new THREE.OctahedronGeometry(1),j%3?0xff6628:0xffd568,(j-3)*.11,Math.sin(j*.55)*.12,-Math.abs(j-3)*.18,.89,true);m.scale.set(.13,.075,.46);m.rotation.y=(j-3)*.18}}
  const sp=rail?17:12;f.shots.push({...a,o,spin,sp,v:dir,age:0,hit:false,size:rail?.25:.30,life:a.r/sp,frontPair:shared});
 }
}
function frontIceStep(f,a,target,dt){
 if(f.t-a.t<a.wind||a.hit)return;
 const p=bodyPoint(f,target),pt=a.frontPoint,inside=dst(p,pt)<2.1&&Math.abs(p.y-pt.y)<1.65;
 a.chill=inside?(a.chill||0)+dt:0;if(a.chill>=.24)strikeHit(f,a,target)
}
function frontPose(f,u,g,rotate,fw,right){
 const a=u.cmd;if(!a?.frontPoint)return;
 const cast=cap((f.t-a.t)/a.wind,0,1),post=cap((f.t-a.t-a.wind)/.38,0,1),wind=cast*(1-post),snap=Math.sin(post*Math.PI);
 for(let wing of g.wings){let side=wing.right?1:-1;
  rotate(wing.bone,fw,side*(a.k==='blizzard'?.62*wind-.48*snap:a.k==='burn'?.74*wind-.84*snap:.26*wind));rotate(wing.tip,right,-.15*wind+.31*snap)}
 rotate(g.head,right,a.k==='rail'?-.27*wind+.37*snap:.09*wind);rotate(g.tailRoot,right,.18*wind-.23*snap)
}
