from pathlib import Path
import json,urllib.request as u
from PIL import Image,ImageEnhance
import numpy as np
from io import BytesIO
p=Path('work/real')
im=Image.open(BytesIO(u.urlopen('https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/Trees/Broadleaf_Desktop_Atlas.png').read())).convert('RGBA');im.thumbnail((1024,1024));im.save(p/'foliage.webp',quality=91)
j=json.load(open('work/trees.json',encoding='utf-8-sig'));m=j['meshes'][3];(p/'tree.json').write_text(json.dumps({k:m[k] for k in ['positions','normals','uvs','indices','subMeshes']}))
def arr(n):return np.asarray(Image.open(p/(n+'.webp')).convert('RGB').resize((768,768)),float)
soil,moss,bark=arr('soil'),arr('moss'),arr('bark');yy,xx=np.indices((768,768))*2*np.pi/768;mix=np.clip(.50+.30*np.sin(xx+np.sin(yy))+.19*np.cos(yy*3+.7*np.sin(xx*2))+.08*np.sin(xx*7+yy*3),0,1)[:,:,None];forest=(soil*np.array([.47,.40,.32])*.72+bark*.28)*(1-mix)+moss*np.array([.62,.58,.52])*mix
Image.fromarray(np.uint8(np.clip(forest,0,255))).save(p/'humus.webp',quality=90)
for n,tint in [('lava',[.34,.35,.39]),('shore',[.65,.70,.72])]:
 a=arr('basalt');gray=(a[:,:,0]*.3+a[:,:,1]*.59+a[:,:,2]*.11)[:,:,None];Image.fromarray(np.uint8(np.clip((gray-128)*1.48*np.array(tint)+128*np.array(tint),0,255))).save(p/(n+'.webp'),quality=90)

