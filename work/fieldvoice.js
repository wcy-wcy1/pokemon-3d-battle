// Original field voices. The same syllable envelopes drive sound, jaw and beak.
function wildVoice(d){
 const group=[12,16,18,144,145,146].includes(d.id)?'chirp':[92,94,63,65,150,151].includes(d.id)?'hollow':[7,9,1,3,54,79,80,129,130,131].includes(d.id)?'croak':[74,76,95,143,384,6,149].includes(d.id)?'rumble':d.kg<15?'squeak':'growl';
 const pitch={chirp:1270,hollow:390,croak:196,rumble:135,squeak:780,growl:220}[group]*cap((32/d.kg)**.16,.60,1.55)*(.91+.025*(d.id%8));
 const count=group==='rumble'?1:group==='chirp'?3:2,syllable=group==='chirp'?.12:group==='rumble'?.53:.20+(d.id%4)*.017,gap=.045+(d.id%5)*.011;
 return {group,pitch,count,syllable,gap,length:count*syllable+(count-1)*gap}
}
function voiceGate(v,t){
 if(t<0||t>=v.length)return 0;
 let q=(t%(v.syllable+v.gap))/v.syllable;return q<1?Math.sin(Math.PI*q)**.82:0
}
function wildSamples(d,v,answer){
 const hz=22050,b=new Float32Array(Math.ceil(hz*v.length)),R=seeded(d.id+31);let phase=0,grain=0;
 const trill=v.group==='chirp',deep=['croak','growl','rumble'].includes(v.group);
 for(let i=0;i<b.length;i++){const t=i/hz,span=v.syllable+v.gap,j=Math.floor(t/span),x=Math.min(1,(t-j*span)/v.syllable),env=voiceGate(v,t);
  let bend=trill?1.25-.70*x+.18*Math.sin(x*Math.PI):deep?.86+.32*Math.sin(x*Math.PI)-.14*x:1+.23*Math.sin(1.7*Math.PI*x);
  phase+=Math.PI*2*v.pitch*bend*(answer?.90:1)*(1+.06*j+.02*Math.sin(t*(31+d.id%16)))/hz;
  grain=.74*grain+.26*(2*R()-1);let wave=Math.sin(phase)+.28*Math.sin(2*phase+.2)+.1*Math.sin(3*phase);
  if(deep)wave=(wave+.30*Math.sin(4*phase)+.16*Math.sin(6*phase))*(.72+.28*Math.sin(t*(v.group==='croak'?121:72)))+.31*grain;
  if(v.group==='hollow')wave=.78*Math.sin(phase+.64*Math.sin(phase*1.49))+.27*Math.sin(phase*.51);
  b[i]=.49*env*wave
 }return b
}
function hushCalls(f){
 const c=f?.watch?.calls;if(!c)return;
 for(const node of c.sources){try{node.stop()}catch{}}c.sources.clear();c.reply=null;
 for(const u of [f.p,f.e])if(u){u.callBeat=null;u.heard=null}
}
function fieldCall(f,u,answer){
 const w=f.watch,c=w.calls,v=wildVoice(u.d);u.callBeat={start:f.t,v,answer};
 if(!S.sound||!ctx||ctx.state!=='running')return;
 let key=u.d.id+':'+answer,buf=c.buffers.get(key);
 if(!buf){const data=wildSamples(u.d,v,answer);buf=ctx.createBuffer(1,data.length,22050);buf.copyToChannel(data,0);if(c.buffers.size>=8)c.buffers.delete(c.buffers.keys().next().value);c.buffers.set(key,buf)}
 let src=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner?.bind(ctx);src.buffer=buf;
 f.cam.updateMatrixWorld();let at=bodyPoint(f,u).applyMatrix4(f.cam.matrixWorldInverse);
 gain.gain.value=.26/(1+.085*at.length());src.connect(gain);
 let stereo=pan?pan():null;if(stereo){stereo.pan.value=cap(at.x/Math.max(.4,Math.hypot(at.x,at.z)),-1,1);gain.connect(stereo).connect(ctx.destination)}else gain.connect(ctx.destination);
 c.sources.add(src);src.onended=()=>{c.sources.delete(src);src.disconnect();gain.disconnect();stereo?.disconnect()};src.start()
}
function listenField(f){
 const w=f.watch,c=w.calls??={next:f.t+2.2,turn:0,sources:new Set,buffers:new Map,reply:null},n=w.near;
 if(!n||w.neighbours===false||!f.e.ready||w.fruit||w.life.memory.alarm>.30||w.life.state==='retreat'||n.state==='yield'){
  if(c.reply||c.sources.size||f.p.callBeat||f.e.callBeat)hushCalls(f);c.next=Math.max(c.next,f.t+1.2);return
 }
 const distant=bodyPoint(f,f.p).distanceTo(bodyPoint(f,f.e)),hearing=(f.wx.power>.55?5.5:9)*(n.seen?1:.72);
 if(c.reply&&f.t>=c.reply.at){let r=c.reply;c.reply=null;if(distant<hearing&&f.t<c.next)fieldCall(f,r.u,true);return}
 if(f.t<c.next)return;
 const first=c.turn++%2?f.p:f.e,other=first===f.p?f.e:f.p;fieldCall(f,first,false);c.next=f.t+6+Math.random()*4;
 if(distant>=hearing)return;
 other.heard={pos:first.pos.clone(),until:f.t+1.65};if(other.lifeRig)other.lifeRig.twitch=f.t;
 if(['notice','together','approach'].includes(n.state))c.reply={u:other,at:f.t+first.callBeat.v.length+.39+.15*(other.d.id%3)}
}
