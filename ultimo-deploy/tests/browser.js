/* Harness de integração: roda somente ao abrir tests/browser.html e clicar no botão. */
const frame=document.querySelector('#game-frame'),report=document.querySelector('#result');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
document.querySelector('#run').onclick=async()=>{
  const run=document.querySelector('#run');run.disabled=true;report.textContent='';let previous=localStorage.getItem('ultimo-deploy-v1'),checks=0;
  function check(ok,text){if(!ok)throw Error(text);checks++;report.textContent+='✓ '+text+'\n';}
  let w=frame.contentWindow,d=w.document;
  const click=id=>{const b=d.getElementById(id);if(!b||b.disabled)throw Error('Controle indisponível: '+id);b.click();};
  const choose=(id,v)=>{const el=d.getElementById(id);if(!el)throw Error('Campo ausente: '+id);el.value=v;el.dispatchEvent(new w.Event('change',{bubbles:true}));};
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
    click('new-game');if(d.getElementById('confirm-reset'))click('confirm-reset');
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
    for(const id of ['aresi','diego','rosangela','angelita','heineck','pinheiro','wanderson'])talk(id);
    check(w.UI.state.act===3&&w.UI.state.talked.length===9,'Todos os professores e estagiário presentes na investigação');
    interact('commits');click('mini-check');check(d.querySelector('#feedback').textContent.length>0&&!w.UI.state.solved.commits,'Montagem incompleta não libera evidência');
    assemble(['c18','test','f24','publish']);click('mini-check');d.querySelector('[data-diff="color"]').click();check(!w.UI.state.solved.commits,'Diff decorativo não resolve o incidente');d.querySelector('[data-diff="route"]').click();check(w.UI.state.solved.commits,'Linha publicada montada e alteração da rota identificada');
    check(w.UI.state.clues.includes('innocence')&&w.UI.state.achievements.includes('Justiça pelo estagiário'),'Histórico inocenta Willian com provas e conquista');click('puzzle-done');dialogue();
    talk('willian');check(w.UI.state.act===3,'Conversa de reputação salva preserva a progressão');
    interact('network');click('mini-check');check(!w.UI.state.solved.network,'Circuito aberto não envia diagnóstico');
    w.PuzzleRules.circuitStart.forEach((mask,i)=>{for(let n=0;mask!==w.PuzzleRules.circuitSolution[i]&&n<4;n++){d.querySelector('[data-wire="'+i+'"]').click();mask=w.PuzzleRules.rotate(mask);}});click('mini-check');check(d.getElementById('trace-output').textContent.includes('SANDBOX'),'Pacote revela destino no monitor');click('mini-check');check(w.UI.state.solved.network,'Circuito conectado conclui diagnóstico');
    interact('database');click('mini-check');check(!w.UI.state.solved.database,'Conversão incompleta não abre lote');d.querySelector('[data-bit="0"]').click();d.querySelector('[data-bit="1"]').click();choose('region-answer','5');click('mini-check');dialogue();click('run-code');check(d.getElementById('code-finish').disabled,'Consulta vazia não permite registrar descoberta');
    code('lote = buscar("sandbox", "NATAL-24")\nmostrar(total(lote))');check(!d.getElementById('code-finish').disabled,'Código corrigido encontra lote completo');
    const editor=d.getElementById('mini-code');editor.value+='\ncomando_invalido()';editor.dispatchEvent(new w.Event('input',{bubbles:true}));check(d.getElementById('code-finish').disabled,'Editar código invalida resultado anterior');click('run-code');check(d.getElementById('code-output').textContent.includes('Linha 3'),'Erro de código mostra linha sem quebrar jogo');code('lote = buscar("sandbox", "NATAL-24")\nmostrar(total(lote))');click('code-finish');check(w.UI.state.solved.database&&w.UI.state.act===4,'Consulta libera quarto ato');
    w.UI.board();click('ded-check');assemble(['mode','click','redirect']);click('mini-check');dialogue();check(w.UI.state.deduced,'Quadro conecta as três evidências');talk('rosangela');check(w.UI.state.revealed&&w.UI.state.act===5,'Revelação completa e recuperação desbloqueada');
    talk('pinheiro');talk('wanderson');check(w.UI.state.helpers.length===2,'Equipe de recuperação reunida');
    w.Engine.enter('factory');interact('santalog');click('deploy');await wait(1750);check(w.UI.state.ending==='chaotic'&&Boolean(d.querySelector('#retry')),'Deploy precipitado produz final caótico recuperável');click('retry');
    click('restore-plan');assemble(['migrate','backup','route','disable']);click('mini-check');check(w.UI.state.setup===0,'Ordem insegura não modifica o lote');
    for(const slot of [...d.querySelectorAll('[data-slot]')])d.querySelector('[data-slot="'+slot.dataset.slot+'"]').click();assemble(['backup','route','migrate','disable']);click('mini-check');dialogue();check(w.UI.state.setup===4,'Quatro operações restauram configuração e lote');
    click('test-deliveries');dialogue();click('run-code');check(!w.UI.state.tests&&d.getElementById('code-finish').disabled,'Testes com expectativas erradas falham');code('conferir("total", 2400000)\nconferir("duplicatas", 0)\nconferir("destino", "producao")');click('code-finish');check(w.UI.state.tests&&Boolean(w.Engine.cinematic),'Testes aprovados encenam conferência da equipe');dialogue();
    click('deploy');await wait(1750);check(w.UI.state.ending==='partial','Final parcial com extras desligados');click('improve');click('test-extras');click('enable-extras');assemble(['ana','bruno','lia']);click('mini-check');dialogue();click('deploy');await wait(1750);check(w.UI.state.ending==='perfect','Final perfeito com etiquetas conferidas');click('credits');click('postcredits');dialogue();check(d.querySelector('#overlay').hidden,'Pós-créditos retorna à exploração');
    w.UI.pause();click('sound-settings');const volume=d.getElementById('music-volume');volume.value='17';volume.dispatchEvent(new w.Event('input',{bubbles:true}));check(w.UI.state.audio.music===.17,'Volume de música independente dos efeitos');if(w.UI.state.muted)click('mute-settings');click('mute-settings');check(w.UI.state.muted===true,'Controle silencia música e efeitos');click('mute-settings');check(w.UI.state.muted===false,'Áudio pode ser reativado');click('audio-back');w.UI.close();
    w.UI.pause();click('main-menu');click('continue');check(w.UI.state.ending==='perfect'&&w.UI.state.setup===4,'Continuar preserva final e configuração');
    // Recarregamento real do documento: sem depender do estado em memória.
    frame.src='../index.html?qa-reload='+Date.now();await new Promise(resolve=>frame.onload=resolve);w=frame.contentWindow;d=w.document;for(let i=0;i<100&&!d.getElementById('continue');i++)await wait(100);click('continue');check(w.UI.state.ending==='perfect'&&w.UI.state.solved.database&&w.UI.state.audio.music===.17,'Save e volume persistem após recarregar a página');w.UI.pause();click('restart');click('confirm-reset');dialogue();check(w.UI.state.act===1&&w.UI.state.clues.length===0&&w.UI.state.setup===0,'Reiniciar limpa a campanha');
    interact('santalog');click('test-start');click('skip-scene');
    check(w.UI.state.clues.includes('incident')&&!w.Engine.cinematic&&!w.Engine.paused,'Pular cutscene conclui evento sem bloquear jogador');
    check(!d.body.classList.contains('cinematic')&&d.getElementById('cinema-status').hidden,'Pular cena remove efeitos e restaura HUD');
    report.className='ok';report.textContent+='\nAPROVADO: '+checks+' verificações. Campanha completa, diálogos, cutscenes, Willian, três finais e save.\n';
  }catch(error){report.className='bad';report.textContent+='\nFALHOU: '+error.message+'\n'+error.stack;console.error(error);}finally{if(previous===null)localStorage.removeItem('ultimo-deploy-v1');else localStorage.setItem('ultimo-deploy-v1',previous);if(w.UI){w.UI.state.started=false;w.UI.menu();}run.disabled=false;}
};
