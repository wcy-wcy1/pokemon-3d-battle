from pathlib import Path
def swap(file,pairs):
 p=Path('work')/file;s=p.read_text(encoding='utf8')
 for a,b in pairs:
  assert a in s,a
  s=s.replace(a,b)
 p.write_text(s,encoding='utf8')
swap('duo.js',[('dir=exDir(u.pos,aim),rel=t.pos.clone().sub(src);rel.y=0;', 'shot=aimRay(f,src,t,aim,17),dir=shot.dir,rel=bodyPoint(f,t).sub(src);'),('range=limitRay(f,src,dir,17)','range=shot.range'),('dst(src,aim))));end.y=groundY(end.x,end.z,f.z)+(hit?(t.height||2)*.54:.42);','src.distanceTo(shot.end))));')])
swap('hydro.js',[('d=exDir(p,aim),rel=tar.pos.clone().sub(p);rel.y=0;', 'shot=aimRay(f,p,tar,aim,15),d=shot.dir,rel=bodyPoint(f,tar).sub(p);'),('max=limitRay(f,p,d,15)','max=shot.range'),('dst(p,aim)),Math.max','p.distanceTo(shot.end)),Math.max'),('end.y=groundY(end.x,end.z,f.z)+(at?(tar.height||2)*.48:max<dst(p,aim)-.1?.65:.11);',''),('j.land=end.clone();','if(end.y-groundY(end.x,end.z,f.z)<.45||(at&&(tar.air||0)<.2))j.land=end.clone();')])
swap('watch.js',[('空格跳跃</span>','空格跳跃／飞行时切换高度</span>')])
