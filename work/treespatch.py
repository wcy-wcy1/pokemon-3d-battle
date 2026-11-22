from pathlib import Path
def patch(n,a,b):
 f=Path('work/'+n);s=f.read_text('utf-8-sig');assert a in s,a;f.write_text(s.replace(a,b),encoding='utf8')
patch('build.py',"app='const EX_DEM='","app='const EX_TREE='+json.dumps(json.loads((land/'tree.json').read_text()))+';const EX_DEM='")
patch('geo.js',"texture(['soil','basalt','basalt'][z],16)","texture(['humus','shore','lava'][z],12)")
patch('geo.js',"color:[","color:[") if False else None
patch('geo.js',"mat(0x90989b,texture('basalt',1))","mat(0xa3aeb3,texture('shore',1))")
patch('geo.js',"mat(0x86776b,texture('basalt',1))","mat(0x91939a,texture('lava',1))")
patch('geo.js',"new T.IcosahedronGeometry(1,1)","new T.IcosahedronGeometry(1,2)")
patch('geo.js',"rock.computeVertexNormals();","rock.computeVertexNormals();")
f=Path('work/geo.js');s=f.read_text('utf8');a=s.index('let frond=');b=s.index('if(!z){for(let i=0;i<150;',a)
s=s[:a]+"""function surfaceAt(x,d){let wr=Math.hypot(x,d);if(wr<17)return groundY(x,d,z);let lo=0,hi=8000;for(let k=0;k<16;k++){let a=(lo+hi)*.5;if(a*.025+16*(1-Math.exp(-a/600))>wr)hi=a;else lo=a}let rr=(lo+hi)*.5,q=wr/rr,ix=cap(x/q/75+64,0,127.99),iz=cap(d/q/75+64,0,127.99),i=ix|0,j=iz|0,tx=ix-i,tz=iz-j,h=(terrain[j*129+i]*(1-tx)+terrain[j*129+i+1]*tx)*(1-tz)+(terrain[(j+1)*129+i]*(1-tx)+terrain[(j+1)*129+i+1]*tx)*tz,k=cap((wr-17)/16,0,1),dh=groundY(x,d,z)*(1-k)+(h-mid)*q*k-(wr<30?2.2*(1-k):0),ed=Math.max(Math.abs(x),Math.abs(d));return Math.max(dh,ed<34?groundY(x,d,z)-Math.max(0,ed-24)*.28:-100)}
let treePieces=[];if(!z){let data=EX_TREE,fol=mat(0xc3c8ad,texture('foliage')),bark=mat(0xa69c87,texture('bark'));fol.alphaTest=.31;fol.side=T.DoubleSide;fol.roughness=.86;bark.side=T.DoubleSide;for(let j=0;j<data.subMeshes.length;j++){let sub=data.subMeshes[j],gg=new T.BufferGeometry;gg.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));gg.setAttribute('normal',new T.Float32BufferAttribute(data.normals,3));gg.setAttribute('uv',new T.Float32BufferAttribute(data.uvs,2));gg.setIndex(data.indices.slice(sub.indexStart,sub.indexStart+sub.indexCount));treePieces.push([gg,j===1||j===3?bark:fol])}}
function tree(x,d,h,solid=false){let y=surfaceAt(x,d)-.14,angle=R()*6.28,s=h/16,sw=s*(.64+R()*.21);for(let [gg,mt] of treePieces)inst(gg,mt,x,y,d,sw,s,sw,angle);if(solid){f.blocks.push({x,z:d,r:h*.047});for(let k=0;k<6;k++){let a=k*1.047;inst(rock,wood,x+Math.cos(a)*.52,y+.19,d+Math.sin(a)*.52,1.1,.35,.26,-a)}}}
"""+s[b:];s=s.replace('i<150;i++','i<113;i++').replace('5+R()*10','9+R()*10');f.write_text(s,'utf8')
patch('field.js',"'。':'出战","'。':'出战") if False else None
patch('field.js',"'+b.note+(S.expeditions","'+b.note+'<br><small>9.6 km 地形采样 · 近景为可玩化重建</small>'+(S.expeditions")

