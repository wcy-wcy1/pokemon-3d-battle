// Per-species choreography: basic technique, signature, anatomy, wind-up, reach.
const choreo=Object.fromEntries(`1 藤梢抽击 vine vine sprout .24 7
3 前足重踏 stomp solar flower .72 18
4 利爪 claw ember mouth .21 12
6 翼爪横扫 claw inferno mouth .49 12
7 卷尾拍击 curlwhip water mouth .25 13
9 龟壳撞击 shellcheck hydro cannons .46 18
10 头撞 bash silk mouth .19 11
12 翅粉 gust silver wings .35 13
16 啄击 peck gust wings .22 11
18 翼击 wing dive wings .39 9
25 铁尾 irontail spark cheeks .28 15
26 铁尾 tail thunder tail .53 17
35 连环拍 palm chime mouth .30 8
37 尾扫 tail vortex tails .33 12
38 狐爪 claw wisps tails .43 14
39 短拍 palm song mouth .39 10
52 猫爪 claw coins hands .22 13
54 啄击 peck ripple mouth .35 12
58 咬住 bite fang jaw .23 4
59 猛扑 pounce rush mane .34 9
63 念力波 mind mind forehead .27 10
65 念力勺 psychic psybeam hands .45 16
66 直拳 punch chop hands .20 3
68 连拳 punch barrage hands .31 4
74 石拳 punch rock hands .39 12
76 滚撞 roll boulders body .50 14
79 尾巴横扫 tail headbutt forehead .38 6
80 重拳 palm clamp shell .25 4
92 鬼雾 wisp tongue mouth .22 6
94 影爪 claw shadow hands .42 15
95 蛇尾横扫 tail rockfall head .55 15
104 骨棒击 chop bone hands .24 13
113 掌推 palm slap hands .19 3
123 镰刀斩 cut fury hands .22 5
129 鱼尾扑打 flop tackle body .16 4
130 尾鞭 tail waterfall mouth .45 8
131 背鳍拍击 bash ice mouth .46 16
197 潜影扑击 pounce dark rings .38 13
133 快扑 pounce quick body .16 8
134 鳍尾横扫 tail muddy mouth .36 13
135 针毛 pin discharge fur .27 9
136 火爪 claw plume mane .38 3.8
143 熊掌 palm bodyslam body .55 5
144 翼刃 wing blizzard wings .48 14
145 电羽 pin rail beak .42 19
146 灼翼 wing burn wings .45 13
149 龙爪 claw dragonrush body .38 10
150 念力光波 psychic psystrike hands .52 16
151 尾尖念波 mind aura hands .32 15
384 龙尾 tail ascent head .57 12`.split('\n').map(l=>{let [id,n,b,k,a,w,r]=l.split(' ');return [id,{n,b,k,a,w:+w,r:+r}]}));
const groupsOf={contact:'shellcheck curlwhip irontail claw stomp tail bash peck pounce wing palm bite punch chop roll cut flop fang rush headbutt clamp slap fury tackle quick bodyslam dive dragonrush ascent barrage',beam:'vine solar inferno water hydro silk spark psybeam tongue ice rail burn',zone:'thunder rock rockfall boulders waterfall blizzard psystrike',pulse:'chime song discharge dark plume',missile:'ember vortex silver gust wisps coins ripple mind psychic wisp pin shadow bone muddy aura'};const family=k=>Object.keys(groupsOf).find(v=>groupsOf[v].split(' ').includes(k))||'missile';
function moveColor(u,k,s){if(u.d.mega)return 0x48bcff;if(k==='solar')return 0xf7ea51;if(k==='dark')return 0x9955ff;if(k==='chime'||k==='song')return 0xff86c9;if(k==='silk')return 0xe3deb8;if(k==='coins')return 0xffc033;if(k==='silver')return 0xc6ebfa;if(k==='muddy')return 0x9d8056;return exColors[u.d.type]||0xffbd84}
function registerRig(u,model){u.poseBones=[];u.lastClip=null;u.clips=model.animations;u.storedMix=u.mixer;model.scene.traverse(n=>{if(!n.isBone||/end|skin|camera|light/i.test(n.name))return;let t=n.name,job=/wing|tsubasa/i.test(t)?'wing':/tail|shippo/i.test(t)?'tail':/feeler|petal|flower|leaf/i.test(t)?'leaf':/ear/i.test(t)?'ear':/jaw|mouth/i.test(t)?'jaw':/head|neck1/i.test(t)?'head':/forearm|^.?arm[_\d]*$|shoulder/i.test(t)?'arm':/thigh|^.?leg[_\d]*$/i.test(t)?'leg':/spine1|waist/i.test(t)?'back':null;if(job)u.poseBones.push({n,job,side:/^(r|right)|_r_/i.test(t)?-1:1,phase:u.poseBones.length*.37,base:n.quaternion.clone()})});u.glow={value:0};if(u.d.id===197){model.scene.traverse(m=>{if(!m.isMesh)return;for(let mat of [].concat(m.material)){mat.onBeforeCompile=s=>{s.uniforms.ringGlow=u.glow;s.fragmentShader='uniform float ringGlow;\n'+s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat ringMask=smoothstep(.08,.33,min(diffuseColor.r,diffuseColor.g)-diffuseColor.b);totalEmissiveRadiance+=vec3(1.,.71,.08)*ringGlow*ringMask;')};mat.needsUpdate=true}})}u.gait=0;u.cmd=null;u.playNative=(tag)=>{if(u.d.id===25)return;let re=tag==='run'?/run(?:$|_|0|1|loop)/i:tag==='walk'?/walk/i:tag==='attack'?/attack|atk|punch|fight_attack|impactrueno/i:/idle|wait|stand/i,a=(tag==='attack'&&u.cmd?u.clips.find(c=>(family(u.cmd.k)!=='contact'?/rangeattack01/i:u.cmd.skill?/[_|]attack02/i:/[_|]attack01/i).test(c.name)):null)||u.clips.find(c=>re.test(c.name))||(tag==='run'?u.clips.find(c=>/walk/i.test(c.name)):null);if(!a||u.lastClip===a&&tag!=='attack')return;u.mixer??=new THREE.AnimationMixer(model.scene);let next=u.mixer.clipAction(a);if(u.currentAnim!==next)u.currentAnim?.fadeOut(.09);next.reset().setLoop(tag==='attack'?THREE.LoopOnce:THREE.LoopRepeat,tag==='attack'?1:Infinity).fadeIn(.08).play();if(tag==='attack')next.setDuration(u.cmd?.total||.56);else next.setEffectiveTimeScale(1);u.currentAnim=next;u.lastClip=a}}
function pose(f,u,dt,walk){let cmd=u.cmd,q=cmd?cap((f.t-cmd.t)/cmd.total,0,1):0,load=cmd?Math.sin(Math.PI*Math.min(1,(f.t-cmd.t)/cmd.wind)*.5)*(1-cap((f.t-cmd.t-cmd.wind)/.16,0,1)):0,hit=cmd?Math.sin(Math.PI*cap((f.t-cmd.t-cmd.wind)/.4,0,1)):0,kind=cmd?.k||'',fam=family(kind),fly=/wings|beak/.test(choreo[u.d.id].a)||[6,149,384,12,150,151,92,94].includes(u.d.id);u.gait=(u.gait||0)+dt*(walk?10:2.2);let gait=Math.sin(u.gait),w=u.motion?0:walk?1:0,duck=/pounce|quick|fang|dark|rush|dive/.test(kind),heavy=/stomp|solar|bodyslam|rockfall/.test(kind);u.body.rotation.y=u.face;u.body.rotation.x=load*(duck?.32:heavy?.16:-.15)-hit*(fam==='contact'?.34:.22);u.body.rotation.z=(kind==='tail'||kind==='cut'?hit*.54:0)+w*gait*.05;let leap=/bodyslam|ascent|dive|pounce|quick|flop|dragonrush/.test(kind)?hit*(heavy?1.65:.78):0;u.body.position.y=.05+(fly?.16+.11*Math.sin(f.t*4):w?.14*Math.abs(gait):.03*Math.sin(f.t*3))+(canFly(u)?0:leap);u.body.scale.set(1,1,1);if(u.glow)u.glow.value=load*2.3+hit*1.7;if(kind==='tail')u.body.rotation.y+=hit*1.05;if(kind==='roll')u.body.rotation.x+=q*6.283;if(kind==='flop')u.body.rotation.z+=hit*.87;if(kind==='dragonrush')u.body.rotation.z+=q*6.283;if(!u.poseBones)return;
// Restore the previous local pose before sampling animation; layer joint offsets without accumulating drift.
for(let b of u.poseBones)b.n.quaternion.copy(b.base);if(!cmd)u.playNative?.((u.motion&&u.drive!=null&&u===f.p?u.drive>.12:walk)?((u.drive||0)>5.4?'run':'walk'):'idle');u.mixer?.update(dt);let rot=new THREE.Euler,delta=new THREE.Quaternion;for(let b of u.poseBones){b.base.copy(b.n.quaternion);let side=b.side,v=Math.sin(u.gait+b.phase*.13),x=0,y=0,z=0;switch(b.job){case 'leg':x=side*v*w*.44+load*.23-hit*.36;break;case 'arm':x=-side*v*w*.34+load*.36-hit*(/punch|palm|barrage|chop|fury/.test(kind)?.85:.29);z=side*hit*.12;break;case 'wing':if(u.motion?.kind==='flyer'||u.motion?.kind==='authored')break;z=side*(Math.sin(f.t*(walk?9:5)+b.phase*.08)*.36+load*.49-hit*.62);break;case 'tail':if(u.d.id===6)break;y=Math.sin(f.t*3+b.phase)*.12+hit*(kind==='tail'?.58:.17);break;case 'leaf':z=Math.sin(f.t*2+b.phase)*.06+side*(load*.21-hit*.25);break;case 'ear':z=side*(.04*Math.sin(f.t*3+b.phase)-load*.27+hit*.14);break;case 'jaw':x=.025*Math.sin(f.t*3)+hit*.38+load*.15;break;case 'head':x=.05*Math.sin(u.gait)-load*.15+hit*.18;break;case 'back':y=.04*gait*w+load*.12-hit*.14;break}b.n.quaternion.multiply(delta.setFromEuler(rot.set(x,y,z)))}}

