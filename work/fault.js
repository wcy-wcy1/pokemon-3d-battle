const faultSnap=2.18,faultEnd=3.25;
function startFault(f,u,aim){
 const dir=exDir(u.pos,aim),focus=u.pos.clone().addScaledVector(dir,Math.min(16,dst(u.pos,aim)));
 focus.y=strideFloor(f,focus.x,focus.z)+1.8;
 const a=u.cmd={k:'fault',front:'gale',skill:3,u,d:u.d,player:u===f.p,aim:focus.clone(),dir,c:0xc6a3ff,wind:.62,total:faultEnd,r:3.25,t:f.t,power:u.d.atk*2.55,focus};
 u.face=Math.atan2(dir.x,dir.z);u.swing=a.total;u.playNative?.('attack');celestialCast(f,a);groundOverture(f,a);startQuake(f,a,u.pos);faultDebris(f,a);f.shake=Math.max(f.shake,.22);
 exSay(f,'自然共鸣 · 断层星爆',2);tone(46,.54,0,'triangle',.11);return true
}
function faultStep(f,a,age){
 if(!a.sent&&age>=a.wind){a.sent=true;wxClear(f);Object.assign(f.wx,{phase:'active',type:'gale',left:8,next:.4,dir:a.dir.x<0?-1:1});wxPaint(f,true)}
 if(!a.burst&&age>=faultSnap){a.burst=true;startQuake(f,a,a.focus,true);const t=a.player?f.e:f.p;
  tone(55,.36,0,'triangle',.13);noise(.32,.21);f.shake=Math.max(.28,f.shake);
  if(bodyPoint(f,t).distanceTo(a.focus)<=a.r)strikeHit(f,a,t)}
 if(age>=a.total){a.u.cmd=null;a.u.lastClip=null}
}
function faultDebris(f,a){
 const focus=a.focus,stones=[],scars=[],burstRings=[],n=38,home=a.u.pos.clone(),smooth=x=>{x=cap(x,0,1);return x*x*(3-2*x)};
 let marker,core;
 flare(f,faultEnd,g=>{
  for(let i=0;i<n;i++){
   const ang=i*2.39996,dist=2.3+(i%7)*.63,x=home.x*.55+focus.x*.45+dist*Math.cos(ang),z=home.z*.55+focus.z*.45+dist*Math.sin(ang),y=strideFloor(f,x,z);
   const start=V(x,y-.12,z),size=.25+.085*(i%6),lat=1-2*(i+.5)/n,ring=Math.sqrt(1-lat*lat),dir=V(ring*Math.cos(ang),lat,ring*Math.sin(ang));
   const dest=focus.clone().addScaledVector(dir,1.02+(i%3)*.14),scatter=dir.clone();scatter.y=lat*.63+.62;
   const rock=new THREE.DodecahedronGeometry(1,1),points=rock.attributes.position,colors=[];
   for(let j=0;j<points.count;j++){let px=points.getX(j),py=points.getY(j),pz=points.getZ(j);
    let vein=Math.sin(5*px+3*py-4*pz+i),fracture=Math.sin(9*pz-4*px+i*.57),w=.90+.17*vein+.12*fracture;
    points.setXYZ(j,px*w,py*w*.88+.14*px,pz*w);let grain=.65+.13*vein+.11*fracture+.07*Math.cos(py*21+px*6);
    colors.push(.23*grain,.19*grain,.15*grain)}
   rock.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));rock.computeVertexNormals();
   const stone=new THREE.Mesh(rock,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,emissive:0x300e30}));g.add(stone);stone.scale.set(size*1.28,size*.87,size);stone.material.emissiveIntensity=.03;
   stones.push({stone,start,dest,scatter,size});
   if(i%3===0){let scar=part(g,new THREE.CircleGeometry(1,7),0x241c22,x,y+.055,z,.65);scar.rotation.x=-Math.PI/2;scar.scale.set(size*1.6,size,1);scars.push(scar)}
  }
  marker=hoop(g,0xb99ade,1,.022);marker.rotation.x=Math.PI/2;marker.position.copy(focus);marker.position.y-=1.7;marker.scale.setScalar(a.r);
  core=part(g,new THREE.IcosahedronGeometry(1,1),0xffbaff,focus.x,focus.y,focus.z,.9,true);
  for(let j=0;j<2;j++){let m=hoop(g,j?0xe3c9ff:0xc1ab91,1,.042);m.position.copy(focus);m.rotation.x=1.56-j*.78;burstRings.push(m)}
 },(g,q,t)=>{
  if(!a.burst&&a.u.cmd!==a){g.visible=false;return}
  const after=Math.max(0,t-faultSnap),fade=1-smooth(after/1.07);
  for(let i=0;i<n;i++){const {stone:m,start,dest,scatter,size}=stones[i],lift=smooth((t-.18-(i%5)*.047)/.66),pull=smooth((t-.83-(i%6)*.04)/.82);
   if(!a.burst){m.position.copy(start);m.position.y+=lift*(1.45+.53*(i%5));m.position.x+=Math.sin(t*37+i)*.09*(1-lift);m.position.lerp(dest,pull);
    m.position.y+=Math.sin(Math.PI*pull)*(.65+i%3*.27);m.rotation.set(i+lift+i*.13*pull,t*(1.2-pull),i*.85);m.material.emissiveIntensity=.04+pull*.52}
   else{m.position.copy(dest).addScaledVector(scatter,after*(5.5+i%6));m.position.y-=6*after*after;
    m.position.y=Math.max(strideFloor(f,m.position.x,m.position.z)+size*fade*.45,m.position.y);m.rotation.z=i*.85+after*(3+i%5);m.scale.set(size*1.28,size*.87,size).multiplyScalar(fade)}
  }
  core.scale.setScalar(a.burst?2.2*Math.exp(-after*8):.04+1.05*smooth((t-1.58)/.58));
  marker.material.opacity=.52*fade;for(const m of scars)m.material.opacity=.63*fade;
  burstRings.forEach((m,j)=>{m.visible=!!a.burst;m.scale.setScalar(.3+Math.sqrt(after)* (5+j));m.material.opacity=fade*fade})
 })
}
