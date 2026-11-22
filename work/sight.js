// Camera-space cutaway for instanced foliage, branches and trunks (colour pass only).
function forestSight(f,materials){
 const targets=[new THREE.Vector4,new THREE.Vector4,new THREE.Vector4],enabled={value:0};
 for(const m of materials){
  const prior=m.onBeforeCompile,key=m.customProgramCacheKey();
  m.customProgramCacheKey=()=>key+'|forest-sight-v2';
  m.onBeforeCompile=(s,r)=>{
   prior.call(m,s,r);s.uniforms.sightOn=enabled;s.uniforms.sightTargets={value:targets};
   s.fragmentShader='uniform float sightOn; uniform vec4 sightTargets[3];\n'+s.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
   if(sightOn>.5){
    float z=vViewPosition.z;
    vec2 uv=-vViewPosition.xy/max(z,.01);
    vec4 a=sightTargets[0], b=sightTargets[1];
    vec2 ab=b.xy-a.xy;
    float t=clamp(dot(uv-a.xy,ab)/max(.00001,dot(ab,ab)),0.,1.);
    vec4 q=mix(a,b,t);
    float cut=0.;
    for(int i=0;i<3;i++){
     vec4 v=q;if(i==0)v=a;else if(i==1)v=b;
     float radial=length(uv-v.xy)/v.w;
     cut=max(cut,(1.-smoothstep(.82,1.18,radial))*(1.-smoothstep(v.z-.15,v.z+.12,z)));
    }
    vec4 sky=sightTargets[2]; if(sky.w>.001){float r=length(uv-sky.xy)/sky.w;cut=max(cut,(1.-smoothstep(.82,1.17,r))*(1.-smoothstep(sky.z-.5,sky.z+.5,z)));}
    cut=max(cut,1.-smoothstep(.85,2.2,z));
    float stipple=fract(52.9829189*fract(dot(floor(gl_FragCoord.xy),vec2(.06711056,.00583715))));
    if(cut>stipple)discard;
   }`);
  }
 }
 const p=V();
 f.updateSight=()=>{
  enabled.value=['live','pause','watch','win','lose'].includes(f.mode)&&f.p?.ready?1:0;if(!enabled.value)return;
  f.cam.updateMatrixWorld();
  for(let i=0;i<2;i++){const u=i&&(f.mode!=='watch'||f.watch?.neighbours!==false)&&f.e?.ready?f.e:f.p;
   p.copy(bodyPoint(f,u)).applyMatrix4(f.cam.matrixWorldInverse);
   let z=Math.max(.2,-p.z),radius=Math.max(1.8,u.height*.72,(u.viewSpan||0)*.60);
   // The far flank of a long animal can lie behind its torso plane.
   const depthPad=Math.min(radius*.72,3.8);
   targets[i].set(p.x/z,p.y/z,z+depthPad,Math.max(.22,radius/z))
  }
  const scene=f.celestial;targets[2].w=0;
  if(scene&&scene.u===f.p&&scene.end>f.t){
   p.copy(scene.center).applyMatrix4(f.cam.matrixWorldInverse);
   const z=Math.max(.2,-p.z),fade=flowSmooth((f.t-scene.start)/.45)*flowSmooth((scene.end-f.t)/.55);
   targets[2].set(p.x/z,p.y/z,z+1.6,4.4*fade/z)
  }
 };
}
