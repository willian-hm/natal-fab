/* Máquina de estados e regras puras: usadas pelo jogo e pelos testes. */
window.Campaign = (() => {
  const SAVE_KEY='ultimo-deploy-v1';
  const fresh=()=>({version:1,started:false,act:1,clues:[],talked:[],helpers:[],solved:{commits:false,network:false,database:false},deduced:false,revealed:false,setup:0,tests:false,extras:false,extraTests:false,ending:null,failures:0,hints:0,seconds:0,scene:'factory',position:{x:309,y:296},visited:['factory'],achievements:[],muted:false,audio:{music:.28,effects:.55}});
  function sync(s){
    // Compatibilidade com partidas anteriores à entrada do Willian no elenco.
    if(s.solved.commits){if(!s.clues.includes('innocence'))s.clues.push('innocence');if(!s.achievements.includes('Justiça pelo estagiário'))s.achievements.push('Justiça pelo estagiário');}
    s.act=!s.clues.includes('incident')||!s.talked.includes('tiago')?1:!Story.required.every(id=>s.talked.includes(id))?2:!Object.values(s.solved).every(Boolean)?3:!s.revealed?4:5;
    if(Object.entries(Story.actors).filter(([,a])=>a.scene).every(([id])=>s.talked.includes(id))&&!s.achievements.includes('Todo mundo no plantão'))s.achievements.push('Todo mundo no plantão');
    if(Object.values(s.solved).every(Boolean)&&s.hints===0&&!s.achievements.includes('Sem colar no suporte'))s.achievements.push('Sem colar no suporte');
    return s;
  }
  function clue(s,id){if(Story.clues[id]&&!s.clues.includes(id))s.clues.push(id);sync(s);}
  function talk(s,id){if(!s.talked.includes(id))s.talked.push(id);clue(s,id);}
  function solve(s,id){if(s.act<3)return false;s.solved[id]=true;clue(s,id);return true;}
  function checkCommits(selected,change){return selected.length===2&&selected.includes('c18')&&selected.includes('f24')&&change==='route';}
  function checkNetwork(visited,cause,destination){return ['power','gateway','service','route'].every(id=>visited.includes(id))&&cause==='config'&&destination==='sandbox';}
  function checkDatabase(env,batch,total,action){return env==='sandbox'&&batch==='NATAL-24'&&total==='2400000'&&action==='move';}
  function checkDeduction(s,feature,trigger,result){return Object.values(s.solved).every(Boolean)&&feature==='mode'&&trigger==='click'&&result==='redirect';}
  function restore(s,action){
    if(!s.revealed||!['pinheiro','wanderson'].every(id=>s.helpers.includes(id)))return {ok:false,message:'Converse com Fábio Pinheiro e Wanderson antes de alterar o sistema.'};
    const order=['backup','route','migrate','disable'];
    if(action!==order[s.setup])return {ok:false,message:['Primeiro proteja os dados com um backup.','Corrija o destino antes de mover o lote.','A rota foi corrigida; agora recupere o lote preservando os IDs.','O lote está em produção. Desative o botão experimental para evitar outro desvio.'][s.setup]||'A configuração já está restaurada.'};
    s.setup++;s.tests=false;return {ok:true,message:['Snapshot criado: NATAL-24 seguro.','Destino atualizado para produção.','2.400.000 IDs migrados, sem duplicatas.','Modo Natal bloqueado. Uma estrela de papel foi instalada no lugar.'][s.setup-1]};
  }
  function validate(s,total,dupes,destination){s.tests=s.setup===4&&total==='2400000'&&dupes==='0'&&destination==='production';return s.tests;}
  function deploy(s){
    if(s.setup!==4||!s.tests||(s.extras&&!s.extraTests)){s.failures++;s.ending='chaotic';return 'chaotic';}
    s.ending=s.extras&&s.extraTests?'perfect':'partial';if(s.ending==='perfect'&&!s.achievements.includes('Natal em produção'))s.achievements.push('Natal em produção');return s.ending;
  }
  function objective(s){
    if(!s.clues.includes('incident'))return {title:'Só mais um teste…',desc:'Use o computador SantaLog na Fábrica.',target:'santalog'};
    if(!s.talked.includes('tiago'))return {title:'Temos um problema',desc:'Converse com Tiago, perto da mesa de commits.',target:'tiago'};
    if(s.act===2){const id=Story.required.find(id=>!s.talked.includes(id));return {title:'Ouça o campus',desc:`${Story.required.filter(id=>s.talked.includes(id)).length}/5 depoimentos. Encontre ${Story.actors[id].name}.`,target:id};}
    if(s.act===3){const id=Object.keys(s.solved).find(id=>!s.solved[id]);return {title:{commits:'O que foi publicado?',network:'Siga a conexão',database:'Onde estão os presentes?'}[id],desc:{commits:'Compare a versão publicada no terminal da Fábrica.',network:'Investigue o rack na Sala de Servidores.',database:'Analise o lote no computador da Biblioteca.'}[id],target:id};}
    if(!s.deduced)return {title:'Ligue os pontos',desc:'Reúna as três provas no quadro de evidências.',target:'board'};
    if(!s.revealed)return {title:'Uma conversa na copa',desc:'Converse com Rosangela sobre o Modo Natal.',target:'rosangela'};
    const helper=['pinheiro','wanderson'].find(id=>!s.helpers.includes(id));
    if(helper)return {title:'Ninguém faz deploy sozinho',desc:`Peça a colaboração de ${Story.actors[helper].name}.`,target:helper};
    if(s.ending==='perfect'||s.ending==='partial')return {title:'O Natal está em produção',desc:'Explore o campus, converse e celebre. Você conseguiu.',target:'santalog'};
    return {title:s.setup<4?'Recupere o SantaLog':'O último deploy',desc:s.setup<4?'Volte ao SantaLog. Backup, rota e lote: nessa ordem.':'Valide as entregas e escolha o destino dos extras.',target:'santalog'};
  }
  function save(s,storage){try{storage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}
  function load(storage){try{
    const raw=JSON.parse(storage.getItem(SAVE_KEY));if(!raw||raw.version!==1)return null;
    const s=fresh();for(const key of ['started','deduced','revealed','tests','extras','extraTests','muted'])if(typeof raw[key]==='boolean')s[key]=raw[key];
    for(const key of ['clues','talked','helpers','visited','achievements'])if(Array.isArray(raw[key]))s[key]=[...new Set(raw[key].filter(v=>typeof v==='string'))];
    s.clues=s.clues.filter(id=>Story.clues[id]);s.talked=s.talked.filter(id=>Story.actors[id]);s.helpers=s.helpers.filter(id=>['pinheiro','wanderson'].includes(id));
    for(const id of Object.keys(s.solved))s.solved[id]=raw.solved?.[id]===true;
    for(const key of ['setup','failures','hints','seconds'])if(Number.isFinite(raw[key])&&raw[key]>=0)s[key]=raw[key];s.setup=Math.min(4,Math.floor(s.setup));
    if(['factory','campus','library','server'].includes(raw.scene))s.scene=raw.scene;
    if(Number.isFinite(raw.position?.x)&&Number.isFinite(raw.position?.y))s.position={x:raw.position.x,y:raw.position.y};
    if(['perfect','partial','chaotic'].includes(raw.ending))s.ending=raw.ending;
    for(const key of ['music','effects'])if(Number.isFinite(raw.audio?.[key]))s.audio[key]=Math.max(0,Math.min(1,raw.audio[key]));
    return sync(s);
  }catch{return null;}}
  return {SAVE_KEY,fresh,sync,clue,talk,solve,checkCommits,checkNetwork,checkDatabase,checkDeduction,restore,validate,deploy,objective,save,load};
})();
