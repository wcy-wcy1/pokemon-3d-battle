from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s;p.write_text(s.replace(a,b),'utf8')
ed('build.py',"'natural','watch'","'natural','wild','watch'")
ed('field.js','microFinish(f,u);','wildlifeFinish(f,u);')
ed('natural.js','map:src.material.map,envMap:','color:0xc5a470,map:src.material.map,envMap:')
