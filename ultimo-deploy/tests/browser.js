/* Harness de integração: roda somente ao abrir tests/browser.html e clicar no botão. */
const frame=document.querySelector('#game-frame'),report=document.querySelector('#result');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
document.querySelector('#run').onclick=async()=>{
  const run=document.querySelector('#run');run.disabled=true;report.textContent='';let previous=localStorage.getItem('ultimo-deploy-v1'),checks=0;
  function check(ok,text){if(!ok)throw Error(text);checks++;report.textContent+='✓ '+text+'\n';}
  let w=frame.contentWindow,d=w.document;
  const click=id=>{const b=d.getElementById(id);if(!b||b.disabled)throw Error('Controle indisponível: '+id);b.click();};
  const choose=(id,v)=>{const el=d.getElementById(id);if(!el)throw Error('Campo ausente: '+id);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}));el.dispatchEvent(new w.Event('change',{bubbles:true}));};
  const dialogue=()=>{let max=120;while(!d.getElementById('overlay').hidden&&d.getElementById('next-line')&&max-->0)click('next-line');if(max<=0)throw Error('Diálogo sem fim');};
  function interact(id,type='object'){w.UI.close();w.UI.interact(id,type);if(['santalog','commits','network','database'].includes(id)){check(Boolean(d.querySelector('.os-panel')),'Computador abre uma área de trabalho: '+id);d.querySelector('[data-open-app]').click();dialogue();}}
  function assemble(ids){ids.forEach((id,i)=>{d.querySelector('[data-piece="'+id+'"]').click();d.querySelector('[data-slot="'+i+'"]').click();});}
  function code(source){const el=d.getElementById('mini-code');el.value=source;el.dispatchEvent(new w.Event('input',{bubbles:true}));click('run-code');}
  function talk(id){const a=w.Story.actors[id];w.Engine.enter(a.scene,w.Engine.safe(a.x,a.y+20,a.scene));interact(id,'npc');if(d.getElementById('ask'))click('ask');dialogue();}
  function collisionChecks(){
    // Flood fill da área jogável de cada interior usando a hitbox real.
    for(const id of ['factory','server','library']){
      const cells=new Map(),queue=[[320,352]],solids=w.Engine.rooms[id].solids;const key=(x,y)=>x+','+y;
      while(queue.length){const [x,y]=queue.shift(),k=key(x,y);if(cells.has(k)||x<48||x>590||y<77||y>390)continue;cells.set(k,false);if(!w.Engine.free(x,y,id))continue;cells.set(k,true);queue.push([x+8,y],[x-8,y],[x,y+8],[x,y-8]);}
      const targets=id==='factory'?[[270,195],[443,195],[170,92],[386,213],[490,320]]:id==='server'?[[268,200],[390,265]]:[[260,200],[399,242]];
      for(const [x,y] of targets)check([...cells].some(([k,v])=>{const [cx,cy]=k.split(',').map(Number);return v&&Math.hypot(cx-x,cy-y)<45;}),id+': interação alcançável em '+x+','+y);
      const p={x:56,y:220,hbHalfW:5,hbH:7};w.Campus.moveWithCollision(p,-20,0,solids,640,440);check(p.x>=53,id+': colisão impede atravessar parede');
    }
    for(const p of w.Engine.places){const pos=w.Engine.safe(p.x,p.y,'campus');check(w.Engine.free(pos.x,pos.y,'campus'),'Chegada segura: '+p.name);
      const goal=w.Engine.doors.find(g=>g.id===p.id)||w.Story.actors[{copa:'rosangela',patio:'pinheiro',auditorio:'diego'}[p.id]];
      const queue=[[pos.x,pos.y]],seen=new Set();let reached=false;
      while(queue.length){const [x,y]=queue.shift(),key=x+','+y;if(seen.has(key)||Math.abs(x-pos.x)>150||Math.abs(y-pos.y)>150)continue;seen.add(key);if(!w.Engine.free(x,y,'campus'))continue;if(Math.hypot(x-goal.x,y-goal.y)<45){reached=true;break;}queue.push([x+8,y],[x-8,y],[x,y+8],[x,y-8]);}
      check(reached,'Caminho livre até porta ou professor: '+p.name);
    }
    for(const [id,a] of Object.entries(w.Story.actors))if(a.scene)check(w.Engine.free(a.x,a.y,a.scene),'NPC fora de obstáculos: '+id);
  }
  try{
    for(let i=0;i<100&&!w.UI;i++)await wait(100);
    check(Boolean(w.UI&&w.Campus.bg),'Scripts e mapa procedural carregados');
    collisionChecks();
    click('new-game');if(d.getElementById('confirm-reset'))click('confirm-reset');check(w.Finale.active,'Abertura apresenta a Fábrica antes do diálogo');click('finale-skip');
    check(d.querySelector('#overlay').classList.contains('dialogue-overlay'),'Conversa usa caixa inferior sem bloquear visualmente o cenário');
    w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'e',bubbles:true}));
    check(d.getElementById('spoken-text').textContent.length>0,'E revela a fala sem pular conteúdo');
    dialogue();check(w.UI.state.act===1,'Nova partida inicia no ato 1');
    click('journal');click('notebook-chat');click('chat-where');check(d.getElementById('chat-log').textContent.includes('Use o computador SantaLog'),'Caderno centraliza o chat e a ajuda contextual');w.UI.close();
    w.Engine.enter('factory',{x:270,y:220});interact('santalog');click('test-start');
    check(Boolean(w.Engine.cinematic)&&d.body.classList.contains('cinematic'),'Teste final inicia encenação com câmera e equipe');
    dialogue();check(w.UI.state.clues.includes('incident')&&!w.Engine.cinematic,'Cutscene conclui incidente e devolve controle');
    talk('willian');check(w.UI.state.clues.includes('willian'),'Willian registra seu álibi sem impedir a investigação');
    interact('willian','npc');click('willian-tip');dialogue();check(w.UI.state.hints===1,'Estagiário fornece dica adequada à missão atual');
    talk('tiago');check(w.UI.state.act===2,'Depoimento libera exploração');
    // Viagem pela própria interface, antes de começar os depoimentos.
    w.UI.map();d.querySelector('[data-place="copa"]').click();check(w.Engine.scene==='campus','Mapa executa deslocamento rápido');
    for(const id of ['aresi','diego','rosangela','leila','heineck','pinheiro','wanderson','claudionei'])talk(id);
    check(w.UI.state.act===3&&w.UI.state.talked.length===10,'Todos os professores e estagiário presentes na investigação');
    interact('commits');check(Boolean(d.getElementById('mosaic')),'Arquivo abre mosaico 3×3');
    const R=w.PuzzleRules,queue=[[Array.from(R.mosaicStart),[]]],seen=new Set();let path=null;for(let n=0;n<queue.length;n++){const [board,route]=queue[n],key=board.join();if(seen.has(key))continue;seen.add(key);if(R.mosaicComplete(board)){path=route;break;}for(let i=0;i<9;i++){const next=R.slide(board,i);if(next.join()!==key)queue.push([next,[...route,i]]);}}
    check(Boolean(path),'Mosaico tem solução usando apenas movimentos legais');for(const i of path)d.querySelector('[data-tile="'+i+'"]').click();click('mini-check');dialogue();check(w.UI.state.mosaic,'Mosaico recuperado persiste antes do histórico');click('mini-check');check(d.querySelector('#feedback').textContent.length>0&&!w.UI.state.solved.commits,'Montagem incompleta não libera evidência');
    assemble(['c18','test','f24','publish']);click('mini-check');d.querySelector('[data-diff="color"]').click();check(!w.UI.state.solved.commits,'Diff decorativo não resolve o incidente');d.querySelector('[data-diff="route"]').click();check(w.UI.state.solved.commits,'Linha publicada montada e alteração da rota identificada');
    check(w.UI.state.clues.includes('innocence')&&w.UI.state.achievements.includes('Justiça pelo estagiário'),'Histórico inocenta Willian com provas e conquista');click('puzzle-done');dialogue();
    talk('willian');check(w.UI.state.act===3,'Conversa de reputação salva preserva a progressão');
    interact('network');click('mini-check');check(!w.UI.state.solved.network,'Circuito aberto não envia diagnóstico');
    for(const [round,level] of w.PuzzleRules.networkLevels.entries()){
      level.start.forEach((mask,i)=>{for(let n=0;mask!==level.solution[i]&&n<4;n++){d.querySelector('[data-wire="'+i+'"]').click();mask=w.PuzzleRules.rotate(mask);}});click('mini-check');check(d.getElementById('trace-output').textContent.includes(round===2?'SANDBOX':'OK'),'Transmissão '+(round+1)+' revela resultado');check(!w.UI.state.solved.network,'Evidência aguarda confirmação da transmissão');click('mini-check');dialogue();
    }check(w.UI.state.solved.network,'Três circuitos conectados concluem diagnóstico');
    interact('database');click('mini-check');check(!w.UI.state.solved.database,'Sinal incorreto mantém a rodada');click('mini-hint');check(d.getElementById('binary-clock').textContent==='Pausado'&&d.getElementById('mini-check').disabled,'Dica pausa cronômetro sem revelar resposta');click('binary-pause');
    d.querySelector('[data-bit="0"]').click();d.querySelector('[data-bit="1"]').click();click('mini-check');check(d.getElementById('binary-target').textContent==='01101','Segunda rodada inverte conversão para decimal');const realNow=w.performance.now.bind(w.performance);Object.defineProperty(w.performance,'now',{configurable:true,value:()=>realNow()+46000});await wait(160);delete w.performance.now;check(!d.getElementById('binary-retry').hidden,'Cronômetro encerra a rodada quando o tempo expira');click('binary-retry');check(d.getElementById('binary-target').textContent==='01101','Repetir preserva a primeira rodada aprovada');choose('region-answer','13');click('mini-check');
    for(const i of [0,2,4])d.querySelector('[data-bit="'+i+'"]').click();click('mini-check');dialogue();check(Boolean(d.getElementById('code-env')),'Três testes binários abrem código guiado');click('run-code');check(d.getElementById('code-finish').disabled,'Consulta vazia não libera descoberta');click('code-env');click('run-code');check(!d.getElementById('code-finish').disabled,'Trocar um único campo encontra o lote');click('code-env');check(d.getElementById('code-finish').disabled,'Mudar ambiente invalida execução anterior');click('code-env');click('run-code');click('code-finish');check(w.UI.state.solved.database&&w.UI.state.act===4,'Consulta guiada libera quarto ato');
    w.UI.board();click('ded-check');choose('timeline','9');click('mini-check');check(!w.UI.state.deduced,'Linha do tempo exige o instante da transição');choose('timeline','8');click('mini-check');dialogue();check(w.UI.state.deduced,'Investigação do horário conecta as provas');talk('rosangela');check(w.UI.state.revealed&&w.UI.state.act===5,'Conversa libera recuperação');
    talk('pinheiro');talk('wanderson');w.Engine.enter('factory');interact('santalog');click('deploy');check(w.UI.state.ending===null&&Boolean(d.getElementById('restore-plan')),'Deploy incompleto mostra pendência, sem criar final alternativo');click('restore-plan');check(d.getElementById('mini-check').disabled,'Painel com alertas bloqueia a rotina');for(const i of [0,4,8])d.querySelector('[data-lock="'+i+'"]').click();click('mini-check');dialogue();check(w.UI.state.setup===4,'Painel de luzes libera recuperação segura');
    click('test-deliveries');dialogue();click('run-code');check(d.getElementById('code-finish').disabled,'Teste guiado exige preencher expectativas');choose('expected-total','2400000');choose('expected-dupes','0');click('run-code');click('code-finish');check(w.UI.state.tests&&Boolean(w.Engine.cinematic),'Teste guiado aprova e encena validação');dialogue();click('deploy');check(w.UI.state.ending===null,'Cartões pendentes impedem publicação, mantendo um único final');
    click('test-extras');check(d.getElementById('mini-check').disabled,'Memória exige encontrar quatro pares');
    // Descobre pares observando somente os cartões virados, como o jogador.
    const known=new Map();for(let i=0;i<8;i++){const el=d.querySelector('[data-memory="'+i+'"]');if(el.disabled)continue;el.click();const label=d.querySelector('[data-memory="'+i+'"]').getAttribute('aria-label');known.set(i,label.match(/\d+/)[0]);if(i%2===1)await wait(950);}
    await wait(950); // Deixa a última dupla incorreta voltar ao verso.
    for(const key of new Set(known.values())){const indexes=[...known].filter(([,v])=>v===key).map(([i])=>i);if(indexes.length===2)for(const i of indexes){const el=d.querySelector('[data-memory="'+i+'"]');if(!el.disabled)el.click();}await wait(950);}
    // Caso uma dupla já tenha combinado na descoberta, ela permanece marcada.
    check(!d.getElementById('mini-check').disabled,'Jogo da memória reconhece os quatro pares');click('mini-check');dialogue();
    for(const item of w.Secrets.items){w.UI.close();w.Engine.enter(item.scene,{x:item.x,y:item.y+14});w.UI.interact(item.id,'secret');dialogue();}check(w.Secrets.complete(w.UI.state),'Todos os cinco segredos são coletáveis');const collected=w.UI.state.secrets.slice();w.UI.state.secrets=[];
    w.UI.close();w.UI.pause();click('sound-settings');const volume=d.getElementById('music-volume');volume.value='17';volume.dispatchEvent(new w.Event('input',{bubbles:true}));check(w.UI.state.audio.music===.17,'Volume de música independente');if(w.UI.state.muted)click('mute-settings');click('mute-settings');check(w.UI.state.muted,'Som pode ser silenciado');click('mute-settings');click('audio-back');w.UI.close();interact('santalog');click('deploy');await wait(1800);check(w.UI.state.ending==='complete'&&w.Finale.active,'Deploy correto inicia o único encerramento');
    const stages=new Set();for(let i=0;i<650&&w.Finale.active;i++){stages.add(d.getElementById('finale-stage')?.dataset.stage);w.UI.interact('willian','npc');checkNoDialogue();await wait(100);}function checkNoDialogue(){if(d.getElementById('next-line')&&!d.getElementById('overlay').hidden)throw Error('NPC voltou a conversar durante o encerramento');}
    for(const stage of ['exit','walk','party','moon','santa'])check(stages.has(stage),'Cena final exibiu: '+stage);check(w.UI.state.finaleSeen&&Boolean(d.getElementById('christmas-photo')),'Final chega à fotografia e salva conclusão');w.UI.interact('tiago','npc');check(Boolean(d.getElementById('christmas-photo')),'NPCs não repetem diálogos depois do final');click('replay-finale');check(w.Finale.active,'Celebração pode ser revista');click('finale-skip');check(!w.Finale.active&&Boolean(d.getElementById('christmas-photo')),'Pular leva à foto sem liberar exploração');click('credits');check(!d.getElementById('postcredits-play'),'Sem achados, pós-crédito permanece bloqueado');click('credits-photo');w.UI.state.secrets=collected;click('credits');click('postcredits-play');check(w.Finale.active,'Todos os achados liberam cutscene após créditos');await wait(3200);check(d.getElementById('finale-caption').textContent.includes('SOCORRO'),'Willian pede socorro no trenó');click('finale-skip');check(Boolean(d.getElementById('secret-photo'))&&w.UI.state.postcreditsSeen,'Pós-crédito chega à ilustração e persiste');click('secret-back');click('end-menu');click('continue');check(w.UI.state.ending==='complete'&&Boolean(d.getElementById('christmas-photo')),'Continuar concluído retorna à foto');
    frame.src='../index.html?qa-reload='+Date.now();await new Promise(resolve=>frame.onload=resolve);w=frame.contentWindow;d=w.document;for(let i=0;i<100&&!d.getElementById('continue');i++)await wait(100);click('continue');check(w.UI.state.ending==='complete'&&w.UI.state.finaleSeen&&w.UI.state.audio.music===.17&&w.UI.state.secrets.length===5&&w.UI.state.postcreditsSeen,'Conclusão e volumes persistem após recarregar');click('end-menu');click('new-game');click('confirm-reset');click('finale-skip');dialogue();check(w.UI.state.act===1&&w.UI.state.ending===null&&!d.body.classList.contains('game-finished'),'Nova partida reativa exploração e limpa encerramento');
    interact('santalog');click('test-start');click('skip-scene');
    check(w.UI.state.clues.includes('incident')&&!w.Engine.cinematic&&!w.Engine.paused,'Pular cutscene conclui evento sem bloquear jogador');
    check(!d.body.classList.contains('cinematic')&&d.getElementById('cinema-status').hidden,'Pular cena remove efeitos e restaura HUD');
    report.className='ok';report.textContent+='\nAPROVADO: '+checks+' verificações. Campanha completa, diálogos, cutscenes, Willian, minigames distintos, encerramento único e save.\n';
  }catch(error){report.className='bad';report.textContent+='\nFALHOU: '+error.message+'\n'+error.stack;console.error(error);}finally{if(previous===null)localStorage.removeItem('ultimo-deploy-v1');else localStorage.setItem('ultimo-deploy-v1',previous);if(w.UI){w.UI.state.started=false;w.UI.menu();}run.disabled=false;}
};
