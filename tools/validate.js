require('./domstub.js');
const fs=require('fs'), path=require('path').join(__dirname,'..','data')+'/';
require(require('path').join(__dirname,'..','assets','trainer.js'));
const files=fs.readdirSync(path).filter(f=>f.endsWith('.js')).sort();
let bad=0;
for (const f of files) {
  delete require.cache[require.resolve(path+f)];
  const before=new Set(Object.keys(window));
  require(path+f);
  const varName=Object.keys(window).find(k=>!before.has(k)&&k.startsWith('KOINE_DATA'));
  const d=window[varName];
  const err=[];
  if(!d) { console.log('✗',f,'нет глобальной переменной'); bad++; continue; }
  const keys=d.fields.map(x=>x.key);
  if(new Set(keys).size!==keys.length) err.push('дублирующиеся ключи полей');
  d.fields.forEach(fl=>{ const vs=fl.options.map(o=>o.v);
    if(new Set(vs).size!==vs.length) err.push('дубли вариантов в поле '+fl.key); });
  const valid=Object.fromEntries(d.fields.map(fl=>[fl.key,new Set(fl.options.map(o=>o.v))]));
  const seen=new Set();
  d.items.forEach((it,i)=>{
    if(!it.prompt) err.push('item '+i+': нет prompt');
    const k=it.prompt+'|'+(it.note||'');
    if(seen.has(k)) err.push('дубль карточки: '+it.prompt); seen.add(k);
    if(!it.answers||!it.answers.length) err.push(it.prompt+': нет ответов');
    (it.answers||[]).forEach(a=>{
      const ak=Object.keys(a);
      if(ak.length!==keys.length||!keys.every(x=>ak.includes(x))) err.push(it.prompt+': ответ не по полям '+JSON.stringify(a));
      ak.forEach(x=>{ if(!valid[x]||!valid[x].has(a[x])) err.push(it.prompt+': недопустимое значение '+x+'='+a[x]); });
    });
  });
  // прогон движка: 20 вопросов, все отвечены верно
  const el=id=>document.getElementById(id);
  ['intro','quiz','result'].forEach(id=>{ registry[id]=new N('section'); });
  registry['btnStart']=new N('button');
  window.Trainer.start({data:d,total:20});
  el('btnStart').click();
  const q=(r,n)=>r.querySelector('[data-t="'+n+'"]');
  const quiz=el('quiz'), rows=q(quiz,'rows'), dots=q(quiz,'dots'), prompt=q(quiz,'prompt');
  for(let i=0;i<20;i++){
    dots.children[i].click();
    const item=d.items.find(x=>x.prompt===prompt.textContent && (x.note||'')===(q(quiz,'note').textContent||''));
    if(!item){ err.push('вопрос '+i+' не найден в колоде: '+prompt.textContent); break; }
    const a=item.answers[0];
    d.fields.forEach(fl=>rows.querySelectorAll('.choice').find(b=>b.dataset.key===fl.key&&b.dataset.value===a[fl.key]).click());
  }
  const green=dots.children.filter(x=>x._cls.has('ok')).length;
  if(green!==20) err.push('верных ответов зачтено '+green+' из 20');
  const uniq=new Set(d.items.map(i=>i.prompt+'|'+(i.note||''))).size;
  console.log((err.length?'✗ ':'✓ ')+f.padEnd(24)+String(d.items.length).padStart(4)+' карточек, полей: '+keys.length+', уникальных: '+uniq+(err.length?'\n    '+err.slice(0,5).join('\n    '):''));
  if(err.length) bad++;
}
console.log(bad?('\nпроблемных файлов: '+bad):'\nвсе колоды прошли проверку');
