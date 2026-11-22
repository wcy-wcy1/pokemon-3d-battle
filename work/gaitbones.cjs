const fs=require('fs'),{chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core'),assert=require('assert');
(async()=>{let b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
let p=await b.newPage({viewport:{width:360,height:258}}),errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',e=>{if(e.type()==='error')errors.push(e.text().slice(0,250))});await p.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
await p.evaluate(()=>{exGate();cancelAnimationFrame(field.frame);observe(field)});let ids=await p.evaluate(()=>all.map(d=>d.id)),out=[];
for(let id of [12,39,146]){if(id===25)continue;await p.evaluate(id=>watchAnimal(field,id),id);await p.waitForFunction(()=>field.p.ready);let rec=await p.evaluate(id=>{const f=field,u=f.p,g=u.motion,frames=[];if(!g)throw Error('missing '+id);u.pos.set(0,0,0);u.face=.75;u.drive=8;f.keys.add('ShiftLeft');let bn=[];u.body.traverse(n=>{if(n.isBone)bn.push(n.name)});return {id,bn,frames:[]};const H=u.height||2;f.cam.position.set(H*1.22,groundY(0,0,f.z)+H*.75,H*1.8);f.cam.lookAt(0,groundY(0,0,f.z)+H*.55,0);
for(let i=0;i<54;i++){f.t+=1/60;actorTick(f,u,1/60,1);if([12,24,36,48].includes(i)&&[9,59,18,130].includes(id)){f.r.render(f.sc,f.cam);frames.push(f.r.domElement.toDataURL('image/jpeg',.91).split(',')[1])}}
f.r.render(f.sc,f.cam);if(!u.body.matrixWorld.elements.every(Number.isFinite))throw Error('invalid pose '+id);
return {id,kind:g.kind,legs:g.limbs.length,soles:g.soles.length,wings:g.wings.length,native:u.lastClip?.name,frames}},id);rec.frames.forEach((f,i)=>fs.writeFileSync('work/fauna'+id+'-'+i+'.jpg',Buffer.from(f,'base64')));delete rec.frames;out.push(rec)}
console.log(JSON.stringify(out));console.log('moving rigs',out.length,'errors',errors);assert.equal(errors.length,0)
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1})
