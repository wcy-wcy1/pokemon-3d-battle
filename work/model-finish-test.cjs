const fs=require('fs'),{chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});try{
 const page=await b.newPage({viewport:{width:500,height:380}});let errors=[],before=process.argv.includes('before');
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(/Shader Error|VALIDATE_STATUS|Model fallback:/.test(m.text()))errors.push(m.text())});
 await page.goto(require('url').pathToFileURL(require('path').resolve('outputs/index.html')).href);
 await page.evaluate(()=>{Math.random=seeded(205);S.team=[25,9,150];exOpen(0);cancelAnimationFrame(field.frame)});await page.waitForFunction(()=>field.p.ready&&field.e.ready);
 const ids=await page.evaluate(before=>before?[25,9,150,59,144,149]:[25,9,150,59,144,149,...all.map(d=>d.id).filter(i=>![25,9,150,59,144,149].includes(i))],before);
 let rows=[];
 for(const [i,id] of ids.entries()){let result=await page.evaluate(async({id,i})=>{const f=field;let u=f.p;if(u.d.id!==id){f.sc.remove(u.root);exDispose(u.root);f.p=u=exUnit(db[id]);await exModel(f,u)}if(!u.model3d||!u.ready)throw Error('missing model '+id);
  for(let n=0;n<150&&Object.values(wildTex).some(t=>!t.image?.width);n++)await new Promise(r=>setTimeout(r,10));f.e.root.visible=false;u.pos.set(0,0,0);u.face=.30;actorTick(f,u,0,0);u.root.updateMatrixWorld(true);let bounds=new THREE.Box3,tris=0,variants=new Set;
  u.body.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,a=g.attributes.position;tris+=(g.index?.count||a.count)/3;if(m.material.userData.finish)variants.add(m.material.userData.finish);if(m.userData.fuzz||m.name==='Living fur tips')return;
   for(let j=0;j<a.count;j+=3){let pt=V().fromBufferAttribute(a,j);if(m.isSkinnedMesh)m.boneTransform(j,pt);if(!Number.isFinite(pt.lengthSq()))throw Error('invalid posed vertex '+id);bounds.expandByPoint(pt.applyMatrix4(m.matrixWorld))}});
  let cam=f.cam,sz=bounds.getSize(V()),center=bounds.getCenter(V()),angle=id===25?V(.85,.3,1.5):V(1.2,.48,-1.5);if(id===150){center.copy(u.motion.head.getWorldPosition(V())).y-=u.height*.27}cam.position.copy(center).addScaledVector(angle.normalize(),id===150?u.height*1.40:Math.max(sz.y,sz.x*.75,sz.z*.76)*1.56);cam.lookAt(center);cam.updateMatrixWorld(true);f.updateSight();f.r.render(f.sc,cam);
  return {id,tris,variants:[...variants],pic:i<6?f.r.domElement.toDataURL('image/jpeg',.92).split(',')[1]:null}
 },{id,i});if(result.pic){fs.writeFileSync('work/model-'+(before?'before':'after')+'-'+id+'.jpg',Buffer.from(result.pic,'base64'));delete result.pic}rows.push(result)}
 if(errors.length)throw Error(errors.join('\n').slice(0,7000));if(!before&&rows.some(r=>!r.variants.length))throw Error('unshaded species '+rows.filter(r=>!r.variants.length).map(r=>r.id));
 fs.writeFileSync('work/model-'+(before?'before':'after')+'.json',JSON.stringify(rows,null,2));console.log('PASS: rendered '+rows.length+' species');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
