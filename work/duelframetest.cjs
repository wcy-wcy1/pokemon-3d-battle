const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
const p=await b.newPage({viewport:{width:640,height:360}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.text().includes('Shader Error'))errors.push(m.text())});
await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);await p.evaluate(()=>{S.team=[25,384,150];exOpen(0);cancelAnimationFrame(field.frame)});await p.waitForFunction(()=>field.p.ready&&field.e.ready);
const result=await p.evaluate(async()=>{let f=field,u=f.p,e=f.e;f.el.querySelector('.exStart').click();f.blocks=[];f.wx.left=999;e.stun=999;e.hp=e.max=5000;
const tick=()=>exSim(f,1/90),check=(ok,msg)=>{if(!ok)throw Error(msg)},canvas=document.createElement('canvas');canvas.width=640;canvas.height=1440;let ctx=canvas.getContext('2d');
canvas.width=838;canvas.height=720;const results=[];let tinySize;
 for(let actor=0;actor<2;actor++){if(actor){exSwitch(f,1,true);while(!f.p.ready)await new Promise(r=>setTimeout(r,10));u=f.p}
 for(let aspect of [16/9,.55])for(let az of [0,Math.PI/2]){
 const wide=aspect>1,w=wide?640:198,h=360;f.cam.aspect=aspect;f.cam.updateProjectionMatrix();f.r.setSize(w,h,false);f.az=az;u.pos.set(actor?-4:-.7,0,0);e.pos.set(actor?4:.7,0,0);f.wx.phase='calm';f.wx.left=999;e.stun=999;
 for(let i=0;i<160;i++)tick();f.cam.updateMatrixWorld(true);f.updateSight();f.r.render(f.sc,f.cam);
 let boxes=[];for(let s of [u,e]){let bounds=new THREE.Box2();s.body.traverse(m=>{if(!m.isSkinnedMesh||m.userData.fuzz)return;let pos=m.geometry.attributes.position;for(let k=0;k<pos.count;k+=4){let v=V().fromBufferAttribute(pos,k);m.boneTransform(k,v);v.applyMatrix4(m.matrixWorld).project(f.cam);bounds.expandByPoint(new THREE.Vector2(v.x,v.y))}});check(bounds.min.x>-.999&&bounds.max.x<.999&&bounds.min.y>-.99&&bounds.max.y<.99,'cutoff '+[actor,aspect,az,JSON.stringify(bounds)]);boxes.push(bounds)}
 if(!actor&&wide&&az===0){tinySize=(boxes[0].max.y-boxes[0].min.y)*h*.5;check(tinySize>32,'small actor unreadable '+tinySize)}
 if(az===0)ctx.drawImage(f.r.domElement,wide?0:640,actor*360,w,h);results.push([actor,aspect,az])}}
 console.log('sampled posed vertices in '+results.length+' views');return canvas.toDataURL('image/jpeg',.88).split(',')[1]});if(errors.length)throw Error(errors);require('fs').writeFileSync('outputs/duel-camera.jpg',Buffer.from(result,'base64'));console.log('PASS: posed small and long models fit, landscape/portrait, side/end-on');}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
