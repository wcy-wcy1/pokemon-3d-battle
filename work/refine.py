from pathlib import Path
p=Path('work')
def edit(file,a,b):
 f=p/file;s=f.read_text('utf-8-sig');assert a in s,a;f.write_text(s.replace(a,b),encoding='utf-8')
edit('data.js',"let view='home'","let drift=0;const seals=[['蓄电箔','起手能量 +30'],['护甲箔','全队减伤 12%'],['疾风箔','速度 +12，攻击 +6%']];let view='home'")
edit('data.js','drag={id:e.pointerId,y:e.clientY','drag={id:e.pointerId,x:e.clientX,y:e.clientY')
edit('data.js','drag.y=e.clientY;drag.t=t','if(dy>0)drift+=(e.clientX-drag.x)/gl.clientHeight;drag.x=e.clientX;drag.y=e.clientY;drag.t=t')
edit('data.js','S.packs++;S.pity','S.seal=drift<-.065?0:drift>.065?2:1;drift=0;S.packs++;S.pity')
edit('cards.js','<label>10 / 10 入库</label></div><div class="fan">',"""<label>10 / 10 入库</label></div><div class="imprint">✧　残箔铭印：'+seals[S.seal??1].join(' · ')+'</div><div class="fan">""")
edit('battle.js','if(bonus>=0)mods[bonus]++;','if(w===1&&S.seal!=null)mods[S.seal]++;if(bonus>=0)mods[bonus]++;')
edit('battle.js',"log:['挑战开始！速度较高的一方先行动。']","log:['残箔共鸣：'+seals[S.seal??1].join(' · ')+'。速度高的一方先行动。']")
edit('cards.js','第一位为首发。点击槽位移除，点击下方卡牌加入。',"第一位为首发。点击槽位移除，点击下方卡牌加入。'+(S.seal!=null?'<br>已装备残箔：'+seals[S.seal].join(' · '):'')+'")
edit('page.html','支持拖动撕包 · 点击按钮快速开封','左斜撕蓄电 · 直撕护甲 · 右斜撕疾风')
edit('battle.js','initScene();localAssets();',"""initScene();primeArt();localAssets();
// Embedded illustrations: PokeAPI/sprites, official-artwork; renderer: Three.js r128 (MIT).
async function primeArt(){for(let d of all){try{let source=await loadImg(ART[d.id]);let c=document.createElement('canvas');c.width=source.naturalWidth;c.height=source.naturalHeight;let g=c.getContext('2d');g.drawImage(source,0,0);let pixels=g.getImageData(0,0,c.width,c.height),a=pixels.data;for(let i=0;i<a.length;i+=4){if(!a[i+3])continue;let grain=((i*17^(i>>>5)*13)%9)-4;for(let j=0;j<3;j++)a[i+j]=Math.min(255,Math.round(a[i+j]/3)*3+grain)}g.putImageData(pixels,0,0);if(!pic[d.id]){images[d.id]=c;pic[d.id]=c.toDataURL('image/webp',.9)}}catch{}await new Promise(r=>setTimeout(r,0))}}""")

