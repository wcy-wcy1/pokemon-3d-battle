from pathlib import Path
import numpy as np
from PIL import Image
rng=np.random.default_rng(46);N=512
y,x=np.indices((N,N))/N
def noise(n):
 a=rng.random((n,n));xf=x*n;yf=y*n;i=xf.astype(int);j=yf.astype(int);u=xf-i;v=yf-j;u=u*u*(3-2*u);v=v*v*(3-2*v)
 return (a[j,i]*(1-u)+a[j,(i+1)%n]*u)*(1-v)+(a[(j+1)%n,i]*(1-u)+a[(j+1)%n,(i+1)%n]*u)*v
def cells(nx,ny):
   X=x*nx+.39*(noise(6)-.5);Y=y*ny+.43*(noise(5)-.5);ix=np.floor(X).astype(int);iy=np.floor(Y).astype(int);r=rng.random((ny,nx,3));p=q=np.full(x.shape,99.);tag=np.zeros(x.shape)
   for a in range(-2,3):
    for b in range(-2,3):
     d=r[(iy+b)%ny,(ix+a)%nx];z=(ix+a+.15+.7*d[:,:,0]-X)**2+(iy+b+.16+.68*d[:,:,1]-Y)**2
     q=np.minimum(q,np.maximum(z,p));tag=np.where(z<p,d[:,:,2],tag);p=np.minimum(z,p)
   return np.sqrt(q)-np.sqrt(p),tag,np.sqrt(p)
for kind,nx,ny in [('scale',18,24),('shell',6,8),('fur',27,9),('rock',13,14),('hide',36,41),('feather',18,7),('metal',13,14)]:
 edge,tag,dist=cells(nx,ny);micro=noise(96)*.55+noise(240)*.45;macro=noise(5)*.55+noise(15)*.30+noise(39)*.15;ridge=1-np.exp(-edge*11);h=.22+.49*ridge+.16*micro+.1*tag;col=.38*tag+.35*macro+.19*ridge+.08*micro
 if kind=='shell':
  h=.23+.40*ridge+.13*np.sin(dist*58+noise(18)*3)*ridge+.16*micro;col=.25*tag+.45*macro+.18*ridge+.12*np.sin(dist*55+noise(12)*4)
 if kind in ('fur','feather'):
  streak=np.sin(2*np.pi*(x*(85 if kind=='fur' else 48)+y*6)+noise(9)*6+noise(31)*2);h=.38+.23*streak+.18*noise(78)+.11*micro;col=.40*macro+.28*(streak*.5+.5)+.19*tag+.13*micro
 if kind=='fur':
  grain=noise(165);tuft=(grain+np.roll(grain,(2,1),(0,1))+np.roll(grain,(4,1),(0,1)))/3;h=.18+.50*tuft+.19*micro+.09*noise(53);col=.72*macro+.20*noise(23)+.08*micro;tag=noise(12)
 if kind=='metal':h=.34+.16*micro+.09*np.sin(y*2*np.pi*135+noise(24)*2)+.17*macro;col=.4*macro+.34*micro+.18*ridge
 rgb=np.stack([h,col,.48*macro+.28*tag+.24*micro],axis=-1);Image.fromarray(np.uint8(np.clip(rgb,0,1)*255)).save(Path('work/real')/('pelt_'+kind+'.webp'),quality=92,method=5)
