const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{const p=await b.newPage({viewport:{width:640,height:360},hasTouch:true}),errors=[];
p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(/shader error|validate_status|webgl: invalid|webglprogram:/i.test(m.text()))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(path.resolve('outputs/index.html')).href);
await p.evaluate(()=>{Math.random=seeded(219);S.team=[25,9,6];exOpen(0);cancelAnimationFrame(field.frame)});
await p.waitForFunction(()=>field.p.ready&&field.e.ready);await p.locator('.exStart').click();
const frames=[],shots=[],tick=n=>p.evaluate(n=>{for(let j=0;j<n;j++)exSim(field,1/60)},n);
await p.evaluate(()=>{const f=field;f.e.hp=f.e.max=9000;f.e.stun=9999;f.blocks=[];f.r.setPixelRatio(.82);f.wx.left=999;window.plate=document.createElement('canvas');plate.width=640;plate.height=388});
for(const [i,id] of [25,9,6,65,150].entries()){
 await p.evaluate(async id=>{const f=field;
 if(f.p.d.id!==id){const slot=(f.slot+1)%3;f.team[slot]=exUnit(db[id]);exSwitch(f,slot,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,12))}
 f.p.pos.set(-1.9,0,0);f.e.pos.set(2.1,0,-.25);f.e.inv=0;f.p.face=Math.PI/2;f.e.face=-Math.PI/2;exHUD(f,true)
 },id);
 if(i>0)await tick(13);
 if(i<2){await p.keyboard.press('k');assert(await p.evaluate(()=>!!(field.p.volts||field.p.jet)))}
 if(i%2===0)await p.keyboard.press('l');else await p.locator('[data-a="3"]').tap();
 const info=await p.evaluate(()=>({skill:field.p.cmd?.skill,id:field.p.d.id,energy:field.p.en,chan:!!(field.p.volts||field.p.jet)}));
 assert.equal(info.skill,3);assert(!info.chan&&info.energy<4);console.log('cast',info);
 const result=await p.evaluate(({i,video})=>{const f=field,a=f.p.cmd,e=f.e,hp=e.hp,out=[],snap=[];let hit=false;
 const label=f.p.d.name+'   /   '+(a.k==='fault'?'断层星爆':resonanceNames[a.front]);
 for(let j=0;j<(i===4?205:162);j++){exSim(f,1/60);if(e.hp<hp)hit=true;
 if((video&&j%5===0)||j===37||j===(i===4?139:65)){
 f.updateSight();f.r.render(f.sc,f.cam);let c=plate.getContext('2d');c.drawImage(f.r.domElement,0,0,640,360);c.fillStyle='#122325';c.fillRect(0,360,640,28);c.font='15px Microsoft YaHei';c.fillStyle='#f2ebd7';c.fillText(label,16,380);
 let pic=plate.toDataURL('image/jpeg',.87).split(',')[1];if(video&&j%5===0)out.push(pic);if(j===37||j===(i===4?139:65))snap.push(pic)
 }}
 return {hit,out,snap,echo:f.vfx.some(x=>x.o.userData.celestial)}
 },{i,video:process.argv.includes('--clip')});
 assert(result.hit&&!result.echo);frames.push(...result.out);shots.push(...result.snap);
 await tick(145);
}
await p.evaluate(()=>{const f=field;f.p.pos.set(-11,0,0);f.e.pos.set(11,0,0);f.e.stun=9999;f.p.face=Math.PI/2;wxClear(f);f.wx.phase='calm';f.wx.left=900;f.p.en=ULT_COST-ULT_REGEN*.3;f.cd[3]=.4;exHUD(f,true)});
await p.locator('[data-a="3"]').tap();assert(await p.evaluate(()=>field.buffered?.i===3&&!field.p.cmd));await tick(28);assert(await p.evaluate(()=>field.p.cmd?.skill===3&&!field.buffered));
const spent=await p.evaluate(()=>field.p.en);await p.keyboard.press('Escape');await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>field.p.en),spent);await p.locator('.exStart').click();await tick(420);
assert(await p.evaluate(()=>field.p.en>=ULT_COST&&field.cd[3]===0&&!field.vfx.some(x=>x.o.userData.celestial)&&field.celestialLight.intensity===0));
if(errors.length)throw Error(errors.join('\n').slice(0,6000));
if(process.argv.includes('--clip')){function encode(args,inputs){const r=require('child_process').spawnSync('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate','12','-vcodec','mjpeg','-i','pipe:0',...args],{input:Buffer.concat(inputs.map(x=>Buffer.from(x,'base64')))});if(r.status)throw Error(String(r.stderr))}
encode(['-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-movflags','+faststart','outputs/super-ultimate.mp4'],frames);
encode(['-vf','scale=384:-1,tile=2x5','-frames:v','1','-q:v','2','outputs/super-ultimate.jpg'],shots)}
console.log('PASS: 5 different live casts; keyboard/touch, K takeover, buffer, pause, regen, scene cleanup',frames.length)
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
