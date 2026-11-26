const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c={window:{},matchMedia:()=>({matches:false})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/finale.js'),'utf8'),c);
test('Encerramento percorre saída, copa, lua, trenó e foto nessa ordem',()=>{
  const phase=c.window.Finale.phase;
  for(const [time,stage] of [[0,'exit'],[5.99,'exit'],[6,'walk'],[10,'party'],[17,'moon'],[22,'santa'],[27,'photo'],[100,'photo']])assert.equal(phase(time),stage);
});

// Executa os loops reais com relógio controlado; drawImage rejeita sprites inválidos.
function cinemaHarness(reduced=false){
  const callbacks=new Map(),nodes=new Map(),classes=new Set(),events={ho:0,voices:[],stages:new Set()};let clock=1000,next=0;
  const image={canvas:true};
  const ctx=new Proxy({}, {get(target,key){if(key in target)return target[key];return (...args)=>{if(key==='drawImage')assert.equal(args.shift()?.canvas,true,'sprite válido em cada quadro');for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v),'coordenadas finitas');};},set(target,key,value){target[key]=value;return true;}});
  const document={hidden:false,body:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)},append:node=>nodes.set(node.id,node)},createElement(){
    const canvas={canvas:true,getContext:()=>ctx},caption={textContent:''},button={focus(){}};
    return {dataset:{},setAttribute(){},querySelector(sel){return sel==='canvas'?canvas:sel==='#finale-caption'?caption:button;},remove(){nodes.delete(this.id);}};
  }};
  const ids=['fabricio','tiago','heineck','rosangela','pinheiro','aresi','leila','diego','wanderson','willian','claudionei'];
  const sprites=Object.fromEntries(ids.map(id=>[id,Object.fromEntries(['up','down','left','right'].map(dir=>[dir,[image,image,image,image]]))]));
  const context={window:{},document,performance:{now:()=>clock},matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>{callbacks.set(++next,fn);return next;},cancelAnimationFrame:id=>callbacks.delete(id),Engine:{getSprites:()=>sprites,rooms:{factory:{canvas:image}}},Story:{actors:Object.fromEntries(ids.map(id=>[id,{scene:'factory',x:120,y:160,skin:'#dfb08b',color:'#eeeeee'}]))},GameAudio:{setMode(){},silenceSpeech(){},hoho(){events.ho++;},voice(id,index){assert.ok(Number.isFinite(index));events.voices.push(id);}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/finale.js'),'utf8'),context);
  function step(ms=100){clock+=ms;const queue=[...callbacks.values()];callbacks.clear();queue.forEach(fn=>fn(clock));const root=nodes.get('finale-stage');if(root)events.stages.add(root.dataset.stage);}
  function run(seconds){for(let i=0;i<seconds*10;i++)step();}
  return {api:context.window.Finale,document,events,step,run,classes,nodes,callbacks};
}
for(const reduced of [false,true])test('Cutscenes completas, sprites válidos e áudio único; movimento reduzido: '+reduced,()=>{
  const h=cinemaHarness(reduced);let ended=0;
  h.api.intro(()=>ended++);h.step(-1);h.run(8);assert.equal(ended,1);assert.equal(h.api.active,false);
  h.api.play(()=>ended++);h.step(-1);h.run(28);assert.equal(ended,2);assert.equal(h.events.ho,1);
  for(const stage of ['exit','walk','party','moon','santa'])assert.ok(h.events.stages.has(stage),stage);
  h.api.postcredits(()=>ended++);h.step(-1);h.run(13);assert.equal(ended,3);assert.equal(h.events.ho,2);assert.ok(h.events.voices.length>0);assert.ok(h.events.voices.every(id=>id==='willian'));
  assert.equal(h.nodes.size,0);assert.equal(h.callbacks.size,0);assert.equal(h.classes.has('finale-playing'),false);
});
test('Trocar de aba pausa a cena; pular, interromper e rever não deixam animação pendurada',()=>{
  const h=cinemaHarness();let ended=0;
  h.api.postcredits(()=>ended++);h.document.hidden=true;h.run(20);assert.equal(ended,0);assert.equal(h.events.ho,0);
  h.document.hidden=false;h.run(4);assert.match(h.nodes.get('finale-stage').querySelector('#finale-caption').textContent,/SOCORRO/);
  h.nodes.get('finale-stage').querySelector('button').onclick();h.run(20);assert.equal(ended,1);assert.equal(h.callbacks.size,0);
  h.api.play(()=>ended++);h.api.stop();h.run(30);assert.equal(ended,1);
  h.api.postcredits(()=>ended++);h.run(13);assert.equal(ended,2);assert.equal(h.events.ho,1);
});
