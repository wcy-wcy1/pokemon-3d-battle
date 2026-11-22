import urllib.request as u,concurrent.futures as f,pathlib,time
from PIL import Image
from io import BytesIO
p=pathlib.Path('work')
ids=[1,3,4,6,7,9,10,12,16,18,25,26,35,37,38,39,52,54,58,59,63,65,66,68,74,76,79,80,92,94,95,104,113,123,129,130,131,132,133,134,135,136,143,144,145,146,149,150,151,384]
def get(i):
 for attempt in range(4):
  try:
   raw=u.urlopen('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/'+str(i)+'.png',timeout=18).read()
   im=Image.open(BytesIO(raw)).convert('RGBA');im.thumbnail((470,470) if i==6 else (320,320));im.save(p/(str(i)+'.webp'),'WEBP',quality=87);return
  except Exception as e:err=e
 print(i,err,flush=True)
with f.ThreadPoolExecutor(14) as ex:list(ex.map(get,ids))
