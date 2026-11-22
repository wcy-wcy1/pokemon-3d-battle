from pathlib import Path
def ed(n,a,b):
 f=Path('work/'+n);s=f.read_text('utf-8-sig');assert a in s;f.write_text(s.replace(a,b),'utf8')
ed('moves.js','u.gait=0;u.cmd=null;',"""u.glow={value:0};if(u.d.id===197){model.scene.traverse(m=>{if(!m.isMesh)return;for(let mat of [].concat(m.material)){mat.onBeforeCompile=s=>{s.uniforms.ringGlow=u.glow;s.fragmentShader='uniform float ringGlow;\\n'+s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\\nfloat ringMask=smoothstep(.08,.33,min(diffuseColor.r,diffuseColor.g)-diffuseColor.b);totalEmissiveRadiance+=vec3(1.,.71,.08)*ringGlow*ringMask;')};mat.needsUpdate=true}})}u.gait=0;u.cmd=null;""")
ed('moves.js','if(!u.poseBones)return;','''if(u.glow)u.glow.value=load*2.3+hit*1.7;if(kind==='tail')u.body.rotation.y+=hit*1.05;if(kind==='roll')u.body.rotation.x+=q*6.283;if(kind==='flop')u.body.rotation.z+=hit*.87;if(kind==='ascent'||kind==='dragonrush')u.body.rotation.z+=q*6.283;if(!u.poseBones)return;''')
ed('beats.js','flare(f,.31,g=>{g.position.copy(u.pos);',"""if(['punch','palm','barrage','slap','bash','stomp','bodyslam','roll','tackle','flop'].includes(k)){let p=u.pos.clone().addScaledVector(a.dir,.85);exFx(f,p,['stomp','bodyslam','roll'].includes(k)?0xcaaa79:c,k==='bodyslam'?2.3:1.2);if(k==='barrage')for(let i=0;i<4;i++)exFx(f,p.clone().add(V((i%2-.5)*.8,0,(i-2)*.2)),c,.65);return}
if(k==='fang'||k==='bite'){flare(f,.29,g=>{g.position.copy(u.pos).addScaledVector(a.dir,.97);g.position.y=groundY(g.position.x,g.position.z,f.z)+1;g.rotation.y=u.face;for(let i=0;i<8;i++){let up=i>=4,m=part(g,new THREE.ConeGeometry(.11,.60,5),k==='fang'?0xffa341:0xffedd0,((i%4)-1.5)*.24,up?.53:-.53,.3);if(up)m.rotation.z=Math.PI}},(g,t)=>g.scale.y=1-.78*Math.sin(t*Math.PI));return}
flare(f,.31,g=>{g.position.copy(u.pos);""")
ed('strike.js',"else for(let i=0;i<(k==='rock'?3:13);i++)","""else for(let i=0;i<(k==='rock'?3:13);i++)""")
ed('strike.js',"if(k==='coins')","if(k==='coins')")
ed('strike.js','if(fam===\'pulse\'){a.origin',"""if(fam==='pulse'){a.origin""")
ed('field.js',"'J · '+choreo[f.p.d.id].n","'J · '+choreo[f.p.d.id].n")

