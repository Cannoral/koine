const fs=require('fs'), dir=require('path').join(__dirname,'..','data')+'/';
global.window={};
const out={};
for (const f of fs.readdirSync(dir).filter(x=>x.endsWith('.js'))) {
  const before=new Set(Object.keys(window));
  require(dir+f);
  const v=Object.keys(window).find(k=>!before.has(k));
  const d=window[v];
  out[f.replace('.js','')]={var:v, title:d.title, lessons:d.lessons, count:d.items.length,
    fields:d.fields.map(fl=>({label:fl.label, options:fl.options.map(o=>o.label)}))};
}
fs.writeFileSync(__dirname+'/decks.json', JSON.stringify(out,null,1));
console.log(Object.keys(out).length+' колод выгружено');
