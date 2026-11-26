/* Conteúdo narrativo separado do motor e das interfaces. */
window.Story = (() => {
  const actors = {
  "claudionei": {
    "name": "Claudionei",
    "role": "Memória e backups da Fábrica",
    "color": "#b79554",
    "hair": "#302a25",
    "skin": "#c99b78",
    "scene": "factory",
    "x": 390,
    "y": 320,
    "beard": "#514032",
    "beardStyle": "short",
    "hairStyle": "fringe"
  },
  "fabricio": {
    "name": "Fabrício",
    "role": "Professor • plantonista involuntário",
    "color": "#719e83",
    "hair": "#53453d",
    "skin": "#ddb295",
    "bald": true,
    "sideHair": true,
    "glasses": false,
    "beard": "#645044",
    "beardStyle": "stubble"
  },
  "tiago": {
    "name": "Tiago",
    "role": "Histórico de commits",
    "color": "#8c84b5",
    "hair": "#858681",
    "skin": "#dab18d",
    "glasses": true,
    "build": "slim",
    "scene": "factory",
    "x": 386,
    "y": 213,
    "hairStyle": "receding",
    "temple": "#adb0aa"
  },
  "heineck": {
    "name": "Heineck",
    "role": "Servidores e conexões",
    "color": "#8b634a",
    "hair": "#3e352e",
    "skin": "#dfb298",
    "build": "tall",
    "oversized": true,
    "scene": "server",
    "x": 390,
    "y": 265,
    "hairStyle": "swept",
    "beard": "#75604d",
    "beardStyle": "goatee",
    "temple": "#938777"
  },
  "rosangela": {
    "name": "Rosangela",
    "role": "Espírito natalino em pessoa",
    "color": "#ba7984",
    "hair": "#957149",
    "skin": "#dfb194",
    "hairStyle": "bob",
    "scene": "campus",
    "x": 1743,
    "y": 652,
    "hairHighlight": "#b89562"
  },
  "pinheiro": {
    "name": "Fábio",
    "role": "Nenhuma hipótese sem teste",
    "color": "#80a888",
    "hair": "#2c2522",
    "skin": "#b88767",
    "scene": "campus",
    "x": 1110,
    "y": 1070,
    "hairStyle": "crop",
    "beard": "#514031",
    "beardStyle": "stubble"
  },
  "aresi": {
    "name": "Aresi",
    "role": "Português • suporte semântico",
    "color": "#b5a184",
    "hair": "#b3a388",
    "skin": "#dfb491",
    "glasses": true,
    "beard": "#766452",
    "hairStyle": "quiff",
    "scene": "campus",
    "x": 1432,
    "y": 706,
    "hairSides": "#4c4038",
    "beardStyle": "stubble"
  },
  "leila": {
    "name": "Leila",
    "role": "Os números contam uma história",
    "color": "#b18cac",
    "hair": "#68503c",
    "skin": "#e7bda7",
    "hairStyle": "shoulder",
    "scene": "library",
    "x": 399,
    "y": 242,
    "hairHighlight": "#8d7154"
  },
  "diego": {
    "name": "Diego",
    "role": "Diagnóstico em Python",
    "color": "#6aada7",
    "hair": "#4c433a",
    "skin": "#e4bba1",
    "scene": "campus",
    "x": 927,
    "y": 643,
    "hairStyle": "receding"
  },
  "wanderson": {
    "name": "Wanderson",
    "role": "Garantia de qualidade natalina",
    "color": "#8a9fc3",
    "hair": "#3c322c",
    "skin": "#e4bca0",
    "scene": "factory",
    "x": 490,
    "y": 320,
    "hairStyle": "wavy",
    "beard": "#594638",
    "beardStyle": "goatee"
  },
  "willian": {
    "name": "Willian",
    "role": "Estagiário • suporte e dicas",
    "color": "#e5e6df",
    "hair": "#352c26",
    "skin": "#e0bba3",
    "hairStyle": "curly-fade",
    "badge": true,
    "scene": "factory",
    "x": 155,
    "y": 234,
    "chain": true
  }
};
  const clues = {
    claudionei:{title:'O arquivo da versão',source:'Claudionei',text:'Um backup guarda a imagem da versão publicada. Antes de mexer no sistema, reconstrua o mosaico do arquivo e confira o histórico.'},
    incident:{title:'Fila vazia, disco intacto',source:'SantaLog',text:'Às 23:08 a fila de produção caiu de 2.400.000 para zero. O espaço usado no disco não mudou.'},
    tiago:{title:'A versão certa é a v2.4',source:'Tiago',text:'Produção recebeu v2.4 às 22:48. Um commit posterior permaneceu na branch de testes. Uma mensagem simpática não garante uma mudança inofensiva.'},
    heineck:{title:'Os servidores respondem',source:'Heineck',text:'Energia, rede e serviço estão disponíveis. Uma conexão bem-sucedida pode levar ao destino errado.'},
    rosangela:{title:'Alguém decorou o painel',source:'Rosangela',text:'Rosangela estava na copa depois de deixar o painel mais natalino. O terminal registrou uma ação às 23:08.'},
    aresi:{title:'O presente foi para o ensaio',source:'Aresi',text:'Na tela apareceu “destino: ensaio” quando Rosangela clicou numa estrelinha. Ensaio é teste, não produção textual.'},
    leila:{title:'A soma continua a mesma',source:'Leila',text:'Há 2.400.000 registros no total, inclusive os pedidos prioritários. Procure fora da fila de produção e confira o lote.'},
    diego:{title:'Diagnóstico sem destruição',source:'Diego',text:'O script pinguim.py não encontrou DELETE. O evento route.changed ocorreu às 23:08. Diagnosticar não é apagar e começar de novo.'},
    pinheiro:{title:'Critério de aceitação',source:'Fábio',text:'Só aprovo se o total restaurado for 2.400.000, com zero duplicatas e destino produção. “Na minha máquina” não é um ambiente.'},
    wanderson:{title:'Lembretes também contam',source:'Wanderson',text:'Entregas, cartões e rastreamento precisam passar nos testes antes da comemoração.'},
    commits:{title:'O Modo Natal chegou à produção',source:'Histórico de commits',text:'c18 e f24 compõem v2.4. f24 introduziu Modo Natal, que troca route para sandbox. d25 nunca foi publicado.'},
    network:{title:'Infraestrutura saudável; rota errada',source:'Diagnóstico de rede',text:'Todos os componentes respondem. A variável route aponta para sandbox. É configuração, não queda de rede.'},
    database:{title:'2.400.000 entregas em sandbox',source:'Consulta de dados',text:'O lote NATAL-24 está completo, pendente e sem duplicatas em sandbox. Deve ser migrado com os mesmos IDs, nunca recriado.'},
    deduction:{title:'Uma decoração com efeito colateral',source:'Quadro de evidências',text:'Modo Natal publicado → clique às 23:08 → rota sandbox. Rosangela ativou uma opção ambígua, sem intenção de causar o incidente.'},
    confession:{title:'Desligar não desfaz o passado',source:'Rosangela',text:'Rosangela confirma o clique e ajuda a recuperar o lote. Desativar o modo impede novos desvios, mas não move os registros antigos.'}
    ,willian:{title:'O estagiário deixou tudo registrado',source:'Willian',text:'Willian só ordenou os presentes por região no commit c18. Os testes passaram. Ele pede que confiram a mudança antes de culpar o estagiário.'}
    ,innocence:{title:'Willian fez tudo certinho',source:'Histórico + testes do c18',text:'O commit de Willian altera apenas a ordem das entregas. Seus testes passaram antes da publicação; ele não criou nem ativou o Modo Natal. As evidências descartam a suspeita sobre o estagiário.'}
  };
  const acts=['O desastre','Os suspeitos','A investigação','A revelação','O último deploy'];
  const required=['rosangela','aresi','heineck','leila','diego','claudionei'];
  const dialogues={
    claudionei:[['claudionei','Antes de sair mexendo em tudo, eu guardei uma cópia da versão publicada.'],['fabricio','Boa. O arquivo abre?'],['claudionei','Abre, mas o visualizador embaralhou os pedaços da imagem. Reconstrói o mosaico no terminal de commits.'],['willian','É tipo organizar as peças na mesa. O espaço vazio é seu amigo, professor.'],['claudionei','Depois disso, os registros ficam legíveis. A gente investiga com calma e com backup.']],
    willian:[['willian','Fabrício, você viu o jeito que estão me olhando? Caiu o sistema e já sobrou pro estagiário.'],['fabricio','Calma. O que você alterou?'],['willian','Só a ordem dos presentes por região. Testei, registrei o commit e deixei tudo certinho. Pode conferir.'],['willian','Salva minha reputação, Fabrício! Meu primeiro Natal aqui não pode terminar num relatório de incidente.'],['fabricio','A gente vai olhar os registros. Ninguém vai levar a culpa só por ser estagiário.'],['willian','Fechou. Se travar na investigação, vem falar comigo. Já separei umas pistas.']],
    tiago:[['tiago','A fila zerou, mas o disco continua cheio. Estranho, né?'],['fabricio','Alguém mexeu nisso hoje?'],['tiago','O Willian organizou os presentes por região. Já estão olhando torto pra ele, mas eu ainda não conferi o histórico.'],['fabricio','Então vamos conferir antes de apontar o dedo.'],['tiago','Isso. Fala com o pessoal pelo campus. O Heineck olha a rede, a Leila confere os dados e o Diego tem um diagnóstico.'],['tiago','Rosangela e Aresi estavam perto do painel. Depois volta aqui pra gente olhar os commits.']],
    heineck:[['heineck','Ping respondeu, servidor respondeu, até o café respondeu. Só as entregas estão em silêncio.'],['fabricio','Reiniciar tudo?'],['heineck','Meu presente de Natal é você não fazer isso. Siga a conexão até o destino: estar conectado não significa estar no lugar certo.'],['heineck','O diagnóstico fica aqui no rack. Depois dos depoimentos, verificamos os quatro componentes.']],
    rosangela:[['rosangela','Fabrício! Fiz café. Também deixei uma coisinha mais natalina antes de vir para a copa.'],['fabricio','Uma coisinha onde?'],['rosangela','No painel. Tinha uma estrelinha tão sem graça… Mas vamos achar essas entregas. Quer ajuda?'],['fabricio','Quero. E vou guardar a informação sobre a estrelinha.']],
    aresi:[['fabricio','A produção caiu!'],['aresi','Produção textual?'],['fabricio','Não, professor. O deploy!'],['aresi','Esse Deploy é aluno de qual turma?'],['fabricio','É o sistema de presentes. Você viu algo no computador?'],['aresi','Vi Rosangela clicar numa estrela. Depois apareceu “destino: ensaio”. Achei ótimo: todo bom texto começa com um ensaio.'],['fabricio','Ensaio… ambiente de testes. Professor, isso foi muito útil.'],['aresi','Disponha. E essa tal branch é uma figura de linguagem?']],
    leila:[['leila','Zero na tela não significa zero no banco. Somei os lotes: o total ainda é 2.400.000.'],['fabricio','Dá para mandar tudo outra vez?'],['leila','Só se quiser que cada criança ganhe dois presentes e uma explicação contábil. Preserve os IDs.'],['leila','Meu computador permite filtrar ambiente e lote. Procure também os registros prioritários.']],
    diego:[['diego','Apresento o pinguim.py. Ele não voa, mas encontra erro de configuração.'],['fabricio','Preciso saber Python?'],['diego','Só ler o relatório: zero exclusões; uma troca de rota às 23:08. O script é educado, não altera nada.'],['fabricio','Um pinguim que não mexe na produção. Já merece promoção.']],
    pinheiro:[['pinheiro','Qual é a hipótese?'],['fabricio','O espírito do Natal entrou no servidor.'],['pinheiro','Rejeitada por falta de teste reproduzível. Traga total, duplicatas e destino.'],['pinheiro','Quando soubermos a causa, ajudo na validação. E sem “funciona na minha máquina”.']],
    wanderson:[['wanderson','Tenho testes de entrega, cartões e rastreamento. O Papai Noel pediu “só uma coisinha simples”.'],['fabricio','Claro. Uma coisinha simples com 2,4 milhões de usuários.'],['wanderson','Na recuperação, a gente confere as entregas e também os cartões. Ninguém vai receber o nome do vizinho.']]
  };
  const reveal=[['fabricio','ROSANGELA, VOCÊ ATIVOU O MODO NATAL?'],['rosangela','Ativei! Ficou tão bonitinho, né?'],['fabricio','VOCÊ MANDOU O NATAL INTEIRO PRO AMBIENTE DE TESTES!'],['rosangela','Quer que eu desative?'],['fabricio','Quero… mas o botão não traz as entregas antigas de volta.'],['rosangela','Então eu ajudo. Se eu soube mandar o Natal para o ensaio, também posso ajudar na estreia.'],['fabricio','Fechado. Sem culpa, com backup. Vou chamar Fábio e Wanderson.'],['rosangela','E depois vamos trocar o nome desse botão. “Muda o ambiente inteiro” seria mais honesto.']];
  const recovery={pinheiro:[['pinheiro','Agora temos evidências. Faça um backup, corrija a rota e só então recupere o lote.'],['pinheiro','Estou com você na revisão. O teste deve verificar total, unicidade e destino, não só a cor verde do painel.']],wanderson:[['wanderson','Preparei o ambiente de validação. Um cartão com erro não deve impedir a entrega do presente.'],['wanderson','Depois das entregas, confira os cartões e o rastreamento. A gente termina isso junto.']],rosangela:[['rosangela','Já etiquetei o botão: “NÃO É DECORAÇÃO”. Também ajudo a conferir as etiquetas dos presentes.']]};
  const extras={claudionei:'Backup do sistema, backup da receita do bolo. Aprendi a priorizar.',tiago:'Mensagem de commit “agora vai” deveria vir com direito de arrependimento.',heineck:'O cabo está conectado. Minha contribuição para a ceia já é maior que a de muita gente.',rosangela:'A estrela da árvore não está conectada ao servidor. Conferi duas vezes.',pinheiro:'O único teste que aceito pular é o teste de paciência. E ainda assim, com ressalvas.',aresi:'Corrigi a mensagem de erro: “Houve problemas”. Ao menos agora ela está gramaticalmente correta.',leila:'Dados são como panetone: se sumiu metade, alguém precisa explicar.',diego:'O pinguim.py usa zero inteligência artificial e cem por cento cachecol.',wanderson:'O teste “Papai Noel cabe na chaminé” ficou fora do escopo.',willian:'Eu trouxe panetone pra dividir. Mas, depois dessa, minha fatia vem com pedido de desculpas.'};
  return {actors,clues,acts,required,dialogues,reveal,recovery,extras};
})();
