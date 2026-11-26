/* Cartões locais para stories: nenhuma foto é enviada automaticamente. */
window.GameShare=(()=>{
  const publicUrl='https://willian-hm.github.io/natal-fab/';
  const cache=new Map();
  function prepare(kind){
    if(cache.has(kind))return cache.get(kind);
    const task=render(kind).catch(error=>{cache.delete(kind);throw error;});
    cache.set(kind,task);return task;
  }
  async function render(kind){
    const secret=kind==='secret',photo=new Image();
    await new Promise((resolve,reject)=>{photo.onload=resolve;photo.onerror=()=>reject(new Error('Não foi possível carregar a foto.'));photo.src=secret?'assets/secret-sleigh-v3.png':'assets/christmas-party-v2.png';});
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
    const c=canvas.getContext('2d'),gradient=c.createLinearGradient(0,0,1080,1920);
    gradient.addColorStop(0,secret?'#222944':'#244c48');gradient.addColorStop(1,'#101d2d');c.fillStyle=gradient;c.fillRect(0,0,1080,1920);
    for(let i=0;i<65;i++){const x=(i*197+43)%1080,y=(i*317+65)%1920;c.fillStyle=i%3?'#e8d6a938':'#e8d6a973';c.beginPath();c.arc(x,y,i%3+2,0,Math.PI*2);c.fill();}
    c.strokeStyle='#d8bb7455';c.lineWidth=2;c.strokeRect(34,34,1012,1852);
    function text(value,y,size,color='#f8edd5',weight='600'){c.fillStyle=color;c.font=weight+' '+size+'px "Segoe UI", sans-serif';c.textAlign='center';c.fillText(value,540,y,940);}
    text('O ÚLTIMO DEPLOY DO ANO',205,34,'#dbc591');
    text('UMA AVENTURA NA FÁBRICA DE SOFTWARE',255,21,'#b8cbc4','400');
    text(secret?'PÓS-CRÉDITO':'ZEREI!',395,secret?68:106);
    text(secret?'DESBLOQUEADO!':'NATAL SALVO.',466,secret?57:46,'#d6dfa9');
    c.save();c.translate(540,880);c.rotate(-.025);c.shadowColor='#0007';c.shadowBlur=40;c.shadowOffsetY=16;c.fillStyle='#f7ebd3';c.fillRect(-494,-354,988,770);c.shadowColor='transparent';
    const scale=Math.min(940/photo.naturalWidth,636/photo.naturalHeight),w=photo.naturalWidth*scale,h=photo.naturalHeight*scale;
    c.drawImage(photo,-w/2,-330+(636-h)/2,w,h);c.fillStyle='#634b45';c.font='italic 27px Georgia, serif';c.textAlign='center';c.fillText(secret?'“Não devia ter vindo escondido!” — Willian':'O melhor deploy foi chegar juntos até aqui.',0,370,920);c.restore();
    text(secret?'5/5 segredos encontrados':'2.400.000 presentes entregues',1400,39,'#e4d49e');
    text(secret?'Nome limpo. Juízo… fica para o próximo ano.':'E a reputação do estagiário foi salva também.',1460,27,'#c2d3ce','400');
    text('SUA VEZ DE SALVAR O NATAL',1640,30);
    c.fillStyle='#d8e2b8';c.fillRect(90,1680,900,84);text('willian-hm.github.io/natal-fab/',1735,37,'#193c3a');
    text('Jogue grátis no navegador • Boas festas!',1820,24,'#b8cbc4','400');
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Não foi possível preparar a imagem.')),'image/png'));
    return {blob,name:secret?'ultimo-deploy-pos-credito-story.png':'ultimo-deploy-zerei-story.png',title:secret?'Desbloqueei o pós-crédito!':'Zerei O Último Deploy do Ano!',text:secret?'Achei os cinco segredos! Sua vez de salvar o Natal:':'Natal salvo e estagiário inocentado! Jogue também:'};
  }
  return {publicUrl,prepare};
})();
