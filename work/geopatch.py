from pathlib import Path
def edit(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s,a;p.write_text(s.replace(a,b),encoding='utf8')
edit('build.py',"'world','field'","'world','geo','field'")
edit('build.py',"app='const EX_MODELS='","""land=p/'real';dem=[json.loads((land/f'dem{k}.json').read_text()) for k in range(3)]
tx={f.stem:'data:image/webp;base64,'+base64.b64encode(f.read_bytes()).decode() for f in land.glob('*.webp')}
app='const EX_DEM='+json.dumps(dem)+';const EX_TX='+json.dumps(tx)+';const EX_MODELS='""")
edit('field.js','exWorld(f);','realWorld(f);')
edit('field.js','new T.PerspectiveCamera(51,1,.15,160)','new T.PerspectiveCamera(53,1,.14,230)')
edit('field.js',"f.cam.position.set(7,5.2,11)","f.cam.position.set(-5,3.2,10)")
edit('field.js','f.cam.position.x=7+','f.cam.position.x=-5+')
edit('field.js','mesh=model.scene;let box=new THREE.Box3().setFromObject(mesh)','''mesh=model.scene;
let anim=model.animations.find(a=>/idle|wait|stand|battle_wait/i.test(a.name))||model.animations.find(a=>/default/i.test(a.name));
if(anim){u.mixer=new THREE.AnimationMixer(mesh);u.mixer.clipAction(anim).play();u.mixer.update(.02)}
mesh.updateMatrixWorld(true);let bounds=new THREE.Box3;
mesh.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.skeleton?.update();let pos=m.geometry.attributes.position;for(let j=0;j<pos.count;j+=Math.max(1,Math.floor(pos.count/3500))){let v=V().fromBufferAttribute(pos,j);if(m.isSkinnedMesh)m.boneTransform(j,v);bounds.expandByPoint(v.applyMatrix4(m.matrixWorld))}});
let box=bounds''')
edit('field.js',";let anim=model.animations.find(a=>/idle|wait|stand|battle_wait/i.test(a.name))||model.animations.find(a=>/default/i.test(a.name));if(anim){u.mixer=new THREE.AnimationMixer(mesh);u.mixer.clipAction(anim).play()}u.model3d=true",";u.model3d=true")
edit('field.js','mesh.scale.multiplyScalar(scale);mesh.position.sub(V(mid.x,box.min.y,mid.z).multiplyScalar(scale));','let wrapper=new THREE.Group;wrapper.add(mesh);wrapper.scale.setScalar(scale);wrapper.position.copy(V(mid.x,box.min.y,mid.z)).multiplyScalar(-scale);mesh=wrapper;')
edit('field.js','(brief?b.note+',"(brief?realSites[f.z][2]+'　'+realSites[f.z][3]+'<br>'+b.note+")
edit('field.js',"'进入战场':paused","'进入战场':paused")
edit('action.js','if(f.water)f.water.position.y=-.03+.06*Math.sin(f.t*.65);','if(f.water){f.water.position.y=-.03+.06*Math.sin(f.t*.65);f.water.material.uniforms.time.value=f.t;}')
edit('action.js','h=(wide?10.8:6.6)+dist*.21,back=(wide?12.4:8.2)+dist*.25','h=(wide?7.3:3.7)+dist*.13,back=(wide?14:9.5)+dist*.34')
edit('action.js','f.cam.lookAt(center.x+Math.sin(f.t*115)*f.shake, .85,center.z)','f.cam.lookAt(center.x+Math.sin(f.t*115)*f.shake, 1.25,center.z)')
f=Path('work/world.js');s=f.read_text('utf-8-sig');f.write_text(s[:s.index('function exWorld(')],'utf-8')

