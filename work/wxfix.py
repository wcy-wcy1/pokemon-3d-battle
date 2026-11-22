from pathlib import Path
def ed(n,a,b):
 p=Path('work/'+n);s=p.read_text('utf-8-sig');assert a in s,a;p.write_text(s.replace(a,b),encoding='utf8')
ed('action.js','f.slot=i;f.p=n;','old.skillUntil=f.t+f.cd[1];f.cd[1]=Math.max(0,(n.skillUntil||0)-f.t);f.slot=i;f.p=n;')
ed('action.js','f.wave++;u.token++;',"f.wave++;if(['wet','ash'].includes(f.wx.mark?.key))f.wx.mark=null;u.token++;")
ed('weather.js',"||target.hp<=0)return 1;","||target.hp<=0||target.inv>0)return 1;")
ed('field.js',"'进入战场':paused","'进入战场':paused")
ed('field.js',"点击地面瞄准，右键拖动环视，滚轮拉近看树皮；触屏用摇杆与招式键。</p>","点击地面瞄准，右键拖动环视，滚轮拉近；触屏用摇杆与招式键。</p><details class=\"exCredit\"><summary>场景取材</summary>山脊使用 AWS Terrain Tiles 高程数据。近景地貌、植被与极端天气为玩法重建；树木和材质来自 Babylon.js Assets，角色模型来自 Pokémon 3D API。</details>")
ed('prove.cjs','S.team=[9,25,6]','S.team=[7,25,6]')
ed('prove.cjs','for(let i=0;i<86;i++)','f.e.stun=20;f.e.pos.set(0,0,-2);for(let i=0;i<86;i++)')
ed('prove.cjs','for(let i=0;i<65;i++)','for(let i=0;i<3;i++)')
