import json,struct,pathlib,io
from PIL import Image,ImageDraw
files=sorted(pathlib.Path('work/rtassets').glob('*.glb'),key=lambda f:int(f.stem))
for k in range(5):
 c=Image.new('RGB',(980,800),'#353535');g=ImageDraw.Draw(c)
 for j,f in enumerate(files[k*10:k*10+10]):
  b=f.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);g.text((0,j*80+19),f.stem)
  for i,m in enumerate(d.get('materials',[])[:12]):
   ti=m.get('pbrMetallicRoughness',{}).get('baseColorTexture',{}).get('index')
   if ti is None:continue
   tex=d['textures'][ti];ix=tex.get('source',tex.get('extensions',{}).get('EXT_texture_webp',{}).get('source'));v=d['bufferViews'][d['images'][ix]['bufferView']];o=n+28+v.get('byteOffset',0);im=Image.open(io.BytesIO(b[o:o+v['byteLength']])).convert('RGB').resize((68,62));x=32+i*76;c.paste(im,(x,j*80));g.text((x,j*80+62),str(i),fill='white')
 c.save('work/faces'+str(k)+'.jpg',quality=94)
