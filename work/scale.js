const FIELD_UNITS_PER_METER=1.12;
const longBodies={
 10:['Nose','Head','Spine2','Spine1','Hips',...sequence('Tail',3)],
 95:sequence('Bone',15).map((_,i)=>'Bone'+String(i+1).padStart(3,'0')+'_0'+i),
 130:['Head','Neck','Spine5','Spine4','Spine3','Spine2','Spine1','Hips',...sequence('Tail',9)],
 384:['Head','Neck2','Neck1','Spine2','Spine1','Waist','Hips',...sequence('Tail',15)]
};
function sequence(prefix,count){return Array.from({length:count},(_,i)=>prefix+(i+1))}
function modelMeasure(id,mesh,size){
 const names=longBodies[id];if(!names)return size.y;
 const bones=names.map(n=>mesh.getObjectByName(n));if(bones.some(b=>!b))return Math.max(size.x,size.y,size.z);
 const pts=bones.map(b=>b.getWorldPosition(V()));let length=0;
 for(let i=1;i<pts.length;i++)length+=pts[i].distanceTo(pts[i-1]);
 // Include skin beyond the terminal joints; horns and fins do not add their sideways span.
 for(const i of [0,bones.length-1]){
  const axis=pts[i].clone().sub(pts[i===0?1:i-1]).normalize();let extra=0;
  mesh.traverse(m=>{if(!m.isSkinnedMesh)return;const at=m.geometry.attributes,ids=m.skeleton.bones.map(b=>{for(let n=b;n;n=n.parent){if(n===bones[i])return true;if(bones.includes(n))break}return false});
   const v=V();for(let j=0;j<at.position.count;j++){let off=j*4;if(![0,1,2,3].some(k=>ids[at.skinIndex.array[off+k]]&&at.skinWeight.array[off+k]>.25))continue;
    v.fromBufferAttribute(at.position,j);m.boneTransform(j,v);extra=Math.max(extra,v.applyMatrix4(m.matrixWorld).sub(pts[i]).dot(axis))}
  });length+=extra
 }return length
}
