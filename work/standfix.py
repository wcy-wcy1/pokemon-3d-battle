from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s,a;p.write_text(s.replace(a,b),'utf8')
ed('field.js','u.mixer=null;u.currentAnim=null;registerRig(u,model);',"""// Pikachu's bind pose is horizontal. The opening frame of Impactrueno is its planted stance.
if(u.d.id===25){let idleFrame=model.animations.find(a=>/impactrueno/i.test(a.name));if(idleFrame){let sampler=new THREE.AnimationMixer(mesh);sampler.clipAction(idleFrame).play();sampler.setTime(0);mesh.updateMatrixWorld(true)}}
u.mixer=null;u.currentAnim=null;registerRig(u,model);""")
ed('moves.js',"u.playNative=(tag)=>{let re=","u.playNative=(tag)=>{if(u.d.id===25)return;let re=")
ed('duo.js','body.updateWorldMatrix(true,true);let samples=','u.root.updateMatrixWorld(true);let samples=')
ed('duo.js',"v.y<u.height*.32||Math.abs(v.x)","v.y<u.height*.32||v.y>u.height*.98||Math.abs(v.x)")
ed('duo.js','let old=mat.onBeforeCompile;mat.onBeforeCompile','let old=mat.onBeforeCompile,oldKey=mat.customProgramCacheKey();mat.customProgramCacheKey=()=>oldKey+\'|field-ground\';mat.onBeforeCompile')
ed('duo.js','let l=f.lamps[u===f.p?0:1]','let l=f.lamps[u===f.e?1:0]')
ed('hydro.js','if(!b)return;if(v||jet)','if(!b)return;b.firstChild.textContent=\'属性招式\';if(v||jet)')

