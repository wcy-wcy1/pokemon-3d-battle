from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf8');assert a in s,a;p.write_text(s.replace(a,b),'utf8')
ed('natural.js',"let seen=new Set;u.body.traverse","let seen=new Set;u.body.traverse")
ed('natural.js',"skip=eye||l.slots.some(s=>s.mat===mat)||id===25&&[1,2].includes(i)","skip=id!==25&&id!==9&&(eye||l.slots.some(s=>s.mat===mat))")
ed('natural.js','mat.envMapIntensity=eye?.85:','mat.envMapIntensity=id===25?.3:id===9&&eye?.28:eye?.55:')
ed('natural.js','if(eye){mat.roughness=.32;','if(eye&&id!==25&&id!==9){mat.roughness=.32;')
ed('natural.js',"freq=(metal?3.4:shell?2.6:fam==='fur'?4:2.15)/Math.max(size.x,size.y,size.z,1e-4)","freq=id===25?1.55:(metal?3.4:shell?2.6:fam==='fur'?4:2.15)/Math.max(size.x,size.y,size.z,1e-4)")
ed('natural.js',"if(fam==='fur')s.fragmentShader","if(eye&&!skip)s.fragmentShader=s.fragmentShader.replace('roughnessFactor=clamp(roughnessFactor','roughnessFactor=mix(roughnessFactor,.27,1.-smoothstep(.03,.17,max(max(diffuseColor.r,diffuseColor.g),diffuseColor.b)));roughnessFactor=clamp(roughnessFactor');if(fam==='fur')s.fragmentShader")
ed('natural.js',"let mat=new T.MeshStandardMaterial({map:src.material.map,vertexColors:true","let mat=new T.MeshStandardMaterial({map:src.material.map,envMap:src.material.envMap,envMapIntensity:src.material.envMapIntensity,vertexColors:true")
ed('natural.js',"let col=k===2?1.04:.84","let col=k===2?1.015:.955")
ed('field.js',"calib(u);unifyLight(f,u);","calib(u);if(u.d.id===9)u.body.traverse(m=>{if(m.isMesh&&/cannons/i.test(m.name)){let old=m.material;m.material=old.clone();u.lifeRig.meta.set(m.material,u.lifeRig.meta.get(old))}});unifyLight(f,u);")
ed('watch.js','f.interest={p:hit,until:f.t+2.8};','''let rapid=f.t-(f.watch.lastTap??-10)<.85;f.watch.lastTap=f.t;f.watch.intent=rapid?'retreat':'inspect';f.watch.actionAt=f.t;f.interest={p:hit,until:f.t+(rapid?1.2:3.5)};''')
ed('watch.js','let vy=u.height||2,wide=',"""let speed=0,age=f.t-(w.actionAt??-99);if(f.interest&&f.interest.until>f.t&&w.intent){let v=exDir(u.pos,f.interest.p),d=dst(u.pos,f.interest.p),yaw=Math.atan2(v.x,v.z);if(w.intent==='retreat'&&age<.45){speed=.8;exMove(f,u,-v.x*dt*.85,-v.z*dt*.85)}else if(w.intent==='inspect'){let delta=Math.atan2(Math.sin(yaw-u.face),Math.cos(yaw-u.face));u.face+=delta*(1-Math.exp(-dt*(age<.32?.3:2.1)));if(age>.5&&age<2.4&&d>.95){speed=u.d.id===9?.50:.76;exMove(f,u,v.x*dt*speed,v.z*dt*speed)}}}else w.intent=null;let vy=u.height||2,wide=""")
ed('watch.js','actorTick(f,u,dt,0);','actorTick(f,u,dt,speed);')

