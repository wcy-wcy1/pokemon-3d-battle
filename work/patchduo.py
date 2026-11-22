from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s,a;p.write_text(s.replace(a,b),'utf8')
ed('build.py',"'beats','field'","'beats','duo','hydro','field'")
p=Path('work/field.js');s=p.read_text('utf8');a=s.index('let sg=new THREE.CircleGeometry(1,40)');b=s.index('u.ready=true;',a);p.write_text(s[:a]+'contactPatch(f,u);calib(u);'+s[b:],'utf8')
ed('field.js','realWorld(f);wxInit(f);','realWorld(f);initDuo(f);wxInit(f);')
ed('field.js',"'L · 释放'][i]})}","'L · 释放'][i]});duoHud(f)}")
ed('field.js',"if(k==='KeyJ')","if(k==='KeyJ')") if False else None
ed('field.js',"hit))exAct(f,0,hit)","hit))exAct(f,f.p.volts?.phase==='armed'?1:0,hit)")
ed('field.js','</details>\':\'\')+',"</details><button class=\"exBtn\" onclick=\"duoTrial(field)\">试用皮卡丘与水箭龟</button>':'')+")
ed('action.js','old.cmd=null;n.cmd=null;','stopPower(f,old);old.cmd=null;n.cmd=null;')
ed('action.js','if(i===2){p.cmd=null;','if(i===1&&p.d.id===25){manualVolts(f,p,aim||f.e.pos);exHUD(f,true);return}if(i===1&&p.d.id===9){pressurize(f,p,aim||f.e.pos);return}if(i!==2&&(p.volts||p.jet))return;if(i===2){stopPower(f,p);p.cmd=null;')
ed('action.js','u.flinch=.38;','u.flinch=.38;chargeHit(f,u);')
ed('action.js','if(u.hp===0){if(mine)','if(u.hp===0){stopPower(f,u);if(mine)')
ed('action.js','if(p.cmd){sp*=.28;','if(p.jet)sp=0;if(p.volts)sp*=p.volts.phase===\'armed\'?.85:.55;if(p.cmd){sp*=.28;')
ed('action.js','let ew=npcStep(f,dt);','duoStep(f,dt);if(f.mode!==\'live\')return;let ew=npcStep(f,dt);')
ed('beats.js','pose(f,u,dt,walk);u.body.visible','pose(f,u,dt,walk);duoPose(f,u);placePatch(f,u);u.body.visible')
ed('beats.js','if(e.cmd)return 0;','if(e.cmd||e.volts||e.jet)return 0;')
ed('beats.js','newCast(f,e,pick,p.pos);','if(pick===1&&e.d.id===25)manualVolts(f,e,p.pos);else if(pick===1&&e.d.id===9)pressurize(f,e,p.pos);else newCast(f,e,pick,p.pos);')
ed('duo.js',"exSay(f,'电衣就绪 · 再按 K 释放',1.4)","exSay(f,u===f.p?'电衣就绪 · 再按 K 释放':'敌方电衣已形成',1.4)")

