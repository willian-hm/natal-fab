/* Interações de computador: peças arrastáveis, circuitos, binário e código. */
window.MiniGames=(()=>{
  let cleanup=()=>{};
  const $=s=>document.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dispose(){cleanup();cleanup=()=>{};document.querySelectorAll('.drag-ghost').forEach(e=>e.remove());}
  function actions(run='Verificar montagem'){return `<div id="feedback" class="feedback" role="status"></div><div class="mini-actions"><button id="mini-check" class="primary">${run}</button><button id="mini-hint">Dica do Willian</button></div>`;}
  function help(api,text){api.hint(text);}
  function arranging(api,{title,subtitle,cards,slots,answer,onCheck,notes=''}){
    let chosen=null,assignments=Array(slots.length).fill(null),drag=null,suppressClick=false;
    api.show(`${api.head(title,subtitle)}<p class="mini-instructions">Arraste as peças para os espaços. Também pode selecionar uma peça e clicar no destino; com teclado, use Tab e Enter.</p>${notes}<div id="arrangement"></div>${actions()}`,'puzzle',true);
    function draw(){
      $('#arrangement').innerHTML=`<div class="assembly-slots">${slots.map((s,i)=>{const c=cards.find(c=>c.id===assignments[i]);return `<button data-slot="${i}" class="assembly-slot ${c?'filled':''}" aria-label="Espaço ${i+1}: ${esc(s)}${c?', '+esc(c.title):', vazio'}"><span class="slot-label">${i+1}. ${s}</span>${c?`<strong>${c.title}</strong><small>${c.text}</small>`:'<span class="slot-empty">Solte uma peça aqui</span>'}</button>`;}).join('')}</div><div class="piece-tray" aria-label="Peças disponíveis">${cards.filter(c=>!assignments.includes(c.id)).map(c=>`<button class="puzzle-piece ${chosen===c.id?'selected':''}" data-piece="${c.id}" aria-pressed="${chosen===c.id}"><span>${c.tag||'PEÇA'}</span><strong>${c.title}</strong><small>${c.text}</small></button>`).join('')}</div><p class="mini-help">${chosen?'Peça selecionada. Escolha um espaço.':'Clique em um espaço preenchido para devolver a peça à bandeja.'}</p>`;
      for(const b of document.querySelectorAll('[data-piece]')){
        b.onclick=()=>{if(suppressClick){suppressClick=false;return;}chosen=b.dataset.piece;draw();document.querySelector(`[data-piece="${chosen}"]`)?.focus();};
        b.onpointerdown=e=>{if(e.button!==0)return;drag={id:b.dataset.piece,x:e.clientX,y:e.clientY,pointer:e.pointerId,source:b,moved:false,ghost:null};};
      }
      for(const b of document.querySelectorAll('[data-slot]'))b.onclick=()=>{const i=Number(b.dataset.slot);if(chosen){put(i,chosen);}else{assignments[i]=null;draw();document.querySelector(`[data-slot="${i}"]`)?.focus();}};
    }
    function put(i,id){assignments=assignments.map(v=>v===id?null:v);assignments[i]=id;chosen=null;draw();GameAudio.play('drop');document.querySelector(`[data-slot="${i}"]`)?.focus();}
    function move(e){
      if(!drag||e.pointerId!==drag.pointer)return;
      if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){drag.moved=true;drag.ghost=drag.source.cloneNode(true);drag.ghost.className='puzzle-piece drag-ghost';drag.ghost.removeAttribute('data-piece');drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);drag.source.setPointerCapture?.(e.pointerId);}
      if(drag.moved){e.preventDefault();drag.ghost.style.left=(e.clientX-80)+'px';drag.ghost.style.top=(e.clientY-26)+'px';document.querySelectorAll('[data-slot]').forEach(el=>el.classList.toggle('drop-hover',el===document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]')));}
    }
    function up(e){if(!drag)return;const d=drag;drag=null;d.ghost?.remove();document.querySelectorAll('.drop-hover').forEach(el=>el.classList.remove('drop-hover'));if(d.moved){suppressClick=true;const slot=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');if(slot)put(Number(slot.dataset.slot),d.id);else{chosen=d.id;draw();}setTimeout(()=>suppressClick=false,0);}}
    function cancel(){drag?.ghost?.remove();drag=null;document.querySelectorAll('.drop-hover').forEach(el=>el.classList.remove('drop-hover'));}
    document.addEventListener('pointermove',move,{passive:false});document.addEventListener('pointerup',up);document.addEventListener('pointercancel',cancel);
    cleanup=()=>{cancel();document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);document.removeEventListener('pointercancel',cancel);};
    draw();$('#mini-check').onclick=()=>{if(assignments.some(v=>!v)){api.feedback('Ainda há espaços vazios. Complete a montagem.');return;}onCheck(assignments);};
    $('#mini-hint').onclick=()=>help(api,answer);
    return {read:()=>assignments.slice()};
  }
  function commits(api){
    arranging(api,{title:'Reconstruir a versão v2.4',subtitle:'GIT / QUEBRA-CABEÇA DO DEPLOY',slots:['Mudança recebida','Verificação','Última mudança','Publicação'],notes:'<div class="note">A versão foi publicada às 22:48. Reconstrua apenas a linha que chegou à produção, em ordem de horário.</div>',cards:[
      {id:'f24',tag:'22:42 · MAIN',title:'f24 · Modo Natal',text:'Botão experimental adicionado à v2.4.'},
      {id:'d25',tag:'23:02 · TESTE-LIMPEZA',title:'d25 · Limpeza',text:'Branch local; nunca foi publicada.'},
      {id:'publish',tag:'22:48 · RELEASE',title:'Publicar v2.4',text:'Inclui as mudanças aprovadas da main.'},
      {id:'c18',tag:'22:10 · WILLIAN',title:'c18 · Ordenação',text:'Organiza os presentes por região.'},
      {id:'test',tag:'22:12 · CI',title:'Testes do c18',text:'Ordem correta. IDs e destinos preservados.'},
      {id:'color',tag:'23:06 · RASCUNHO',title:'Título dourado',text:'Alteração não enviada ao servidor.'}
    ],answer:'Comece no c18 das 22:10. Seus testes vieram depois. f24 entrou às 22:42; publicar v2.4 foi a última ação. As branches locais ficam de fora.',onCheck(order){
      if(order.join()!==PuzzleRules.release.join()){api.feedback('A sequência não corresponde à release. Compare os horários e deixe de fora os rascunhos locais.');return;}
      api.show(`${api.head('O que esse botão realmente faz?','GIT / INSPECIONAR f24')}<div class="note">c18: testes aprovados. Willian não mudou o destino das entregas.</div><p>Clique na linha do diff que explica o desaparecimento da fila. Uma delas altera muito mais que a decoração.</p><div class="code-diff"><button data-diff="color"><span>01</span> + decoracao = "festiva"</button><button data-diff="route"><span>02</span> + rota = "sandbox"</button><button data-diff="star"><span>03</span> + icone = "estrela"</button></div><div id="feedback" class="feedback" role="status"></div><button id="mini-hint">Dica do Willian</button>`,'puzzle',true);
      document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>b.dataset.diff==='route'?api.success('commits'):api.feedback('Essa linha muda a aparência. Procure a alteração que muda para onde as entregas vão.'));
      $('#mini-hint').onclick=()=>help(api,'Rota é o destino do pedido. Sandbox é o ambiente de testes.');
    }});
  }
  function network(api){
    let masks=PuzzleRules.circuitStart.slice(),traced=false;
    api.show(`${api.head('Siga o pacote','REDE / PAINEL DE DIAGNÓSTICO')}<p>O desenho das conexões se embaralhou. Gire os conectores para ligar todos os pontos; depois envie um pacote de diagnóstico. Isso não altera a rede real do SantaLog.</p><div class="circuit-layout"><div id="circuit" class="circuit-grid" aria-label="Circuito de quatro por quatro"></div><div class="terminal" id="trace-output">Energia estável ✓\nGateway disponível ✓\n\nMonte o circuito para descobrir o destino.</div></div>${actions('Enviar pacote')}`,'puzzle',true);
    const labels={0:'Entrada',2:'Gateway',9:'SantaLog',15:'Destino'};
    function draw(){const result=PuzzleRules.circuit(masks);$('#circuit').innerHTML=masks.map((mask,i)=>`<button data-wire="${i}" class="wire ${result.lit.includes(i)?'powered':''} ${!mask?'blank':''}" ${!mask?'disabled':''} aria-label="Conector ${i+1}${labels[i]?', '+labels[i]:''}; girar"><svg viewBox="0 0 64 64" aria-hidden="true">${[[1,32,0],[2,64,32],[4,32,64],[8,0,32]].filter(([bit])=>mask&bit).map(([,x,y])=>`<path d="M32 32 L${x} ${y}"/>`).join('')}<circle cx="32" cy="32" r="5"/></svg><small>${labels[i]||''}</small></button>`).join('');
      for(const b of document.querySelectorAll('[data-wire]'))b.onclick=()=>{const i=Number(b.dataset.wire);masks[i]=PuzzleRules.rotate(masks[i]);traced=false;draw();document.querySelector(`[data-wire="${i}"]`)?.focus();GameAudio.play('tap');};}
    draw();$('#mini-check').onclick=()=>{const r=PuzzleRules.circuit(masks);if(!r.complete){api.feedback(`O pacote alcança ${r.lit.length} ponto(s), mas há conexão aberta. Alinhe as pontas dos conectores vizinhos.`);return;}
      if(traced){api.success('network');return;}traced=true;$('#circuit').classList.add('transmitting');$('#trace-output').textContent='PACOTE RECEBIDO ✓\n\nEnergia: OK\nGateway: OK\nSantaLog: OK\nDestino: SANDBOX\n\nÚltima troca de rota: 23:08\nEvento: Modo Natal\n\nA infraestrutura funciona.\nA configuração aponta para testes.';$('#mini-check').textContent='Registrar o destino encontrado';api.feedback('Pacote entregue. Leia o destino revelado no monitor.',true);};
    $('#mini-hint').onclick=()=>help(api,'Siga a luz desde a Entrada. A bifurcação liga o Gateway à direita e desce até SantaLog; daí o caminho segue à direita e termina embaixo. Cada ponta precisa encontrar outra ponta.');
  }
  function database(api){
    let bits=[0,0,0,0,0];
    api.show(`${api.head('A etiqueta veio em binário','DADOS / DECODIFICAR O LOTE')}<p>O arquivo está identificado pelo dia do Natal: <strong>24</strong>. Ative os bits cuja soma forma 24. Cada posição vale o dobro da posição à direita.</p><div class="binary-target">LOTE NATAL–<strong>24</strong></div><div id="bits" class="binary-bits"></div><div id="bit-sum" class="binary-sum"></div><label class="binary-read"><span>O cabeçalho também diz <code>00101</code>. Quantas regiões há no arquivo?</span><input id="region-answer" type="number" inputmode="numeric" min="0" max="31" placeholder="Valor decimal" aria-label="Converter 00101 para decimal"></label>${actions('Abrir arquivo')}`,'puzzle',true);
    function draw(){ $('#bits').innerHTML=bits.map((b,i)=>`<button data-bit="${i}" class="bit ${b?'on':''}" aria-pressed="${Boolean(b)}" aria-label="Bit de valor ${2**(4-i)}"><small>${2**(4-i)}</small><strong>${b}</strong><span>${b?'ligado':'desligado'}</span></button>`).join('');$('#bit-sum').textContent=`${bits.map((v,i)=>v?2**(4-i):0).join(' + ')} = ${PuzzleRules.binary(bits)}`;for(const b of document.querySelectorAll('[data-bit]'))b.onclick=()=>{const i=Number(b.dataset.bit);bits[i]=1-bits[i];draw();document.querySelector(`[data-bit="${i}"]`)?.focus();};}
    draw();$('#mini-check').onclick=()=>{if(PuzzleRules.binary(bits)!==24||$('#region-answer').value.trim()!=='5'){api.feedback('Confira as duas conversões. Em 00101, os bits ligados valem 4 e 1. Para 24, combine os maiores valores necessários.');return;}
      api.transition([['angelita','Isso: lote 24, cinco regiões. Agora precisamos consultar o arquivo.'],['diego','Deixei um programa curto. Troque o ambiente, execute e veja se os números batem.']],()=>code(api,'database'));
    };$('#mini-hint').onclick=()=>help(api,'24 = 16 + 8: ligue os dois primeiros bits. Já 00101 = 4 + 1 = 5. O zero não soma nada.');
  }
  function code(api,mode){
    const tests=mode==='tests';
    const source=tests?'# Complete as três verificações\nconferir("total", 0)\nconferir("duplicatas", 1)\nconferir("destino", "sandbox")':'# Encontre o lote desaparecido\nlote = buscar("producao", "NATAL-24")\nmostrar(total(lote))';
    api.show(`${api.head(tests?'Escreva o teste que protege o Natal':'Uma consulta, cinco regiões',tests?'QA / TESTES ANTES DO DEPLOY':'PINGUIM.PY / CONSULTA SOMENTE LEITURA')}<p>${tests?'Corrija os valores esperados e rode seu programa. Cada verificação compara sua expectativa com o relatório real.':'Este editor usa uma linguagem didática parecida com Python. Corrija o ambiente da consulta e rode o programa para encontrar o total.'}</p><div class="editor-layout"><div><label class="editor-label" for="mini-code">${tests?'testes_natal.py':'consulta_natal.py'}</label><textarea id="mini-code" class="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Editor de código">${source}</textarea><div class="code-toolbar"><button id="run-code" class="primary">▶ Rodar código</button><button id="reset-code">Restaurar exemplo</button></div><pre id="code-output" class="terminal" aria-live="polite">Aguardando execução.</pre></div><aside class="code-manual"><h3>${tests?'Relatório da recuperação':'Manual de bolso'}</h3>${tests?'<p>Total: <b>2.400.000</b><br>Duplicatas: <b>0</b><br>Destino: <b>producao</b></p><code>conferir("campo", esperado)</code><p>Campos: total, duplicatas e destino. Textos ficam entre aspas; números não.</p>':'<code>buscar("ambiente", "lote")</code><p>Ambientes: <b>producao</b> ou <b>sandbox</b>.<br>Lotes: <b>NATAL-24</b> ou <b>DEMO</b>.</p><code>total(lote)</code><p>Soma as entregas das regiões.</p><code>mostrar(valor)</code><p>Escreve o resultado no console.</p>'}<p><code>#</code> inicia um comentário. O código só opera sobre os dados fictícios deste jogo.</p></aside></div><div id="feedback" class="feedback" role="status"></div><div class="mini-actions"><button id="code-finish" disabled class="primary">${tests?'Aprovar testes':'Registrar descoberta'}</button><button id="mini-hint">Dica do Willian</button></div>`,'puzzle',true);
    let success=false;
    $('#mini-code').addEventListener('input',()=>{success=false;$('#code-finish').disabled=true;});
    $('#run-code').onclick=()=>{const r=PuzzleRules.execute($('#mini-code').value,mode);success=r.ok&&r.success;$('#code-finish').disabled=!success;
      $('#code-output').textContent=(r.output.join('\n')||'(nenhuma saída)')+(r.error?'\n\n'+r.error:'')+(!tests&&r.success?'\n\nSul: 400.000 · Sudeste: 800.000\nNorte: 300.000 · Nordeste: 600.000\nCentro-Oeste: 300.000\nIDs únicos: 2.400.000 · Duplicatas: 0\nDestino: sandbox · Lote intacto':'');
      api.feedback(success?(tests?'As três verificações passaram.':'Você encontrou 2.400.000 entregas intactas!'):r.error|| (tests?'Há verificações incorretas ou faltando. Compare com o relatório.':'O programa rodou, mas ainda não encontrou o lote completo. Investigue outro ambiente.'),success);
    };
    $('#reset-code').onclick=()=>{$('#mini-code').value=source;success=false;$('#code-finish').disabled=true;$('#code-output').textContent='Exemplo restaurado.';};
    $('#code-finish').onclick=()=>{if(!success)return;tests?api.testsDone():api.success('database');};
    $('#mini-hint').onclick=()=>help(api,tests?'Mantenha os três comandos conferir. Os valores corretos são 2400000, 0 e "producao", na ordem dos campos do relatório.':'Na primeira linha do programa, troque "producao" por "sandbox". Mantenha NATAL-24 e a chamada mostrar(total(lote)). Depois clique em Rodar código.');
  }
  function deduction(api){arranging(api,{title:'Reconstrua o que aconteceu',subtitle:'EVIDÊNCIAS / CAUSA E CONSEQUÊNCIA',slots:['Mudança publicada','Acontecimento às 23:08','Resultado observado'],cards:[
    {id:'redirect',title:'Lote em sandbox',text:'Os mesmos 2.400.000 IDs aparecem em testes.'},
    {id:'delete',title:'Exclusão de presentes',text:'Hipótese: os registros foram apagados.'},
    {id:'click',title:'Clique na estrelinha',text:'Aresi viu Rosangela no painel às 23:08.'},
    {id:'mode',title:'f24 · Modo Natal',text:'A opção altera a rota quando é ativada.'},
    {id:'intern',title:'Ordenação do estagiário',text:'c18 só ordena; os testes preservam os destinos.'}
  ],answer:'A causa começa na opção publicada em f24. O clique dispara a ação. O efeito é o lote intacto em outro ambiente — não uma exclusão.',onCheck(order){order.join()==='mode,click,redirect'?api.deductionDone():api.feedback('A cadeia precisa explicar as três provas ao mesmo tempo. A ordenação do Willian não muda destinos.');}});}
  function restoration(api){
    const all=[{id:'backup',title:'Criar backup',text:'Protege o lote antes de qualquer alteração.'},{id:'route',title:'Corrigir rota',text:'Define produção como destino das novas entregas.'},{id:'migrate',title:'Migrar o lote',text:'Move os registros existentes com os mesmos IDs.'},{id:'disable',title:'Bloquear Modo Natal',text:'Impede que outro clique volte a desviar a rota.'}];
    const remaining=all.slice(api.setup);if(!remaining.length){api.restored();return;}
    arranging(api,{title:'Monte a rotina de recuperação',subtitle:'SANTALOG / SEQUÊNCIA SEGURA',slots:remaining.map((_,i)=>`Etapa ${api.setup+i+1}`),cards:[...remaining].reverse(),notes:'<div class="note">Planeje a sequência antes de executar. Preserve primeiro, corrija o destino, recupere os dados e bloqueie o botão.</div>',answer:'A ordem segura é backup, rota, migração e bloqueio do Modo Natal. Se já fez uma etapa, continue a partir da próxima.',onCheck(order){if(order.join()!==remaining.map(c=>c.id).join()){api.feedback('Essa ordem deixa dados desprotegidos ou envia o lote antes de corrigir o destino. Reorganize as peças.');return;}api.restoreDone(order);}});
  }
  function extras(api){
    arranging(api,{title:'Cada cartão no presente certo',subtitle:'EXTRAS / TESTE DE ETIQUETAS',slots:['Pedido 104 · Ana · produção','Pedido 218 · Bruno · produção','Pedido 307 · Lia · produção'],cards:[
      {id:'bruno',tag:'ID 218 · PRODUÇÃO',title:'Bruno',text:'Cartão e rastreio do pedido 218.'},
      {id:'demo',tag:'ID DEMO · SANDBOX',title:'Criança de exemplo',text:'Etiqueta gerada no ambiente de testes.'},
      {id:'lia',tag:'ID 307 · PRODUÇÃO',title:'Lia',text:'Cartão e rastreio do pedido 307.'},
      {id:'ana',tag:'ID 104 · PRODUÇÃO',title:'Ana',text:'Cartão e rastreio do pedido 104.'}
    ],notes:'<div class="note">Teste uma amostra real: combine nome, ID e ambiente. A etiqueta de demonstração não pertence a nenhum presente.</div>',answer:'Use os IDs, não a posição das peças: Ana 104, Bruno 218 e Lia 307. A etiqueta DEMO fica na bandeja.',onCheck(order){order.join()==='ana,bruno,lia'?api.extrasDone():api.feedback('Há um cartão no pedido errado. Compare o nome, o número e o ambiente de cada etiqueta.');}});
  }
  return {dispose,commits,network,database,deduction,restoration,extras,tests:api=>code(api,'tests')};
})();
