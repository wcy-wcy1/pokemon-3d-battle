from pathlib import Path
import json
p=Path('work');m=json.loads((p/'trees.json').read_text('utf-8-sig'))['meshes'][2];(p/'real/treehigh.json').write_text(json.dumps({k:m[k] for k in ['positions','normals','uvs','indices','subMeshes']}))
def edit(n,a,b):
 f=p/n;s=f.read_text('utf-8-sig');assert a in s,a;f.write_text(s.replace(a,b),encoding='utf8')
edit('build.py',"'geo','field'","'geo','weather','field'")
edit('build.py',"""app='const EX_TREE='""","""app='const EX_TREE_HIGH='+json.dumps(json.loads((land/'treehigh.json').read_text()))+';const EX_TREE='""")
edit('geo.js','if(id!==\'norm\')','if(![\'norm\',\'leafnormal\',\'barknormal\'].includes(id))')
edit('geo.js','f.sc.add(sun);let terrain','f.sc.add(sun);f.sun=sun;let terrain')
edit('geo.js','floor.vertexColors=true','f.floorMat=floor;f.floorColor=floor.color.clone();floor.vertexColors=true')
edit('geo.js','let treePieces=[];if(!z){let data=EX_TREE,fol=','f.wind={value:.1};f.windTime={value:0};let treePieces=[[],[]];if(!z){let fol=')
edit('geo.js',"bark.side=T.DoubleSide;for(let j=0;j<data.subMeshes.length;j++)","""bark.side=T.DoubleSide;fol.normalMap=texture('leafnormal');fol.normalScale.set(.46,-.46);bark.normalMap=texture('barknormal');bark.normalScale.set(1.1,-1.1);bark.roughness=.84;
fol.onBeforeCompile=s=>{s.uniforms.wind=f.wind;s.uniforms.wtime=f.windTime;s.vertexShader='uniform float wind; uniform float wtime;\\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\\nfloat flex=smoothstep(2.,14.,position.y);transformed.x+=wind*flex*(.28*sin(wtime*2.6+instanceMatrix[3].x*.31+position.z*.39)+.13*sin(wtime*5.7+position.x*1.7));transformed.z+=.12*wind*flex*sin(wtime*2.+position.x);')};
for(let lod=0;lod<2;lod++){let data=lod?EX_TREE_HIGH:EX_TREE;for(let j=0;j<data.subMeshes.length;j++)""")
edit('geo.js','treePieces.push([gg,j===1||j===3?bark:fol])}}','treePieces[lod].push([gg,j===1||j===3?bark:fol])}}}')
edit('geo.js','of treePieces)inst','of treePieces[solid?1:0])inst')
edit('field.js','realWorld(f);exModel','realWorld(f);wxInit(f);exModel')
edit('field.js','f.mode=mode;f.keys','f.mode=mode;if(f.wx)f.wx.badge.hidden=true;f.keys')
edit('field.js',"""+'</div><p>'+(f.rental""","""+'</div><div class="wxDrills"><small>首场气象演练（可选）</small>'+wxMaps[f.z].map(k=>'<button class="drill" data-wx="'+k+'" onclick="wxRecipe(field,this.dataset.wx)">'+wxDefs[k].n+'</button>').join('')+'</div><p>'+(f.rental""")
edit('field.js',".join('、')+'。')+",".join('、')+'。')+")
edit('field.js','f.el.focus();exSay','wxPaint(f,true);f.el.focus();exSay')
edit('action.js','f.t+=dt;f.clock+=dt;','f.t+=dt;f.clock+=dt;wxTick(f,dt);if(f.mode!==\'live\')return;')
edit('action.js','p.dash=.24;p.inv=.38;','p.dash=.24;p.inv=.38;if(f.wx.phase===\'active\'&&f.wx.type===\'gale\'&&p.vel.x*f.wx.dir>.45)wxMark(f,\'wind\',\'已借风 · 属性招触发风切\');')
edit('action.js','if(!e.ready||!p.ready)return 0;','if(!e.ready||!p.ready)return 0;if(e.stun>0){e.stun-=dt;return 0}')
edit('action.js','exHurt(f,t,s.power,s.d,s.skill!==0)','exHurt(f,t,s.power*wxCombo(f,t,s),s.d,s.skill!==0)')
edit('action.js','v.addScaledVector(s.v,s.sp*dt);','v.addScaledVector(s.v,s.sp*dt);if(f.wx.type===\'gale\'&&f.wx.phase===\'active\')v.x+=f.wx.dir*.8*dt;')
edit('action.js','n.runs++;','n.runs++;n.chains=(n.chains||0)+f.wx.chain;')
edit('field.js',"' / 3 名对手，用时 '","' / 3 名对手，气象连携 '+f.wx.chain+' 次，用时 '")
edit('weather.js',"if(!opts.includes(first))return;w.type","if(!opts.includes(first))return;let t=f.el.querySelector('.wxDrills small');if(t)t.textContent=wxDefs[first].rule+'。'+wxDefs[first].alt;w.type")

