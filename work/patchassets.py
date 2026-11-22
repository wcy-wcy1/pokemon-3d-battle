from pathlib import Path
import urllib.request as u
from PIL import Image
from io import BytesIO
p=Path('work')
im=Image.open(BytesIO(u.urlopen('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png',timeout=15).read())).convert('RGBA');im.thumbnail((320,320));im.save(p/'197.webp','WEBP',quality=87)
f=p/'data.js';f.write_text(f.read_text('utf-8-sig').replace('132 百变怪 一般 R 变身','197 月亮伊布 恶 SR 恶之波动'),'utf-8')
f=p/'build.py';f.write_text(f.read_text('utf-8-sig').replace("for f in p.glob('*.webp')}","for f in p.glob('*.webp') if f.stem!='132'}"),'utf-8')
f=p/'scene.js';f.write_text(f.read_text('utf-8-sig').replace("g.globalCompositeOperation='destination-out';","g.globalCompositeOperation='destination-out';g.fillStyle='#000';").replace('0xc1b9b8,1.4','0xc1b9b8,1.1'),'utf-8')
