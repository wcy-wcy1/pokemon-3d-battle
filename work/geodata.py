import numpy as np,urllib.request as u,math,concurrent.futures as ft,json
from PIL import Image
from pathlib import Path
from io import BytesIO
p=Path('work/real');p.mkdir(exist_ok=True)
def load(url):
 for i in range(3):
  try:return u.urlopen(url,timeout=30).read()
  except Exception as err:e=err
 raise e
places=[(30.3785,130.5722),(55.2408,-6.5116),(31.5523,130.6735)]
def dem(k,loc):
 lat,lon=loc;z=12;n=256*2**z;cx=(lon+180)/360*n;cy=(1-math.asinh(math.tan(math.radians(lat)))/math.pi)*.5*n;step=75/(math.cos(math.radians(lat))*40075016.69/n);i=np.arange(129)-64;X,Y=np.meshgrid(np.rint(cx+i*step).astype(int),np.rint(cy+i*step).astype(int));h=np.zeros(X.shape)
 def tile(q):
  x,y=q;im=np.asarray(Image.open(BytesIO(load(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'))).convert('RGB'),dtype=float);a=X//256==x;a&=Y//256==y;v=im[Y[a]%256,X[a]%256];h[a]=v[:,0]*256+v[:,1]+v[:,2]/256-32768
 with ft.ThreadPoolExecutor(8) as ex:list(ex.map(tile,[(x,y) for x in np.unique(X//256) for y in np.unique(Y//256)]))
 (p/f'dem{k}.json').write_text(json.dumps(h.round().astype(int).flatten().tolist()));print(k,int(h.min()),int(h.max()),flush=True)
root='https://raw.githubusercontent.com/BabylonJS/Assets/master/'
tx={'soil':'textures/ground.jpg','basalt':'textures/rockyGround_basecolor.png','norm':'textures/rockyGround_normal.png','stone':'textures/rock.png','bark':'meshes/Trees/BroadleafBark.jpg','moss':'textures/grass.jpg','sand':'textures/sand.jpg'}
def tex(kv):
 k,v=kv;im=Image.open(BytesIO(load(root+v))).convert('RGB');im.thumbnail((768,768));im.save(p/(k+'.webp'),'WEBP',quality=86)
with ft.ThreadPoolExecutor(10) as ex:
 jobs=[ex.submit(dem,k,v) for k,v in enumerate(places)]+[ex.submit(tex,v) for v in tx.items()]
 for j in jobs:j.result()

