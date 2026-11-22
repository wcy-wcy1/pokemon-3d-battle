from pathlib import Path
import struct,json,io
from PIL import Image,ImageFilter
import numpy as np
def atlas(id,idx):
 b=Path(f'work/rtassets/{id}.glb').read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);t=d['textures'][d['materials'][idx]['pbrMetallicRoughness']['baseColorTexture']['index']];j=t['extensions']['EXT_texture_webp']['source'];v=d['bufferViews'][d['images'][j]['bufferView']];a=n+28+v.get('byteOffset',0);return Image.open(io.BytesIO(b[a:a+v['byteLength']])).convert('RGB')
im=atlas(9,1).resize((768,768),Image.Resampling.BICUBIC);r,g,b=np.moveaxis(np.array(im,dtype=float),-1,0);mask=(r-b>21)&(r>72)&(g>b+9)
# Distance from the painted sutures, retaining each shield's authored perimeter.
dist=np.where(mask,100.,0.)
for i in range(70):
 d=np.pad(dist,1,mode='edge')
 dist=np.minimum.reduce([dist,d[1:-1,:-2]+1,d[1:-1,2:]+1,d[:-2,1:-1]+1,d[2:,1:-1]+1,d[2:,2:]+1.414,d[:-2,:-2]+1.414,d[2:,:-2]+1.414,d[:-2,2:]+1.414])
y,x=np.indices(r.shape);rng=np.random.default_rng(259)
def noise(n,shape):
 return np.asarray(Image.fromarray(rng.integers(0,255,(n,n),np.uint8)).resize(shape,Image.Resampling.BICUBIC))/255
cloud=noise(19,im.size);grain=noise(165,im.size);phase=dist*.49+cloud*2.4+grain*.35
ring=(.5+.5*np.cos(phase))**6;seam=np.clip(dist/4,0,1);height=(.25+.51*seam-.15*ring+.10*grain);pigment=.40+.17*cloud+.12*grain+.10*seam-.17*ring
Image.fromarray(np.uint8(np.stack([height,pigment,mask.astype(float)],axis=2).clip(0,1)*255)).save('work/real/scutes9.webp',quality=96)
# A subdued amber iris around the pupil; preserve the authored lids and glints.
im=atlas(25,4).resize((256,1024),Image.Resampling.BICUBIC);arr=np.array(im,dtype=float);y,x=np.indices(arr.shape[:2]);l=arr.mean(2)
for k,side in ((0,0),(0,1),(1,0),(1,1)):
 zone=(x//128==side)&(y>=k*256)&(y<(k+1)*256)&(l<103)&(abs(arr[:,:,0]-arr[:,:,2])<120)
 yy,xx=np.where(zone)
 if not len(xx):continue
 cx=(xx.min()+xx.max())/2;cy=(yy.min()+yy.max())/2;dx=(x-cx)/max(1,.48*np.ptp(xx));dy=(y-cy)/max(1,.48*np.ptp(xx));rad=np.hypot(dx,dy);ang=np.arctan2(dy,dx);iris=np.clip((rad-.44)*8,0,1)*np.clip((1-rad)*10,0,1)*zone
 iris*=.7+.16*np.sin(ang*65+rad*8)+.10*np.sin(ang*103-rad*6)
 arr+=iris[:,:,None]*np.array([62,41,18])[None,None,:]
Image.fromarray(arr.clip(0,255).astype(np.uint8)).save('work/real/iris25.webp',quality=96)

for idx in (1,2):
 im=atlas(25,idx).resize((384,768),Image.Resampling.BICUBIC);arr=np.array(im,dtype=float);r,g,b=np.moveaxis(arr,-1,0)
 red=(r>105)&(g<100)&(b<126);y,x=np.indices(red.shape)
 for side in (0,1):
  region=(x//192==side)&(y<192);yy,xx=np.where(red&region)
  if not len(xx):continue
  cx=(xx.max()+xx.min())/2;cy=(yy.max()+yy.min())/2
  dx=(x-cx)/(.50*np.ptp(xx));dy=(y-cy)/(.50*np.ptp(yy));rad=np.hypot(dx,dy)
  fur=noise(140,im.size);cloud=noise(24,im.size)
  alpha=np.clip((1.09-rad+.09*(cloud-.5)+.08*(fur-.5))/.35,0,1);alpha=alpha*alpha*(3-2*alpha)
  base=np.array([254,211,7]);warm=np.array([166,55,37])+((cloud-.5)*24+(fur-.5)*30+dy*6)[:,:,None]
  arr[region]=(base[None,None,:]*(1-alpha[:,:,None])+warm*alpha[:,:,None])[region]
 Image.fromarray(arr.clip(0,255).astype(np.uint8)).save(f'work/real/cheeks25_{idx}.webp',quality=95)
