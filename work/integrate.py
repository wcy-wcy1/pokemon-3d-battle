from pathlib import Path
def mod(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s;p.write_text(s.replace(a,b),encoding='utf-8')
mod('build.py',"['data','scene','cards','battle']","['data','scene','cards','battle','world','field','action']")
mod('build.py',"s=read('page.html')","""raw=p/'rtassets'
mods={int(f.stem):base64.b64encode(f.read_bytes()).decode() for f in raw.glob('*.glb')}
app='const EX_MODELS='+json.dumps(mods)+';const EX_DECODER='+json.dumps((raw/'draco_decoder.js').read_text('utf-8')).replace('</','<\\\\/')+';\\n'+app
s=read('page.html')""")
mod('build.py',"read('three.js')","read('three.js')+'\\n'+read('rtassets/DRACOLoader.js')+'\\n'+read('rtassets/GLTFLoader.js')")
mod('build.py',"read('polish.css')","read('polish.css')+read('field.css')")
gate='<button class="fieldGate" onclick="exGate()"><div><small>FIELD EXPEDITION　/　3D LIVE</small><b>旷野实战</b></div><span>三处生态战场 · 实时操控　↗</span></button>'
mod('page.html','<div class="featuretitle">',gate+'<div class="featuretitle">')
mod('page.html','<small class="accent">▰','<button class="exQuick" onclick="exGate()">进入实时战场 ↗</button><small class="accent">▰')
mod('cards.js','<h3 style="margin:16px 0">我的卡库',gate+'<h3 style="margin:16px 0">我的卡库')
mod('scene.js',"if(view!=='home'||document.hidden)return","if(view!=='home'||document.hidden||field)return")
mod('field.js',"'场景无效'","'场景无效'") if False else None
mod('field.js',"""(brief?b.note:paused?""","""(brief?b.note+(S.expeditions?.[zIndex(f)]?.wins?'　最佳通关：'+S.expeditions[zIndex(f)].best+' 秒。':''):paused?""")
mod('field.js','zIndex(f)','f.z')

