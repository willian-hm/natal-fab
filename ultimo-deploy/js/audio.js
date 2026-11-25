/* Música original e efeitos sintetizados localmente; nenhum arquivo de áudio externo. */
window.GameAudio=(()=>{
  let context,master,musicBus,fxBus,timer,enabled=false,mode='explore',step=0,next=0,lastVoice=0,lastTap=-1;
  let settings={music:.28,effects:.55};
  const profiles={claudionei:[148,'sine'],fabricio:[120,'triangle'],tiago:[155,'square'],heineck:[98,'triangle'],pinheiro:[108,'sine'],aresi:[140,'triangle'],diego:[168,'sine'],wanderson:[132,'triangle'],willian:[185,'triangle'],rosangela:[285,'sine'],leila:[245,'triangle']};
  const melodies={explore:[72,76,79,76,74,71,67,null,69,72,76,79,77,74,72,null],terminal:[57,null,64,69,60,null,67,71,57,null,64,69,62,67,64,null],victory:[72,76,79,84,83,79,77,74,76,79,84,88,86,84,79,null]};
  const frequency=n=>440*2**((n-69)/12);
  function tone(hz,when,duration,volume=.1,type='sine',bus=fxBus){
    if(!context||!enabled||document.hidden)return;
    const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.value=hz;
    gain.gain.setValueAtTime(0,when);gain.gain.linearRampToValueAtTime(volume,when+.008);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    osc.connect(gain);gain.connect(bus);osc.start(when);osc.stop(when+duration+.02);
  }
  function schedule(){
    if(!context||context.state!=='running'||!enabled||document.hidden)return;
    const notes=melodies[mode]||melodies.explore,beat=mode==='terminal'?.36:.31;
    if(next<context.currentTime)next=context.currentTime+.05;
    while(next<context.currentTime+.3){const n=notes[step%notes.length];
      if(settings.music>0){if(n!==null){tone(frequency(n),next,.55,.10,'sine',musicBus);tone(frequency(n+12),next,.24,.023,'sine',musicBus);}
        if(step%4===0)tone(frequency((mode==='terminal'?45:48)+(Math.floor(step/8)%2?5:0)),next,.9,.09,'triangle',musicBus);}
      step++;next+=beat;
    }
  }
  async function unlock(){
    try{if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();musicBus=context.createGain();fxBus=context.createGain();master.gain.value=.65;musicBus.connect(master);fxBus.connect(master);master.connect(context.destination);apply();timer=setInterval(schedule,100);}
      if(enabled&&!document.hidden&&context.state==='suspended'){await context.resume();next=context.currentTime+.04;}}
    catch{/* O jogo continua normalmente se o navegador não disponibilizar áudio. */}
  }
  function apply(){if(!context)return;master.gain.setTargetAtTime(enabled?.65:0,context.currentTime,.08);musicBus.gain.setTargetAtTime(settings.music,context.currentTime,.08);fxBus.gain.setTargetAtTime(settings.effects,context.currentTime,.03);}
  function configure(muted,values={}){enabled=!muted;if(muted)silenceSpeech();settings={music:Number.isFinite(values.music)?Math.max(0,Math.min(1,values.music)):.28,effects:Number.isFinite(values.effects)?Math.max(0,Math.min(1,values.effects)):.55};apply();if(enabled&&context?.state==='suspended'&&!document.hidden)void unlock();}
  function play(type='tap'){
    if(!context||!enabled||settings.effects===0)return;const t=context.currentTime;if(type==='tap'){if(t-lastTap<.045)return;lastTap=t;}
    if(type==='success'){[523,659,784].forEach((f,i)=>tone(f,t+i*.07,.18,.14,'sine'));}
    else if(type==='error'){tone(175,t,.15,.12,'triangle');tone(130,t+.1,.2,.10,'triangle');}
    else if(type==='drop'){tone(350,t,.09,.1,'triangle');tone(520,t+.035,.08,.08,'sine');}
    else {tone(650,t,.045,.10,'sine');tone(900,t+.025,.035,.045,'sine');}
  }
  function voice(actor,textIndex=0){
    if(!context||!enabled||settings.effects===0||context.currentTime-lastVoice<.06)return;
    lastVoice=context.currentTime;const [pitch,type]=profiles[actor]||[170,'triangle'];
    const f=pitch*(1+((textIndex%5)-2)*.045);tone(f,lastVoice,.065,.24,type);tone(f*2,lastVoice,.045,.045,'sine');
  }
  function hoho(){
    if(!context||!enabled||settings.effects===0)return;
    const synth=window.speechSynthesis,Voice=window.SpeechSynthesisUtterance;
    const voice=synth?.getVoices().find(v=>v.localService&&/^pt/i.test(v.lang));
    if(voice&&Voice){const utterance=new Voice('Ho! Ho! Ho!');utterance.voice=voice;utterance.lang=voice.lang;utterance.pitch=.55;utterance.rate=.7;utterance.volume=settings.effects;synth.speak(utterance);return;}
    const t=context.currentTime;for(let i=0;i<3;i++){tone(92-i*5,t+i*.45,.33,.34,'triangle');tone(470,t+i*.45,.24,.07,'sine');tone(780,t+i*.45,.2,.025,'sine');}
  }
  function silenceSpeech(){window.speechSynthesis?.cancel();}
  function setMode(value){if(mode===value)return;mode=value;step=0;if(context)next=context.currentTime+.05;}
  document.addEventListener('pointerdown',()=>void unlock(),{passive:true});
  document.addEventListener('keydown',()=>void unlock());
  document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#next-line'))play('tap');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){context?.suspend();silenceSpeech();}else if(enabled)void unlock();});
  window.addEventListener('pagehide',()=>{clearInterval(timer);context?.suspend();});
  window.addEventListener('pageshow',e=>{if(e.persisted){clearInterval(timer);timer=setInterval(schedule,100);if(enabled)void unlock();}});
  return {configure,unlock,play,voice,setMode,hoho,silenceSpeech};
})();
