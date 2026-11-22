/* Sprites e retratos compartilham as características de cada personagem. */
window.Characters = (() => {
  const ink = '#243035';
  const pixel = (g,x,y,w,h,color) => { g.fillStyle=color;g.fillRect(x,y,w,h); };
  function shade(color,factor) {
    return '#'+color.slice(1).match(/../g).map(v=>Math.min(255,Math.round(parseInt(v,16)*factor)).toString(16).padStart(2,'0')).join('');
  }
  function sprite(actor,dir,frame) {
    const c=document.createElement('canvas');c.width=20;c.height=34;
    const g=c.getContext('2d'),p=(x,y,w,h,color)=>pixel(g,x,y,w,h,color);
    const tall=actor.build==='tall',slim=actor.build==='slim',top=tall?1:slim?3:5;
    const step=frame===1?1:frame===3?-1:0,body=actor.oversized?14:slim?8:10,left=(20-body)/2;
    const side=dir==='left'||dir==='right',back=dir==='up';
    if(dir==='left'){g.translate(20,0);g.scale(-1,1);}
    // Fabrício tem um perfil próprio: uma orelha/olho e cabelo apenas atrás.
    // Reutilizar o rosto frontal deixava uma mecha sobre o nariz ao virar.
    if(actor.bald&&side){
      p(7,26,4,6,'#37444f');p(10,26,4,6,'#45525c');
      p(6+step,31,5,2,'#17252b');p(10-step,31,5,2,'#17252b');
      p(6,top+13,9,13,ink);p(7,top+14,7,10,actor.color);
      p(7,top+14,2,9,shade(actor.color,.8));p(9,top+15,4,2,shade(actor.color,1.12));
      p(9,top+17,4,5,actor.color);p(10+step,top+22,3,3,actor.skin);
      p(8,top+10,5,4,shade(actor.skin,.88));
      p(7,top,6,1,ink);p(5,top+1,10,10,ink);p(6,top+10,9,3,ink);
      p(6,top+2,8,9,actor.skin);p(7,top+1,6,1,actor.skin);
      p(7,top+10,7,2,actor.skin);p(14,top+5,1,6,actor.skin);
      p(15,top+7,1,1,actor.skin);
      p(8,top+2,4,1,shade(actor.skin,1.12));
      if(actor.sideHair){p(5,top+5,3,6,actor.hair);p(6,top+4,2,3,actor.hair);p(5,top+6,1,3,shade(actor.hair,1.25));}
      p(8,top+7,2,3,actor.skin);p(8,top+8,1,1,shade(actor.skin,.78));
      p(13,top+6,1,2,ink);p(13,top+10,2,1,'#966854');
      p(7,top+13,7,2,'#ae6662');p(12,top+15,2,4,'#ae6662');
      return c;
    }
    // Pernas e sapatos: a base permanece igual em todas as alturas.
    p(6,26,8,6,ink);p(6,26,3,5+step,'#37444f');p(11,26,3,5-step,'#45525c');
    p(5,31+step,5,2,'#17252b');p(11,31-step,5,2,'#17252b');
    p(left-1,top+13,body+2,actor.oversized?14:12,ink);
    p(left,top+13,body,actor.oversized?13:11,actor.color);
    p(left+1,top+14,body-2,2,shade(actor.color,1.16));
    p(left,top+23,body,2,shade(actor.color,.74));
    p(left-2,top+15,2,actor.oversized?8:5,actor.color);
    p(left+body,top+15,2,actor.oversized?8:5,actor.color);
    p(left-2,top+(actor.oversized?23:20)+step,2,3,actor.skin);
    p(left+body,top+(actor.oversized?23:20)-step,2,3,actor.skin);
    // Cabeça com contorno e sombra lateral, sem chapéu sobre a calvície.
    p(5,top,10,1,ink);p(3,top+2,14,8,ink);p(4,top+1,12,11,ink);
    p(5,top+1,10,11,actor.skin);p(4,top+3,12,6,actor.skin);
    p(5,top+9,2,2,shade(actor.skin,.82));p(6,top+11,8,1,shade(actor.skin,.8));
    if(actor.bald){
      p(7,top+2,5,1,shade(actor.skin,1.12));p(4,top+6,1,2,shade(actor.skin,.8));
      if(actor.sideHair){p(4,top+4,2,5,actor.hair);p(14,top+4,2,5,actor.hair);p(4,top+4,1,2,shade(actor.hair,1.3));if(back)p(5,top+9,10,2,actor.hair);}
    }
    else {
      p(5,top+1,10,3,actor.hair);p(4,top+3,2,4,actor.hair);p(14,top+3,2,4,actor.hair);
      p(7,top+1,6,1,shade(actor.hair,1.2));
      if(back){p(5,top+3,10,7,actor.hair);p(6,top+10,8,1,actor.hair);}
      if(actor.hairStyle==='short-bob'){p(3,top+4,3,7,actor.hair);p(14,top+4,3,7,actor.hair);p(4,top+11,2,1,actor.hair);}
      if(actor.hairStyle==='short'){p(3,top+3,3,5,actor.hair);p(14,top+3,3,5,actor.hair);}
      if(actor.hairStyle==='curly'){
        p(3,top,14,5,actor.hair);p(2,top+2,3,6,actor.hair);p(15,top+2,3,6,actor.hair);
        for(const [x,y] of [[4,-1],[8,-2],[12,-1],[15,0]]){p(x,top+y,3,3,actor.hair);p(x,top+y,2,1,shade(actor.hair,1.24));}
        p(5,top+4,2,2,shade(actor.hair,.8));p(10,top+3,2,2,shade(actor.hair,1.18));
      }
    }
    if(!back){
      if(side){p(12,top+6,1,2,ink);p(15,top+7,2,2,actor.skin);}
      else{p(6,top+6,2,2,ink);p(12,top+6,2,2,ink);p(9,top+10,2,1,'#966854');}
      if(actor.beard){p(5,top+8,2,3,actor.beard);p(13,top+8,2,3,actor.beard);p(6,top+10,8,2,actor.beard);p(8,top+9,4,1,shade(actor.beard,.8));}
      if(actor.glasses){
        p(5,top+5,4,4,ink);p(11,top+5,4,4,ink);p(9,top+6,2,1,ink);
        p(6,top+6,2,2,'#c4d7cf');p(12,top+6,2,2,'#c4d7cf');p(7,top+7,1,1,ink);p(13,top+7,1,1,ink);
      }
    }
    if(actor.bald){p(left,top+14,body,2,'#ae6662');p(left+body-3,top+16,2,4,'#ae6662');}
    if(actor.badge){p(8,top+13,1,6,'#d1bd7c');p(11,top+13,1,6,'#d1bd7c');p(8,top+18,4,4,'#e1dfc4');p(9,top+19,2,1,'#58756b');}
    return c;
  }
  function portrait(actor,canvas) {
    const c=document.createElement('canvas');c.width=48;c.height=56;const g=c.getContext('2d');
    const p=(x,y,w,h,color)=>pixel(g,x,y,w,h,color),skin=actor.skin,hair=actor.hair;
    p(0,0,48,56,'#d8dfcd');p(0,40,48,16,'#b9c9b7');
    for(let y=3;y<39;y+=6)for(let x=3;x<47;x+=6)p(x,y,1,1,'#c5d0bd');
    const body=actor.build==='slim'?26:actor.oversized?40:34,left=(48-body)/2;
    p(left,41,body,15,ink);p(left+2,42,body-4,14,actor.color);p(left+4,43,body-8,3,shade(actor.color,1.12));
    p(19,33,10,10,shade(skin,.85));p(19,39,10,3,skin);
    p(15,7,18,2,ink);p(11,11,26,22,ink);p(13,9,22,27,ink);p(17,35,14,3,ink);
    p(14,10,20,23,skin);p(12,13,24,17,skin);p(17,32,14,4,skin);
    p(11,21,3,7,skin);p(34,21,3,7,skin);p(14,27,3,5,shade(skin,.85));p(29,30,4,3,shade(skin,.85));
    if(actor.bald){
      p(17,10,13,2,shade(skin,1.12));p(14,13,3,3,shade(skin,1.08));
      if(actor.sideHair){p(11,17,4,11,hair);p(33,17,4,11,hair);p(12,17,2,4,shade(hair,1.3));p(34,17,2,4,shade(hair,1.3));}
    }
    else {
      p(14,8,20,7,hair);p(11,12,5,11,hair);p(32,12,5,11,hair);p(17,8,13,2,shade(hair,1.18));
      if(actor.hairStyle==='short-bob'){p(9,16,5,17,hair);p(34,16,5,17,hair);p(10,31,5,3,hair);p(33,31,5,3,hair);}
      if(actor.hairStyle==='short'){p(10,12,5,12,hair);p(33,12,5,12,hair);}
      if(actor.hairStyle==='curly'){
        p(10,9,28,10,hair);p(8,14,7,10,hair);p(33,14,7,10,hair);
        for(const [x,y] of [[10,8],[15,5],[21,4],[27,5],[33,8],[9,15],[32,16],[17,13],[25,12]]){p(x,y,6,6,hair);p(x+1,y,4,2,shade(hair,1.23));p(x,y+4,2,2,shade(hair,.8));}
      }
    }
    p(16,22,4,2,ink);p(28,22,4,2,ink);p(23,24,2,5,shade(skin,.8));p(21,32,6,1,'#985d4d');
    if(actor.beard){p(14,28,4,6,actor.beard);p(30,28,4,6,actor.beard);p(17,32,14,5,actor.beard);p(20,30,8,2,shade(actor.beard,.85));p(21,33,6,1,'#8a7569');}
    if(actor.glasses){p(13,20,9,7,ink);p(26,20,9,7,ink);p(22,22,4,2,ink);p(15,22,5,3,'#c4d7cf');p(28,22,5,3,'#c4d7cf');p(18,23,2,2,ink);p(29,23,2,2,ink);}
    if(actor.bald){p(left+2,42,body-4,4,'#ae6662');p(29,46,5,10,'#ae6662');}
    if(actor.badge){p(18,42,2,11,'#dbc784');p(28,42,2,11,'#dbc784');p(19,49,10,7,'#ece6cd');p(22,51,4,2,'#5f8071');}
    const out=canvas.getContext('2d');out.imageSmoothingEnabled=false;out.clearRect(0,0,canvas.width,canvas.height);out.drawImage(c,0,0,canvas.width,canvas.height);
  }
  return {sprite,portrait};
})();
