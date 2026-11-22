from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s,a;p.write_text(s.replace(a,b),encoding='utf8')
ed('build.py',"'duo','hydro','field'","'duo','hydro','creature','natural','watch','field'")
ed('field.js','if(t?.isTexture)items.add(t)','if(t?.isTexture&&!t.userData?.fieldShared)items.add(t)')
ed('field.js','u.mixer=null;u.currentAnim=null;registerRig(u,model);','u.mixer=null;u.currentAnim=null;registerRig(u,model);unitLife(u,model);')
ed('field.js','calib(u);unifyLight(f,u);','calib(u);unifyLight(f,u);microFinish(f,u);downyCoat(u);')
ed('field.js','realWorld(f);initDuo(f);','realWorld(f);fieldProbe(f);initDuo(f);')
ed('field.js',"else if(f.mode==='brief'){f.t+=dt;","else if(f.mode==='watch'){watchTick(f,dt)}else if(f.mode==='brief'){f.t+=dt;")
ed('field.js','f.r?.dispose();','f.probe?.dispose();f.r?.dispose();')
ed('field.js','试用皮卡丘与水箭龟</button>','试用皮卡丘与水箭龟</button> <button class="exBtn" onclick="observe(field)">野外观察</button>')
ed('beats.js','duoPose(f,u);placePatch','duoPose(f,u);living(f,u,dt,walk);placePatch')

