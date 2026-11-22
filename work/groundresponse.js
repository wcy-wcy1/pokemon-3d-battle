// Recyclable terrain impressions. All 64 prints/ripples share one draw and game clock.
function groundTrail(f){
 const T=THREE,N=64,g=new T.InstancedBufferGeometry,plane=new T.PlaneGeometry(2,2);
 g.index=plane.index;g.setAttribute('position',plane.attributes.position);g.instanceCount=N;
 const slot=(name,size)=>{let a=new T.InstancedBufferAttribute(new Float32Array(N*size),size);a.setUsage(T.DynamicDrawUsage);g.setAttribute(name,a);return a};
 const loc=slot('markPlace',4),info=slot('markInfo',4),slope=slot('markSlope',2),clock={value:f.t};
 const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,uniforms:{clock},vertexShader:`
 attribute vec4 markPlace,markInfo;attribute vec2 markSlope;uniform float clock;
 varying vec2 p;varying float age,kind,alive,seed;
 void main(){p=position.xy;kind=markInfo.z;age=clamp((clock-markInfo.x)/max(.01,markInfo.y),0.,1.);alive=step(.01,markInfo.y)*(1.-step(1.,age));seed=markInfo.x;
 float sz=markInfo.w*(kind>2.5?(.5+1.9*age):kind>1.5?(1.+.6*age):1.);
 float c=cos(markPlace.w),s=sin(markPlace.w);vec2 d=mat2(c,-s,s,c)*p*sz;
 vec3 v=markPlace.xyz+vec3(d.x,dot(markSlope,d),d.y);gl_Position=projectionMatrix*viewMatrix*vec4(v,1.);}`,fragmentShader:`
 varying vec2 p;varying float age,kind,alive,seed;
 float pad(vec2 off,vec2 size){return 1.-smoothstep(.84,1.,length((p-off)/size));}
 void main(){if(alive<.5)discard;float a;vec3 c;
 if(kind>2.5){float r=length(p);a=(1.-smoothstep(.018,.095,abs(r-.81)))+.48*(1.-smoothstep(.02,.07,abs(r-.48)));c=vec3(.70,.91,.95);}
 else if(kind>1.5){float grain=fract(sin(dot(floor(p*18.),vec2(12.99,78.23))+seed)*4375.);a=(1.-smoothstep(.18,1.,length(p)))*smoothstep(.52,.92,grain);c=vec3(.55,.49,.41);}
 else if(kind>.5){a=pad(vec2(0.,-.10),vec2(.48,.72));c=vec3(.12,.11,.074);}
 else{a=pad(vec2(0.,-.19),vec2(.48,.36));for(int i=0;i<4;i++){float x=float(i)-1.5;a=max(a,pad(vec2(x*.30,.52-.14*abs(x)),vec2(.135,.19)));}c=vec3(.105,.084,.055);}
 a*=alive*(1.-smoothstep(.1,1.,age))*.77;if(a<.018)discard;gl_FragColor=vec4(c,a);
 #include <encodings_fragment>
 }`});
 const mesh=new T.Mesh(g,mat);mesh.frustumCulled=false;mesh.renderOrder=3;f.sc.add(mesh);return f.trail={loc,info,slope,clock,mesh,count:0,N}
}
function touchSound(f,u,kind,force){
 if(!S.sound||!ctx||ctx.state!=='running'||ctx.currentTime<(f.nextFootAudio||0))return;
 let t=ctx.currentTime;f.nextFootAudio=t+.075;const mass=cap(Math.pow(u.d.kg/40,.21),.48,1.85),vol=.027*force/(1+.07*dst(f.p.pos,u.pos));
 let len=kind==='water'?.15:kind==='rock'?.065:.11;
 if(!f.footNoise){let n=Math.ceil(ctx.sampleRate*.17),b=ctx.createBuffer(1,n,ctx.sampleRate),s=b.getChannelData(0);for(let i=0;i<n;i++)s[i]=Math.random()*2-1;f.footNoise=b}
 let source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=f.footNoise;filter.type='bandpass';filter.frequency.value=(kind==='water'?2300:kind==='rock'?1050:560)/mass;filter.Q.value=.76;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(vol*mass,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+len);source.connect(filter).connect(gain).connect(ctx.destination);source.start(t);source.stop(t+len);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};if(mass>.94)tone(83/mass,.075,0,'sine',vol*.4)
}
function placeTrack(f,u,p,force=1){
 const t=f.trail||groundTrail(f),i=t.count++%t.N,h=strideFloor(f,p.x,p.z),water=f.z===1&&channel(p.x,p.z)&&h<(f.water?.position.y??0)+.03;
 const kind=water?'water':f.z===0?'earth':'rock',glyph=water?3:kind==='rock'?2:familyOf(u.d.id)==='fur'?0:1;
 const size=cap(u.d.meters*.17,.095,.48)*(water?1.8:1)*Math.sqrt(force),duration=water?.95:kind==='earth'?6.8:.57;
 t.loc.setXYZW(i,p.x,water?Math.max(h,f.water?.position.y??0)+.055:h+.021,p.z,u.face);t.info.setXYZW(i,f.t,duration,glyph,size);
 t.slope.setXY(i,water?0:(strideFloor(f,p.x+.08,p.z)-h)/.08,water?0:(strideFloor(f,p.x,p.z+.08)-h)/.08);
 t.loc.needsUpdate=t.info.needsUpdate=t.slope.needsUpdate=true;touchSound(f,u,kind,force)
}
function groundResponse(f,u,dt){
 if(!['live','watch'].includes(f.mode)||!dt)return;if(f.trail)f.trail.clock.value=f.t;
 if(canFly(u)||['float','serpent','swimmer'].includes(u.motion?.kind))return;
 let s=u.contacts??={last:u.pos.clone(),air:0,dist:0,side:1,next:0,feet:new Map},d=dst(s.last,u.pos);s.last.copy(u.pos);
 s.air=u.air||0;if(d>2.5){s.dist=0;s.peak=s.air;return}
 if(s.air>.01){s.peak=Math.max(s.peak||0,s.air);s.dist=0;return}const land=(s.peak||0)>.12;s.peak=0;
 if(land){placeTrack(f,u,u.pos,1.8);s.next=f.t+.16;s.dist=0;return}
 s.dist+=d;let actual=u.motion?.soles||[],candidates=[];
 for(let sole of actual){if(sole.end===u.body)continue;sole.end.updateWorldMatrix(true,false);let gap=Infinity,best=V();for(let pt of sole.samples){if(!pt)continue;let v=V().copy(pt).applyMatrix4(sole.end.matrixWorld),a=v.y-strideFloor(f,v.x,v.z);if(a<gap){gap=a;best.copy(v)}}
 let prev=s.feet.get(sole)??false,close=gap<(prev?.11:.052)*Math.min(u.height,2);s.feet.set(sole,close);if(close&&!prev)candidates.push(best)}
 if(d<.0002||f.t<s.next)return;
 let stride=cap(u.d.meters*.56,.32,1.65);if(candidates.length&&s.dist>stride*.28){placeTrack(f,u,candidates[0]);s.dist=0;s.next=f.t+.11}
 else if(s.dist>=stride&&!actual.some(z=>z.end!==u.body)){s.side*=-1;let span=cap(u.height*.11,.07,.48)*s.side;
 let paw=u.d.id===25&&u.boundRig?.legs?.find(l=>!l.hind&&((l.c.name.startsWith('L'))===(s.side>0)))?.c;
 let p=paw?paw.getWorldPosition(V()):u.pos.clone().add(V(Math.cos(u.face)*span,0,-Math.sin(u.face)*span));placeTrack(f,u,p);s.dist=0;s.next=f.t+.12}
}
