const {chromium}=require(process.env.LOCALAPPDATA+'/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright-core');
const {resolve}=require('path'),{pathToFileURL}=require('url');

(async()=>{
 const browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
 try{
  for(const path of process.argv.slice(2)){
   const page=await browser.newPage({viewport:{width:760,height:438}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',msg=>{if(/shader error|VALIDATE_STATUS|webgl: invalid/i.test(msg.text()))errors.push(msg.text())});
   await page.goto(pathToFileURL(resolve(path)).href);
   await page.evaluate(()=>{Math.random=seeded(12);S.owned[MEGA_X]=1;exOpen(2,[6,25,9]);cancelAnimationFrame(field.frame)});
   await page.waitForFunction(()=>field.p.ready&&field.e.ready);
   await page.locator('.exStart').click();
   const result=await page.evaluate(async()=>{
    const f=field,gl=f.r.getContext(),bytes=new Uint8Array(4),runs=[];
    f.r.setPixelRatio(1);f.blocks=[];f.nextRock=1e4;f.wx.left=1e4;f.e.stun=1e4;f.e.hp=f.e.max=1e4;S.sound=false;
    f.p.air=0;f.p.pos.set(-1.5,0,0);f.e.pos.set(2.0,0,0);
    activateMega(f);
    for(let i=0;i<Math.ceil(megaSequence.swap*60)+2;i++)exSim(f,1/60);
    while(!f.p.ready)await new Promise(resolve=>setTimeout(resolve,10));
    for(let i=0;i<Math.ceil((megaSequence.end-megaSequence.swap+1)*60);i++)exSim(f,1/60);
    const draw=()=>{
     f.updateSight?.();
     if(typeof fieldDraw==='function')fieldDraw(f);else f.r.render(f.sc,f.cam);
     gl.readPixels(19,19,1,1,gl.RGBA,gl.UNSIGNED_BYTE,bytes)
    };
    for(let repetition=0;repetition<3;repetition++){
     f.p.pos.set(-1.5,0,0);f.e.pos.set(2,0,0);f.p.air=2.31;
     f.duelCamera=null;f.p.en=100;f.cd[3]=0;exAct(f,3);
     const series={dive:[],impact:[]};
     for(let i=0;i<127;i++){
      const begin=performance.now();exSim(f,1/60);
      const phase=i>=62&&i<75?'dive':i>=89&&i<110?'impact':null;
      if(phase){
       draw();
       series[phase].push(performance.now()-begin);
      }
     }
     for(let i=0;i<100;i++)exSim(f,1/60);
     if(repetition)runs.push(series);
    }
    const stats=key=>{
     const v=runs.flatMap(run=>run[key]).sort((a,b)=>a-b);
     return {median:+v[Math.floor(v.length*.5)].toFixed(1),p90:+v[Math.floor(v.length*.9)].toFixed(1),samples:v.length}
    };
    return {dive:stats('dive'),impact:stats('impact')};
   });
   if(errors.length)throw Error(errors.join('\n'));
   console.log(path,JSON.stringify(result));
   await page.close();
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
