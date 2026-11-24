/* Pequenos achados opcionais; nenhum deles muda a solução do incidente. */
window.Secrets=(()=>{
  const items=[
    {id:'duck',name:'Patinho de borracha',scene:'factory',x:567,y:297,icon:'♟',color:'#e7c36f',hint:'Um colega bem quieto acompanha os testes na Fábrica.',line:'O debugger mais antigo da Fábrica: você explica o erro e ele não julga. Diferente do pessoal com o estagiário.'},
    {id:'disk',name:'Disquete do primeiro deploy',scene:'server',x:90,y:219,icon:'▣',color:'#b4b0da',hint:'Nos servidores, nem toda memória está ligada na tomada.',line:'“versao_final_AGORA_VAI”. O Natal tem tradições que a gente prefere não manter.'},
    {id:'book',name:'Manual da chaminé',scene:'library',x:570,y:278,icon:'▤',color:'#c88a85',hint:'Na biblioteca, um manual não parece ser de informática.',line:'Capítulo 1: não fazer deploy pela chaminé. Capítulo 2: nunca subir escondido no trenó. Parece específico demais…'},
    {id:'bell',name:'Guizo perdido',scene:'campus',x:1748,y:735,icon:'♪',color:'#e7c36f',hint:'Um som bem baixinho ficou pelo caminho da copa.',line:'Tá morninho. E tem um adesivo escrito “Polo Norte”. Professor, será que ele já passou por aqui?'},
    {id:'cookie',name:'Biscoito em forma de estrela',scene:'campus',x:1128,y:1160,icon:'★',color:'#d6ad7d',hint:'Uma estrela caiu perto do caminho do pátio.',line:'Cinco achados estranhos numa noite só. Não que eu esteja planejando investigar um trenó… imagina.'}
  ];
  const complete=state=>items.every(item=>state.secrets?.includes(item.id));
  return {items,complete};
})();
