const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const {writeFileSync}=require('fs');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{
 const p=await b.newPage({viewport:{width:800,height:480}}),errors=[];
 p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
 await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
 await p.evaluate(()=>{S.team=[150,25,9];exOpen(0);cancelAnimationFrame(field.frame)});
 await p.waitForFunction(()=>field.p.ready&&field.e.ready);
 await p.evaluate(()=>{const f=field;f.el.querySelector('.exStart').click();f.wx.left=999;f.blocks=[];f.e.hp=f.e.max=9999;
  window.clipFrames=[];let sample=0,clip=document.createElement('canvas');clip.width=640;clip.height=384;
  window.stepGrip=n=>{for(let i=0;i<n;i++){exSim(f,1/90);
   if(window.recordGrip&&sample++%3===0){f.updateSight();f.r.render(f.sc,f.cam);clip.getContext('2d').drawImage(f.r.domElement,0,0,640,384);clipFrames.push(clip.toDataURL('image/jpeg',.86).split(',')[1])}
  }};
  const sheet=document.createElement('canvas');sheet.width=1200;sheet.height=756;window.gripSheet=sheet;
  window.gripFrame=(idx,label)=>{f.updateSight();f.r.render(f.sc,f.cam);const ctx=sheet.getContext('2d'),x=idx%2*600,y=Math.floor(idx/2)*378;ctx.drawImage(f.r.domElement,x,y,600,360);ctx.fillStyle='#172423';ctx.fillRect(x,y+360,600,18);ctx.font='13px sans-serif';ctx.fillStyle='#fff';ctx.fillText(label,x+12,y+374)};
 });
 for(const [i,[dx,dy]] of [[-110,0],[110,0],[0,-105],[65,80]].entries()){
  const seat=await p.evaluate(({i,clip})=>{const f=field,u=f.p,v=f.e;
   f.az=i>1?1.1:.1;u.pos.set(-1.9,0,0);v.pos.set(1.9,0,0);v.stun=999;v.air=v.vy=0;f.cd[0]=0;stepGrip(60);
   window.recordGrip=clip&&i===0;exAct(f,0);for(let n=0;n<100&&!f.grip;n++)stepGrip(1);if(!f.grip)throw Error('missed palm');
   const g=f.grip,side=g.side<0?'left':'right',j=k=>u.motion.joints(side+k).getWorldPosition(V());
   stepGrip(33);const origin=j('hand'),finger=j('middle01').sub(origin).normalize(),target=bodyPoint(f,v).sub(origin).normalize();
   if(finger.dot(target)<.95)throw Error('hand did not point at target '+finger.dot(target));
   const height=()=>j('hand').y-j('arm01').y,samples=[];
   for(let k=0;k<5;k++){while(f.t-g.t<.42+k/4*g.lift.duration)stepGrip(1);samples.push([height(),v.air]);if(!i&&(k===0||k===4))gripFrame(k===0?0:1,k===0?'01  命中 / 锁定':'02  抬手 / 悬停')}
   if(samples.some(([h,y],k)=>k&&(y<=samples[k-1][1]||h<samples[k-1][0]-.025))||samples[4][0]-samples[0][0]<.10)throw Error('asynchronous lift '+JSON.stringify(samples));
   for(let y=160;y<270;y+=10)for(let x=260;x<470;x+=10)if(document.elementFromPoint(x,y)===f.r.domElement)return {x,y};throw Error('no drag area')
  },{i,clip:process.argv.includes('--clip')});
  await p.mouse.move(seat.x,seat.y);await p.mouse.down();await p.mouse.move(seat.x+dx,seat.y+dy,{steps:5});await p.mouse.up();
  console.log(await p.evaluate(({i,dx,dy})=>{const f=field,g=f.grip,u=f.p,v=f.e;if(g.phase!=='thrown')throw Error('no throw');
   const right=V(1,0,0).applyQuaternion(f.cam.quaternion);right.y=0;right.normalize();
   const up=V(right.z,0,-right.x),expected=right.clone().multiplyScalar(dx).addScaledVector(up,-dy).normalize();
   const start=v.pos.clone(),alt=v.air;stepGrip(12);
   if(v.pos.distanceTo(start)>.001||Math.abs(v.air-alt)>.001)throw Error('victim moved before palm swept');
   stepGrip(6);let s=g.side<0?'left':'right',j=k=>u.motion.joints(s+k).getWorldPosition(V()),arm=j('hand').sub(j('arm02'));arm.y=0;
   let dot=arm.normalize().dot(expected);if(dot<.94)throw Error('wrong hand heading '+dot);if(!i)gripFrame(2,'03  挥臂 / 脱手');
   stepGrip(21);if(!i)gripFrame(3,'04  随挥 / 飞出');stepGrip(150);
   window.recordGrip=false;let travel=v.pos.clone().sub(start);if(f.grip||v.air>.1||travel.length()<2||travel.normalize().dot(expected)<.98)throw Error('incorrect flight or landing');
   return {dx,dy,alignment:dot}
  },{i,dx,dy}));
 }
 if(errors.length)throw Error(errors.join('\n'));
 if(process.argv.includes('--clip')){const frames=await p.evaluate(()=>clipFrames),ff=require('child_process').spawnSync('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','outputs/mewtwo-grip.mp4'],{input:Buffer.concat(frames.map(s=>Buffer.from(s,'base64')))});if(ff.status!==0)throw Error(ff.error||String(ff.stderr))}
 const img=await p.evaluate(()=>gripSheet.toDataURL('image/jpeg',.90).split(',')[1]);writeFileSync('outputs/mewtwo-grip.jpg',Buffer.from(img,'base64'));console.log('PASS: lock, synchronized lift, detach and four camera-relative gestures');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
