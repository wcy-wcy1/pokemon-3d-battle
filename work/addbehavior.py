from pathlib import Path
p=Path('work/build.py');s=p.read_text('utf8');p.write_text(s.replace("'creature','natural'","'creature','bodylanguage','natural'"),'utf8')
p=Path('work/beats.js');s=p.read_text('utf8');p.write_text(s.replace('living(f,u,dt,walk);placePatch','living(f,u,dt,walk);speciesAct(f,u);placePatch'),'utf8')
