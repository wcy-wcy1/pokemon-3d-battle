from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s;p.write_text(s.replace(a,b),'utf8')
ed('duo.js','function calib(u){','''function unifyLight(f,u){if(!u.model3d)return;u.floorY={value:groundY(u.pos.x,u.pos.z,f.z)};let seen=new Set;u.body.traverse(m=>{if(!m.isMesh)return;for(let mat of [].concat(m.material)){if(seen.has(mat)||!mat.isMeshStandardMaterial)return;seen.add(mat);let old=mat.onBeforeCompile;mat.onBeforeCompile=function(s,r){old.call(this,s,r);s.uniforms.pokeFloor=u.floorY;s.uniforms.pokeHeight={value:u.height||2};s.uniforms.pokeBounce={value:new THREE.Color([0xa1b28a,0xb4c9cb,0xb39a92][f.z]).convertSRGBToLinear()};s.vertexShader='varying float actorWY;\\n'+s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\\nactorWY=(modelMatrix*vec4(transformed,1.)).y;');s.fragmentShader='varying float actorWY;uniform float pokeFloor,pokeHeight;uniform vec3 pokeBounce;\\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\\nfloat low=1.-smoothstep(0.,.65,(actorWY-pokeFloor)/pokeHeight);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))),.065);diffuseColor.rgb*=mix(vec3(1.),.59+.34*pokeBounce,low*.66);')};mat.needsUpdate=true}})}
function vaporTex(){let t=softTex(),c=t.image,g=c.getContext('2d'),a=g.getImageData(0,0,96,96);for(let y=0;y<96;y++)for(let x=0;x<96;x++){let n=(y*96+x)*4+3,sw=.5+.5*Math.sin(x*.16+Math.sin(y*.10)*3+y*.054);a.data[n]*=(.12+.88*sw*sw)}g.putImageData(a,0,0);t.needsUpdate=true;return t}
function calib(u){''')
ed('duo.js','let tex=softTex(),motes=[]','let tex=softTex(),vapor=vaporTex(),motes=[]')
ed('duo.js','map:tex,transparent:true,opacity:0','map:i<2?tex:vapor,transparent:true,opacity:0')
ed('duo.js','drawRibbon(f,v.halo,lines,.060);','''if(armed&&u.poseBones?.length){let bones=u.poseBones.filter(b=>b.job==='ear'||b.job==='tail'||b.job==='arm');for(let j=0;j<3&&bones.length;j++){let tip=bones[(v.seed+j*5)%bones.length].n.getWorldPosition(V());if(tip.distanceTo(center)<h*1.3){let start=cheeks[j%2];lines.push([pathNoise(start,tip,.32,rng,9),.64]);if(j===0)lines.push([pathNoise(tip,V(tip.x+.16,groundY(tip.x,tip.z,f.z)+.02,tip.z+.25),.25,rng,8),.37])}}}
drawRibbon(f,v.halo,lines,.060);''')
ed('duo.js','m.material.opacity=(armed?.29:','m.material.rotation=theta+age*.7;m.material.opacity=(armed?.44:')
ed('duo.js','function releaseVolts(f,u,aim){let t=','function releaseVolts(f,u,aim){let turn=exDir(u.pos,aim);u.face=Math.atan2(turn.x,turn.z);u.body.rotation.y=u.face;u.body.updateWorldMatrix(true,true);let t=')
ed('duo.js','function placePatch(f,u){let o=','function placePatch(f,u){if(u.floorY)u.floorY.value=groundY(u.pos.x,u.pos.z,f.z);let o=')
ed('field.js','contactPatch(f,u);calib(u);','contactPatch(f,u);calib(u);unifyLight(f,u);')
ed('hydro.js',"if(!b)return;if(u.d.id===25)","if(!b)return;if(v||jet){for(let i of [0,3])f.el.querySelector('[data-a=\"'+i+'\"]').disabled=true}if(u.d.id===25)")

