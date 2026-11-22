from pathlib import Path
def file(n):return Path('work')/(n+'.js')
def patch(n,*pairs):
 p=file(n);s=p.read_text('utf-8')
 for a,b in pairs:
  assert a in s,(n,a)
  s=s.replace(a,b)
 p.write_text(s,'utf-8')
p=file('action');s=p.read_text('utf-8');a=s.index('if(i!==2&&');b=s.index('if(!newCast',a);s=s[:a]+'if(i===2||p.volts||p.jet)return;'+s[b:];p.write_text(s,'utf-8')
patch('action',("return f.keys.has('ShiftLeft')","return f.sprintPointer!=null||f.keys.has('ShiftLeft')"),('n.dash=0;','n.runBlend=0;n.drive=0;'),("'swing','dash'","'swing'"),('if(p.dash>0){sp=16;m.copy(p.vel);moving=1}',''),("if(p.volts)sp*=p.volts.phase==='armed'?.85:.55;",''),('exMove(f,p,m.x*dt*sp,m.z*dt*sp);','let x0=p.pos.x,z0=p.pos.z;exMove(f,p,m.x*dt*sp,m.z*dt*sp);p.drive=dt?Math.hypot(p.pos.x-x0,p.pos.z-z0)/dt:0;if(p.drive>2&&sprinting(f)&&f.wx.type==="gale"&&f.wx.phase==="active"&&m.x*f.wx.dir>.45&&!(f.wx.mark?.key==="wind"&&f.wx.mark.until>f.t+1))wxMark(f,"wind","顺风冲刺 · 属性招触发风切");'))
patch('field',('inv:0,dash:0','inv:0,drive:0'),("'闪避'","'冲刺'"),('、V 闪避',''),(",'V','L ·",",'Shift · 按住','L ·"),('KeyV:2,',''),('f.mode=mode;if','f.mode=mode;f.sprintPointer=null;if'),("f.on(b,'pointerdown',e=>","if(i===2){f.on(b,'pointerdown',e=>{if(f.mode==='live'){b.setPointerCapture(e.pointerId);f.sprintPointer=e.pointerId}});for(let ev of ['pointerup','pointercancel','lostpointercapture'])f.on(b,ev,e=>{if(f.sprintPointer===e.pointerId)f.sprintPointer=null});return}f.on(b,'pointerdown',e=>"))
patch('weather',('闪避','冲刺'),('if(u===f.p&&u.inv>0)','if(u===f.p&&sprinting(f)&&u.drive>2&&f.lastMove.z<-.35)'))
patch('world',('闪避','冲刺'))
patch('moves',("(u.dash>0?.30:0)+load","load"))
patch('watch',('verticalStep(u,dt);','let x0=u.pos.x,z0=u.pos.z;verticalStep(u,dt);'),('actorTick(f,u,dt,speed);','u.drive=dt?Math.hypot(u.pos.x-x0,u.pos.z-z0)/dt:0;actorTick(f,u,dt,speed);'))
patch('beats',('pose(f,u,dt,walk);','if(u.d.id===25)u.body.rotation.order="YXZ";pose(f,u,dt,walk);'),('animalReflex(f,u);','animalReflex(f,u);pikaBound(f,u,dt);'))
