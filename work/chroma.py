from pathlib import Path
p=Path('work/strike.js');s=p.read_text('utf8').replace("color:c,transparent:true","color:new THREE.Color(c).convertSRGBToLinear(),toneMapped:false,transparent:true")
s=s.replace("j===0?0xffffcb:0xffc518,j===0?.085:.037,true","j===0?0xffe657:0xef9714,j===0?.085:.052,false")
s=s.replace("m.rotation.x=Math.PI/2;return m","m.material.blending=THREE.NormalBlending;m.rotation.x=Math.PI/2;return m")
s=s.replace("water?0x9cefff:k==='ice'?0xadfaff:k==='solar'?0xffffbb","water?0x47b9f9:k==='ice'?0x94dafc:k==='solar'?0xffdb47")
s=s.replace("water?0x409eea:k==='solar'?(i?0xf5d42d:0xb7eb4a):c,.058*wide,true","water?(i?0x37a1ea:0x9ce4ff):k==='solar'?(i?0xaad947:0xfff0a4):c,.074*wide,false")
s=s.replace("if(fam==='beam'){for(let side","if(fam==='beam'){let rel=target.pos.clone().sub(start);rel.y=0;let along=rel.dot(dir);if(along>0&&rel.addScaledVector(dir,-along).length()<1.06)d=Math.min(d,along+.3);for(let side")
s=s.replace("d*i/14));stroke(g,pts","d*i/14));if(j===0)for(let i of [4,8,11]){let a=pts[i];stroke(g,[a,a.clone().add(V(.32,.38,.28)),a.clone().add(V(.1,.77,.37)),a.clone().add(V(.58,.92,.62))],0xeaaa27,.043,false)}stroke(g,pts")
p.write_text(s,'utf8')
