// Each observation has a home range. Habituation survives switching animals in this visit.
function fieldTemper(u){let id=u.d.id;
 if([7,9,54,79,80,129,130,131,134].includes(id))return ['water','寻找浅水',.8];
 if([12,16,18,144,145,146].includes(id))return ['air','迎风盘旋',1.35];
 if([37,38,52,58,59,133,135,136,197,25,26].includes(id))return ['nose','循迹嗅探',1.12];
 if([1,3,10,35,39,113,143].includes(id))return ['forage','低头觅食',.7];
 if([63,65,92,94,150,151].includes(id))return ['mind','悬停感知',.85];
 if([74,76,95,104].includes(id))return ['stone','巡视岩面',.72];
 return ['patrol',canFly(u)?'巡游领地':'巡视领地',1.03]
}
function beginFieldLife(f,u){
 const w=f.watch;w.mem??=new Map;const memory=w.mem.get(u.d.id)||{trust:Math.min(.84,.2+.075*mealsWith(u.d.id)),alarm:0};w.mem.set(u.d.id,memory);
 w.life={memory,temper:fieldTemper(u),home:u.pos.clone(),target:u.pos.clone(),state:'listen',since:f.t,until:f.t+1.25,effort:0,turn:0,visits:[],lastLabel:'',blocked:0,manualUntil:0};
 w.intent=null;w.lastTap=-100
}
function wildState(f,name,duration){let a=f.watch.life;a.state=name;a.since=f.t;a.until=f.t+duration;a.blocked=0}
function habitatPoint(f,u,a){
 let best,score=-Infinity;
 for(let i=0;i<16;i++){
  let theta=Math.random()*6.283,rad=2+Math.random()*4.2,pt=u.pos.clone().add(V(Math.sin(theta)*rad,0,Math.cos(theta)*rad));if(Math.hypot(pt.x,pt.z)>11||f.blocks.some(o=>Math.hypot(o.x-pt.x,o.z-pt.z)<o.r+.8))continue;
  let h=groundY(pt.x,pt.z,f.z),nearTree=Math.min(8,...f.blocks.map(o=>Math.hypot(o.x-pt.x,o.z-pt.z)-o.r));
  let n=Math.random()*.8-.10*dst(pt,a.home)-a.visits.reduce((s,p)=>s+Math.max(0,2.8-dst(p,pt)),0);
  if(a.temper[0]==='water')n+=f.z===1&&channel(pt.x,pt.z)?3:-h;
  if(['forage','nose'].includes(a.temper[0]))n+=Math.max(0,3-nearTree)*.42;
  if(a.temper[0]==='stone')n+=h+Math.max(0,4-nearTree)*.3;
  if(a.temper[0]==='air')n+=nearTree*.22;
  if(n>score){score=n;best=pt}
 }return best||a.home.clone()
}
function fieldNoise(f,hit,rapid){
 let w=f.watch,a=w.life,m=a.memory;
 if(rapid){m.alarm=Math.min(1,m.alarm+.62);m.trust=Math.max(0,m.trust-.14)}else{m.trust=Math.min(1,m.trust+.10)}
 a.target.copy(hit);let retreat=rapid||m.alarm>m.trust+.20;
 wildState(f,retreat?'retreat':'inspect',retreat?1.1:2.8);w.intent=retreat?'retreat':'inspect';w.actionAt=f.t;f.interest={p:a.target,until:a.until}
}
function wildBehaviour(f,u,dt,manual){
 const w=f.watch,a=w.life,m=a.memory;
 m.alarm=Math.max(0,m.alarm-dt*.065);
 if(manual){a.manualUntil=f.t+.85;a.home.copy(u.pos);wildState(f,'listen',1.3);w.intent=null;f.interest=null}
 else if(f.t>=a.manualUntil){
  if(f.t>a.until){
   if(['shelter','shore','upwind'].includes(a.state)){wildState(f,'rest',2.5)}else if(a.state==='roam'){a.visits.push(a.target.clone());if(a.visits.length>3)a.visits.shift();wildState(f,'sample',1.5+Math.random()*1.4)}
   else if(a.state==='retreat'||a.state==='inspect'){wildState(f,'listen',.8+m.alarm*1.6)}
   else if(a.effort>.54){wildState(f,'rest',2.6+Math.min(2,u.d.kg/100))}
   else{a.target=habitatPoint(f,u,a);wildState(f,'roam',4+Math.random()*2)}
  }
  let go=['roam','inspect','retreat','shelter','shore','upwind'].includes(a.state),v=exDir(u.pos,a.target),d=dst(u.pos,a.target),age=f.t-a.since;
  w.intent=a.state==='inspect'||a.state==='sample'?'inspect':a.state==='retreat'?'retreat':null;w.actionAt=a.since;
  if(go||a.state==='sample')f.interest={p:a.target,until:a.until};else f.interest=null;
  if(go){let back=a.state==='retreat';if(back)v.negate();
   const yaw=Math.atan2(v.x,v.z),delta=Math.atan2(Math.sin(yaw-u.face),Math.cos(yaw-u.face));
   u.face+=delta*(1-Math.exp(-dt*(back?8:3)));
   let sp=a.temper[2]*(back?2.6:a.state==='inspect'?.82:1.26)*cap(age/(back?.12:.43),0,1)*cap(1-Math.abs(delta)/2.4,.08,1);
   if(!back&&d<.85){a.until=Math.min(a.until,f.t+.03);sp=0}
   let x=u.pos.x,z=u.pos.z;exMove(f,u,Math.sin(u.face)*sp*dt,Math.cos(u.face)*sp*dt);
   let moved=Math.hypot(u.pos.x-x,u.pos.z-z);a.blocked=moved<sp*dt*.25?a.blocked+dt:0;if(a.blocked>.45)a.until=f.t;
   a.effort=Math.min(1,a.effort+moved*.055)
  }
 }
 if(a.state==='rest')a.effort=Math.max(0,a.effort-dt*.27);
 let label=manual?'跟随指令':({shelter:'寻找背风处',shore:'沿浅水巡视',upwind:'转向迎风飞行',roam:a.temper[0]==='air'?'沿林缘飞行':'探索周围',sample:a.temper[1],inspect:'察看动静',retreat:'受惊避开',listen:'留神倾听',rest:'停下来歇息'})[a.state];
 if(label!==a.lastLabel){w.bar.querySelector('.watchBio').textContent=bodyFacts(u.d)+(mealsWith(u.d.id)?'　·　熟悉你的气味':'')+'　·　'+label;a.lastLabel=label}
}
function wildBody(f,u,g,rot,fw,right,up){
 if(f.mode!=='watch'||u!==f.p||!f.watch.life)return;let a=f.watch.life,t=f.t-a.since,
 blend=cap(t/.46,0,1)*cap((a.until-f.t)/.42,0,1),n=g.joints,k=a.temper[0];
 if(a.state==='sample'){
  if(['water','nose','forage','stone'].includes(k)){
   rot(g.head,right,blend*((k==='stone'?.13:.27)+.052*Math.sin(t*(k==='nose'?9:3))));
   rot(n('neck','neck1'),right,.11*blend);rot(g.head,up,.12*blend*Math.sin(t*2.3));
   if(k==='water')rot(n('jaw','lowerbeak'),right,blend*.11*(1+Math.sin(t*5)))
  }else{rot(g.head,up,blend*.34*Math.sin(t*2));rot(n('spine1'),fw,.06*blend*Math.sin(t*1.6))}
 }else if(a.state==='rest'){rot(g.head,right,.13*blend);rot(n('lear','lear1'),fw,-.12*blend);rot(n('rear','rear1'),fw,.12*blend)}
}
