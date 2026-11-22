const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const path=require('path'),fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const page=await browser.newPage({viewport:{width:720,height:408},hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/shader error|validate_status|webgl: invalid|webglprogram:/i.test(m.text())){errors.push(m.text());console.log(m.text().slice(0,1900))}});
 await page.goto(require('url').pathToFileURL(path.resolve('outputs/index.html')).href);
 async function setup(z){await page.evaluate(z=>{Math.random=seeded(712);S.team=[6,9,25];exOpen(z);cancelAnimationFrame(field.frame)},z);await page.waitForFunction(()=>field.p.ready&&field.e.ready);
 await page.locator('.exStart').click();await page.evaluate(()=>{let f=field;f.e.hp=f.e.max=9000;f.e.stun=9999;f.nextRock=999;f.wx.left=999;
 f.p.pos.set(-2.7,0,-.40);f.e.pos.set(2.9,0,.2);f.az=-.27;f.e.face=-1.6;f.p.face=1.45;
 for(let i=0;i<85;i++)exSim(f,1/60);exHUD(f,true)})}
 await setup(2);await page.keyboard.press('l');
 const video=process.argv.includes('--clip');const {snaps,film,hurt,over,spouts,quadrants,outer}=await page.evaluate(video=>{
  const f=field,a=f.p.cmd,caster=f.p,beat=charizardTiming;
  if(!a?.charFlight||!caster.charizard?.tail.length)throw Error('missing flight sequence or tail rig');
  const head=caster.motion.head,headRotation=()=>head.getWorldQuaternion(new THREE.Quaternion());
  const headForward=V(Math.sin(a.charFlight.yaw),0,Math.cos(a.charFlight.yaw)).applyQuaternion(headRotation().invert());
  const lookY=()=>headForward.clone().applyQuaternion(headRotation()).y;
  const idleLook=lookY();
  const hp=f.e.hp;let hurt=-1,m,hiddenTime=0;
  let over=null,firstShadow,lateShadow;const fired=new Set();const snaps=[],film=[],c=document.createElement('canvas');c.width=720;c.height=436;const ctx=c.getContext('2d');
  for(let i=0;i<880;i++){
   exSim(f,1/60);const t=(i+1)/60;if(f.e.hp<hp&&hurt<0)hurt=t;
   const wrap=caster.charizard.envelope;
   if(i===18&&wrap.mesh.visible)throw Error('shared flame appeared before the grab');
   if(i===66&&wrap.uniforms.tail.value!==0)throw Error('fire trail appeared before takeoff');
   if(i===104||i===194){
    const up=V(0,1,0).applyQuaternion(wrap.mesh.quaternion);
    if(!wrap.mesh.visible||wrap.uniforms.tail.value<.85||(i===104?up.y<.99:up.y>-.99))
     throw Error('fire trail did not follow the direction of flight');
    if(caster.charizard.flames.some(source=>source.group.visible))throw Error('separate flame visible alongside the fireball');
   }
   if(i===197&&caster.charizard.flames[0].group.visible)throw Error('tail flame returned abruptly on impact');
   if(i===229&&!caster.charizard.flames[0].group.visible)throw Error('tail flame did not return after landing');
   if(i===66||i===98){
    if(!wrap.mesh.visible||wrap.uniforms.ignite.value<.95)throw Error('shared flame did not form before launch');
    f.cam.updateMatrixWorld(true);
    const width=120,height=68,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const small=canvas.getContext('2d');
    const frame=()=>{f.r.render(f.sc,f.cam);small.drawImage(f.r.domElement,0,0,width,height);return small.getImageData(0,0,width,height).data};
    const lit=frame();wrap.mesh.visible=false;const bare=frame();wrap.mesh.visible=true;
    let changed=0;for(let pixel=0;pixel<lit.length;pixel+=4)if(lit[pixel]>bare[pixel]+35&&lit[pixel]>lit[pixel+1]*1.2)changed++;
    if(changed<16)throw Error('shared flame did not render at '+t+'s ('+changed+' illuminated pixels)');
   }
   if(i===44&&(a.charFlight.victim!==f.e||!caster.charizard.flames[1].group.visible))throw Error('missing fiery grab');
   if(i===66||i===107||i===191){
    const hold=a.charFlight,forward=V(0,0,1).applyEuler(hold.pose),across=V(1,0,0).applyEuler(hold.pose);
    const chest=caster.motion.joints('spine2').getWorldPosition(V()),spine=f.e.motion?.joints('spine2','chest','spine1','hips');
    const torso=spine?spine.getWorldPosition(V()):hold.heldTorso;
    const offset=torso.clone().sub(chest),gap=offset.dot(forward);
    if(gap<.15||gap>.70||Math.abs(offset.dot(across))>.16)throw Error('target slipped away from the chest');
    for(const side of ['l','r']){
     const paw=caster.motion.joints(side+'hand').getWorldPosition(V()).sub(torso);
     if(paw.length()>.37||paw.dot(across)*(side==='l'?1:-1)<0)throw Error('forepaw missed the side of the held target')
    }
   }
   if(i===107&&(caster.air<3||Math.abs(caster.air-f.e.air)>1.3))throw Error('missing shared vertical launch');
   if(t>=beat.launch&&t<beat.hidden){
    if(Math.abs(caster.body.rotation.x)>.01||Math.abs(caster.body.rotation.z)>.01)throw Error('takeoff body tilted');
    if(lookY()<idleLook+.15)throw Error('head not looking upward during takeoff '+JSON.stringify({t,idleLook,look:lookY()}))
   }
   if(!caster.body.visible){hiddenTime+=1/60;if(caster.charizard.group.visible||f.e.body.visible)throw Error('captured actors visible while offscreen')}
   if(t<beat.impact&&f.landscape.cast)throw Error('floor cracked before impact');
   m=a.magma;
   if(t<beat.impact&&f.e.hp!==hp)throw Error('damage before impact');
   const shadow=f.vfx?.find(v=>v.o.userData.grabShadow)?.o;
   if((i===128||i===182)&&shadow?.visible){
    const p=shadow.children[0].geometry.attributes.position;
    const width=p.getX(14)-p.getX(0);if(i===128)firstShadow=width;else lateShadow=width
   }
   if(i===191&&caster.body.rotation.x<2.7)throw Error('dive was not headfirst');
   if(i===229&&(!m||m.vents.length!==3||dst(m.vents.at(-1).pos,a.charFlight.landing)>.1||m.vents.some(v=>v.opened)))throw Error('landing and seep phase');
   for(const v of m?.spouts||[])if(v.popped)fired.add(v);
   if(i===278){const camera=f.cam.clone();camera.position.set(0,35,9);camera.lookAt(0,0,0);f.r.render(f.sc,camera);ctx.drawImage(f.r.domElement,0,0,720,408);ctx.fillStyle='#191e1e';ctx.fillRect(0,408,720,28);ctx.fillStyle='#ffdfc2';ctx.font='15px Microsoft YaHei';ctx.fillText('战场俯瞰  /  竞技场边界内的断层网络',14,427);over=c.toDataURL('image/jpeg',.92).split(',')[1]}
   const snap=[52,98,162,194,228,284].includes(i);
   if(snap||video&&i%4===0){f.updateSight?.();f.r.render(f.sc,f.cam);ctx.drawImage(f.r.domElement,0,0,720,408);
    ctx.fillStyle='#191e1e';ctx.fillRect(0,408,720,28);ctx.fillStyle='#f8dac4';ctx.font='15px Microsoft YaHei';
    ctx.fillText('喷火龙  /  地脉喷发      '+(t<beat.grab?'冲刺':t<beat.launch?'抓取蓄势':t<beat.hidden?'抱住对手升空':t<beat.dive?'落点影子':t<beat.impact?'火焰旋转俯冲':t<a.wind?'撞地 · 岩层开裂':t<5.2?'主裂隙喷发':'火山持续活动 · 间歇喷发'),14,427);
    const d=c.toDataURL('image/jpeg',.89).split(',')[1];if(snap)snaps.push(d);if(video&&i%4===0)film.push(d)
   }
  }
  if(!(lateShadow>firstShadow*2))throw Error('landing shadow did not expand');
  if(Math.abs(hiddenTime-1)>.036)throw Error('wrong offscreen duration '+hiddenTime);
  if(hurt<0||f.landscape.cast!==a||f.landscape.un.landMode.value!==1||
    f.landscape.un.landHeat.value!==1||!activeVolcano(f)||!f.wx.badge.textContent.includes('持续'))throw Error('volcano or ash expired while Charizard stayed out');
  const lateRound=m.round;
  for(let i=0;i<800;i++)exSim(f,1/60);
  if(!activeVolcano(f)||m.round<=lateRound||m.spouts.length>7)throw Error('persistent vents stopped or accumulated');
  const atlasVersion=f.landscape.tex.version;
  exAct(f,3);
  const second=f.p.cmd;if(!second?.charFlight)throw Error('recast unavailable');
  for(let i=0;i<287;i++)exSim(f,1/60);
  if(f.landscape.cast!==second||!second.magma||f.landscape.tex.version!==atlasVersion||f.landscape.un.landAge.value<20)throw Error('recast reset the active fissures');
  const defeated=f.p;
  exHurt(f,defeated,defeated.hp*10,f.e.d,false);
  if(!f.down||activeVolcano(f))throw Error('volcano survived faint');
  return {snaps,film,hurt,over,spouts:fired.size,quadrants:new Set(m.nodes.map(p=>(p.x<0?1:0)+(p.z<0?2:0))).size,outer:m.nodes.filter(n=>Math.hypot(n.x,n.z)>10).length}
 },video);
 assert(spouts>=5&&quadrants===4&&outer>=6,'field coverage or late vents');
 const faintCleanup=await page.evaluate(async()=>{
  const f=field;for(let i=0;i<115;i++){if(!f.p.ready)await new Promise(r=>setTimeout(r,10));exSim(f,1/60)}
  return f.p.d.id!==6&&!f.landscape.cast&&f.landscape.un.landMode.value===0&&f.landscape.lamp.intensity===0
 });assert(faintCleanup,'faint and forced switch did not restore the arena');
 if(errors.length)throw Error(errors.join('\n').slice(0,3500));
 function encode(args,images){const r=require('child_process').spawnSync('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','15','-vcodec','mjpeg','-i','pipe:0',...args],{input:Buffer.concat(images.map(x=>Buffer.from(x,'base64')))});if(r.status!==0)throw Error(String(r.stderr))}
 encode(['-vf','scale=480:-1,tile=2x3','-frames:v','1','-q:v','2','outputs/magma-stages.jpg'],snaps);
 fs.writeFileSync('outputs/magma-map.jpg',Buffer.from(over,'base64'));
 if(film.length)encode(['-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','outputs/charizard-caldera.mp4'],film);
 await page.setViewportSize({width:390,height:700});await setup(1);await page.locator('[data-a="3"]').tap();
 const miss=await page.evaluate(()=>{const f=field,a=f.p.cmd,hp=f.e.hp;f.e.pos.set(-12,0,4);for(let i=0;i<80;i++)exSim(f,1/60);
  return !a.charFlight.victim&&!f.landscape.cast&&f.e.hp===hp
 });assert(miss);
 await setup(1);await page.locator('[data-a="3"]').tap();
 const coastal=await page.evaluate(()=>{
  const f=field,a=f.p.cmd;let enveloped=false;
  for(let i=0;i<291;i++){
   exSim(f,1/60);
   if(i===66){
    const mesh=f.p.charizard.envelope.mesh;
    f.r.render(f.sc,f.cam);
    const c=document.createElement('canvas');c.width=60;c.height=104;
    const ctx=c.getContext('2d');
    ctx.drawImage(f.r.domElement,0,0,c.width,c.height);
    const lit=ctx.getImageData(0,0,c.width,c.height).data;
    mesh.visible=false;f.r.render(f.sc,f.cam);ctx.drawImage(f.r.domElement,0,0,c.width,c.height);mesh.visible=true;
    const bare=ctx.getImageData(0,0,c.width,c.height).data;let changes=0;
    for(let j=0;j<lit.length;j+=4)if(lit[j]>bare[j]+35&&lit[j]>lit[j+1]*1.2)changes++;
    enveloped=changes>8;
   }
   if(i===197||i===268)f.r.render(f.sc,f.cam)
  }
  return enveloped&&activeVolcano(f)&&a.charFlight.landed
 });assert(coastal);
 await page.keyboard.press('x');await page.waitForFunction(()=>field.p.ready&&field.p.d.id===9);
 const clear=await page.evaluate(()=>{const f=field;exSim(f,1/60);if(f.landscape.cooledAt==null||activeVolcano(f))return false;
  for(let i=0;i<185;i++)exSim(f,1/60);
  return !f.landscape.cast&&!f.landscape.lamp.intensity&&!f.vfx.some(v=>v.o.userData.volcanic)
 });assert(clear,'manual switch did not restore the arena');
 if(errors.length)throw Error(errors.join('\n').slice(0,3500));
 console.log('PASS: persistent volcano, repeat cast, manual switch, faint, mobile evasion.',film.length,'frames;',spouts,'late vents; first hit',hurt,'sec')
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
