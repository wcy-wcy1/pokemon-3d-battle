const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const assert=require('assert/strict'),fs=require('fs'),{pathToFileURL}=require('url'),{resolve}=require('path');
const url=pathToFileURL(resolve('outputs/index.html')).href;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 try{
  for(const [width,height] of [[900,540],[390,700]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:width<500}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(/shader error|validate_status|webgl: invalid|webglprogram:|model fallback/i.test(m.text()))errors.push(m.text())});
   await page.goto(url);
   await page.locator('#force').click();
   await page.locator('#openbtn').click();
   await page.getByText('十连开封结果',{exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>S.owned[MEGA_X]),1);
   assert(await page.evaluate(()=>S.last.length===10&&rank(pack[9])===4&&!pack[9].evolution));
   if(width>500)await page.screenshot({path:'outputs/mega-x-card.jpg',quality:91});
   await page.reload();assert.equal(await page.evaluate(()=>S.owned[MEGA_X]),1);
   await page.locator('nav [data-view="dex"]').click();
   await page.locator('.megaEntry').click();
   assert(await page.locator('.holo .megaFoil .artwin').evaluate(img=>img.complete&&img.naturalWidth>0&&
    getComputedStyle(img.parentElement).aspectRatio==='4 / 3'));
   await page.getByRole('button',{name:'喷火龙体验队'}).click();
   await page.waitForFunction(()=>field?.p.ready&&field.e.ready);
   await page.evaluate(()=>{const f=field;cancelAnimationFrame(f.frame);f.p.pos.set(-1.5,0,0);f.e.pos.set(2,0,0);f.e.hp=f.e.max=999;f.e.stun=9999;f.wx.left=999;f.nextRock=999;f.p.face=1.45;f.p.hp-=18;});
   await page.locator('.exStart').click();
   await page.evaluate(()=>{for(let i=0;i<24;i++)exSim(field,1/60);exHUD(field,true)});
   const before=await page.evaluate(()=>({hp:field.p.hp,en:field.p.en,atk:field.p.d.atk}));
   const card=page.getByRole('button',{name:'使用 Mega 喷火龙 X 进化卡'});
   assert(await card.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0));
   if(width>500)await card.click();else await card.tap();
   const step=async ticks=>page.evaluate(ticks=>{
    const f=field;
    for(let i=0;i<ticks;i++)exSim(f,1/60);
    f.updateSight?.();megaRender(f);f.r.render(f.sc,f.cam);
   },ticks);
   const clips={evolution:[],claw:[],wave:[],dive:[]};
   const record=async(label,ticks)=>{
    if(width<500||!(label==='evolution'?process.argv.includes('--evolution-clip'):process.argv.includes('--clip')))return step(ticks);
    while(ticks>0){
     const advance=Math.min(3,ticks);
     await step(advance);
     clips[label].push(await page.screenshot({type:'jpeg',quality:88}));
     ticks-=advance;
    }
   };
   const stage=async(name)=>{
    const jpg=await page.screenshot({type:'jpeg',quality:92});
    if(width>500||/^(lotus|impact|demon|card-flight|array|column|outline|particles)/.test(name))
     fs.writeFileSync('outputs/mega-x-'+name+(width<500?'-portrait':'')+'.jpg',jpg);
   };
   const effect=kind=>page.evaluate(k=>!!field.vfx?.some(fx=>fx.o.visible&&fx.o.userData.megaFX===k),kind);
   await record('evolution',29);
   assert(await page.evaluate(()=>{
    const s=field.megaShift,{style}=s.card,turn=Number(style.transform.match(/rotateY\(([^d]+)deg\)/)?.[1]);
    return s.card.isConnected&&s.card.children.length===2&&s.card.classList.contains('showBack')&&Math.abs(turn)<35&&
     getComputedStyle(s.card.children[0]).visibility==='hidden'&&getComputedStyle(s.card.children[1]).visibility==='visible'&&
     s.card.getBoundingClientRect().width>s.sourceWidth*1.4&&!s.u.d.mega;
   }),'the shiny card should make a complete three-dimensional flip');
   await stage('card-flight');
   await record('evolution',36);
   assert(await page.evaluate(()=>{
    const {card}=field.megaShift;
    return !card.classList.contains('showBack')&&getComputedStyle(card.children[0]).visibility==='visible'&&
     card.style.getPropertyValue('--foil-x')!=='';
   }),'the front of the foil card should return as the spin finishes');
   await stage('card-foil');
   await record('evolution',11);
   assert(await page.evaluate(()=>{
    const s=field.megaShift;
    return Number(s.card.style.opacity)<.8&&s.ritual.group.visible&&s.ritual.trace.value<.12&&!s.ritual.column.visible;
   }),'the seal should start drawing as the card fades');
   await record('evolution',45);
   assert(await page.evaluate(()=>{
    const s=field.megaShift;
    return !s.card.isConnected&&s.ritual.trace.value>.42&&s.ritual.trace.value<.70&&
     !s.ritual.column.visible&&s.u.air<.10&&!s.u.d.mega;
   }),'the two triangles should draw progressively beneath the grounded Pokémon');
   await stage('array-drawing');
   await record('evolution',45);
   assert(await page.evaluate(()=>{
    const f=field,s=f.megaShift,p=s.ground.clone().project(f.cam);
    return s.ritual.trace.value===1&&!s.ritual.column.visible&&Math.abs(p.x)<.74&&Math.abs(p.y)<.69;
   }),'the complete six-pointed star should be visible before the beam');
   await stage('array-sealed');
   await record('evolution',34);
   assert(await page.evaluate(()=>{
    const s=field.megaShift;
    return s.ritual.column.visible&&s.ritual.height.value>6&&s.cover.value>.90&&!s.u.d.mega;
   }),'the light column should rise and cover the original model before evolution');
   await stage('column');
   await record('evolution',14);
   await page.waitForFunction(()=>field.p.ready&&field.p.d.mega);
   await record('evolution',16);
   assert(await page.evaluate(()=>{const s=field.megaShift;return !s.card.isConnected&&s.cover.value>.95&&s.breakup.value===0&&!s.particles}));
   await stage('outline');
   await record('evolution',46);
   assert(await page.evaluate(()=>{const s=field.megaShift;return s.breakup.value>.4&&s.particles?.mesh.geometry.attributes.position.count===960}));
   await stage('particles');
   await record('evolution',74);
   assert(await page.evaluate(()=>{
    const f=field;
    return !f.megaShift&&!f.el.querySelector('.megaFlightCard')&&!f.el.classList.contains('megaEvolving');
   }),'the sequence should clean up its overlay and restore battle controls');
   const after=await page.evaluate(()=>{
    const f=field,u=f.p;
    for(let i=0;i<70;i++)exSim(f,1/60);
    f.updateSight?.();f.r.render(f.sc,f.cam);
    const c=document.createElement('canvas');c.width=120;c.height=90;
    const ctx=c.getContext('2d');ctx.drawImage(f.r.domElement,0,0,c.width,c.height);
    const pixels=ctx.getImageData(0,0,c.width,c.height).data;let blue=0,lit=0;
    for(let i=0;i<pixels.length;i+=4){if(pixels[i+2]>70&&pixels[i+2]>pixels[i]*1.32&&pixels[i+1]>1.17*pixels[i])blue++;if(pixels[i]+pixels[i+1]+pixels[i+2]>130)lit++}
    return {hp:u.hp,en:u.en,atk:u.d.atk,model:u.model3d,blue,lit,tail:u.charizard.tail.length,wings:u.charizard.wings.length,ready:!f.megaShift,owned:S.owned[MEGA_X]}
   });
   assert(after.hp===before.hp&&after.atk>before.atk&&after.en>=before.en&&after.owned===1&&after.model&&after.tail===7&&after.wings===6&&after.ready&&after.blue>4&&after.lit>250,JSON.stringify(after));
   const aura=await page.evaluate(()=>{
    const f=field,u=f.p,a=u.charizard.megaAura;
    let breaths=0;
    for(let i=0;i<175;i++){exSim(f,1/60);if(a.mouth.some(flame=>flame.visible))breaths++}
    return a.group.visible&&a.shell.length>0&&a.shell.every(m=>m.visible&&m.skeleton===m.parent.skeleton)&&breaths>5&&breaths<140;
   });
   assert(aura,'expected visible aura and intermittent mouth flames');
   await step(0);
   await page.screenshot({path:width>500?'outputs/mega-x-battle.jpg':'outputs/mega-x-mobile.jpg',quality:91});
   if(width>500)await page.keyboard.press('k');else await page.locator('[data-a="1"]').tap();
   const flightFrames=await page.evaluate(()=>Math.ceil((field.p.cmd.wind+field.p.cmd.flight)*60));
   await record('wave',81);
   assert(await page.evaluate(()=>{
    const f=field,a=f.p.cmd,p=a?.lotus?.position;
    return a?.megaSkill===1&&a.gathering&&a.formed&&!a.sent&&p.distanceTo(megaLotusHands(a))<.04&&
     a.lotus.scale.x>.75&&f.p.charizard.megaAura.uniforms.strength.value<.30;
   }),'the charge should gather body flames between the moving hands');
   await stage('lotus-charge');
   await record('wave',57);
   assert(await page.evaluate(()=>{
    const f=field,a=f.megaLotusFlight;
    return a?.sent&&!f.p.cmd&&!a.hit&&a.lotus.position.distanceTo(a.origin)>.25&&a.lotus.position.y>a.target.y+.25&&
     a.lotus.material.uniforms.open.value===0&&f.e.hp===f.e.max;
   }),'the closed bud should still be gliding after the casting animation finishes');
   await stage('lotus-glide');
   await record('wave',flightFrames+9-138);
   assert(await page.evaluate(()=>{
    const f=field,a=f.megaLotusFlight,flower=a.lotus;
    return flower.material.uniforms.open.value===0&&flower.position.y>a.target.y+.46&&f.e.hp===f.e.max&&
     dst(a.target,flower.position)<.1&&f.t-a.launched>=a.flight;
   }),'the fire lotus should hover as a closed bud before the detonation');
   await stage('lotus-bud');
   await record('wave',40);
   assert(await effect('lotusBloom'));
   assert(await page.evaluate(()=>field.e.megaScorch?.until>field.t&&field.e.hp<field.e.max));
   assert(await page.evaluate(()=>{
    const screen=field.vfx.find(x=>x.o.userData.megaFX==='lotusBloom').o.children[2];
    return !screen.material.depthTest&&screen.geometry.parameters.width===2&&screen.material.uniforms.phase.value>.4;
   }),'shockwave should render over the whole viewport');
   await stage('lotus-shockwave');
   await record('wave',38);
   assert(await page.evaluate(()=>{
    const f=field,flower=f.vfx.find(x=>x.o.userData.megaFX==='lotusBloom').o.children[0];
    const center=f.megaBloom.center.clone().add(V(0,1,0)).project(f.cam);
    return flower.material.uniforms.open.value>.9&&flower.scale.x>2.3&&Math.abs(center.x)<.88&&Math.abs(center.y)<.68;
   }),'the open lotus should fit within the frame');
   await stage('lotus-bloom');
   await record('wave',61);
   assert(!await effect('lotusBloom'));
   const markedHP=await page.evaluate(()=>field.e.hp);
   if(width>500)await page.keyboard.press('l');else await page.locator('[data-a="3"]').tap();
   await record('dive',66);
   assert(await page.evaluate(()=>field.p.cmd?.megaSkill===3&&field.p.charizard.envelope.mesh.visible&&field.p.charizard.envelope.uniforms.blue.value===1));
   if(width>500){
    await page.evaluate(()=>{const f=field;f.updateSight?.();f.r.render(f.sc,f.cam)});
    await page.screenshot({path:'outputs/mega-x-blue-flame.jpg',quality:92});
   }
   await record('dive',37);
   assert(await effect('skyburst'));
   assert(await page.evaluate(()=>{
    const f=field,s=f.landscape;
    return f.megaTint&&f.quake.amp.value>0&&s.cast===f.p.cmd&&s.un.landMode.value===1&&s.un.landBlue.value===1&&s.bytes.some(x=>x>240);
   }),'Mega X should use the volcanic terrain atlas in blue');
   await stage('impact');
   await record('dive',18);
   assert(await page.evaluate(()=>{
    const f=field,a=f.p.cmd,g=f.vfx.find(x=>x.o.userData.megaFX==='demon').o;
    const [torso,first,second]=g.children;
    return a?.breached&&g.visible&&torso.position.y<-3&&first.children.at(-1).position.y>.38&&second.children.at(-1).position.y<0;
   }),'first skeletal hand should break through before the torso and the other hand');
   await stage('demon-hand');
   await record('dive',56);
   assert(await effect('demon'));
   assert(await page.evaluate(()=>{
    const f=field,o=f.vfx.find(x=>x.o.userData.megaFX==='demon').o,a=f.p.cmd;
    const head=o.position.clone().add(V(0,2.9,0)).project(f.cam);
    return a?.victim===f.e&&o.children[0].position.y>-.18&&Math.abs(head.x)<.88&&Math.abs(head.y)<.70;
   }),'the demon should rise out of the fissure and fit the lens');
   await stage('demon-rise');
   await record('dive',20);
   assert(await page.evaluate(()=>{
    const a=field.p.cmd,g=field.vfx.find(x=>x.o.userData.megaFX==='demon').o;
    return a.skyClaw.visible&&a.skyClaw.position.y>g.position.y+5&&g.children[0].position.y>-.20&&!a.sealed;
   }),'the dragon claw should descend after the skeleton has crawled halfway out');
   await stage('sky-claw');
   await record('dive',31);
   assert(await page.evaluate(()=>{
    const f=field,a=f.p.cmd,g=f.vfx.find(x=>x.o.userData.megaFX==='demon').o;
    return a?.sealed&&a.skyClaw.visible&&a.skyClaw.position.y<g.position.y+4.3&&g.children[0].position.y<-.18&&
     f.quake.hit&&f.quake.amp.value>0;
   }),'the claw should continue downward as the skeleton sinks');
   await stage('demon-seal');
   await record('dive',42);
   assert(await page.evaluate(hp=>field.e.hp<hp&&!field.e.megaScorch&&field.landscape.cast?.keepLava&&!field.p.cmd,markedHP));
   assert(!await effect('demon'));
   if(width>500){
    await page.evaluate(()=>{
     const f=field;f.p.pos.set(0,0,0);f.e.pos.set(1.30,0,0);f.p.air=f.e.air=0;
     for(let i=0;i<12;i++)exSim(f,1/60);
    });
    const clawHP=await page.evaluate(()=>field.e.hp);
    await page.keyboard.press('j');
    await record('claw',16);
    const first=await page.evaluate(()=>field.e.hp);assert(first<clawHP,JSON.stringify(await page.evaluate(()=>{
     const f=field,u=f.p,e=f.e;
     return {cmd:u.cmd?.megaSkill,claw:u.cmd?.lastClaw,a:u.air,b:e.air,pos:u.pos.toArray(),foe:e.pos.toArray(),overlap:meleeOverlap(f,u,e),strength:u.d.atk,inv:e.inv};
    })));
    await record('claw',21);
    assert(await page.evaluate(hp=>field.e.hp<hp,first),'follow-up claw did not hit');
    await page.evaluate(()=>{
     const f=field;
     for(let i=0;i<320;i++)exSim(f,1/60);
     if(!f.vfx.some(v=>v.o.userData.volcanic))throw Error('persistent blue magma should spawn secondary vents');
     f.landscape.cast.magma.next=Infinity;
     f.landscape.cast.magma.spouts.length=0;
     f.e.pos.set(3,0,0);exHUD(f,true);
    });
    const beforeMiss=await page.evaluate(()=>field.e.hp);
    const atlas=await page.evaluate(()=>field.landscape.tex.version);
    await page.keyboard.press('k');
    await page.evaluate(()=>field.e.pos.set(-9,0,0));
    await step(256);
    assert(await page.evaluate(hp=>field.e.hp===hp&&!field.e.megaScorch,beforeMiss),'the lotus should miss a target that leaves the blast area');
    await page.evaluate(()=>field.e.pos.set(3,0,0));
    await page.keyboard.press('l');
    await page.evaluate(()=>field.e.pos.set(-9,0,0));
    await step(270);
    assert(await page.evaluate(hp=>field.e.hp===hp,beforeMiss),'dive should miss outside the locked radius');
    assert(await page.evaluate(version=>field.landscape.tex.version===version,atlas),'recasting should keep the existing fault network');
    await page.keyboard.press('x');
    await page.waitForFunction(()=>field.p.d.id===25&&field.p.ready);
    await page.evaluate(()=>{for(let i=0;i<165;i++)exSim(field,1/60)});
    assert(await page.evaluate(()=>!field.landscape.cast&&field.landscape.un.landMode.value===0&&field.landscape.lamp.intensity===0));
    await page.keyboard.press('z');
    await page.waitForFunction(()=>field.p.d.id===6&&field.p.ready);
    assert(await page.evaluate(()=>field.p.d.mega&&field.megaUsed&&S.owned[MEGA_X]===1));
    assert(await page.locator('[data-mega]').isDisabled());
    await page.evaluate(()=>{exClose();S.team=[6,25,9];startFight(1)});
    await page.locator('[data-turn-mega]').click();
    assert(await page.evaluate(()=>battle.player[0].mega&&battle.megaUsed&&battle.turn===1&&S.owned[MEGA_X]===1));
    assert(await page.locator('[data-turn-mega]').isDisabled());
    const encodeClip=(frames,output)=>{
     const encode=require('child_process').spawnSync('ffmpeg',
      ['-v','error','-y','-f','image2pipe','-framerate','20','-vcodec','mjpeg','-i','pipe:0',
       '-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',output],
      {input:Buffer.concat(frames)});
     assert.equal(encode.status,0,encode.stderr?.toString());
    };
    if(process.argv.includes('--clip'))encodeClip([clips.claw,clips.wave,clips.dive].flatMap(frames=>[...frames,...Array(8).fill(frames.at(-1))]),'outputs/mega-x-skills.mp4');
    if(process.argv.includes('--evolution-clip'))encodeClip(clips.evolution,'outputs/mega-x-evolution.mp4');
   }
   assert.equal(errors.length,0,errors.join('\n'));
   console.log('PASS',width,after);await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
