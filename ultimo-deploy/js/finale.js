/* Encerramento autoral em pixel art: saída, caminhada, ceia, lua e fotografia. */
window.Finale=(()=>{
  let root,canvas,g,raf=0,elapsed=0,last=0,finish=()=>{},saidHo=false,active=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cast=['fabricio','tiago','heineck','rosangela','pinheiro','aresi','leila','diego','wanderson','willian','claudionei'];
  const captions={exit:'Fabrício: “Deploy concluído. Agora ninguém trabalha mais hoje.”',walk:'Rosangela: “O bolo tá esperando na copa. E dessa vez fui eu mesmo que fiz!”',party:'Willian: “Natal salvo, nome limpo… e uma fatia bem grande pra mim.”',moon:'Por uma noite, o campus inteiro podia descansar.',santa:'HO! HO! HO!'};
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  const phase=t=>t<6?'exit':t<10?'walk':t<17?'party':t<22?'moon':t<27?'santa':'photo';
  function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);}
  function text(s,x,y,size=12,color='#fff0ce'){g.fillStyle=color;g.font=`${size}px ui-monospace,Consolas,monospace`;g.textAlign='center';g.fillText(s,x,y);}
  function person(id,x,y,dir='down',frame=0,scale=1){const image=Engine.getSprites()[id][dir][frame%4];g.save();g.translate(Math.round(x),Math.round(y));g.scale(scale,scale);rect(-7,-1,14,3,'#21182a44');g.drawImage(image,-10,-33);g.restore();}
  function sky(offset=0){rect(0,0,640,420,'#111c39');for(let i=0;i<65;i++){const x=(i*137+53)%640,y=(i*67+19)%310-offset;rect(x,y,i%4===0?2:1,i%4===0?2:1,i%3?'#c0b9cc':'#f5deb3');}g.fillStyle='#f3e7bb';g.beginPath();g.arc(445,96,43,0,Math.PI*2);g.fill();g.fillStyle='#d9cea8';for(const [x,y,r] of [[428,80,7],[458,102,9],[431,115,4]]){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}}
  function garland(y){for(let x=25;x<620;x+=18){const yy=y+Math.sin(x/85)*8;rect(x,yy,18,2,'#2d5c4b');rect(x+7,yy+3,4,6,['#e9b96e','#ce7773','#b5c795'][Math.floor(x/18)%3]);}}
  function cake(x,y,large=false){const k=large?1.4:1;g.save();g.translate(x,y);g.scale(k,k);g.fillStyle='#c1c5ab';g.beginPath();g.ellipse(0,6,62,10,0,0,Math.PI*2);g.fill();rect(-52,-27,104,32,'#9b594a');rect(-52,-29,104,8,'#f5dec0');for(let i=-48;i<50;i+=14)rect(i,-24,7,9,'#f5dec0');rect(-37,-54,74,26,'#b77a62');rect(-37,-57,74,7,'#fff0d3');rect(-23,-76,46,20,'#d6aa80');rect(-23,-79,46,7,'#fff0d3');for(let i=-15;i<=15;i+=15){rect(i,-91,3,13,'#bf5f65');rect(i,-96,3,5,'#f4cf65');}for(let i=-44;i<48;i+=22){rect(i,-31,6,4,'#ab3f50');rect(i,-33,3,2,'#487952');}text('✦',0,-61,10,'#aa6356');g.restore();}
  function room(){
    rect(0,0,640,420,'#684e4d');rect(22,24,596,285,'#8d6f5c');rect(22,309,596,100,'#504445');
    for(let y=315;y<410;y+=16)for(let x=22;x<618;x+=65)rect(x,y,63,14,(x+y)%3?'#7d6252':'#896d57');
    rect(26,28,588,7,'#bd9875');rect(26,300,588,10,'#ba9270');
    for(const x of [60,454]){rect(x,62,126,119,'#463e4c');rect(x+7,68,112,104,'#20304a');for(let i=0;i<9;i++)rect(x+14+(i*19)%94,76+(i*29)%85,2,2,'#d7d9ce');rect(x+61,68,5,104,'#bdac8b');rect(x+7,119,112,5,'#bdac8b');rect(x-5,60,9,122,'#944f59');rect(x+122,60,9,122,'#944f59');}
    garland(38);text('CEIA DO PLANTÃO',320,78,15);text('24 de dezembro • IFC Videira',320,99,8,'#e1cba3');
    // Árvore, presentes e luzes quentes da copa.
    rect(73,265,11,37,'#78563e');for(let i=0;i<4;i++){const w=28+i*17;rect(79-w/2,169+i*25,w,31,'#355d4b');rect(82-w/2,169+i*25,w-6,5,'#668365');}text('★',79,164,22,'#f4d389');for(let i=0;i<13;i++)rect(79+Math.sin(i*5)*(i+6),186+i*7,4,4,i%2?'#e8bc76':'#c87575');
    rect(50,293,25,20,'#b9696d');rect(60,293,4,20,'#dfc38a');rect(88,298,30,18,'#81977c');rect(100,298,4,18,'#e2c387');
    rect(538,245,54,68,'#82664f');rect(535,240,60,8,'#bc9974');rect(550,220,13,20,'#d5c3a1');rect(569,225,14,15,'#e5d5b7');
  }
  function table(){rect(168,256,310,72,'#563c39');rect(180,313,14,51,'#684a3c');rect(450,313,14,51,'#684a3c');rect(160,239,326,69,'#e8d1af');rect(160,299,326,17,'#a35159');for(let x=164;x<486;x+=22){rect(x,303,11,13,'#d68a83');}rect(294,239,45,61,'#aa5961');cake(318,270,true);}
  function plate(x,y){g.fillStyle='#e8e2c6';g.beginPath();g.ellipse(x,y,12,5,0,0,Math.PI*2);g.fill();rect(x-6,y-8,12,8,'#a7664f');rect(x-6,y-9,12,3,'#f1d9b5');}
  function feast(t=0,photo=false){
    room();
    const positions=photo?[[149,232],[231,220],[409,220],[494,232],[122,312],[519,312],[130,377],[225,380],[320,380],[415,377],[510,377]]:cast.map((_,i)=>{const a=i/cast.length*Math.PI*2;return [320+Math.cos(a)*207,282+Math.sin(a)*86];});
    function drawOne(i){const [x,y]=positions[i],hop=photo||reduced?0:Math.max(0,Math.sin(t*5+i*.9))*9;person(cast[i],x,y-hop,'down',photo?0:Math.floor(t*5)%4,photo?1.8:1.35);if(photo){plate(x+19,y-18);rect(x+10,y-32,9,4,Story.actors[cast[i]].skin||'#dbb289');}}
    positions.forEach((p,i)=>{if(p[1]<270)drawOne(i);});table();positions.forEach((p,i)=>{if(p[1]>=270)drawOne(i);});
    if(!photo){text('♪',126,191+Math.sin(t*2)*3,17,'#e7c68b');text('♫',515,188+Math.cos(t*2)*3,17,'#e7c68b');}
  }
  function walk(t){sky();rect(0,270,640,150,'#20353e');rect(0,344,640,46,'#8b8274');rect(0,347,640,4,'#b0a18b');
    for(const [x,label] of [[15,'FÁBRICA'],[450,'COPA']]){rect(x,180,175,153,'#41554d');rect(x-8,174,191,15,'#6f5c53');rect(x+65,254,40,79,'#d9b87f');for(const xx of [x+15,x+120])rect(xx,216,35,35,'#d1af79');text(label,x+87,207,11);}
    for(let i=0;i<cast.length;i++){const p=clamp((t-6)*.4-i*.075);person(cast[i],-30+p*690,373+(i%2)*14,'right',Math.floor(t*8)%4,1.4);}
  }
  function leave(t){g.drawImage(Engine.rooms.factory.canvas,0,0);for(let i=0;i<cast.length;i++){const p=clamp((t-i*.19)/3.8),start={x:140+(i%5)*75,y:235+Math.floor(i/5)*43};let x,y;if(p<.38){const q=p/.38;x=start.x+(350-start.x)*q;y=start.y+(300-start.y)*q;}else if(p<.7){const q=(p-.38)/.32;x=350-30*q;y=300+70*q;}else{x=320;y=370+(p-.7)/.3*110;}if(p<1)person(cast[i],x,y,p<.38?(start.x<350?'right':'left'):'down',Math.floor(t*8)%4);}}
  function sleighPosition(t){const p=clamp((t-22)/4.5);return {x:740-p*940,y:90+Math.sin(p*Math.PI)*24};}
  function santa(t){const {x,y}=sleighPosition(t);g.save();g.translate(x,y);g.fillStyle='#10142d';
    // Renas, arreios e trenó em silhueta, passando na frente da lua.
    for(let i=0;i<3;i++){const rx=-65-i*50;rect(rx,-6,29,11,'#10142d');rect(rx-8,-14,12,13,'#10142d');rect(rx-9,-24,3,13,'#10142d');rect(rx-15,-26,9,3,'#10142d');rect(rx-15,-31,3,8,'#10142d');for(const leg of [3,20]){rect(rx+leg,4,3,14,'#10142d');rect(rx+leg-5,16,8,3,'#10142d');}}
    rect(-35,9,76,13,'#10142d');rect(25,-7,15,27,'#10142d');rect(-40,23,84,4,'#10142d');rect(-45,19,8,6,'#10142d');g.beginPath();g.arc(5,0,16,0,Math.PI*2);g.fill();g.beginPath();g.arc(2,-20,8,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(-5,-24);g.lineTo(5,-43);g.lineTo(14,-23);g.fill();g.strokeStyle='#10142d';g.lineWidth=2;g.beginPath();g.moveTo(-35,3);g.lineTo(-175,-3);g.stroke();g.restore();}
  function hangingWillian(x,y,t){
    const actor=Story.actors.willian,image=Engine.getSprites().willian.down[0];
    const swing=reduced?0:Math.sin(t*3)*3,kick=reduced?0:Math.sin(t*7)*3;
    g.save();g.translate(Math.round(x),Math.round(y));g.scale(1.6,1.6);
    // Mãos fixas no patim; cotovelos acompanham o corpo, sem braços da pose de caminhada.
    for(const side of [-1,1]){
      g.strokeStyle=actor.skin;g.lineWidth=3;g.lineCap='square';g.beginPath();g.moveTo(side*8,1);g.lineTo(side*10+swing/2,10);g.lineTo(side*6+swing,22);g.stroke();
      rect(side*8-2,-2,4,4,actor.skin);
      rect(side*6+swing-2,19,4,5,actor.color);
    }
    g.translate(swing,0);
    g.drawImage(image,3,0,14,18,-7,3,14,18);
    g.drawImage(image,5,18,10,8,-5,21,10,8);
    // Pernas soltas e desencontradas, em vez de passos sobre uma sombra de chão.
    g.drawImage(image,5,26,5,8,-5-kick/2,29,5,8);
    g.drawImage(image,10,26,5,8,kick/2,29+Math.abs(kick)/2,5,8);
    rect(-1,18,2,3,'#714a42');g.restore();
  }
  function draw(t){g.clearRect(0,0,640,440);const stage=phase(t);if(stage==='exit')leave(t);else if(stage==='walk')walk(t);else if(stage==='party')feast(t);else if(stage==='moon'){const p=reduced?1:smooth((t-17)/5);g.save();g.translate(0,p*440);feast(t);g.restore();g.save();g.translate(0,-440+p*440);sky();g.restore();}else{sky();santa(t);}if(root){root.dataset.stage=stage;root.querySelector('#finale-caption').textContent=captions[stage]||'';}if(stage==='santa'&&!saidHo){saidHo=true;GameAudio.hoho();}}
  function stop(){cancelAnimationFrame(raf);raf=0;active=false;root?.remove();root=null;GameAudio.silenceSpeech();document.body.classList.remove('finale-playing');}
  function complete(){const callback=finish;stop();callback();}
  function play(onFinish){stop();finish=onFinish;elapsed=0;last=performance.now();saidHo=false;active=true;Engine.paused=true;document.body.classList.add('finale-playing');
    root=document.createElement('section');root.id='finale-stage';root.setAttribute('aria-label','Encerramento de Natal');root.innerHTML='<canvas id="finale-canvas" width="640" height="440" aria-label="A equipe sai da Fábrica e celebra na copa, antes da passagem de Papai Noel pela lua."></canvas><p id="finale-caption" role="status"></p><button id="finale-skip">Pular para a foto</button>';document.body.append(root);canvas=root.querySelector('canvas');g=canvas.getContext('2d');g.imageSmoothingEnabled=false;root.querySelector('button').onclick=complete;root.querySelector('button').focus();GameAudio.setMode('victory');
    function frame(now){if(!active)return;const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;if(!document.hidden)elapsed+=dt;if(phase(elapsed)==='photo'){complete();return;}draw(elapsed);raf=requestAnimationFrame(frame);}draw(0);raf=requestAnimationFrame(frame);
  }
  function photo(target){const previous=g;target.width=960;target.height=630;g=target.getContext('2d');g.imageSmoothingEnabled=false;g.save();g.scale(1.5,1.5);feast(0,true);g.restore();g=previous;}
  function vignette(kind,onFinish){
    stop();finish=onFinish;elapsed=0;last=performance.now();active=true;saidHo=false;Engine.paused=true;
    document.body.classList.add('finale-playing');
    const intro=kind==='intro';
    root=document.createElement('section');root.id='finale-stage';root.dataset.stage=kind;
    root.setAttribute('aria-label',intro?'Abertura da Fábrica':'Pós-crédito secreto');
    root.innerHTML=`${intro?'<img class="intro-logo" src="assets/fabrica-logo.png" alt="Fábrica de Software">':''}<canvas id="finale-canvas" width="640" height="440" aria-label="${intro?'Fabrício chega à Fábrica para o último plantão.':'Willian segura o patim do trenó com as duas mãos e balança as pernas sobre o campus.'}"></canvas><p id="finale-caption" role="status"></p><button id="finale-skip">${intro?'Começar o plantão':'Ver a foto secreta'}</button>`;
    document.body.append(root);canvas=root.querySelector('canvas');g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
    root.querySelector('button').onclick=complete;root.querySelector('button').focus();GameAudio.setMode(intro?'explore':'victory');
    function frame(now){
      if(!active)return;const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;if(!document.hidden)elapsed+=dt;
      if(elapsed>(intro?7:12)){complete();return;}
      g.clearRect(0,0,640,440);
      if(intro){
        const z=reduced?1:1+smooth(elapsed/7)*.09;g.save();g.translate(320,220);g.scale(z,z);g.drawImage(Engine.rooms.factory.canvas,-320,-220);g.restore();
        for(const [i,id] of cast.entries())if(Story.actors[id].scene==='factory')person(id,Story.actors[id].x,Story.actors[id].y);
        person('fabricio',320,355-smooth(elapsed/4)*58,'up',elapsed<4?Math.floor(elapsed*7)%4:0);
        root.querySelector('#finale-caption').textContent=elapsed<3?'IFC Videira · 24 de dezembro · 23h04':'Uma fábrica acesa. Um último teste. O bolo podia esperar… só um pouquinho.';
      }else{
        sky();
        // Campus ao longe, abaixo do trenó: a câmera já acompanha a carona clandestina.
        for(let i=0;i<12;i++){const x=i*59-25,y=332+(i%3)*18;rect(x,y,48,48,'#314a58');rect(x-3,y-4,54,7,'#7b6160');for(let j=0;j<4;j++)rect(x+6+j*10,y+9,4,7,'#e3c58c');}
        const sway=reduced?0:Math.sin(elapsed*2)*5;g.save();g.translate(0,sway);santa(23.55);
        const anchor=sleighPosition(23.55);hangingWillian(anchor.x+5,anchor.y+25,elapsed);g.restore();
        const caption=elapsed<3?'Depois dos créditos… alguém resolveu investigar por conta própria.':elapsed<9?'Willian: “SOCORROOO! Não devia ter vindo escondido! Eu só queria ver o trenó!”':'Papai Noel: “HO HO HO!”';
        root.querySelector('#finale-caption').textContent=caption;
        if(elapsed>3&&elapsed<8&&Math.floor(elapsed*8)!==Math.floor((elapsed-dt)*8))GameAudio.voice('willian',Math.floor(elapsed*8));
        if(elapsed>=9&&!saidHo){saidHo=true;GameAudio.hoho();}
      }
      // Barras discretas dão enquadramento às cenas sem esconder os personagens.
      rect(0,0,640,12,'#0c1524');rect(0,420,640,20,'#0c1524');raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
  }
  return {play,stop,photo,phase,intro:done=>vignette('intro',done),postcredits:done=>vignette('postcredits',done),get active(){return active;}};
})();
