/* Canvas 2D: campus herdado, interiores, personagens, câmera e entrada. */
window.Engine = (()=>{
  const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
  const mini=document.querySelector('#minimap'),mg=mini.getContext('2d');
  const keys=new Set(),cam={x:0,y:0,init:false};
  const player={x:309,y:296,dir:'down',frame:0,hbHalfW:5,hbH:7};
  const rooms={},sprites={},roomNames={factory:'Fábrica de Software',server:'Sala de Servidores',library:'Biblioteca'};
  const doors=[{id:'factory',name:'Fábrica de Software',x:1160,y:994},{id:'server',name:'Sala de Servidores',x:795,y:757},{id:'library',name:'Biblioteca',x:1463,y:696}];
  const places=[{id:'factory',name:'Fábrica de Software',desc:'Tiago • Willian (dicas) • SantaLog',x:1160,y:1035},{id:'server',name:'Laboratórios',desc:'Heineck • diagnóstico de rede',x:795,y:790},{id:'library',name:'Biblioteca',desc:'Angelita • Aresi • dados',x:1463,y:720},{id:'copa',name:'Copa / Cantina',desc:'Rosangela • café de emergência',x:1743,y:682},{id:'patio',name:'Pátio acadêmico',desc:'Fábio Pinheiro • validação',x:1107,y:1097},{id:'auditorio',name:'Auditório',desc:'Diego • pinguim.py',x:943,y:670}];
  let scene='factory',paused=true,width=1,height=1,zoom=1,dpr=1,target=null,near=null,time=0,anim=0,handler=()=>{},lastSave=0;
  let cinematic=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const objects={factory:[{id:'santalog',name:'Computador SantaLog',x:270,y:195},{id:'commits',name:'Histórico de commits',x:443,y:195},{id:'board',name:'Quadro de evidências',x:170,y:92},{id:'coffee',name:'Café da resistência',x:101,y:313}],server:[{id:'network',name:'Diagnóstico de rede',x:268,y:200}],library:[{id:'database',name:'Consultar entregas',x:260,y:200}]};
  function px(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);}
  function txt(g,s,x,y,color='#d8dfd3',size=9){g.font=`${size}px ui-monospace,Consolas,monospace`;g.fillStyle=color;g.textAlign='center';g.fillText(s,x,y);}
  function tree(g,x,y,size=1){g.save();g.translate(x,y);g.scale(size,size);px(g,-4,-8,8,12,'#896044');for(let i=0;i<4;i++){const w=17+i*10;px(g,-w/2,-70+i*16,w,22,'#214d41');px(g,-w/2+3,-70+i*16,w-6,5,'#3c7660');}for(let i=0;i<16;i++)px(g,Math.sin(i*5)*((i/16)*23),-64+i*3.7,3,3,['#e9c481','#d87573','#b0d1ab'][i%3]);px(g,-2,-78,4,12,'#f3d38f');px(g,-6,-74,12,4,'#f3d38f');g.restore();}
  function gift(g,x,y,c){px(g,x,y,17,13,c);px(g,x+7,y,3,13,'#e6c68e');px(g,x,y+3,17,2,'#e6c68e');px(g,x+5,y-3,7,3,'#e6c68e');}
  function lamp(g,x,y,r=80){let grad=g.createRadialGradient(x,y,1,x,y,r);grad.addColorStop(0,'#f6c57c28');grad.addColorStop(1,'#f6c57c00');g.fillStyle=grad;g.fillRect(x-r,y-r,r*2,r*2);}
  function desk(g,x,y,label,active=false){px(g,x+4,y+9,104,47,'#08141a80');px(g,x+3,y+36,7,25,'#55483d');px(g,x+91,y+36,7,25,'#55483d');px(g,x,y,104,40,'#9d7656');px(g,x,y,104,4,'#c29970');px(g,x+3,y+35,98,5,'#614f42');px(g,x+31,y-22,43,32,'#0c1b22');px(g,x+34,y-19,37,24,active?'#548e7b':'#344a57');px(g,x+48,y+10,7,6,'#283a3c');px(g,x+40,y+15,25,3,'#26363a');px(g,x+30,y+24,44,9,'#c4c2aa');for(let n=0;n<6;n++)px(g,x+35+n*6,y+26,3,2,'#717e77');px(g,x+9,y+17,8,9,'#ece0c3');px(g,x+17,y+19,3,5,'#ece0c3');px(g,x+9,y+17,8,2,'#563c2c');px(g,x+37,y-14,23,2,'#a3c7b0');px(g,x+37,y-9,16,2,'#a3c7b0');txt(g,label,x+52,y-32,'#c4cfc6',7);px(g,x+40,y+64,26,20,'#314d49');px(g,x+40,y+59,26,9,'#46645b');px(g,x+43,y+82,4,6,'#1d3031');px(g,x+60,y+82,4,6,'#1d3031');}
  function makeRoom(id){const c=document.createElement('canvas');c.width=640;c.height=440;const g=c.getContext('2d');const solids=[{x:40,y:35,w:560,h:36},{x:30,y:35,w:20,h:365},{x:590,y:35,w:20,h:365},{x:40,y:390,w:245,h:20},{x:355,y:390,w:245,h:20}];
    px(g,36,43,570,370,'#050e15');px(g,48,69,544,321,'#766b58');
    for(let y=71;y<390;y+=15)for(let x=48;x<590;x+=49){px(g,x,y,48,14,((x+y)%3===0)?'#776c59':'#6c6455');px(g,x,y+13,48,1,'#524f46');px(g,x+3,y+3,24,1,'#95836a25');}
    px(g,40,26,560,43,'#324d46');px(g,40,27,560,4,'#6a8370');px(g,40,66,560,6,'#1a3432');px(g,40,29,8,370,'#344940');px(g,592,29,8,370,'#344940');px(g,40,390,245,10,'#344940');px(g,355,390,245,10,'#344940');
    for(const x of [277,400]){px(g,x,31,83,29,'#142a39');px(g,x+3,34,77,22,'#253f51');px(g,x+40,31,3,29,'#81958b');px(g,x,45,83,3,'#81958b');px(g,x+10,38,2,2,'#c1d6d3');}
    for(let x=55;x<591;x+=14){px(g,x,30+Math.sin(x/26)*3,11,1,'#24352c');px(g,x,31+Math.sin(x/26)*3,3,4,['#e7bd77','#c67170','#85b5a0'][Math.floor(x/14)%3]);}
    px(g,196,236,250,113,'#40584d');px(g,199,239,244,107,'#6f7060');px(g,204,243,234,99,'#3c554d');for(let y=247;y<340;y+=8)px(g,208,y,226,1,'#4b6359');
    txt(g,id==='factory'?'F Á B R I C A   D E   S O F T W A R E':id==='server'?'S A L A   D E   S E R V I D O R E S':'B I B L I O T E C A',320,373,'#cbc2a4',8);
    px(g,286,390,68,9,'#c0a47d');px(g,290,399,60,8,'#82765e');txt(g,'CAMPUS',320,420,'#b0c1b7',8);
    if(id==='factory'){
      desk(g,218,140,'SANTALOG',true);desk(g,392,140,'COMMITS',true);desk(g,210,300,'TESTES');
      solids.push({x:218,y:126,w:104,h:57},{x:392,y:126,w:104,h:57},{x:210,y:285,w:104,h:56});
      px(g,93,42,133,35,'#bc9c76');px(g,97,45,125,29,'#3e6057');for(let i=0;i<5;i++){px(g,106+i*22,52+(i%2)*7,16,13,['#d3c59f','#cdaaa1','#b7c6aa'][i%3]);}txt(g,'EVIDÊNCIAS',160,40,'#c5d3c7',7);
      px(g,67,281,63,22,'#956e51');px(g,74,259,22,24,'#192d32');px(g,77,262,15,6,'#91bca2');px(g,101,274,9,8,'#e1ceb1');solids.push({x:67,y:268,w:63,h:35});
      px(g,466,344,100,30,'#876f4f');px(g,470,338,92,23,'#b2976a');for(let i=0;i<3;i++)px(g,476+i*28,341,24,17,'#a1865f');solids.push({x:466,y:338,w:100,h:35});
    }else if(id==='server'){
      for(let x=95;x<560;x+=105){px(g,x,85,62,81,'#1a2b35');px(g,x+3,85,56,3,'#526571');for(let y=92;y<157;y+=14){px(g,x+5,y,52,10,'#2b434d');px(g,x+9,y+3,3,3,'#9dce98');px(g,x+17,y+3,3,3,'#eac17b');px(g,x+27,y+3,22,1,'#81919a');}solids.push({x,y:95,w:62,h:71});}desk(g,218,140,'DIAGNÓSTICO',true);
      for(let y=230;y<300;y+=15)px(g,95,y,70,7,'#4b5961');
    }else{
      for(const x of [70,455]){px(g,x,85,110,100,'#755c43');for(let y=93;y<180;y+=28){for(let n=0;n<15;n++)px(g,x+6+n*6,y,5,22-(n%3)*3,['#8b786d','#a39d79','#577c72','#856b82'][n%4]);px(g,x,y+23,110,3,'#b4956a');}solids.push({x,y:85,w:110,h:100});}desk(g,208,140,'ENTREGAS',true);solids.push({x:208,y:125,w:104,h:60});
      px(g,466,297,85,45,'#806e57');px(g,474,305,28,20,'#d4c6a0');px(g,505,305,28,20,'#c5b992');solids.push({x:466,y:297,w:85,h:45});
    }
    tree(g,535,250,.83);gift(g,505,252,'#aa6363');gift(g,540,254,'#8f9b76');gift(g,522,262,'#7e709c');solids.push({x:513,y:212,w:43,h:55});
    for(const [x,y] of [[75,120],[573,316]]){px(g,x-7,y,15,12,'#aa8364');px(g,x-10,y-13,20,16,'#3d7058');px(g,x-6,y-23,12,17,'#57936e');}
    lamp(g,265,150,100);lamp(g,536,213,90);lamp(g,321,45,160);
    return {canvas:c,solids};
  }
  function makeSprites(){
    for(const [id,actor] of Object.entries(Story.actors)){
      sprites[id]={};
      for(const dir of ['up','down','left','right'])sprites[id][dir]=Array.from({length:4},(_,frame)=>Characters.sprite(actor,dir,frame));
    }
  }
  function beginCinematic(kind='incident'){
    cinematic={kind,beat:0,elapsed:0,beatElapsed:0,originalZoom:zoom};
    keys.clear();target=null;
  }
  function cinematicBeat(beat){if(cinematic){cinematic.beat=beat;cinematic.beatElapsed=0;}}
  function endCinematic(){if(!cinematic)return;zoom=cinematic.originalZoom;cinematic=null;cam.init=false;resize();}
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.imageSmoothingEnabled=false;zoom=scene==='campus'?(width<600?1.65:1.9):Math.max(.78,Math.min(width/670,height/445,2.2));if(cinematic)cinematic.originalZoom=zoom;cam.init=false;}
  function free(x,y,id=scene){const solid=id==='campus'?Campus.SOLIDS:rooms[id].solids;return !solid.some(s=>y>s.y&&y-7<s.y+s.h&&x+6>s.x&&x-6<s.x+s.w);}
  function safe(x,y,id=scene){const w=id==='campus'?Campus.W:640,h=id==='campus'?Campus.H:440;x=Campus.clamp(x,58,w-58);y=Campus.clamp(y,85,h-58);if(free(x,y,id))return {x,y};for(let r=8;r<200;r+=8)for(let a=0;a<Math.PI*2;a+=.4){let nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(nx>50&&nx<w-50&&ny>75&&ny<h-35&&free(nx,ny,id))return {x:nx,y:ny};}return id==='campus'?{x:1630,y:700}:{x:320,y:280};}
  function enter(id,pos){scene=id;Object.assign(player,safe(pos?.x??320,pos?.y??355,id));target=null;near=null;keys.clear();resize();document.querySelector('#location-name').innerHTML=(roomNames[id]||'Campus Videira')+'<small>IFC • '+(id==='campus'?'CAMINHOS ILUMINADOS':'24 DE DEZEMBRO')+'</small>';if(window.UI)UI.onMove(scene,player);}
  function getNPCs(){if(window.UI?.state.ending==='complete')return [];return Object.entries(Story.actors).filter(([id,a])=>a.scene===scene).map(([id,a])=>({id,...a,type:'npc'}));}
  function interactables(){if(window.UI?.state.ending==='complete')return [];return [...getNPCs(),...(scene==='campus'?doors.map(d=>({...d,type:'door'})):[...objects[scene].map(o=>({...o,type:'object'})),{id:'exit',name:'Sair para o campus',type:'door',x:320,y:391}])];}
  function proximity(){near=interactables().map(o=>({...o,d:Math.hypot(o.x-player.x,o.y-player.y)})).filter(o=>o.d<49).sort((a,b)=>a.d-b.d)[0]||null;const b=document.querySelector('#interact');b.hidden=paused||!near;if(near)b.querySelector('span').textContent=near.name;}
  function interact(){if(paused||!near)return;target=null;keys.clear();if(near.type==='door'){if(near.id==='exit'){if(UI.state.act===1){UI.toast('Primeiro confira o SantaLog e converse com Tiago.');return;}const d=doors.find(d=>d.id===scene);enter('campus',{x:d.x,y:d.y+25});}else enter(near.id);return;}handler(near.id,near.type);}
  function update(dt){if(!paused){let ix=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),iy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));if(ix||iy)target=null;else if(target){let dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy);if(d<4){target=null;}else{ix=dx/d;iy=dy/d;}}
    const len=Math.hypot(ix,iy);if(len){ix/=len;iy/=len;player.dir=Math.abs(ix)>Math.abs(iy)?(ix>0?'right':'left'):(iy>0?'down':'up');const prev={x:player.x,y:player.y};const speed=keys.has('shift')?235:132;Campus.moveWithCollision(player,ix*speed*dt,iy*speed*dt,scene==='campus'?Campus.SOLIDS:rooms[scene].solids,scene==='campus'?Campus.W:640,scene==='campus'?Campus.H:440);anim+=dt*9;player.frame=Math.floor(anim)%4;if(target&&Math.hypot(player.x-prev.x,player.y-prev.y)<.1)target=null;}else{player.frame=0;anim=0;}
    if(UI.state){UI.state.seconds+=dt;lastSave+=dt;if(lastSave>5){UI.onMove(scene,player);lastSave=0;}}
  }
    if(cinematic){cinematic.elapsed+=dt;cinematic.beatElapsed+=dt;const z=cinematic.originalZoom*(width<600?1.6:1.2);zoom+=(z-zoom)*(reduced?1:1-Math.exp(-2*dt));}
    const w=scene==='campus'?Campus.W:640,h=scene==='campus'?Campus.H:440,vw=width/zoom,vh=height/zoom;
    const focus=cinematic?{x:315,y:230+Math.min(55,100/zoom)}:player;
    const tx=cinematic?focus.x-vw/2:vw>w?(w-vw)/2:Campus.clamp(focus.x-vw/2,0,w-vw),ty=cinematic?focus.y-vh/2:vh>h?(h-vh)/2:Campus.clamp(focus.y-vh/2,0,h-vh);
    if(!cam.init){cam.x=tx;cam.y=ty;cam.init=true;}else{const alpha=1-Math.exp(-9.5*dt);cam.x+=(tx-cam.x)*alpha;cam.y+=(ty-cam.y)*alpha;}proximity();
  }
  function drawPerson(id,x,y,dir='down',frame=0){px(ctx,x-6,y-2,12,4,'#06101666');ctx.drawImage(sprites[id][dir][frame],Math.round(x)-10,Math.round(y)-33);}
  function stagePerson(p){
    if(!cinematic)return p;
    if(p.id==='fabricio')return {...p,x:270,y:220,dir:'up',frame:0};
    if(!['tiago','wanderson','pinheiro'].includes(p.id))return p;
    const destination=p.id==='tiago'?{x:329,y:226}:p.id==='pinheiro'?{x:350,y:270}:{x:375,y:272};
    const progress=reduced?1:Math.min(1,Math.max(0,(cinematic.elapsed-.4)/1.8));
    return {...p,x:p.x+(destination.x-p.x)*progress,y:p.y+(destination.y-p.y)*progress,dir:'left',frame:progress<1?Math.floor(cinematic.elapsed*8)%4:0};
  }
  function visible(x,y,pad=100){return x>cam.x-pad&&x<cam.x+width/zoom+pad&&y>cam.y-pad&&y<cam.y+height/zoom+pad;}
  function drawScene(t){ctx.setTransform(dpr,0,0,dpr,0,0);px(ctx,0,0,width,height,'#0d1a22');ctx.save();ctx.scale(zoom,zoom);ctx.translate(-Math.round(cam.x),-Math.round(cam.y));
    if(scene==='campus'){
      const sx=Math.max(0,Math.floor(cam.x)),sy=Math.max(0,Math.floor(cam.y)),sw=Math.min(Campus.W-sx,Math.ceil(width/zoom)+2),sh=Math.min(Campus.H-sy,Math.ceil(height/zoom)+2);if(sw>0&&sh>0)ctx.drawImage(Campus.bg,sx,sy,sw,sh,sx,sy,sw,sh);
      for(const lk of Campus.LAKES)if(visible(lk.x+lk.w/2,lk.y+lk.h/2,500))ctx.drawImage(lk.frames[Math.floor(t*3.2)&3],lk.x,lk.y);
      for(const d of Campus.DECOR)if(visible(d.x,d.y))ctx.drawImage(d.c,d.x,d.y);
      for(const s of Campus.SPRITES)if(visible(s.x,s.y,Math.max(s.c.width,s.c.height)+30))ctx.drawImage(s.c,s.x,s.y);
      for(const ov of Campus.OVERLAYS)if(visible(ov.x,ov.y))ctx.drawImage(ov.c,ov.x,ov.y);
      px(ctx,cam.x,cam.y,width/zoom,height/zoom,'#0b183b70');
      for(const loc of Campus.LOCATIONS){for(const [x,y] of loc.doors){if(!visible(x,y))continue;lamp(ctx,x,y-18,70);for(let j=-32;j<33;j+=8)px(ctx,x+j,y-45+Math.sin(j/12)*3,3,3,['#e9bd78','#c06c6f','#9bc8ad'][(j+32)/8%3]);}}
      for(const p of places){if(visible(p.x,p.y)){tree(ctx,p.x+47,p.y-20,.62);gift(ctx,p.x+60,p.y-15,'#9b636c');}}
      for(const l of Campus.WORLD_LABELS)if(l.primary&&visible(l.x,l.y,0)){txt(ctx,l.id==='principal'?'PRÉDIO PRINCIPAL • FÁBRICA':l.text.toUpperCase(),l.x,l.y,'#e2d8ba',7);}
    }else ctx.drawImage(rooms[scene].canvas,0,0);
    if(cinematic){
      const bad=cinematic.kind==='incident'&&cinematic.beat>=3,passed=cinematic.kind==='validation'&&cinematic.beat>=2;
      const color=bad?'#cb6669':'#92c9a5';
      px(ctx,252,121,37,24,bad?'#622d3c':'#284e48');
      for(let i=0;i<3;i++){px(ctx,256,125+i*5,3,2,color);px(ctx,262,125+i*5,bad?17:Math.max(0,Math.min(20,Math.floor((cinematic.elapsed-i*.4)*12))),2,color);}
      lamp(ctx,270,145,90);
      if(bad){px(ctx,cam.x,cam.y,width/zoom,height/zoom,'#a12b3922');if(!reduced&&cinematic.beatElapsed<.24)px(ctx,cam.x,cam.y,width/zoom,height/zoom,'#ecbbc62e');}
      if(passed)txt(ctx,'✓',270,113,'#c5e1af',10);
    }
    const guests=cinematic?.kind==='validation'?[{id:'pinheiro',x:350,y:300}]:[];
    const people=[...getNPCs(),...guests,{id:'fabricio',x:player.x,y:player.y}].map(stagePerson).sort((a,b)=>a.y-b.y);for(const p of people){if(!visible(p.x,p.y))continue;drawPerson(p.id,p.x,p.y,p.dir||(p.id==='fabricio'?player.dir:'down'),p.frame??(p.id==='fabricio'?player.frame:0));}
    // Repassa apenas copas/coberturas à frente do jogador, preservando profundidade do mapa.
    if(scene==='campus')for(const s of Campus.SPRITES)if(s.sortY>player.y&&visible(s.x,s.y,90)&&player.x>s.x-15&&player.x<s.x+s.c.width+15)ctx.drawImage(s.c,s.x,s.y);
    if(!cinematic)for(const p of getNPCs())if(visible(p.x,p.y)&&Math.hypot(p.x-player.x,p.y-player.y)<115){const w=p.name.length*4.3+12;px(ctx,p.x-w/2,p.y-49,w,12,'#0a1824dd');txt(ctx,p.name,p.x,p.y-40,'#f1e6d0',7);}
    if(!cinematic)for(const o of interactables().filter(o=>o.type!=='npc'))if(visible(o.x,o.y)){px(ctx,o.x-5,o.y-2,10,3,near?.id===o.id?'#d9c28c':'#a6c6a955');}
    if(target){ctx.strokeStyle='#b2d5b5';ctx.lineWidth=1;ctx.strokeRect(target.x-5,target.y-3,10,6);}
    if(!paused){const objective=Campaign.objective(UI.state),mark=interactables().find(o=>o.id===objective.target);if(mark&&visible(mark.x,mark.y))txt(ctx,'◆',mark.x,mark.y-62,'#edcf8b',10);}
    ctx.restore();
    if(!reduced)for(let i=0;i<(scene==='campus'?48:12);i++){const x=((i*137.3+Math.sin(t*.3+i)*15)%width+width)%width,y=(i*81+t*(8+i%8))%height;px(ctx,x,y,i%3===0?2:1,i%3===0?2:1,scene==='campus'?'#d6e0da70':'#e8d5a71c');}
    const vig=ctx.createRadialGradient(width/2,height/2,height*.15,width/2,height/2,Math.max(width,height)*.7);vig.addColorStop(0,'#09151c00');vig.addColorStop(1,'#09151c99');ctx.fillStyle=vig;ctx.fillRect(0,0,width,height);
    drawMini();
  }
  function drawMini(destination=mini){const g=destination.getContext('2d'),w=destination.width,h=destination.height;g.drawImage(miniBase,0,0,w,h);const sx=w/Campus.W,sy=h/Campus.H;for(const p of places){px(g,p.x*sx-1,p.y*sy-1,3,3,'#e2c17e');}const pos=scene==='campus'?player:doors.find(d=>d.id===scene);g.fillStyle='#bce8b1';g.beginPath();g.arc(pos.x*sx,pos.y*sy,3,0,Math.PI*2);g.fill();if(scene==='campus'){g.strokeStyle='#b3bdcf';g.strokeRect(cam.x*sx,cam.y*sy,width/zoom*sx,height/zoom*sy);}}
  let miniBase;
  function init(callback){Campus.init();for(const id of ['factory','server','library'])rooms[id]=makeRoom(id);makeSprites();for(const a of Object.values(Story.actors))if(a.scene)Object.assign(a,safe(a.x,a.y,a.scene));miniBase=document.createElement('canvas');miniBase.width=320;miniBase.height=210;const g=miniBase.getContext('2d');g.drawImage(Campus.bg,0,0,320,210);for(const lk of Campus.LAKES)g.drawImage(lk.frames[0],lk.x/10,lk.y/10,lk.w/10,lk.h/10);for(const l of Campus.LOCATIONS)for(const r of l.rects)px(g,r[0]/10,r[1]/10,r[2]/10,r[3]/10,'#b6bba0');px(g,0,0,320,210,'#132a4544');handler=callback;resize();let last=performance.now();function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;time=now/1000;update(dt);drawScene(time);requestAnimationFrame(frame);}requestAnimationFrame(frame);}
  window.addEventListener('resize',resize);window.addEventListener('blur',()=>{keys.clear();target=null;if(window.UI?.state.started&&!paused)UI.pause();});
  document.addEventListener('visibilitychange',()=>{keys.clear();target=null;if(document.hidden&&window.UI?.state.started&&!paused)UI.pause();});
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)&&!paused)e.preventDefault();if(paused)return;if(k==='e'&&!e.repeat)interact();else keys.add(k);});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('pointerdown',e=>{if(paused)return;const r=canvas.getBoundingClientRect(),x=cam.x+(e.clientX-r.left)/zoom,y=cam.y+(e.clientY-r.top)/zoom;const hit=interactables().find(o=>Math.hypot(o.x-x,o.y-y)<24&&Math.hypot(o.x-player.x,o.y-player.y)<49);if(hit){near=hit;interact();}else target={x,y};});
  for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));}
  document.querySelector('#interact').onclick=interact;
  return {init,enter,drawMini,places,doors,player,rooms,free,safe,beginCinematic,cinematicBeat,endCinematic,get cinematic(){return cinematic;},get scene(){return scene;},get near(){return near;},get paused(){return paused;},set paused(v){paused=v;keys.clear();target=null;},portrait(id,canvas){Characters.portrait(Story.actors[id||'fabricio'],canvas);},getSprites:()=>sprites};
})();
