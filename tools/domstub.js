// Минимальный DOM-заглушка: ровно то, чем пользуется assets/trainer.js.
class N {
  constructor(tag){ this.tag=tag; this.children=[]; this.attrs={}; this.dataset={};
    this._cls=new Set(); this.handlers={}; this.textContent=''; this.disabled=false; this.style={}; }
  get className(){ return [...this._cls].join(' '); }
  set className(v){ this._cls=new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList(){ const s=this._cls; return {
    add:(...c)=>c.forEach(x=>s.add(x)), remove:(...c)=>c.forEach(x=>s.delete(x)),
    contains:c=>s.has(c), toggle:(c,f)=>{ (f===undefined? !s.has(c): f) ? s.add(c) : s.delete(c); } }; }
  setAttribute(k,v){ this.attrs[k]=v; }
  addEventListener(t,fn){ (this.handlers[t]=this.handlers[t]||[]).push(fn); }
  click(){ (this.handlers.click||[]).forEach(f=>f()); }
  appendChild(c){ this.children.push(c); return c; }
  set innerHTML(html){
    this.children=[];
    // из строки нас интересуют только узлы с data-t="…"
    const re=/data-t="([a-z]+)"/g; let m;
    while((m=re.exec(html))){ const n=new N('div'); n.dataset.t=m[1]; this.children.push(n); }
    this._html=html;
  }
  get innerHTML(){ return this._html||''; }
  _all(out=[]){ this.children.forEach(c=>{ out.push(c); c._all(out); }); return out; }
  querySelector(sel){ return this.querySelectorAll(sel)[0]||null; }
  querySelectorAll(sel){
    const m=sel.match(/^\[data-t="([a-z]+)"\]$/);
    const list=this._all().filter(n => m ? n.dataset.t===m[1] : n._cls.has(sel.slice(1)));
    list.forEach=Array.prototype.forEach.bind(list);
    return list;
  }
}
const registry={};
global.document={ getElementById:id=>registry[id]||(registry[id]=new N('section')),
                  createElement:t=>new N(t), addEventListener:()=>{} };
global.window={ scrollTo:()=>{} };
global.N=N; global.registry=registry;
module.exports={N,registry};
