from pathlib import Path
def edit(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s;p.write_text(s.replace(a,b),encoding='utf-8')
edit('scene.js','skin=new THREE.MeshStandardMaterial',"""let studio=document.createElement('canvas');studio.width=512;studio.height=256;let sg=studio.getContext('2d');sg.fillStyle='#424347';sg.fillRect(0,0,512,256);let band=sg.createLinearGradient(0,0,512,120);for(let [p,k] of [[0,'#313137'],[.12,'#a5a4a0'],[.2,'#faf4e9'],[.32,'#373943'],[.56,'#7b7470'],[.68,'#e9ddd1'],[.77,'#49454a'],[1,'#323238']])band.addColorStop(p,k);sg.fillStyle=band;sg.fillRect(0,0,512,256);let env=new THREE.CanvasTexture(studio);env.mapping=THREE.EquirectangularReflectionMapping;let pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(env).texture;pm.dispose();env.dispose();skin=new THREE.MeshStandardMaterial""")
edit('scene.js',"for(let i=0;i<10;i++){let c=new THREE.Mesh","""let cb=document.createElement('canvas');cb.width=220;cb.height=300;let cg=cb.getContext('2d');cg.fillStyle='#1c3654';cg.fillRect(0,0,220,300);cg.strokeStyle='#d5b376';cg.lineWidth=6;cg.strokeRect(9,9,202,282);for(let r of [55,46,17]){cg.beginPath();cg.arc(110,150,r,0,7);cg.stroke()}cg.beginPath();cg.moveTo(54,150);cg.lineTo(94,150);cg.moveTo(126,150);cg.lineTo(166,150);cg.stroke();let bt=new THREE.CanvasTexture(cb);bt.encoding=THREE.sRGBEncoding;for(let i=0;i<10;i++){let c=new THREE.Mesh""")
edit('scene.js','color:i===9?0x35465e:0xd3cbc0','color:0xffffff,map:bt,roughness:.75')
edit('scene.js','orig[3*i+1]-.21*fold','orig[3*i+1]-.21*fold+.03*fold*Math.sin(v*33)')
edit('cards.js','function setFocus(i){focus=i;','function setFocus(i){focus=i;chord(rank(pack[i]));')
edit('cards.js','function inspect(id){let d=db[id];','function inspect(id){let d=db[id];chord(rank(d));')
edit('cards.js','function library(v){','''function historyList(){return S.records?.length?'<details style="margin-top:12px"><summary>最近战绩 · '+S.records.length+'</summary>'+S.records.slice().reverse().map(x=>'<p style="padding:5px">'+(x.win?'胜利':'惜败')+' · 第 '+x.w+' 站 · '+x.turn+' 回合 · '+x.team.map(i=>esc(db[i].name)).join(' / ')+'</p>').join('')+'</details>':''}
function library(v){''')
edit('cards.js','开始对战 →</button></div></div>','开始对战 →</button></div>\'+historyList()+\'</div>')
edit('battle.js','b.done=true;S[','b.done=true;S.records=[...(S.records||[]),{win,w:b.w,turn:b.turn,team:S.team.slice()}].slice(-12);S[')

