from pathlib import Path
import base64,json,csv
p=Path('work')
def read(n):return (p/n).read_text('utf-8-sig')
art={int(f.stem):'data:image/webp;base64,'+base64.b64encode(f.read_bytes()).decode() for f in p.glob('*.webp') if f.stem!='132'}
app='\n'.join(read(n+'.js') for n in ['data','scene','cards','mega','megafx','battle','world','sight','geo','groundresponse','weather','habitatweather','moves','missileart','elementfx','strike','club','irontail','peck','birddive','birdfront','rockvolley','terraincast','evofield','turtlej','duelframe','hitfeedback','guard','combatflow','lullaby','psystrike','limitbreak','landscape','charizard','resonance','fault','grip','palm','skillfx','encounter','beats','duo','hydro','creature','bodylanguage','anatomymotion','silhouette','speciesdetail','compliance','faunagait','travel','flight','scale','model-finish','natural','wild','fieldlife','offering','neighbour','fieldvoice','watch','field','faint','action'])
raw=p/'rtassets'
mods={int(f.stem):base64.b64encode(f.read_bytes()).decode() for f in raw.glob('*.glb')}
# PokeAPI pokemon.csv (default forms): decimetres and hectograms.
with (p/'pokemon-physical.csv').open(encoding='utf-8') as fp:
 phys={int(row['id']):[int(row['height'])/10,int(row['weight'])/10] for row in csv.DictReader(fp) if row['is_default']=='1' and int(row['id']) in mods}
assert len(phys)==50 and set(phys)==set(mods)-{10034} and all(h>0 and w>0 for h,w in phys.values())
app='const DEX_BODY='+json.dumps(phys,separators=(',',':'))+';\n'+app
land=p/'real';dem=[json.loads((land/f'dem{k}.json').read_text()) for k in range(3)]
tx={f.stem:'data:image/webp;base64,'+base64.b64encode(f.read_bytes()).decode() for f in land.glob('*.webp')}
app='const PIKA_WORD='+json.dumps(base64.b64encode((p/'pikacall.wav').read_bytes()).decode())+';const EX_TREE_HIGH='+json.dumps(json.loads((land/'treehigh.json').read_text()))+';const EX_TREE='+json.dumps(json.loads((land/'tree.json').read_text()))+';const EX_DEM='+json.dumps(dem)+';const EX_TX='+json.dumps(tx)+';const EX_MODELS='+json.dumps(mods)+';const EX_DECODER='+json.dumps((raw/'draco_decoder.js').read_text('utf-8')).replace('</','<\\/')+';\n'+app
s=read('page.html').replace('__THREE__',read('three.js')+'\n'+read('rtassets/DRACOLoader.js')+'\n'+read('rtassets/GLTFLoader.js')).replace('__CSS__',read('ui.css')+read('polish.css')+read('field.css')).replace('__ART__',json.dumps(art)).replace('__LOGO__',"''").replace('__APP__',app).replace('<div id="gl"','<div class="stageindex">SPECIMEN<b>006</b></div><i class="scale"></i><div id="gl"')
Path('outputs/index.html').write_text(s,encoding='utf-8')

