from pathlib import Path
def patch(name, pairs):
 p=Path('work')/name;s=p.read_text(encoding='utf-8-sig')
 for a,b in pairs:
  assert a in s,a
  s=s.replace(a,b)
 p.write_text(s,encoding='utf-8')
patch('field.js',[('downyCoat(u);','downyCoat(u);muzzleWhiskers(u);')])
patch('beats.js',[('speciesAct(f,u);','speciesAct(f,u);animalReflex(f,u);')])
patch('watch.js',[(' <button class="exBtn" onclick="exOpen',' <button class="exBtn" data-orbit>绕到侧后方</button> <button class="exBtn" onclick="exOpen'),("f.on(bar.querySelector('select')","f.on(bar.querySelector('[data-orbit]'),'click',e=>{let w=f.watch;w.rear=!w.rear;e.currentTarget.textContent=w.rear?'回到正面':'绕到侧后方'});f.on(bar.querySelector('select')"),('let az=w.heading','w.orbit=(w.orbit||0)+((w.rear?2.07:0)-(w.orbit||0))*(1-Math.exp(-dt*4));let az=w.orbit+w.heading')])
