from PIL import Image,ImageDraw,ImageFont
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',17)
frames=[]
for i in range(24):
 sheet=Image.new('RGB',(724,574),'#19211b');g=ImageDraw.Draw(sheet)
 for j,(id,name) in enumerate([(9,'水箭龟 · 重步'),(59,'风速狗 · 奔跑'),(18,'大比鸟 · 振翅'),(130,'暴鲤龙 · 游动')]):
  x=(j%2)*364;y=(j//2)*289
  sheet.paste(Image.open(f'work/gaitstrip{id}-{i}.jpg'),(x,y+27))
  g.text((x+6,y+2),name,font=font,fill='#f2ead8')
 frames.append(sheet)
frames[0].save('outputs/species-gaits.webp',save_all=True,append_images=frames[1:],duration=58,loop=0,quality=87)
