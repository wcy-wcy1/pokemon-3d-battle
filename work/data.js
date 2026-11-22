const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],rar=['N','R','SR','SSR','UR'],colors=['#d6dce2','#77b5fe','#bd96fc','#edbc66','#ff788a'],rows=`1 妙蛙种子 草 N 藤鞭
3 妙蛙花 草 SSR 日光束
4 小火龙 火 N 火花
6 喷火龙 火 SSR 爆炸烈焰
7 杰尼龟 水 N 水枪
9 水箭龟 水 SSR 加农水炮
10 绿毛虫 虫 N 吐丝
12 巴大蝶 虫 R 银色旋风
16 波波 飞行 N 起风
18 大比鸟 飞行 SR 神鸟猛击
25 皮卡丘 电 R 十万伏特
26 雷丘 电 SR 打雷
35 皮皮 妖精 N 魅惑之声
37 六尾 火 N 火焰旋涡
38 九尾 火 SR 鬼火
39 胖丁 妖精 R 唱歌
52 喵喵 一般 N 聚宝功
54 可达鸭 水 N 水之波动
58 卡蒂狗 火 R 火焰牙
59 风速狗 火 SR 闪焰冲锋
63 凯西 超能 N 念力
65 胡地 超能 SSR 精神强念
66 腕力 格斗 N 空手劈
68 怪力 格斗 SR 爆裂拳
74 小拳石 岩石 N 落石
76 隆隆岩 岩石 SR 岩石爆击
79 呆呆兽 水 N 意念头锤
80 呆壳兽 水 SR 贝壳夹击
92 鬼斯 幽灵 R 舌舔
94 耿鬼 幽灵 SSR 暗影球
95 大岩蛇 岩石 R 岩崩
104 卡拉卡拉 地面 R 骨头回力镖
113 吉利蛋 一般 SR 拍击
123 飞天螳螂 虫 SR 连斩
129 鲤鱼王 水 N 撞击
130 暴鲤龙 水 SSR 攀瀑
131 拉普拉斯 冰 SSR 冰冻光束
197 月亮伊布 恶 SR 恶之波动
133 伊布 一般 R 电光一闪
134 水伊布 水 SR 浊流
135 雷伊布 电 SR 放电
136 火伊布 火 SR 喷烟
143 卡比兽 一般 SSR 泰山压顶
144 急冻鸟 冰 UR 暴风雪
145 闪电鸟 电 UR 电磁炮
146 火焰鸟 火 UR 燃尽
149 快龙 龙 SSR 龙之俯冲
150 超梦 超能 UR 精神击破
151 梦幻 超能 UR 波导弹
384 烈空坐 龙 UR 画龙点睛`.split('\n');
const db=Object.fromEntries(rows.map(s=>{let [i,name,type,r,move]=s.split(' '),k=rar.indexOf(r),id=+i;return [id,{id,name,type,r,move,meters:DEX_BODY[id][0],kg:DEX_BODY[id][1],hp:110+k*34+id%19,atk:25+k*11+id%6,spd:45+(id*7)%45+k*2}]})),all=Object.values(db),pic={},images={},img=i=>pic[i]||ART[i],rank=d=>rar.indexOf(d.r),color=d=>colors[rank(d)],no=i=>'#'+String(i).padStart(3,'0'),pick=a=>a[Math.floor(Math.random()*a.length)],esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),key='pokepack.lab.v1';
const MEGA_X=10034;
db[MEGA_X]={id:MEGA_X,name:'Mega 喷火龙 X',type:'火／龙',r:'UR',move:'硬爪',meters:1.7,kg:110.5,evolution:6};
let S={owned:{},team:[],packs:0,pity:0,wins:0,loss:0,best:0,force:false,sound:true,last:[]};try{Object.assign(S,JSON.parse(localStorage.getItem(key)||'{}'))}catch{}function save(){try{localStorage.setItem(key,JSON.stringify(S))}catch{}}
let drift=0;const seals=[['蓄电箔','起手能量 +30'],['护甲箔','全队减伤 12%'],['疾风箔','速度 +12，攻击 +6%']];let view='home',pack=[],focus=0,progress=0,opening=false,drag=null,ctx,lastNoise=0,noticeTimer,filter='全部',only=false,typeFilter='全部',battle=null,holoCleanup;
function toast(t){$('#toast').textContent=t;$('#toast').style.opacity=1;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#toast').style.opacity=0,1750)}
function unlock(){if(!S.sound)return;try{ctx??=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{})}catch{}}document.addEventListener('pointerdown',unlock,{passive:true});function tone(f,len=.15,dt=0,w='sine',v=.06){if(!ctx||!S.sound)return;let t=ctx.currentTime+dt,o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;o.type=w;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(v,t+.014);g.gain.exponentialRampToValueAtTime(.001,t+len);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+len+.01)}
function noise(speed=1,len=.09){if(!ctx||!S.sound)return;let n=Math.ceil(ctx.sampleRate*len),b=ctx.createBuffer(1,n,ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);let src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=b;f.type='bandpass';f.frequency.value=1300+Math.min(speed,4)*1200;g.gain.value=.18;src.connect(f).connect(g).connect(ctx.destination);src.start()}
function chord(k){[[0,7],[0,4,7],[0,3,7,10],[0,4,7,11],[0,4,7,11,14]][k].forEach((v,i)=>tone(300*2**(v/12),.55,i*.065,'triangle'))}
const loadImg=src=>new Promise((ok,no)=>{let im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src});
async function localAssets(){if(location.protocol==='file:')return;try{let r=await fetch('./pokemon-data-50.json');if(r.ok){let raw=await r.json();for(let a of (Array.isArray(raw)?raw:raw.pokemon||raw.cards||[])){let d=db[a.id];if(!d)continue;for(let [k,key] of [['name','name'],['type','type'],['move','move']])if(typeof a[key]==='string')d[k]=a[key].slice(0,30);if(rar.includes(a.rarity||a.r))d.r=a.rarity||a.r;for(let [k,v] of [['hp',a.hp],['atk',a.attack??a.atk],['spd',a.speed??a.spd]])if(Number.isFinite(+v)&&+v>0)d[k]=Math.min(999,Math.round(+v))}}}catch{}let list=all.slice();await Promise.all(Array.from({length:4},async()=>{while(list.length){let d=list.shift();for(let ext of ['webp','png','jpg'])try{let im=await loadImg('./assets/'+d.id+'.'+ext);if(!im.naturalWidth)continue;pic[d.id]=im.src;images[d.id]=im;break}catch{}}}));if(view==='home')featured()}
function hud(){$('#counter').textContent=S.pity+' / 3';$('#bars').innerHTML=[0,1,2].map(i=>'<i class="'+(i<S.pity?'lit':'')+'"></i>').join('');$('#pitytext').textContent='再开 '+(3-S.pity)+' 包，必得 UR 传说卡';$('#force').classList.toggle('on',S.force);$('#force').setAttribute('aria-pressed',S.force);$('#sound').textContent=S.sound?'♫':'♫̸';$('#sound').setAttribute('aria-pressed',S.sound)}
function featured(){$('#featured').innerHTML=[[6,'CHARIZARD','#53352c'],[150,'MEWTWO','#43354e'],[130,'GYARADOS','#2c424d']].map(([id,en,w])=>{let d=db[id];return '<button class="tile" style="--wash:'+w+';--r:'+color(d)+'" onclick="inspect('+id+')"><span class="badge">'+d.r+'</span><strong>'+esc(d.name)+'</strong><label>'+en+' / '+no(id)+'</label><img src="'+img(id)+'"></button>'}).join('')}
function nav(v){if(opening)return;if(battle&&!battle.done&&v!=='fight'){if(!confirm('离开会结束当前挑战，确定离开？'))return;S.loss++;save();battle=null}view=v;$('#home').hidden=v!=='home';$('#other').hidden=v==='home';$$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===(v==='fight'?'team':v==='result'?'home':v)));if(v==='dex'||v==='team')library(v);if(v==='home'){hud();featured();requestAnimationFrame(resize)}if(v==='result')results(false)}
document.addEventListener('click',e=>{let b=e.target.closest('[data-view]');if(b)nav(b.dataset.view)});$('.brand').onclick=e=>{e.preventDefault();nav('home')};$('#force').onclick=()=>{S.force=!S.force;save();hud()};$('#sound').onclick=()=>{S.sound=!S.sound;unlock();tone(660);save();hud()};
function drawPack(){
 const ranks=Array.from({length:10},()=>{const v=Math.random();return v<.007?4:v<.048?3:v<.185?2:v<.49?1:0});
 if(S.force||S.pity===2)ranks[9]=4;
 else if(Math.max(...ranks)<1)ranks[9]=1;
 const cards=ranks.map(k=>pick(all.filter(d=>rank(d)===k))||pick(all));
 if((S.force&&!S.owned[MEGA_X])||Math.random()<.05)cards[8]=db[MEGA_X];
 return cards;
}
function beginOpen(){if(opening)return;opening=true;drag=null;pack=drawPack();focus=pack.findIndex(d=>d.evolution);if(focus<0)focus=pack.reduce((a,d,i)=>rank(d)>rank(pack[a])?i:a,0);noise(4,.22);tone(120,.21,0,'sawtooth');$('#openbtn').disabled=true;let t=performance.now(),start=progress;function lift(now){let u=Math.min(1,(now-t)/1150);progress=start+(1-start)*Math.min(1,u*3);deform(progress);extract(u);if(u<1)requestAnimationFrame(lift);else{S.seal=drift<-.065?0:drift>.065?2:1;drift=0;S.packs++;S.pity=(S.pity+1)%3;S.last=pack.map(d=>d.id);pack.forEach(d=>S.owned[d.id]=(S.owned[d.id]||0)+1);save();opening=false;$('#openbtn').disabled=false;nav('result');results(true);progress=0;deform(0);extract(0);hud()}}requestAnimationFrame(lift)}
$('#openbtn').onclick=()=>{unlock();beginOpen()};let gl=$('#gl');gl.onpointerdown=e=>{if(opening)return;let b=gl.getBoundingClientRect(),x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;if(Math.abs(x-.5)>Math.max(.2,b.height*.29/b.width)||y<.06||y>.69)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};gl.setPointerCapture(e.pointerId)};gl.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;let dy=Math.max(0,e.clientY-drag.y),t=performance.now();progress=Math.min(1,progress+dy/(gl.clientHeight*.52));if(dy&&t-lastNoise>38){noise(dy/Math.max(1,t-drag.t));lastNoise=t}if(dy>0)drift+=(e.clientX-drag.x)/gl.clientHeight;drag.x=e.clientX;drag.y=e.clientY;drag.t=t;deform(progress);if(progress>=.8)beginOpen()};gl.onpointerup=gl.onpointercancel=()=>drag=null;

function bodyFacts(d){return (longBodies[d.id]?'图鉴体长 ':'图鉴身高 ')+d.meters.toFixed(1)+' m　·　体重 '+d.kg.toFixed(1)+' kg'}
