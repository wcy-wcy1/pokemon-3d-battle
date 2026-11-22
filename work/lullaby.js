// Each sung syllable is a wave emitted from the singer's current position.
function lullabyNote(f,a,i){
 const origin=socket(f,a.u,'mouth'),range=a.r,life=.69,speed=range/life,hz=[392,494,440][i];
 tone(hz,.23,0,'sine',.065);tone(hz*2,.19,.018,'triangle',.017);
 (a.notes??=[]).push({origin,age:0,speed,r:0,range,spent:false});
 flare(f,life,g=>{g.position.copy(origin);for(let j=0;j<2;j++){let m=hoop(g,j?0xbba3f5:0xffbcd5,1,.012);m.rotation.x=Math.PI/2-.07*j}
 for(let j=0;j<5;j++){let stem=part(g,new THREE.CylinderGeometry(.018,.018,.27,6),0xffdbed);let note=part(g,new THREE.SphereGeometry(.09,8,5),0xffbad5);note.scale.set(1,.58,.64);note.userData.a=stem.userData.a=j*1.257+i*.7}},
 (g,t)=>{let rad=.02+t*range;g.children.forEach((m,j)=>{m.material.opacity=(1-t)**1.4*(j<2?.45:.9);if(j<2){m.scale.setScalar(rad*(1-j*.04));return}
 let a=m.userData.a+t*.16;m.position.set(Math.sin(a)*rad+(j%2?-.05:0),t*.39+Math.sin(a+t*4)*.13+(j%2?0:.12),Math.cos(a)*rad)})})
}
function lullabyStep(f,a,u,dt,t){
 const count=Math.min(3,Math.floor(Math.max(0,t)/.28)+1);while((a.notes?.length||0)<count)lullabyNote(f,a,a.notes?.length||0);
 for(let wave of a.notes||[]){if(wave.spent)continue;const old=wave.r;wave.age+=dt;wave.r=Math.min(wave.range,wave.age*wave.speed);
 const ear=bodyPoint(f,u),d=wave.origin.distanceTo(ear),reach=unobscured(f,wave.origin,ear)?wave.range:wave.range*.53;
 if(d<=reach&&d>=old-.34&&d<=wave.r+.34){wave.spent=true;if(u.inv<=0&&u.hp&&!(u.sleepGuard>f.t)){
  a.heard=(a.heard||0)+1;if(a.heard===1){u.drowsy=f.t+.85;exSay(f,u.d.name+'听到了歌声',.65)}
  if(a.heard===2){u.sleepUntil=f.t+(a.skill===3?2.6:1.65);u.sleepGuard=u.sleepUntil+2.4;u.cmd=null;u.swing=0;u.vel.set(0,0,0);stopPower(f,u);u.drowsy=0;exSay(f,u.d.name+'睡着了',1.05);exHUD(f,true)}
 }}if(wave.r>=wave.range)wave.spent=true
 }
}
function lullabyPose(f,u,g,rot,fw,right){
 const a=u.cmd,sl=u.sleepUntil>f.t?Math.min(1,(u.sleepUntil-f.t)*4):0,n=g.joints;
 if(sl){rot(n('head','neck1'),right,.19*sl);rot(n('lear','lear1'),fw,-.13*sl);rot(n('rear','rear1'),fw,.13*sl);return}
 if(a?.k!=='song')return;let t=f.t-a.t-a.wind,breath=cap((f.t-a.t)/a.wind,0,1),beat=t<0?0:Math.sin(Math.PI*cap((t% .28)/.23,0,1))*(t<.81?1:0);
 rot(n('larm'),fw,-.22*breath-.24*beat);rot(n('rarm'),fw,.22*breath+.24*beat);rot(n('hair1'),right,-.11*beat);u.body.rotation.z+=.08*beat*Math.cos(Math.max(0,t)*11);u.body.rotation.x-=.08*beat
}
