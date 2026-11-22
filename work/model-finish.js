// Split only visibly curved, shared edges. Keep UV/material boundaries, hard
// creases and original vertex indices intact (combat sockets refer to them).
function roundModel(u){
 const seen=new Set;u.body.traverse(m=>{
  if(!m.isMesh||m.userData.fuzz||m.name==='Living fur tips')return;
  const g=m.geometry;if(seen.has(g))return;seen.add(g);
  const at=g.attributes,pos=at.position,nor=at.normal,idx=g.index;
  if(!idx||!nor||idx.count>30000||Object.keys(g.morphAttributes).length||g.groups.length)return;
  const dim=new THREE.Box3().setFromBufferAttribute(pos).getSize(V()).length(),N=pos.count,edges=new Map;
  if(dim<=0)return;
  const key=(i,j)=>Math.min(i,j)*N+Math.max(i,j);
  for(let t=0;t<idx.count;t+=3){for(let j=0;j<3;j++){const a=idx.getX(t+j),b=idx.getX(t+(j+1)%3),k=key(a,b);edges.set(k,1+(edges.get(k)||0))}}
  const added=new Map,parts=[],out=[],A=V(),B=V(),na=V(),nb=V();
  for(const [k,count] of edges){if(count!==2)continue;let a=Math.floor(k/N),b=k%N;
   na.fromBufferAttribute(nor,a).normalize();nb.fromBufferAttribute(nor,b).normalize();
   let smooth=na.dot(nb);if(smooth<.34||smooth>.9994)continue;
   A.fromBufferAttribute(pos,a);B.fromBufferAttribute(pos,b).sub(A);let len=B.length();
   if(len<dim*.012||len>dim*.37)continue;
   const offset=nb.clone().multiplyScalar(B.dot(nb)).addScaledVector(na,-B.dot(na)).multiplyScalar(.125);
   if(offset.length()<dim*.00016)continue;offset.clampLength(0,len*.10);
   added.set(k,N+parts.length);parts.push({a,b,p:A.clone().addScaledVector(B,.5).add(offset),n:na.clone().add(nb).normalize()})
  }
  if(!parts.length)return;
  for(let t=0;t<idx.count;t+=3){
   const a=idx.getX(t),b=idx.getX(t+1),c=idx.getX(t+2),x=added.get(key(a,b)),y=added.get(key(b,c)),z=added.get(key(c,a));
   if(x&&y&&z)out.push(a,x,z,x,b,y,z,y,c,x,y,z);
   else if(x&&y)out.push(x,b,y,a,x,c,x,y,c);
   else if(y&&z)out.push(y,c,z,b,y,a,y,z,a);
   else if(z&&x)out.push(z,a,x,c,z,b,z,x,b);
   else if(x)out.push(a,x,c,x,b,c);else if(y)out.push(b,y,a,y,c,a);else if(z)out.push(c,z,b,z,a,b);else out.push(a,b,c)
  }
  const read=(att,i,j)=>{const ar=att.isInterleavedBufferAttribute?att.data.array:att.array;
   const v=ar[att.isInterleavedBufferAttribute?i*att.data.stride+att.offset+j:i*att.itemSize+j];
   if(!att.normalized)return v;return ar instanceof Uint8Array?v/255:ar instanceof Uint16Array?v/65535:ar instanceof Int16Array?Math.max(-1,v/32767):ar instanceof Int8Array?Math.max(-1,v/127):v};
  if(at.skinIndex&&at.skinWeight)for(const p of parts){const weights=new Map;
   for(const i of [p.a,p.b])for(let j=0;j<4;j++){const bone=read(at.skinIndex,i,j),w=read(at.skinWeight,i,j);weights.set(bone,(weights.get(bone)||0)+w)}
   p.skin=[...weights].sort((a,b)=>b[1]-a[1]).slice(0,4);while(p.skin.length<4)p.skin.push([0,0]);const sum=p.skin.reduce((s,e)=>s+e[1],0)||1;p.skin.forEach(e=>e[1]/=sum)
  }
  for(const [name,attr] of Object.entries(at)){const n=attr.itemSize,ar=name==='skinIndex'?new Uint16Array((N+parts.length)*n):new Float32Array((N+parts.length)*n);
   for(let i=0;i<N;i++)for(let j=0;j<n;j++)ar[i*n+j]=read(attr,i,j);
   parts.forEach((p,i)=>{const off=(N+i)*n;if(name==='position')p.p.toArray(ar,off);else if(name==='normal')p.n.toArray(ar,off);else for(let j=0;j<n;j++)ar[off+j]=name==='skinIndex'?p.skin[j][0]:name==='skinWeight'?p.skin[j][1]:(read(attr,p.a,j)+read(attr,p.b,j))*.5});
   g.setAttribute(name,new THREE.BufferAttribute(ar,n))
  }
  g.setIndex(out);g.computeBoundingBox();g.computeBoundingSphere()
 })
}

// Finish the *lit* surface, not the postprocessed image. Different materials
// receive different sky fill, grazing reflection, pigment and pore response.
function fieldFinish(f,u){
 if(!u.model3d)return;const id=u.d.id,l=u.lifeRig,seen=new Set;
 u.body.traverse(m=>{
  const mat=m.material;if(!m.isMesh||!mat?.isMeshStandardMaterial||seen.has(mat))return;seen.add(mat);
  const ix=l.meta.get(mat),name=mat.name.toLowerCase();
  if(/fire_|material_1[56]/.test(name))return;
  const eye=(ix!=null&&(pupils[id]===ix||eyeSheets[id]===ix))||/eye|iris/.test(name);
  const fam=familyOf(id),role=eye?'eye':id===9&&/cannon/i.test(m.name)?'metal':id===9&&ix===1?'shell':id===150?'dermis':id===134?'hide':fam;
  mat.userData.finish=role;
  const fur=role==='fur',plume=role==='feather',rock=role==='stone',plate=role==='shell'||role==='chitin',scale=role==='scale',metal=role==='metal',mist=role==='mist';
  const rough=eye?.43:metal?.34:plate?.48:fur?.91:plume?.67:rock?.94:scale?.57:mist?.71:role==='dermis'?.49:.62;
  mat.roughness=rough;mat.metalness=metal?.74:0;if(f.probe){mat.envMap=f.probe.texture;mat.envMapIntensity=metal?1.0:eye?.52:plate?.53:rock?.16:.28}
  const prev=mat.onBeforeCompile,key=mat.customProgramCacheKey();mat.customProgramCacheKey=()=>key+'|field-finish-4:'+role+':'+(id===149);
  mat.onBeforeCompile=function(s,r){prev.call(this,s,r);
   s.vertexShader='varying vec3 craftP;varying float craftOcclusion;\n'+(s.vertexShader.includes('attribute vec3 animalCoord;')?'':'attribute vec3 animalCoord;\n')+(s.vertexShader.includes('attribute float animalShade;')?'':'attribute float animalShade;\n')+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncraftP=animalCoord;craftOcclusion=animalShade;');
   const band=plume?'sin(52.*craftP.y+28.*abs(craftP.x)+5.*sin(8.*craftP.z))':rock?'sin(42.*craftP.y+8.*craftP.x+2.2*sin(12.*craftP.z))':'sin(dot(craftP,vec3(18.,29.,13.))+2.*sin(craftP.x*7.))';
   const detail=eye?'':`float craftBand=${band};float under=1.-smoothstep(.10,.78,craftP.y);
    diffuseColor.rgb*=mix(vec3(.91,.90,.94),vec3(1.07,1.04,.99),craftOcclusion)*mix(1.,${plume?'.90+.10*craftBand':rock?'.93+.07*craftBand':plate?'.97+.03*craftBand':'.98+.02*craftBand'},smoothstep(.1,.72,craftOcclusion));
    diffuseColor.rgb*=mix(vec3(1.),vec3(1.09,1.045,.99),under*.84);`;
   // Preserve Dragonite's honey-colored hide and smooth cream belly. Its
   // unlit color atlas was painted for display rather than diffuse reflectance.
   const honey=id===149&&!eye?`float amber=smoothstep(.035,.25,base.r-base.b);
    float cream=(1.-amber)*smoothstep(.27,.65,lum);diffuseColor.rgb=mix(diffuseColor.rgb,
    base*mix(vec3(.84,.68,.53),vec3(1.08,.95,.78),.6+.22*mottle),.66*amber+.77*cream);
    relief=mix(relief,.5,.60*cream+.26*amber);`:'';
   const pearl=role==='dermis'?`float tissue=.5+.5*sin(dot(craftP,vec3(28.,21.,7.))+1.8*sin(dot(craftP,vec3(8.,10.,5.))));
    diffuseColor.rgb*=mix(vec3(.82,.77,.90),vec3(1.035,1.,1.03),craftOcclusion)*(.985+.025*tissue);`:'';
   s.fragmentShader='varying vec3 craftP;varying float craftOcclusion;\n'+s.fragmentShader.replace('#include <alphamap_fragment>',detail+honey+pearl+'\n#include <alphamap_fragment>');
   // r128 writes its final color before tonemapping_fragment.
   const finish=`vec3 craftN=normalize(inverseTransformDirection(normal,viewMatrix));
    vec3 craftV=normalize(vViewPosition);float nv=clamp(abs(dot(normal,craftV)),0.,1.);
    float sky=clamp(.46+.54*dot(craftN,normalize(vec3(-.56,.78,.43))),0.,1.);
    float soft=pow(sky,1.4),edge=pow(1.-nv,${fur||plume?'2.7':'4.2'});
    gl_FragColor.rgb*=mix(vec3(.74,.76,.82),vec3(1.08,1.055,1.01),soft);
    gl_FragColor.rgb+=diffuseColor.rgb*(soft*soft*${fur?'.20':plume?'.22':rock?'.12':'.24'})*craftOcclusion;
    gl_FragColor.rgb+=${fur?'mix(diffuseColor.rgb,vec3(.63,.55,.40),.15)':plume?'mix(diffuseColor.rgb,vec3(.47,.63,.75),.33)':mist?'vec3(.24,.12,.38)':'vec3(.71,.77,.78)'}*edge*(.12+.88*sky)*${eye?'.13':fur?'.35':plume?'.25':plate?'.15':rock?'.03':'.095'};
    vec3 craftH=normalize(inverseTransformDirection(craftV,viewMatrix)+normalize(vec3(-.52,.83,.21)));
    float spread=pow(max(0.,dot(craftN,craftH)),${metal?'32.':eye?'54.':plate?'22.':role==='dermis'?'17.':fur?'6.':'11.'});
    gl_FragColor.rgb+=spread*craftOcclusion*${metal?'vec3(.27,.28,.26)':eye?'vec3(.12,.14,.15)':plate?'vec3(.105,.094,.078)':role==='dermis'?'vec3(.13,.105,.15)':fur?'diffuseColor.rgb*.13':rock?'vec3(.015)':'vec3(.051,.061,.067)'};`;
   s.fragmentShader=s.fragmentShader.replace('#include <tonemapping_fragment>',finish+'\n#include <tonemapping_fragment>')
  };mat.needsUpdate=true
 })
}
