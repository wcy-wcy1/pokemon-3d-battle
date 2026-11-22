from pathlib import Path
import json,urllib.request as u,concurrent.futures as f,time,struct
p=Path('work/rtassets');p.mkdir(exist_ok=True)
def get(a):
 n,url=a
 for t in range(4):
  try:
   b=u.urlopen(url,timeout=30).read();(p/n).write_bytes(b);return
  except Exception as e:err=e
 print(n,err)
ids=[f.stem for f in Path('work').glob('*.webp') if f.stem!='132']
jobs=[(i+'.glb','https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/'+i+'.glb') for i in ids]+[(n,'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/'+q) for n,q in [('GLTFLoader.js','loaders/GLTFLoader.js'),('DRACOLoader.js','loaders/DRACOLoader.js'),('draco_decoder.js','libs/draco/gltf/draco_decoder.js')]]
with f.ThreadPoolExecutor(10) as ex:list(ex.map(get,jobs))
print(len(list(p.glob('*.glb'))),sum(x.stat().st_size for x in p.glob('*')))
