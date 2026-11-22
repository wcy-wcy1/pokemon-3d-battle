from pathlib import Path
def load(n):return Path('work/'+n).read_text(encoding='utf-8-sig')
def put(n,s):Path('work/'+n).write_text(s,encoding='utf8')
s=load('field.js');a=s.index('scale=cap(2.65');b=s.index('u.height=s.y*scale',a);s=s[:a]+"""measure=modelMeasure(u.d.id,mesh,s),scale=FIELD_UNITS_PER_METER*u.d.meters/Math.max(.000001,measure);
u.measuredSpan=measure*scale;u.viewSpan=Math.max(s.y,s.x,s.z)*scale;"""+s[b:];s=s.replace('mesh.position.y=1.25;mesh.scale.set(2.5,2.5,1);','u.height=u.viewSpan=u.d.meters*FIELD_UNITS_PER_METER;mesh.position.y=u.height/2;mesh.scale.set(u.height,u.height,1);');put('field.js',s)
s=load('build.py').replace("'flight','natural'","'flight','scale','natural'");put('build.py',s)
s=load('data.js').replace("return '图鉴身高 '+d.meters","return (longBodies[d.id]?'图鉴体长 ':'图鉴身高 ')+d.meters");put('data.js',s)
s=load('action.js').replace('let lift=.67','let span=Math.max(p.viewSpan||0,e.viewSpan||0),extra=Math.max(0,span-4);back+=extra*(wide?1.2:.75);h+=extra*.28;let lift=.67').replace('1.25+lift,center.z','1.25+lift+Math.max(0,Math.max(p.height,e.height)-3)*.35,center.z');put('action.js',s)
