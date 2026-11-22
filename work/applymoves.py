from pathlib import Path
def read(n):return Path('work/'+n).read_text('utf-8-sig')
def write(n,s):Path('work/'+n).write_text(s,'utf8')
s=read('field.js').replace('if(anim){u.mixer','u.mixer=null;u.currentAnim=null;registerRig(u,model);if(anim){u.mixer').replace('u.mixer.clipAction(anim).play();','u.currentAnim=u.mixer.clipAction(anim).play();u.lastClip=anim;').replace('let wrapper=new THREE.Group;','u.height=s.y*scale;let wrapper=new THREE.Group;')
a=s.index('function exUpdateActor');b=s.index('\nfunction ',a+10);s=s[:a]+'function exUpdateActor(f,u,dt,walk){actorTick(f,u,dt,walk)}'+s[b:]
s=s.replace("'J · 连射'","'J · '+choreo[f.p.d.id].n").replace("b.disabled=f.cd[i]>.01||","b.disabled=(i!==2&&!!f.p.cmd)||f.cd[i]>.01||")
write('field.js',s)
s=read('action.js');a=s.index('function exBolt');b=s.index('function exAct',a);s=s[:a]+s[b:];a=s.index('p.face=Math.atan2(dir.x,dir.z);');b=s.index('\nfunction exEnd',a)
s=s[:a]+"""if(!newCast(f,p,i,aim||f.e.pos))return;f.cd[i]=[.47,2.8,1.9,1.4][i];if(i===3){p.en=0;f.shake=.15;chord(rank(p.d));navigator.vibrate?.(40)}else if(i===1)p.en=Math.min(100,p.en+5)}
"""+s[b:]
s=s.replace('if(i===2){p.vel','if(i===2){p.cmd=null;p.vel').replace('let old=f.p,n=f.team[i];','let old=f.p,n=f.team[i];old.cmd=null;n.cmd=null;')
a=s.index('function exAI(');b=s.index('function exSim',a);s=s[:a]+s[b:]
s=s.replace('let ew=exAI(f,dt);','let ew=npcStep(f,dt);castStep(f,f.p,dt);if(f.mode!==\'live\')return;castStep(f,f.e,dt);animateFX(f,dt);')
s=s.replace('v.y=groundY(v.x,v.z,f.z)+.88;',"""s.age+=dt;s.spin.rotation.z+=dt*(s.k==='bone'?16:5);v.y=groundY(v.x,v.z,f.z)+s.baseH+.08*Math.sin(s.age*9);if(s.k==='bone'&&s.age>.55){s.v.lerp(exDir(v,s.u.pos),Math.min(1,dt*7)).normalize()}""").replace('exHurt(f,t,s.power*wxCombo(f,t,s),s.d,s.skill!==0);','strikeHit(f,s,t);')
s=s.replace('exMove(f,p,m.x*dt*sp,m.z*dt*sp);','if(p.cmd){sp*=.28;p.face=Math.atan2(p.cmd.dir.x,p.cmd.dir.z)}exMove(f,p,m.x*dt*sp,m.z*dt*sp);')
write('action.js',s)
s=read('strike.js').replace('total:wind+(contact?.43:.47)','total:wind+(contact?.43:family(k)===\'pulse\'?.71:.56)');write('strike.js',s)
s=read('build.py').replace("'field','action'","'moves','strike','beats','field','action'");write('build.py',s)

