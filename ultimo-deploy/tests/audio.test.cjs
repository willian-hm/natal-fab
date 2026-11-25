const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function audioRig(){
  const notes=[],gains=[],intervals=[];let resumes=0;
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(v){this.peak=v;},exponentialRampToValueAtTime(){},setTargetAtTime(v){this.value=v;}});
  class Context{
    constructor(){this.currentTime=1;this.state='suspended';this.destination={};rig.context=this;}
    createGain(){const gain={gain:param(),connect(){}};gains.push(gain);return gain;}
    createOscillator(){const note={frequency:param(),type:'sine',connect(){},start(){notes.push(this);},stop(){}};return note;}
    async resume(){resumes++;this.state='running';}
    suspend(){this.state='suspended';}
  }
  const rig={notes,gains,intervals,get resumes(){return resumes;}},document={hidden:false,addEventListener(){}};
  const c={window:{AudioContext:Context,addEventListener(){}},document,setInterval(fn){intervals.push(fn);return 1;},clearInterval(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/audio.js'),'utf8'),c);rig.audio=c.window.GameAudio;rig.document=document;return rig;
}
test('Vozes têm perfis distintos e respeitam mute e volume',async()=>{
  const r=audioRig();r.audio.configure(false);await r.audio.unlock();const pitches=[];
  for(const actor of ['fabricio','tiago','heineck','pinheiro','aresi','diego','wanderson','willian','rosangela','leila']){r.context.currentTime+=.1;const before=r.notes.length;r.audio.voice(actor,2);assert.equal(r.notes.length,before+2);pitches.push(r.notes[before].frequency.value);assert.equal(r.gains.at(-2).gain.peak,.24);}
  assert.equal(new Set(pitches).size,10);assert.ok(Math.min(...pitches.slice(8))>Math.max(...pitches.slice(0,8)));
  const before=r.notes.length;r.audio.configure(true);r.context.currentTime+=1;r.audio.voice('fabricio',2);r.audio.play('success');assert.equal(r.notes.length,before);
  r.audio.configure(false,{music:1,effects:0});r.context.currentTime+=1;r.audio.voice('leila',2);r.audio.play('tap');assert.equal(r.notes.length,before);
});
test('Trilha muda com o cenário, não reinicia a cada tecla e suspende oculta',async()=>{
  const r=audioRig();r.audio.configure(false,{music:.2,effects:.5});await r.audio.unlock();r.intervals[0]();assert.ok(r.notes.length>0);const explore=r.notes[0].frequency.value;
  const before=r.notes.length;r.context.currentTime+=1;await r.audio.unlock();assert.equal(r.resumes,1);r.audio.setMode('terminal');r.intervals[0]();assert.notEqual(r.notes[before].frequency.value,explore);
  r.document.hidden=true;const hiddenCount=r.notes.length;r.context.currentTime+=1;r.intervals[0]();r.audio.play('success');assert.equal(r.notes.length,hiddenCount);
  assert.equal(r.gains[1].gain.value,.2);assert.equal(r.gains[2].gain.value,.5);
});
test('Falas de cutscene sem índice de texto produzem frequências válidas',async()=>{
  const r=audioRig();r.audio.configure(false);await r.audio.unlock();
  r.audio.voice('willian');assert.equal(r.notes.length,2);
  for(const note of r.notes)assert.ok(Number.isFinite(note.frequency.value)&&note.frequency.value>0);
});
