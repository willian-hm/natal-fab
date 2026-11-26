/* Pequenos achados opcionais; nenhum deles muda a solução do incidente. */
window.Secrets=(()=>{
  const items=[
    {id:'duck',name:'Patinho de borracha',scene:'factory',x:567,y:297,icon:'●',color:'#e7c36f',place:'factory',hint:'Na Fábrica, procure um patinho amarelo no lado direito da sala, entre a árvore e a planta.',line:'O debugger mais antigo da Fábrica: você explica o erro e ele não julga. Diferente do pessoal com o estagiário.'},
    {id:'disk',name:'Disquete do primeiro deploy',scene:'server',x:90,y:219,icon:'▣',color:'#b4b0da',place:'server',hint:'Na Sala de Servidores, procure um disquete roxo à esquerda, abaixo dos racks.',line:'“versao_final_AGORA_VAI”. O Natal tem tradições que a gente prefere não manter.'},
    {id:'book',name:'Manual da chaminé',scene:'library',x:570,y:278,icon:'▤',color:'#c88a85',place:'library',hint:'Na Biblioteca, procure um livro rosado no lado direito, perto da mesa de leitura.',line:'Capítulo 1: não fazer deploy pela chaminé. Capítulo 2: nunca subir escondido no trenó. Parece específico demais…'},
    {id:'bell',name:'Guizo perdido',scene:'campus',x:1748,y:735,icon:'♪',color:'#e7c36f',place:'copa',hint:'Do lado de fora da copa, desça pelo caminho e procure um guizo dourado.',line:'Tá morninho. E tem um adesivo escrito “Polo Norte”. Professor, será que ele já passou por aqui?'},
    {id:'cookie',name:'Biscoito em forma de estrela',scene:'campus',x:1128,y:1160,icon:'★',color:'#d6ad7d',place:'patio',hint:'No pátio, siga para baixo de onde está Fábio. Procure um biscoito em forma de estrela.',line:'Cinco achados estranhos numa noite só. Não que eu esteja planejando investigar um trenó… imagina.'}
  ];
  const complete=state=>items.every(item=>state.secrets?.includes(item.id));
  return {items,complete};
})();
