function rockVolleyTell(f,a){
 a.volley={next:0,aim:aimPoint(f,a.player?f.e:f.p,a.aim)};a.total=a.wind+.81;a.u.swing=a.total;
}
function volleyHand(f,a,i){
 const u=a.u,side=i%2?'l':'r',b=u.motion?.joints(side+'hand',side+'forearm',side+'arm');
 const base=bodyPoint(f,u);if(b){let pt=b.getWorldPosition(V());if(pt.distanceTo(base)<u.height*.92)return pt}
 return socket(f,u,'hands',i%2?-1:1)
}
function rockVolleyStep(f,a,age){
 const v=a.volley,dt=age-a.wind;
 while(v.next<3&&dt>=v.next*.225){
  const n=v.next++,origin=volleyHand(f,a,n),dir=v.aim.clone().sub(origin).normalize(),speed=9+n*1.8;
  const o=new THREE.Group,spin=new THREE.Group;f.sc.add(o);o.add(spin);o.position.copy(origin);o.quaternion.setFromUnitVectors(V(0,0,1),dir);
  const rock=part(spin,new THREE.DodecahedronGeometry(.22+n*.024),[0x8d7154,0x695747,0x9a8364][n]);rock.scale.set(1.25,.84,1.10);rock.rotation.set(n*.9,.5,n*.43);
  for(let j=0;j<3;j++){let chip=part(spin,new THREE.TetrahedronGeometry(.053),0xc8b291,.095*Math.cos(j*2.4),.11*Math.sin(j*2.4),-.25-.14*j);chip.rotation.z=j}
  f.shots.push({...a,o,spin,v:dir,sp:speed,size:.22,age:0,life:a.r/speed,hit:false,power:a.power*[.28,.32,.40][n]});tone(144-16*n,.09,0,'triangle',.06)
 }
 if(age>=a.total){a.u.cmd=null;a.u.lastClip=null}
}
function volleyPose(f,u,g,rotate,fw,right,up){
 const a=u.cmd;if(!a?.volley)return;
 const t=f.t-a.t,load=cap(t/a.wind,0,1)*(1-cap((t-a.wind)/.18,0,1)),n=g.joints;
 rotate(n('waist','spine1'),right,-.16*load);
 let twist=0;for(let i=0;i<3;i++){const side=i%2?'l':'r',s=i%2?-1:1,local=t-a.wind-i*.225;
  const cock=Math.sin(Math.PI*cap((local+.18)/.18,0,1)),send=Math.sin(Math.PI*cap((local+.015)/.20,0,1));
  rotate(n(side+'arm',side+'shoulder'),up,s*(.42*cock-.63*send));rotate(n(side+'forearm'),right,-.32*cock+.46*send);twist+=s*(.09*cock-.16*send)}
 u.body.rotation.y+=twist
}
