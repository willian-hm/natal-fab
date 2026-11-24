/* Interfaces, diálogos e ligação entre campanha e exploração. Sem dependências. */
window.UI = (()=>{
  let state=Campaign.fresh(),saved=null,toastTimer,modal='',lastFocus=null,locked=false,computerSession=null;
  let textTimer=null,advanceDialogue=null,finishCinematic=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $=s=>document.querySelector(s),overlay=$('#overlay'),panel=$('#panel');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(label,id,cls='')=>`<button id="${id}" class="${cls}">${label}</button>`;
  const head=(title,kicker='SANTALOG / PLANTÃO DE NATAL')=>`<div class="panel-top"><span class="eyebrow">${kicker}</span><button id="close-panel" aria-label="Fechar">×</button></div><h1 id="panel-title">${title}</h1>`;
  function sound(type='tap'){GameAudio.play(type);}
  function persist(){Campaign.sync(state);let ok=false;try{ok=Campaign.save(state,localStorage);}catch{}$('#save-status').textContent=ok?'◈ Progresso salvo automaticamente':'◈ Salvamento indisponível neste navegador';hud();}
  function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),4200);}
  function clue(id){if(state.clues.includes(id))return;Campaign.clue(state,id);toast('Nova evidência: '+Story.clues[id].title);sound('success');persist();}
  function hud(){GameAudio.configure(state.muted,state.audio);const obj=Campaign.objective(state);$('#act-number').textContent=String(state.act).padStart(2,'0');$('#act-name').textContent=Story.acts[state.act-1];$('#act-progress').innerHTML=Story.acts.map((_,i)=>`<i class="${i<state.act?'done':''}"></i>`).join('');$('#objective-title').textContent=obj.title;$('#objective-desc').textContent=obj.desc;$('#clue-count').textContent=state.clues.length;$('#clock').textContent=[state.clues.includes('incident')?'23:08':'23:04','23:16','23:29','23:43','23:56'][state.act-1];const recovered=state.ending==='complete';if(recovered)$('#clock').textContent='23:59';$('#delivery-count').textContent=recovered||state.setup>=3?'2.400.000':state.clues.includes('incident')?'0':'2.400.000';$('#delivery-label').textContent=recovered?'livres para encontrar suas chaminés':state.setup>=3?'entregas recuperadas • aguardando deploy':state.clues.includes('incident')?'entregas visíveis em produção':'entregas esperando o último teste';$('#status-pill').textContent=recovered?'RECUPERADO':state.clues.includes('incident')?'INCIDENTE':'AGUARDANDO';$('#status-pill').style.color=recovered?'var(--green)':state.clues.includes('incident')?'var(--red)':'var(--gold)';$('#audio').innerHTML=`♪ <span>Som ${state.muted?'desligado':'ligado'}</span>`;$('#audio').setAttribute('aria-label',state.muted?'Ativar áudio':'Silenciar áudio');$('#audio').title=state.muted?'Ativar música e efeitos':'Silenciar música e efeitos';}
  function show(html,type='',wide=false){
    MiniGames.dispose();clearInterval(textTimer);advanceDialogue=null;
    if(overlay.hidden)lastFocus=document.activeElement;
    modal=type;document.body.dataset.ui=type;Engine.paused=true;overlay.hidden=false;
    overlay.className='overlay'+(type==='menu'?' menu-overlay':['dialogue','talk'].includes(type)?' dialogue-overlay':'');
    const inComputer=computerSession&&['desktop','computer','puzzle','recovery','tests','extras','deploy'].includes(type);
    if(!inComputer&&!['dialogue','talk'].includes(type))computerSession=null;
    GameAudio.setMode(type==='ending'?'victory':computerSession?'terminal':'explore');
    panel.className=inComputer?'wide os-panel':wide?'wide':'';
    panel.innerHTML=inComputer?`<div class="os-top"><span class="os-led"></span><strong>${stations[computerSession].name}</strong><span class="os-user">Fabrício · conectado</span><button id="os-home" aria-label="Área de trabalho">⌂</button><button id="os-exit" aria-label="Sair do computador">×</button></div><div class="os-body">${html}</div><div class="os-taskbar"><span>✦ Campus OS</span><span>${type==='desktop'?'Área de trabalho':stations[computerSession].app}</span><span>24 DEZ · 23h</span></div>`:html;
    panel.scrollTop=0;panel.focus();
    if(locked){$('#os-home')?.setAttribute('disabled','');$('#os-exit')?.setAttribute('disabled','');}$('#os-home')?.addEventListener('click',()=>{if(!locked)desktop(computerSession);});$('#os-exit')?.addEventListener('click',close);
    $('#close-panel')?.addEventListener('click',close);
  }
  function close(){
    if(locked||Finale.active)return;
    if(state.ending==='complete'&&modal!=='menu'){finalPhoto();return;}
    if(finishCinematic){finishCinematic();return;}
    if(modal==='menu')return;
    clearInterval(textTimer);advanceDialogue=null;
    if(!state.started){menu();return;}
    MiniGames.dispose();computerSession=null;GameAudio.setMode('explore');overlay.hidden=true;modal='';document.body.dataset.ui='play';Engine.paused=false;lastFocus?.focus?.();
  }
  function feedback(text,ok=false){const el=$('#feedback');if(el){el.textContent=text;el.className='feedback '+(ok?'success':'error');}sound(ok?'success':'error');}
  function hint(text){state.hints++;persist();feedback(text,true);}
  function dialogue(lines,done=()=>{},title='',options={}){
    const pages=[];
    lines.forEach(([actor,text],step)=>{
      let part='';for(const word of text.split(' ')){if((part+' '+word).length>155&&part){pages.push({actor,text:part,step});part='';}part+=(part?' ':'')+word;}
      if(part)pages.push({actor,text:part,step});
    });
    let index=0;
    function page(){
      const {actor,text,step}=pages[index],a=Story.actors[actor];
      show(`<h1 id="panel-title" class="dialog-name">${a.name}</h1><div class="dialog-content"><canvas class="portrait" id="portrait" width="96" height="112" aria-label="Retrato de ${a.name}"></canvas><div class="dialog-copy"><p class="dialog-text" id="spoken-text" aria-hidden="true"></p><p class="sr-only" aria-live="polite">${esc(text)}</p></div></div><div class="dialog-footer"><span>${options.cinematic?'O último teste da noite':'Conversa'}</span><button id="next-line" aria-label="Continuar conversa"><span class="dialog-key">E / Enter</span><span class="dialog-arrow" aria-hidden="true">▼</span></button></div>`,'dialogue');
      Engine.portrait(actor,$('#portrait'));options.onStep?.(step);
      let written=0;const words=Array.from(text),line=$('#spoken-text');
      function reveal(){clearInterval(textTimer);written=words.length;line.textContent=text;$('#next-line').classList.add('ready');}
      if(reducedMotion)reveal();else textTimer=setInterval(()=>{written=Math.min(words.length,written+2);line.textContent=words.slice(0,written).join('');if(/[\p{L}\p{N}]/u.test(words.slice(Math.max(0,written-2),written).join('')))GameAudio.voice(actor,written);if(written===words.length)reveal();},22);
      advanceDialogue=()=>{
        if(written<words.length){reveal();return;}
        sound();if(++index<pages.length)page();else{clearInterval(textTimer);advanceDialogue=null;if(!options.cinematic)close();done();}
      };
      $('#next-line').onclick=()=>advanceDialogue?.();
      $('.dialog-content').onclick=()=>advanceDialogue?.();
    }
    page();
  }
  function testScene(kind='incident',done=()=>{}){
    const station=computerSession;computerSession=null;const incident=kind==='incident';
    const lines=incident?[
      ['fabricio','Tá. Último teste e a gente vai embora. Pode rodar.'],
      ['tiago','Cadastro certo… estoque certo… Até aqui, tudo verde.'],
      ['wanderson','Falta só conferir a fila de entregas.'],
      ['fabricio','Ué. Zero? Tinha mais de dois milhões aqui agora.'],
      ['tiago','Pera. Não fecha essa tela. O servidor ainda está respondendo.'],
      ['fabricio','Era pra ser só um teste, Tiago.'],
      ['tiago','Eu sei. Vem cá, vamos descobrir o que mudou.']
    ]:[
      ['fabricio','Lote recuperado. Vamos conferir juntos antes de publicar.'],
      ['wanderson','Dois milhões e quatrocentos mil registros. Nenhum repetido.'],
      ['pinheiro','E todos em produção. Agora o teste faz sentido.'],
      ['fabricio','Aí, sim. Falta o deploy. E dessa vez ninguém encosta na estrelinha.']
    ];
    Engine.beginCinematic(kind);document.body.classList.add('cinematic');
    const status=$('#cinema-status');status.hidden=false;
    let finished=false;
    const finish=()=>{
      if(finished)return;finished=true;clearInterval(textTimer);advanceDialogue=null;finishCinematic=null;
      Engine.endCinematic();document.body.classList.remove('cinematic');status.hidden=true;
      $('#skip-scene').hidden=true;
      if(incident)clue('incident');
      close();computerSession=incident?null:station;done();
    };
    finishCinematic=finish;$('#skip-scene').hidden=false;$('#skip-scene').onclick=finish;
    dialogue(lines,finish,'',{
      cinematic:true,
      onStep(step){
        Engine.cinematicBeat(step);
        const failed=incident&&step>=3;
        status.className=failed?'cinema-status failed':'cinema-status';
        status.innerHTML=`<span class="eyebrow">SANTALOG · TESTE FINAL</span><strong>${failed?'0 entregas':step===0?'Conectando…':incident?'Verificando a fila…':'2.400.000 entregas'}</strong><span>${failed?'A fila de produção está vazia.':step===0?'A equipe está acompanhando.':incident?'Cadastro ✓ &nbsp; Estoque ✓':'IDs únicos ✓ &nbsp; Produção ✓'}</span><div class="cinema-meter"><i style="width:${failed||step>=2?100:step===0?15:60}%"></i></div>`;
        if(failed&&step===3)sound('error');else if(step===2&&!incident)sound('success');
      }
    });
  }
  function menu(){Finale.stop();document.body.classList.remove('game-finished');try{saved=Campaign.load(localStorage);}catch{saved=null;}if(!state.started&&saved){state.muted=saved.muted;state.audio=saved.audio;hud();}show(`<img class="menu-logo" src="assets/fabrica-logo.png" alt="Fábrica de Software"><div class="menu-kicker">24 DE DEZEMBRO • 23H04 • IFC VIDEIRA</div><h1 id="panel-title">O último<br><em>deploy</em><br>do ano<span style="color:var(--gold)">.</span></h1><p class="menu-copy">Uma noite tranquila. Um último teste.<br>E o Natal inteiro no ambiente errado.</p><div class="menu-buttons">${button('Jogar · começar o plantão','new-game','primary')}${button('Continuar investigação','continue')}${button('Controles e como jogar','controls','ghost')}</div><div class="menu-foot">AVENTURA • INVESTIGAÇÃO • UM POUCO DE CAFÉ<br><br>Uma comédia fictícia e afetuosa. Nenhum presente real foi perdido.</div>`,'menu');$('#continue').disabled=!saved?.started;$('#new-game').onclick=()=>{if(saved?.started)restart();else start();};$('#continue').onclick=()=>{state=saved;state.started=true;Engine.enter(state.scene,state.position);persist();if(state.ending==='complete'){state.finaleSeen?finalPhoto():ending();return;}overlay.hidden=true;modal='';document.body.dataset.ui='play';Engine.paused=false;toast('Plantão retomado. Confira o painel de missões.');};$('#controls').onclick=controls;}
  function start(){Finale.stop();document.body.classList.remove('game-finished');const {muted,audio}=state;state=Campaign.fresh();state.muted=muted;state.audio=audio;state.started=true;Engine.enter('factory',state.position);persist();overlay.hidden=true;Finale.intro(()=>dialogue([['fabricio','Todo mundo indo pra ceia… e a gente aqui. O SantaLog já está pronto, né?'],['tiago','Só falta conferir as entregas. O computador está ali, do seu lado.'],['fabricio','Beleza. Vamos acabar isso antes que o panetone acabe também.']],()=>toast('Aproxime-se do monitor SantaLog e pressione E.'),'ATO 1 / O DESASTRE'));}
  function restart(){show(`${head('Começar outro plantão?','NOVA PARTIDA')}<p>O progresso salvo desta aventura será substituído. Você pode continuar a investigação atual sem perder nada.</p><div class="buttons">${button('Voltar','cancel-reset')}${button('Reiniciar partida','confirm-reset','danger')}</div>`,'restart');$('#cancel-reset').onclick=()=>state.started?pause():menu();$('#confirm-reset').onclick=start;}
  function controls(){show(`${head('O manual do plantonista','CONTROLES')}<div class="check-list"><div class="choice"><kbd>W A S D</kbd> ou setas: mover pelo campus</div><div class="choice"><kbd>SHIFT</kbd> correr <kbd>E</kbd> interagir quando estiver perto</div><div class="choice"><kbd>ESC</kbd> fechar interfaces / pausar <kbd>M</kbd> mapa <kbd>J</kbd> missões <kbd>Q</kbd> evidências</div></div><p>Clique ou toque no chão para caminhar. Obstáculos interrompem esse movimento: contorne-os com novos cliques ou com o teclado. No celular, use as setas na tela e toque no botão de interação.</p><p>O mapa permite deslocamento rápido após conversar com Tiago. Entre nos prédios pelas portas iluminadas. Consulte as missões sempre que precisar.</p><div class="note">O relógio do plantão acompanha a história. As transmissões binárias têm cronômetro próprio: dá para pausar e repetir uma rodada sem perder as anteriores. O progresso é salvo neste navegador.</div><div class="buttons">${button('Tudo pronto','controls-done','primary')}</div>`,'controls');$('#controls-done').onclick=()=>state.started?close():menu();}
  function pause(){if(Finale.active||locked)return;if(state.ending==='complete'){finalPhoto();return;}if(finishCinematic){finishCinematic();}if(!state.started){menu();return;}persist();show(`${head('Um café antes de continuar?','JOGO PAUSADO')}<p>Ato ${state.act} · ${Story.acts[state.act-1]}<br>${Campaign.objective(state).desc}</p><div class="buttons">${button('Continuar','resume','primary')}${button('Controles','pause-controls')}${button('Música e efeitos','sound-settings')}</div><div class="buttons">${button('Menu inicial','main-menu')}${button('Reiniciar','restart','danger')}</div><p style="font-size:12px">${state.achievements.length?state.achievements.join(' · '):'Seus colegas estão esperando. E o panetone também.'}</p>`,'pause');$('#resume').onclick=close;$('#pause-controls').onclick=controls;$('#sound-settings').onclick=audioSettings;$('#main-menu').onclick=menu;$('#restart').onclick=restart;}
  function willian(){
    if(!state.clues.includes('incident')){
      dialogue([['willian','E aí, professor! Deixei os presentes organizados por região. Os testes passaram certinho.'],['fabricio','Boa, Willian. Vou conferir a distribuição e a gente encerra.'],['willian','Fechou. Se precisar de alguma coisa, estou aqui.']]);return;
    }
    const cleared=state.solved.commits;
    const line=cleared?'Eu falei que tinha feito tudo certinho! Agora posso voltar a ser só o estagiário do café?':'Todo mundo me olhando torto… Sempre sobra pro estagiário. Mas eu fiz tudo certinho, professor!';
    show(`<h1 id="panel-title" class="dialog-name">Willian</h1><div class="dialog-content"><canvas class="portrait" id="portrait" width="96" height="112"></canvas><div class="dialog-copy"><p class="dialog-text">${line}</p></div></div><div class="dialog-choices">${button(cleared?'Conferi seu commit. Você tá limpo.':'Me conta o que você fez.','ask')}${button('Me dá uma dica?','willian-tip')}${button('Já volto.','leave-talk')}</div>`,'talk');
    Engine.portrait('willian',$('#portrait'));
    $('#ask').onclick=()=>dialogue(cleared?[
      ['fabricio','Olhei seu commit e os testes. Você fez tudo certo. Não foi a sua alteração.'],
      ['willian','Aí, sim! Pode colocar isso no grupo? Com meu nome, por favor.'],
      ['fabricio','Pode deixar. Suspeita encerrada, com evidências.'],
      ['willian','Obrigado, professor. Agora bora salvar o Natal. Minha reputação já foi!']
    ]:Story.dialogues.willian,()=>{Campaign.talk(state,'willian');persist();toast(cleared?'Reputação salva. Justiça pelo estagiário!':'Relato do Willian anotado no caderno.');});
    $('#willian-tip').onclick=()=>{
      const obj=Campaign.objective(state);
      const tips={
        claudionei:'O Claudionei está na Fábrica. Ele guardou uma cópia da versão antes de começar a investigação.',
        tiago:'Fala com o Tiago ali do lado. Ele sabe qual versão foi publicada. A gente começa pelo que dá pra conferir.',
        commits:'Confere quais mudanças chegaram de verdade à versão publicada. Rascunho local também aparece no histórico, mas não foi pro servidor.',
        network:'Gira os conectores até ligar todas as pontas. Se tudo responde, pode ser que a conexão esteja certa… mas indo pro lugar errado.',
        database:'Cada posição do binário tem um peso. E, na consulta, pensa no destino que você viu na rede antes de escolher onde procurar.',
        board:'Junta as três coisas: o que o botão faz, quem viu o clique e onde os presentes foram parar.',
        rosangela:state.deduced?'Agora conversa com a Rosangela. Pergunta do botão, sem acusar. Vai por mim: ninguém gosta de ser julgado antes de explicar.':'A Rosangela está perto da copa. O mapa te deixa na entrada; ela está logo ali.',
        heineck:'O Heineck está na Sala de Servidores. Vai aos Laboratórios pelo mapa e entra pela porta.',
        leila:'A Leila Rossi está dentro da Biblioteca. O Aresi também está por perto, mas do lado de fora.',
        aresi:'Procura o Aresi na frente da Biblioteca. Às vezes ele entende os termos diferente, mas presta atenção no que ele viu.',
        diego:'O Diego está perto do Auditório. Ele preparou um diagnóstico que só lê os dados, sem alterar nada.',
        pinheiro:'O Pinheiro está no pátio. Mostra as evidências; ele ajuda a conferir se a recuperação está segura.',
        wanderson:'O Wanderson está aqui na Fábrica, perto da árvore. Ele vai ajudar nos testes.',
        santalog:state.setup<4?'Repara em quais luzes mudam juntas. Um interruptor afeta mais de uma posição, e repetir o clique desfaz o efeito.':'Os testes são uma promessa sobre o resultado. E pros cartões, vai guardando um símbolo de cada vez. Sem pressa.'
      };
      state.hints++;persist();dialogue([['willian',tips[obj.target]||obj.desc],['willian',cleared?'E obrigado por confiar em mim. Tamo junto.':'E quando descobrir o que houve… salva minha reputação, Fabrício!']]);
    };
    $('#leave-talk').onclick=close;
  }
  function talk(id){
    if(id==='willian'){willian();return;}
    if(!state.clues.includes('incident')){dialogue([[id,id==='tiago'?'O SantaLog está na mesa à esquerda. Rode o último teste, que a ceia não se compila sozinha.':'Confira o SantaLog primeiro. Ainda estou acreditando numa noite tranquila.']]);return;}
    if(id==='rosangela'&&state.deduced&&!state.revealed){dialogue(Story.reveal,()=>{state.revealed=true;clue('confession');persist();toast('Recuperação liberada. Reúna Pinheiro e Wanderson.');},'ATO 4 / A REVELAÇÃO');return;}
    if(state.revealed&&['pinheiro','wanderson'].includes(id)&&!state.helpers.includes(id)){
      dialogue(Story.recovery[id],()=>{if(!state.helpers.includes(id))state.helpers.push(id);Campaign.talk(state,id);persist();toast(Story.actors[id].name+' entrou na equipe de recuperação.');});return;
    }
    const a=Story.actors[id];
    const investigate=()=>dialogue(Story.dialogues[id],()=>{Campaign.talk(state,id);persist();toast('Anotado no caderno: '+a.name);});
    if(!state.talked.includes(id)){investigate();return;}
    show(`<h1 id="panel-title" class="dialog-name">${a.name}</h1><div class="dialog-content"><canvas class="portrait" id="portrait" width="96" height="112"></canvas><div class="dialog-copy"><p class="dialog-text">E aí, Fabrício? Descobriu alguma coisa?</p></div></div><div class="dialog-choices">${button('Me conta de novo o que você viu.','ask')}${button('E a ceia, como fica?','extra')}${button('Já volto.','leave-talk')}</div>`,'talk');
    Engine.portrait(id,$('#portrait'));$('#ask').onclick=investigate;
    $('#extra').onclick=()=>dialogue([[id,Story.extras[id]]]);$('#leave-talk').onclick=close;
  }
  function santalog(){
    if(!state.clues.includes('incident')){
      show(`<h1 id="panel-title" class="dialog-name">Fabrício</h1><div class="dialog-content"><canvas class="portrait" id="portrait" width="96" height="112"></canvas><div class="dialog-copy"><p class="dialog-text">O SantaLog está pronto. Vamos fazer aquele último teste?</p></div></div><div class="dialog-choices">${button('Rodar o teste final','test-start')}${button('Só um instante.','computer-close')}</div>`,'talk');
      Engine.portrait('fabricio',$('#portrait'));
      $('#test-start').onclick=()=>testScene('incident',()=>toast('Converse com Tiago ao lado do computador.'));
      $('#computer-close').onclick=close;return;
    }
    if(state.act<5){show(`${head('Plantão de incidente','SANTALOG / TERMINAL 01')}<div class="terminal"><span class="error">PRODUÇÃO: 0 entregas</span>\nÚltima versão: v2.4\nStatus: investigação em andamento\nIntegridade do disco: OK</div><p>${Campaign.objective(state).desc}</p><div class="buttons">${button('Ver evidências','computer-board')}${button('Voltar ao campus','computer-close','primary')}</div>`,'computer');$('#computer-board').onclick=board;$('#computer-close').onclick=close;return;}
    recovery();
  }
  function gate(id){if(state.solved[id]){show(`${head('Diagnóstico concluído','EVIDÊNCIA CONFIRMADA')}<div class="note">${Story.clues[id].text}</div><div class="buttons">${button('Abrir quadro de evidências','solved-board','primary')}${button('Voltar','solved-close')}</div>`,'puzzle');$('#solved-board').onclick=board;$('#solved-close').onclick=close;return false;}if(state.act<3){toast('Primeiro reúna os depoimentos indicados nas missões.');journal();return false;}return true;}
  function solved(id){Campaign.solve(state,id);persist();sound('success');show(`${head('Uma peça se encaixou.','DIAGNÓSTICO CONCLUÍDO')}<div class="note">${Story.clues[id].text}</div><p>${id==='commits'?'O c18 do Willian passou nos testes e não altera destinos. Reputação salva: não foi o estagiário!':Campaign.objective(state).desc}</p><div class="buttons">${button('Continuar investigação','puzzle-done','primary')}${button('Ver evidências','puzzle-board')}</div>`,'puzzle');$('#puzzle-done').onclick=()=>transition({commits:[['willian','Tá vendo? Fiz tudo certinho! Salva minha reputação no grupo também, Fabrício!'],['fabricio','Pode deixar. Seu commit está limpo. Agora vamos atrás desse botão.']],network:[['heineck','Chegou em sandbox. Eu sabia que não era o cabo.'],['fabricio','A rede funciona. O destino é que está errado. Vamos anotar.']],database:[['leila','Dois milhões e quatrocentos mil. Não sumiu nenhum.'],['fabricio','Então a recuperação precisa preservar esses IDs. Nada de duplicar presente.']]}[id],close);$('#puzzle-board').onclick=board;}
  const stations={
    santalog:{name:'Fábrica / PC 01',app:'SantaLog',icon:'✦',desc:'Distribuição de presentes e recuperação.'},
    commits:{name:'Fábrica / PC 02',app:'Histórico Git',icon:'⑂',desc:'Reconstrua a versão que foi publicada.'},
    network:{name:'Servidores / console',app:'Diagnóstico de rede',icon:'⌘',desc:'Siga a conexão e descubra o destino.'},
    database:{name:'Biblioteca / PC 03',app:'Pinguim.py',icon:'▤',desc:'Decodifique o lote e consulte os dados.'}
  };
  function desktop(id){computerSession=id;const pc=stations[id];show(`<div class="desktop-wallpaper"><span class="eyebrow">IFC VIDEIRA · PLANTÃO DE NATAL</span><h1 id="panel-title">Boa noite, Fabrício.</h1><p>Qual arquivo vamos investigar?</p><div class="desktop-icons"><button data-open-app="${id}" class="desktop-icon"><span>${pc.icon}</span><strong>${pc.app}</strong><small>${pc.desc}</small></button><button id="desktop-readme" class="desktop-icon"><span>▧</span><strong>Leia-me</strong><small>Recado da equipe</small></button></div><div class="desktop-footer"><span>▣ Conexão local ativa</span><span>Esc para levantar da mesa</span></div></div>`,'desktop',true);$('[data-open-app]').onclick=()=>({santalog,commits,network,database}[id])();$('#desktop-readme').onclick=()=>{show(`${head('Antes de começar','RECADO DO WILLIAN')}<p>Professor, deixei as ferramentas separadas por computador. Abre o programa, confere as pistas e me chama se travar.</p><p>Nas montagens, dá pra arrastar as peças ou clicar na peça e no espaço. No código, o manual fica do lado e dá pra rodar quantas vezes quiser.</p><div class="note">Os diagnósticos não mexem nos presentes. A recuperação só acontece depois de reunir a equipe.</div><button id="readme-back">Voltar à área de trabalho</button>`,'computer');$('#readme-back').onclick=()=>desktop(id);};}
  function transition(lines,next){const station=computerSession;dialogue(lines,()=>{computerSession=station;next();});}
  function miniAPI(){return {show,head,hint,feedback,transition,success:solved,setup:state.setup,restored:recovery,
    deductionDone(){state.deduced=true;clue('deduction');persist();transition([['fabricio','O botão trocou a rota. O clique explica o horário, e os dados estão inteiros.'],['aresi','Então vale ouvir a Rosangela antes de tirar conclusões.'],['fabricio','Isso. E o Willian está fora dessa. O commit dele passou certinho.']],()=>{close();toast('Converse com Rosangela na copa.');});},
    restoreDone(order){for(const step of order){const result=Campaign.restore(state,step);if(!result.ok){feedback(result.message);return;}}persist();transition([['wanderson','Backup guardado. O lote voltou com os mesmos IDs.'],['fabricio','Agora vamos provar que está tudo certo. Sem pular teste.']],recovery);},
    testsDone(){if(!Campaign.validate(state,'2400000','0','production'))return;persist();testScene('validation',recovery);},
    extrasDone(){state.extraTests=true;persist();transition([['leila','Nome, pedido e rastreio conferem. Cada criança vai receber o cartão certo.'],['fabricio','Aí sim. Natal completo.']],recovery);}
  };}
  function commits(){if(!state.mosaic&&state.act>=3&&!state.solved.commits){transition([['claudionei','A cópia da versão está aqui. Vamos recuperar a imagem do arquivo primeiro.'],['fabricio','Uma peça de cada vez. Depois a gente confere os registros.']],()=>MiniGames.mosaic(miniAPI(),()=>{state.mosaic=true;persist();commits();}));return;}if(gate('commits'))transition([['willian','Professor, meu commit é o c18. Dá uma olhada nos testes antes de me culpar também, por favor.'],['fabricio','Calma. Vamos montar a versão que foi publicada e conferir o que mudou.']],()=>MiniGames.commits(miniAPI()));}
  function network(){if(gate('network'))transition([['heineck','O servidor está de pé. Esse painel mostra o caminho do pedido.'],['fabricio','Vou alinhar as conexões e mandar um pacote. Quero ver onde ele chega.']],()=>MiniGames.network(miniAPI()));}
  function database(){if(gate('database'))transition([['leila','O total não mudou. A etiqueta do arquivo é que veio em binário.'],['fabricio','Vamos decodificar isso e procurar o lote. Sem cadastrar tudo de novo.']],()=>MiniGames.database(miniAPI()));}
  function board(){computerSession=null;const ready=Object.values(state.solved).every(Boolean);show(`${head('Todo detalhe deixa um rastro.','QUADRO DE EVIDÊNCIAS')}<p>${state.clues.length} pistas reunidas · ${Object.values(state.solved).filter(Boolean).length}/3 provas técnicas</p>${ready&&!state.deduced?'<div class="note">Temos as três provas. Use a linha do tempo para localizar a mudança.</div><button id="ded-check" class="primary">Reconstruir o incidente</button>':state.deduced?'<div class="note">Converse com Rosangela na copa para entender o clique.</div>':'<div class="note">Conclua os três diagnósticos para ligar as pistas.</div>'}<details class="evidence-details"><summary>Ler as pistas reunidas</summary><div class="grid">${state.clues.map(id=>`<article class="card"><div class="eyebrow">${Story.clues[id].source}</div><h3>${Story.clues[id].title}</h3><p>${Story.clues[id].text}</p></article>`).join('')}</div></details>`,'board',true);$('#ded-check')?.addEventListener('click',()=>MiniGames.deduction(miniAPI()));}
  function journal(){const obj=Campaign.objective(state);show(`${head('Caderno do plantão','ATO '+state.act+' / '+Story.acts[state.act-1])}<nav class="notebook-tabs">${button('Objetivos','notebook-goals','active')}${button('Evidências · '+state.clues.length,'notebook-evidence')}${button('Conversas','notebook-chat')}</nav><div class="note"><strong>${obj.title}</strong><br>${obj.desc}</div><div class="check-list">${Story.acts.map((a,i)=>`<div class="choice"><span class="${i+1<state.act?'success':''}">${i+1<state.act?'✓':String(i+1).padStart(2,'0')}</span><span>${a}<small style="display:block;color:var(--muted)">${['Execute o teste inicial e procure Tiago.','Ouça Rosangela, Aresi, Heineck, Leila, Diego e Claudionei.','Analise commits, rede e banco de dados.','Cruze as provas e converse com Rosangela.','Reúna a equipe, recupere, teste e faça o deploy.'][i]}</small></span></div>`).join('')}</div><details class="secret-notes"><summary>Achados pelo campus · ${state.secrets.length}/${Secrets.items.length}</summary><p>Encontre todos antes do último deploy para descobrir uma cena depois dos créditos.</p>${Secrets.items.map(item=>`<p>${state.secrets.includes(item.id)?'✓ '+item.name:'◇ '+item.hint}</p>`).join('')}</details><p>Conquistas: ${state.achievements.length?state.achievements.join(' · '):'continue investigando para descobrir.'}</p><div class="buttons">${button('Localizar objetivo','journal-map','primary')}${button('Voltar ao jogo','journal-close')}</div>`,'journal');$('#notebook-goals').onclick=journal;$('#notebook-evidence').onclick=board;$('#notebook-chat').onclick=chat;$('#journal-map').onclick=()=>obj.target==='board'?board():map();$('#journal-close').onclick=close;}
  function targetPlace(){const id=Campaign.objective(state).target;return {claudionei:'factory',tiago:'factory',wanderson:'factory',santalog:'factory',commits:'factory',heineck:'server',network:'server',leila:'library',database:'library',aresi:'library',rosangela:'copa',pinheiro:'patio',diego:'auditorio'}[id]||'factory';}
  function map(){show(`${head('O campus ainda está acordado.','MAPA / DESLOCAMENTO RÁPIDO')}<p>${Campaign.objective(state).desc}</p><canvas id="large-map" class="map-large" width="800" height="420" aria-label="Mapa completo do campus"></canvas><div class="travel-grid">${Engine.places.map(p=>`<button data-place="${p.id}" class="${targetPlace()===p.id?'active':''}" ${state.act===1?'disabled':''}>${targetPlace()===p.id?'◆ ':''}${p.name}<small>${p.desc}</small></button>`).join('')}</div><div class="note">${state.act===1?'Converse com Tiago após o incidente para liberar a saída e o deslocamento rápido.':'Escolha um local para chegar à entrada. Aproxime-se da porta ou de um professor e pressione E. O marcador dourado indica o objetivo sugerido.'}</div>`,'map',true);Engine.drawMini($('#large-map'));for(const b of document.querySelectorAll('[data-place]'))b.onclick=()=>{const p=Engine.places.find(p=>p.id===b.dataset.place);Engine.enter('campus',p);close();toast('Você chegou: '+p.name);};}
  function recovery(){
    if(state.ending==='complete'){ending(state.ending);return;}
    computerSession='santalog';const helpers=['pinheiro','wanderson'].every(id=>state.helpers.includes(id));
    show(`${head('Operação: salvar o Natal.','SANTALOG / RECUPERAÇÃO')}<div class="recovery-status"><span>${state.setup}/4 operações</span><span>Testes: ${state.tests?'✓ aprovados':'pendentes'}</span><span>Extras: ${state.extras?(state.extraTests?'✓ testados':'pendentes'):'desligados'}</span></div><p>${!helpers?'Reúna Fábio Pinheiro e Wanderson antes de alterar o sistema.':state.setup<4?'A equipe está pronta. Estabilize o painel para executar a rotina de recuperação.':'Os dados voltaram. Confira os testes antes de publicar.'}</p><div class="recovery-steps"><button id="restore-plan" ${!helpers||state.setup===4?'disabled':''}><span>01</span><strong>Estabilizar painel</strong><small>Backup, rota, lote e proteção</small></button><button id="test-deliveries" ${state.setup<4?'disabled':''}><span>02</span><strong>Validar entregas</strong><small>Complete os campos e rode</small></button><button id="test-extras" ${state.setup<4?'disabled':''}><span>03</span><strong>Cartões e rastreio</strong><small>Encontre os pares de cartões</small></button></div><div id="feedback" class="feedback" role="status"></div><p class="mini-help">Achados: ${state.secrets.length}/${Secrets.items.length}. O deploy encerra a exploração. Encontre todos antes de publicar para liberar o pós-crédito.</p><div class="buttons">${button('Executar último deploy','deploy','primary')}${button('Voltar ao campus','recovery-close')}</div>`,'recovery',true);
    $('#restore-plan').onclick=()=>MiniGames.restoration(miniAPI());$('#test-deliveries').onclick=tests;$('#test-extras').onclick=extras;$('#deploy').onclick=deploy;$('#recovery-close').onclick=close;
  }
  function tests(){if(state.setup<4){feedback('Conclua a recuperação primeiro.');return;}transition([['pinheiro','Teste verde só vale se ele conferir a coisa certa.'],['wanderson','Os comandos já estão prontos. Só preenche os valores destacados e manda rodar.']],()=>MiniGames.tests(miniAPI()));}
  function extras(){state.extras=true;state.extraTests=false;persist();MiniGames.extras(miniAPI());}
  function audioSettings(){show(`${head('Som do plantão','MÚSICA E EFEITOS')}<p>Trilha original, cliques e uma voz de pixels para cada personagem.</p><label class="volume-control">Música <output id="music-value">${Math.round(state.audio.music*100)}%</output><input id="music-volume" type="range" min="0" max="100" value="${Math.round(state.audio.music*100)}"></label><label class="volume-control">Vozes e efeitos <output id="effects-value">${Math.round(state.audio.effects*100)}%</output><input id="effects-volume" type="range" min="0" max="100" value="${Math.round(state.audio.effects*100)}"></label><div class="buttons"><button id="mute-settings">${state.muted?'Ativar som':'Silenciar tudo'}</button><button id="audio-back">Voltar</button></div>`,'audio');for(const key of ['music','effects'])$('#'+key+'-volume').oninput=e=>{state.audio[key]=Number(e.target.value)/100;$('#'+key+'-value').textContent=e.target.value+'%';persist();};$('#effects-volume').onchange=()=>GameAudio.voice('fabricio',0);$('#mute-settings').onclick=()=>{state.muted=!state.muted;persist();audioSettings();};$('#audio-back').onclick=pause;}
  function deploy(){
    const result=Campaign.deploy(state);persist();if(result==='blocked'){feedback('Ainda falta uma conferência. Complete o painel, os testes e os quatro pares de cartões antes de publicar.');return;}
    locked=true;show(`${head('O último deploy do ano.','PUBLICAÇÃO / SANTALOG v2.4.1')}<div class="terminal" id="deploy-log">Preparando pacote…</div><div class="deploy-progress"><i id="deploy-bar"></i></div><p>Todo mundo se aproxima. Dessa vez, está tudo conferido.</p>`,'deploy');$('#close-panel').disabled=true;
    const lines=['Backup localizado.','2.400.000 entregas em produção.','Cartões e rastreamento aprovados.','DEPLOY CONCLUÍDO. Boas festas!'];let n=0;const timer=setInterval(()=>{if(!$('#deploy-log')){clearInterval(timer);locked=false;return;}$('#deploy-log').textContent+='\n'+lines[n];$('#deploy-bar').style.width=((n+1)*25)+'%';if(++n===lines.length){clearInterval(timer);locked=false;ending();}},380);
  }
  function ending(){
    clearInterval(textTimer);advanceDialogue=null;MiniGames.dispose();computerSession=null;overlay.hidden=true;modal='finale';document.body.dataset.ui='finale';Engine.paused=true;
    Finale.play(()=>{state.finaleSeen=true;persist();finalPhoto();});
  }
  function finalPhoto(){
    if(Finale.active)return;document.body.classList.add('game-finished');GameAudio.setMode('victory');
    show(`<div class="final-card"><span class="eyebrow">PLANTÃO ENCERRADO · 24 DE DEZEMBRO</span><h1 id="panel-title">Feliz Natal!</h1><figure class="christmas-photo"><img id="christmas-photo" src="assets/christmas-party-v2.png" width="1536" height="1024" alt="Fabrício, Willian e toda a equipe felizes, comendo bolo na copa decorada para o Natal. Ilustração cartoon."><figcaption>O melhor deploy foi chegar juntos até aqui. ♡</figcaption></figure><p>2.400.000 presentes entregues. Uma mesa cheia.<br>E o estagiário de nome limpo.</p><div class="buttons"><button id="replay-finale">Rever a celebração</button><button id="credits">Créditos</button><button id="end-menu">Menu inicial</button></div><small>FIM · Obrigado por jogar</small></div>`,'ending',true);
    $('#replay-finale').onclick=()=>{document.body.classList.remove('game-finished');ending();};$('#credits').onclick=credits;$('#end-menu').onclick=menu;
  }
  function credits(){show(`${head('Feito de pixels e colaboração.','CRÉDITOS')}<p><strong>O Último Deploy do Ano</strong><br>Uma comédia natalina na Fábrica de Software do IFC Campus Videira.</p><p>Equipe da Fábrica: Claudionei Lovato Serafini, Diego Kroll, Fabio José Rodrigues Pinheiro, Fabricio Bizotto, Leila Lisiane Rossi, Tiago Lopes Gonçalves, Tiago Heineck e Wanderson Rigo.</p><p>Com participação especial de Fábio Aresi, Rosangela e Willian, o estagiário.</p><p><a href="https://fabrica.labia.ifc.edu.br/equipe" target="_blank" rel="noopener noreferrer">Equipe oficial da Fábrica</a> · Campus adaptado de <a href="https://github.com/willian-hm/ifc-map" target="_blank" rel="noopener noreferrer">IFC Map · willian-hm</a>.</p><p>Ilustrações de encerramento geradas para esta aventura. Puzzles inspirados em circuitos giratórios, mosaicos deslizantes e jogos da memória.</p><p>${Secrets.complete(state)?'Todos os achados reunidos. Parece que alguém ficou para trás…':'Achados: '+state.secrets.length+'/'+Secrets.items.length+'. Há uma surpresa para quem explorar cada cantinho antes do deploy.'}</p><div class="buttons"><button id="credits-photo">Voltar à foto</button>${Secrets.complete(state)?'<button id="postcredits-play" class="primary">Continuar · cena pós-créditos</button>':''}</div>`,'credits');$('#credits-photo').onclick=finalPhoto;$('#postcredits-play')?.addEventListener('click',postcredits);}
  function postcredits(){
    if(!Secrets.complete(state))return;overlay.hidden=true;modal='postcredits';Finale.postcredits(()=>{state.postcreditsSeen=true;persist();secretPhoto();});
  }
  function secretPhoto(){
    show(`<div class="final-card"><span class="eyebrow">PÓS-CRÉDITOS · CURIOSIDADE DEMAIS</span><h1 id="panel-title">Carona de estagiário</h1><figure class="christmas-photo"><img id="secret-photo" src="assets/secret-sleigh-v3.png" width="1536" height="1024" alt="Papai Noel ri de frente no trenó. Willian fica pendurado abaixo, assustado e choroso, olhando para cima. O campus aparece muito longe no chão."><figcaption>“Socorroooo! Não devia ter vindo escondido!” — Willian</figcaption></figure><p>Nome limpo. Juízo… a gente vê no próximo ano.</p><div class="buttons"><button id="secret-replay">Rever a carona</button><button id="secret-back">Voltar à comemoração</button></div></div>`,'ending',true);$('#secret-replay').onclick=postcredits;$('#secret-back').onclick=finalPhoto;
  }
  function collectSecret(id){
    const item=Secrets.items.find(item=>item.id===id);if(!item||state.secrets.includes(id)||item.scene!==Engine.scene||Math.hypot(item.x-Engine.player.x,item.y-Engine.player.y)>=49)return;
    state.secrets.push(id);if(Secrets.complete(state))state.achievements.push('Curioso demais para ficar no chão');persist();sound('success');
    dialogue([['fabricio','Olha só… '+item.name+'.'],['willian',item.line]],()=>toast(Secrets.complete(state)?'Todos os segredos encontrados! Uma cena espera depois dos créditos.':'Achado guardado no caderno · '+state.secrets.length+'/'+Secrets.items.length));
  }
  function chat(){
    const messages=[['Tiago',state.clues.includes('incident')?'Abri este grupo de plantão. Ninguém toca no botão até entendermos o incidente.':'Último teste e estamos liberados. Estou confiante. Isso é preocupante.'],['Fábio Aresi','O nome do grupo está sem vírgula. Depois resolvemos.']];
    if(state.act>=3)messages.push(['Diego Kroll','pinguim.py pronto. Relatório só de leitura: zero exclusões, uma troca de rota.']);
    if(state.revealed)messages.push(['Rosangela','Estou com vocês. E tirei o glitter de perto do servidor.']);
    show(`${head('Plantão de Natal','CHAT LOCAL / FÁBRICA DE SOFTWARE')}<div id="chat-log" class="check-list" role="log" aria-live="polite"></div><p>Peça ajuda à equipe. As respostas acompanham sua investigação.</p><div class="buttons">${button('Onde investigar?','chat-where')}${button('Estado do sistema','chat-status')}${button('Preciso de café','chat-coffee')}</div>`,'chat');
    function append(name,text){const row=document.createElement('div');row.className='card';const who=document.createElement('div');who.className='eyebrow';who.textContent=name;const p=document.createElement('p');p.textContent=text;row.append(who,p);$('#chat-log').append(row);row.scrollIntoView({block:'nearest'});}
    for(const [name,text] of messages)append(name,text);
    $('#chat-where').onclick=()=>{append('Fabrício','Onde investigo agora?');append('Tiago',Campaign.objective(state).desc+' Use o mapa para encontrar o local indicado.');sound();};
    $('#chat-status').onclick=()=>{append('Fabrício','Como estamos?');append('Leila Rossi',state.setup>=3?'O lote está recuperado: 2.400.000 registros. Confira os testes antes de publicar.':state.solved.database?'O lote inteiro está em sandbox. Preservar os IDs é essencial.':state.clues.includes('incident')?'A produção mostra zero. Precisamos de evidências antes de alterar os dados.':'2.400.000 entregas cadastradas. Falta o teste final.');};
    $('#chat-coffee').onclick=()=>{append('Fabrício','Preciso de café.');append('Rosangela','Tem na mesa do canto esquerdo da Fábrica. Esse botão só faz café, prometo.');};
  }
  $('#chat').onclick=chat;
  function interact(id,type){if(state.ending==='complete'||Finale.active)return;sound();if(type==='secret'){collectSecret(id);return;}if(type==='npc'){talk(id);return;}({santalog:()=>desktop('santalog'),commits:()=>desktop('commits'),network:()=>desktop('network'),database:()=>desktop('database'),board,coffee:()=>{if(!state.achievements.includes('Café da resistência')){state.achievements.push('Café da resistência');persist();}dialogue([['fabricio','Café quente. Backup recente. As duas coisas que mantêm um professor de pé.']]);}}[id]||(()=>{}))();}
  function onMove(scene,p){state.scene=scene;state.position={x:p.x,y:p.y};if(!state.visited.includes(scene))state.visited.push(scene);if(state.started)persist();}
  $('#audio').onclick=()=>{state.muted=!state.muted;persist();GameAudio.unlock();sound();};$('#pause').onclick=pause;$('#brand').onclick=e=>{e.preventDefault();pause();};$('#journal').onclick=journal;$('#evidence').onclick=board;$('#travel').onclick=map;$('#map').onclick=map;$('#minimap').onclick=map;$('#track').onclick=()=>Campaign.objective(state).target==='board'?board():map();
  window.addEventListener('keydown',e=>{if(Finale.active){if(e.key==='Escape')e.preventDefault();return;}if(state.ending==='complete'&&['e','E','m','M','j','J','q','Q','Escape'].includes(e.key)){e.preventDefault();return;}if(advanceDialogue&&['e','Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)advanceDialogue();return;}if(e.key==='Escape'){e.preventDefault();if(locked)return;if(overlay.hidden)pause();else close();}if(!overlay.hidden&&e.key==='Tab'){const items=[...panel.querySelectorAll('button:not(:disabled),input,textarea,summary,a[href]')];if(!items.length){e.preventDefault();return;}if(e.shiftKey&&(document.activeElement===items[0]||document.activeElement===panel)){items.at(-1).focus();e.preventDefault();}else if(!e.shiftKey&&(document.activeElement===items.at(-1)||document.activeElement===panel)){items[0].focus();e.preventDefault();}}if(overlay.hidden&&!e.repeat){if(e.key.toLowerCase()==='m')map();if(e.key.toLowerCase()==='j')journal();if(e.key.toLowerCase()==='q')board();}});
  window.addEventListener('pagehide',()=>{if(state.started)onMove(Engine.scene,Engine.player);});
  function boot(){try{Engine.init(interact);hud();$('#loading').remove();menu();}catch(e){console.error(e);$('#loading').innerHTML='<h1>O campus não terminou de carregar.</h1><p>Recarregue a página. Se necessário, abra o jogo por um servidor local.</p>';}}
  requestAnimationFrame(()=>setTimeout(boot,30));
  return {get state(){return state;},interact,pause,toast,onMove,board,journal,map,close,menu};
})();
