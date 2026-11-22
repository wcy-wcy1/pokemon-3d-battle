const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const p=await b.newPage({viewport:{width:512,height:300}}),errors=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(/shader error|validate_status|webgl: invalid|webglprogram:/i.test(m.text())){errors.push(m.text());console.log(m.text().slice(0,1500))}});
 await p.goto(require('url').pathToFileURL(path.resolve('outputs/index.html')).href);
 await p.evaluate(()=>{Math.random=seeded(1199);S.team=[6,25,9];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
 await p.evaluate(()=>{const f=field;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;f.e.hp=f.e.max=9000;f.e.stun=9999;f.zoom=.80;
  window.board=document.createElement('canvas');board.width=1024;board.height=978;window.clip=document.createElement('canvas');clip.width=512;clip.height=326});
 const first=[6,25,9,94,131,150],rows=[],frames=[];
 for(const [i,id] of first.entries()){const r=await p.evaluate(async({i,id,record})=>{
  const f=field;if(f.p.d.id!==id){const j=(f.slot+1)%3;f.team[j]=exUnit(db[id]);exSwitch(f,j,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,6))}
  const u=f.p,e=f.e;e.scorch=null;e.slowUntil=0;e.stun=9999;f.wx.left=999;e.inv=0;u.en=100;f.cd.fill(0);
  u.face=Math.PI/2;u.pos.set(-2.3,0,0);e.pos.set(2,0,0);e.hp=e.max;const tick=()=>exSim(f,1/90);
  for(let j=0;j<100;j++)tick();exAct(f,i===5?3:1);
  let hp=e.hp,kind=['fire','volt','water','mind','ice','mind'][i],firstHit=-1,pic=false,film=[],wake=false;
  let name=u.d.name+'   /   '+(i===5?'断层星爆':u.d.move);
  const draw=()=>{f.updateSight();f.r.render(f.sc,f.cam);const c=clip.getContext('2d');c.drawImage(f.r.domElement,0,0,512,300);c.fillStyle='#101e22';c.fillRect(0,300,512,26);c.font='14px Microsoft YaHei';c.fillStyle='#edf2e4';c.fillText(name,13,318)};
  for(let j=0;j<430;j++){
   if(u.volts?.phase==='armed')exAct(f,1);tick();
   const fx=(f.vfx||[]).map(v=>v.o.userData);wake||=fx.some(x=>x.missileWake);
   if(firstHit<0&&e.hp<hp){firstHit=j;if(!fx.some(x=>x.burst===kind))throw Error('missing impact '+id+' '+JSON.stringify(fx))}
   if(firstHit<0&&fx.some(x=>x.burst))throw Error('early impact');
   const age=j-firstHit;const snap=i===0?15:i===1?8:i===2?19:i===3?12:i===4?21:13;
   if(firstHit>=0&&age===snap){draw();board.getContext('2d').drawImage(clip,i%2*512,Math.floor(i/2)*326);pic=true}
   const start=i===1?215:i===5?118:0;
   if(record&&j>=start&&j%5===0&&(firstHit<0||age<73)){draw();film.push(clip.toDataURL('image/jpeg',.84).split(',')[1])}
   if(firstHit>=0&&age>80)break
  }
  if(!pic||i===3&&!wake)throw Error('missing capture/trail '+id);
  for(let j=0;j<350;j++)tick();
  if(f.vfx.some(v=>v.o.userData.burst||v.o.userData.mark||v.o.userData.overture||v.o.userData.missileWake)||f.burstLamp.intensity!==0)throw Error('lingering FX');
  return {id,kind,firstHit,wake,film}
 },{id,i,record:process.argv.includes('--clip')});frames.push(...r.film);delete r.film;rows.push(r)}
 // Move out after launch: no damage, no impact decal or light at the opponent.
 await p.evaluate(async()=>{let f=field;const j=(f.slot+1)%3;f.team[j]=exUnit(db[94]);exSwitch(f,j,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,6));
  f.wx.left=999;f.e.stun=999;f.p.pos.set(-2,0,0);f.e.pos.set(2,0,0);f.cd[1]=0;exAct(f,1);const hp=f.e.hp;let launched=false;
  for(let i=0;i<230;i++){exSim(f,1/90);if(f.shots.length&&!launched){launched=true;f.e.pos.z=9}if(f.vfx.some(x=>x.o.userData.burst))throw Error('false hit FX')}
  if(!launched||f.e.hp!==hp)throw Error('miss case')});
 if(errors.length)throw Error(errors.join('\n').slice(0,5000));
 fs.writeFileSync('outputs/elemental-impact.jpg',Buffer.from(await p.evaluate(()=>board.toDataURL('image/jpeg',.90).split(',')[1]),'base64'));
 if(frames.length){const ff=require('child_process').spawnSync('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','18','-vcodec','mjpeg','-i','pipe:0','-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','outputs/elemental-impact.mp4'],{input:Buffer.concat(frames.map(v=>Buffer.from(v,'base64')))});if(ff.status!==0)throw Error(String(ff.stderr)||ff.error)}
 console.log('PASS',rows,frames.length)
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
