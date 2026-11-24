/* Regras determinísticas dos minigames e interpretador didático sem eval. */
window.PuzzleRules=(()=>{
  const release=['c18','test','f24','publish'];
  const rotate=mask=>((mask<<1)&15)|(mask>>3); // N=1, L=2, S=4, O=8.
  const circuitSolution=[2,14,8,0,0,5,0,0,0,3,10,12,0,0,0,1];
  const circuitStart=circuitSolution.map((m,i)=>{for(let n=0;n<(i%3)+1;n++)m=rotate(m);return m;});
  function circuit(masks,width=4){
    const lit=new Set([0]),queue=[0];let leaks=0;
    while(queue.length){const i=queue.shift(),mask=masks[i]||0;
      for(const [bit,dx,dy,opposite] of [[1,0,-1,4],[2,1,0,8],[4,0,1,1],[8,-1,0,2]])if(mask&bit){
        const x=i%width+dx,y=Math.floor(i/width)+dy,j=y*width+x;
        if(x<0||x>=width||y<0||y>=width||!((masks[j]||0)&opposite)){leaks++;continue;}
        if(!lit.has(j)){lit.add(j);queue.push(j);}
      }
    }
    return {lit:[...lit],leaks,complete:masks.some(Boolean)&&leaks===0&&masks.every((m,i)=>!m||lit.has(i))};
  }
  // Três árvores conectadas: mais peças e ramificações a cada transmissão.
  function networkLevel(width,edges,label){
    const solution=Array(width*width).fill(0);
    for(const [a,b] of edges){const delta=b-a,bit=delta===1?2:delta===-1?8:delta===width?4:1;solution[a]|=bit;solution[b]|=rotate(rotate(bit));}
    const start=solution.map((m,i)=>{for(let n=0;n<i%3+1;n++)m=rotate(m);return m;});
    return {width,solution,start,label};
  }
  const networkLevels=[
    networkLevel(3,[[0,1],[1,4],[4,3],[4,5],[5,2],[5,8],[8,7],[7,6]],'Rede local'),
    networkLevel(4,[[0,4],[4,5],[5,1],[1,2],[2,3],[3,7],[5,6],[6,10],[10,9],[9,8],[8,12],[12,13],[10,11],[11,15],[15,14]],'Gateway do campus'),
    networkLevel(5,[[0,1],[1,6],[6,5],[5,10],[10,15],[15,16],[16,11],[11,12],[12,7],[7,2],[2,3],[3,4],[4,9],[9,8],[8,13],[13,14],[14,19],[19,18],[18,17],[17,22],[22,21],[21,20],[22,23],[23,24]],'Destino do SantaLog')
  ];
  const mosaicGoal=[1,2,3,4,5,6,7,8,0];
  function slide(board,index){const gap=board.indexOf(0);if(!Number.isInteger(index)||index<0||index>8||Math.abs(index%3-gap%3)+Math.abs(Math.floor(index/3)-Math.floor(gap/3))!==1)return board.slice();const next=board.slice();[next[index],next[gap]]=[next[gap],next[index]];return next;}
  const mosaicStart=[7,4,3,6,7,8,5,4,1,0,3,4,7,6,3,4,5,8].reduce(slide,mosaicGoal);
  const mosaicComplete=board=>board.length===9&&board.every((n,i)=>n===mosaicGoal[i]);
  const binary=bits=>bits.reduce((sum,b,i)=>sum+(b?2**(bits.length-i-1):0),0);
  const records=[{region:'Sul',amount:400000},{region:'Sudeste',amount:800000},{region:'Norte',amount:300000},{region:'Nordeste',amount:600000},{region:'Centro-Oeste',amount:300000}];
  function execute(source,mode='database',snapshot={}){
    const output=[],queries=[],assertions=[],variables=Object.create(null);let printed=[];
    const error=(line,message)=>({ok:false,error:`Linha ${line}: ${message}`,output,queries,assertions,printed});
    if(typeof source!=='string'||source.length>4096)return error(1,'Limite de 4.096 caracteres.');
    if(mode==='tests')Object.assign(variables,{total:snapshot.total??2400000,duplicatas:snapshot.duplicates??0,destino:snapshot.destination??'producao'});
    const commands=Object.create(null);
    commands.buscar=(env,batch)=>{
      if(mode!=='database')throw Error('buscar só está disponível na consulta de dados.');
      if(!['sandbox','producao'].includes(env)||!['NATAL-24','DEMO'].includes(batch))throw Error('Use ambientes "sandbox" ou "producao" e lotes "NATAL-24" ou "DEMO".');
      queries.push({env,batch});return {env,batch,rows:batch==='DEMO'?[{region:'Demonstração',amount:12}]:env==='sandbox'?records.map(r=>({...r})):[]};
    };
    commands.total=lote=>{if(!lote||!Array.isArray(lote.rows))throw Error('total precisa de um lote retornado por buscar.');return lote.rows.reduce((n,r)=>n+r.amount,0);};
    commands.mostrar=value=>{printed.push(value);output.push(typeof value==='object'?JSON.stringify(value):String(value));return value;};
    commands.conferir=(name,expected)=>{
      if(mode!=='tests')throw Error('conferir pertence ao programa de testes.');
      if(!['total','duplicatas','destino'].includes(name))throw Error('O primeiro argumento deve ser "total", "duplicatas" ou "destino".');
      const actual=variables[name],passed=actual===expected;assertions.push({name,expected,actual,passed});
      output.push(`${passed?'✓':'✕'} ${name}: esperado ${expected}; recebido ${actual}`);return passed;
    };
    function expr(text,depth=0){
      if(depth>8)throw Error('Expressão muito aninhada.');text=text.trim();
      if(/^\d+$/.test(text))return Number(text);
      if(/^"[^"\n]*"$/.test(text)||/^'[^'\n]*'$/.test(text))return text.slice(1,-1);
      if(/^[a-z_]+$/.test(text)){if(Object.hasOwn(variables,text))return variables[text];throw Error(`Variável "${text}" não foi definida.`);}
      const call=/^([a-z_]+)\((.*)\)$/.exec(text);if(!call||!Object.hasOwn(commands,call[1]))throw Error('Comando desconhecido. Consulte o manual ao lado.');
      const args=[];let part='',quote='',level=0;
      for(const ch of call[2]){if(quote){part+=ch;if(ch===quote)quote='';continue;}if(ch==='"'||ch==="'"){quote=ch;part+=ch;}else if(ch==='('){level++;part+=ch;}else if(ch===')'){level--;part+=ch;}else if(ch===','&&level===0){args.push(part);part='';}else part+=ch;}
      if(quote||level!==0)throw Error('Confira as aspas e os parênteses.');if(part.trim())args.push(part);
      const expected={buscar:2,total:1,mostrar:1,conferir:2}[call[1]];if(args.length!==expected)throw Error(`${call[1]} recebe ${expected} argumento(s).`);
      return commands[call[1]](...args.map(a=>expr(a,depth+1)));
    }
    const lines=source.split('\n');if(lines.length>40)return error(1,'Use no máximo 40 linhas.');
    for(let n=0;n<lines.length;n++){
      const line=lines[n].trim();if(!line||line.startsWith('#'))continue;
      try{const assignment=/^([a-z_]+)\s*=\s*(.+)$/.exec(line);if(assignment){if(['total','duplicatas','destino'].includes(assignment[1])&&mode==='tests')throw Error('Os dados do relatório são somente leitura.');variables[assignment[1]]=expr(assignment[2]);}else expr(line);}
      catch(e){return error(n+1,e.message);}
    }
    const found=queries.some(q=>q.env==='sandbox'&&q.batch==='NATAL-24')&&printed.includes(2400000);
    const tested=['total','duplicatas','destino'].every(name=>assertions.some(a=>a.name===name&&a.passed))&&assertions.every(a=>a.passed);
    return {ok:true,output,queries,assertions,printed,success:mode==='database'?found:tested};
  }
  function toggleLock(lights,index){return lights.map((v,i)=>Math.abs(i%3-index%3)+Math.abs(Math.floor(i/3)-Math.floor(index/3))<=1?1-v:v);}
  const lockStart=[0,4,8].reduce((lights,i)=>toggleLock(lights,i),Array(9).fill(0));
  function memoryDeck(){const pairs=[['104','★','Ana'],['218','☾','Bruno'],['307','♥','Lia'],['410','❄','Caio']];const cards=pairs.flatMap(([key,icon,name])=>[{key,icon,label:'Presente '+key},{key,icon,label:name+' · '+key}]);for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
  return {networkLevels,mosaicGoal,mosaicStart,slide,mosaicComplete,toggleLock,lockStart,memoryDeck,release,rotate,circuit,circuitStart,circuitSolution,binary,execute};
})();
