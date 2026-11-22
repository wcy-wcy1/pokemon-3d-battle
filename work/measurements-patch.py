from pathlib import Path
def patch(n,*pairs):
 p=Path('work')/n;s=p.read_text('utf-8-sig')
 for a,b in pairs:
  assert a in s,(n,a);s=s.replace(a,b)
 p.write_text(s,'utf-8')
patch('build.py',('import base64,json','import base64,json,csv'),("land=p/'real';","""# PokeAPI pokemon.csv (default forms): decimetres and hectograms.
with (p/'pokemon-physical.csv').open(encoding='utf-8') as fp:
 phys={int(row['id']):[int(row['height'])/10,int(row['weight'])/10] for row in csv.DictReader(fp) if row['is_default']=='1' and int(row['id']) in mods}
assert len(phys)==50 and phys.keys()==mods.keys() and all(h>0 and w>0 for h,w in phys.values())
app='const DEX_BODY='+json.dumps(phys,separators=(',',':'))+';\\n'+app
land=p/'real';"""))
patch('data.js',('return [id,{id,name,type,r,move,hp:',"return [id,{id,name,type,r,move,meters:DEX_BODY[id][0],kg:DEX_BODY[id][1],hp:"))
with open('work/data.js','a',encoding='utf-8') as f:f.write("\nfunction bodyFacts(d){return '图鉴身高 '+d.meters.toFixed(1)+' m　·　体重 '+d.kg.toFixed(1)+' kg'}\n")
patch('field.js',("scale*=u.d.id===25?.74:u.d.id===1?.78:1;u.height=s.y*scale;","""if(u.d.id===25)scale*=.74;else{
 // Preserve proportions and readability on the compact field. Long entries
 // describe body length, so fit the longest axis instead of stretching vertically.
 const span=[95,130,384].includes(u.d.id)?Math.max(s.y,s.z,s.x):Math.max(s.y,s.x*.70,s.z*.58);
 const target=1.961*Math.pow(u.d.meters/.4,.39);
 scale=cap(target/Math.max(span,.001),.00001,400)
}u.viewSpan=Math.max(s.y,s.x*.66,s.z*.82)*scale;u.height=s.y*scale;"""))
patch('watch.js',('</button></div><span>轻点','</button></div><small class="watchBio"></small><span>轻点'),('f.p=exUnit(db[id]);','f.p=exUnit(db[id]);f.watch.bar.querySelector(\'.watchBio\').textContent=bodyFacts(db[id]);'),('let vy=u.height||2,wide=','let vy=u.viewSpan||u.height||2,wide='),(')+vy*.52,u.pos.z',')+(u.height||vy)*.52,u.pos.z'))
patch('cards.js',("+'系</p><label>暴击 '","+'系<br>'+bodyFacts(d)+'</p><label>暴击 '"))
patch('faunagait.js',("const bones=new Map;", """// Mild allometry: same species keeps its rate across different camera scales.
 g.cadence=cap(Math.pow(u.d.meters/.9,-.18)*Math.pow(u.d.kg/24,-.055),.63,1.50);
 g.inertia=cap(Math.pow(u.d.kg/24,.24),.65,1.95);
 const bones=new Map;"""),("g.weight+=(Number(active)-g.weight)*(1-Math.exp(-dt*10));g.speed+=(drive-g.speed)*(1-Math.exp(-dt*7));","g.weight+=(Number(active)-g.weight)*(1-Math.exp(-dt*10/g.inertia));g.speed+=(drive-g.speed)*(1-Math.exp(-dt*7/g.inertia));"),("dt*(pace+strength*(heavy?.72:1.15))","dt*g.cadence*(pace+strength*(heavy?.72:1.15))"),("if(kind==='authored')return;","if(kind==='authored'){if(active&&u.currentAnim)u.currentAnim.setEffectiveTimeScale(cap(g.cadence*(.95+.32*strength),.72,1.26));return}"),("H*.051*gallop","H*.051/g.inertia*gallop"))
patch('faunapreview.cjs',("dt=1/(24*hz)","dt=1/(24*hz*g.cadence)"))
