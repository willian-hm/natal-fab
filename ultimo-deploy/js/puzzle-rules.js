/* Regras determinísticas dos minigames e interpretador didático sem eval. */
window.PuzzleRules=(()=>{
  const release=['c18','test','f24','publish'];
  const rotate=mask=>((mask<<1)&15)|(mask>>3); // N=1, L=2, S=4, O=8.
  const circuitSolution=[2,14,8,0,0,5,0,0,0,3,10,12,0,0,0,1];
  const circuitStart=circuitSolution.map((m,i)=>{for(let n=0;n<(i%3)+1;n++)m=rotate(m);return m;});
  function circuit(masks){
    const lit=new Set([0]),queue=[0];let leaks=0;
    while(queue.length){const i=queue.shift(),mask=masks[i]||0;
      for(const [bit,dx,dy,opposite] of [[1,0,-1,4],[2,1,0,8],[4,0,1,1],[8,-1,0,2]])if(mask&bit){
        const x=i%4+dx,y=Math.floor(i/4)+dy,j=y*4+x;
        if(x<0||x>3||y<0||y>3||!((masks[j]||0)&opposite)){leaks++;continue;}
        if(!lit.has(j)){lit.add(j);queue.push(j);}
      }
    }
    return {lit:[...lit],leaks,complete:leaks===0&&circuitSolution.every((m,i)=>!m||lit.has(i))};
  }
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
  return {release,rotate,circuit,circuitStart,circuitSolution,binary,execute};
})();
