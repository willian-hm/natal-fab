const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/puzzle-rules.js'),'utf8'),context);
const R=context.window.PuzzleRules;
test('Três redes crescentes são conectadas, embaralhadas e recuperáveis por rotação',()=>{
  assert.deepEqual(Array.from(R.networkLevels,l=>l.width),[3,4,5]);
  for(const level of R.networkLevels){assert.equal(R.circuit(level.start,level.width).complete,false);assert.equal(R.circuit(level.solution,level.width).complete,true);assert.equal(R.circuit(level.solution,level.width).lit.length,level.width**2);level.start.forEach((value,i)=>{const variants=[value];for(let n=0;n<3;n++)variants.push(R.rotate(variants.at(-1)));assert.ok(variants.includes(level.solution[i]));});}
});
test('Mosaico preserva peças, recusa movimentos ilegais e nasce solúvel',()=>{
  const board=Array.from(R.mosaicStart);assert.equal(R.mosaicComplete(board),false);
  assert.deepEqual([...board].sort(),[0,1,2,3,4,5,6,7,8]);
  const gap=board.indexOf(0);assert.deepEqual(Array.from(R.slide(board,gap)),board);assert.deepEqual(Array.from(R.slide(board,-1)),board);
  const nonzero=board.filter(Boolean);let inversions=0;for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(nonzero[i]>nonzero[j])inversions++;
  assert.equal(inversions%2,0,'Paridade par garante solução em tabuleiro 3×3');
  for(let i=0;i<9;i++){const next=R.slide(board,i);if(next.join()!==board.join())assert.deepEqual(Array.from(R.slide(next,gap)),board);}
});
test('Circuito exige conexão completa sem pontas abertas',()=>{
  assert.equal(R.circuit(R.circuitStart).complete,false);
  assert.equal(R.circuit(R.circuitSolution).complete,true);
  for(let i=0;i<16;i++)assert.equal(R.rotate(R.rotate(R.rotate(R.rotate(i)))),i);
  for(const i of [0,1,2,5,9,10,11,15]){const broken=[...R.circuitSolution];broken[i]=0;assert.equal(R.circuit(broken).complete,false);}
});
test('Bits respeitam os pesos das posições',()=>{assert.equal(R.binary([1,1,0,0,0]),24);assert.equal(R.binary([0,0,1,0,1]),5);assert.equal(R.binary([1,1,1,1,1]),31);});
test('Consulta só aprova o lote completo encontrado em sandbox',()=>{
  assert.equal(R.execute('lote = buscar("sandbox", "NATAL-24")\nmostrar(total(lote))').success,true);
  for(const [env,batch] of [['producao','NATAL-24'],['sandbox','DEMO']])assert.equal(R.execute(`lote = buscar("${env}", "${batch}")\nmostrar(total(lote))`).success,false);
  assert.equal(R.execute('mostrar(2400000)').success,false);
});
test('Interpretador não executa JavaScript nem loops e explica erros',()=>{
  for(const source of ['fetch("https://example.com")','while True:','window.alert(1)','mostrar(lote)','buscar("sandbox")','mostrar("aspas)','mostrar(total(buscar("sandbox", "NATAL-24")))\nruim()'])assert.equal(R.execute(source).ok,false,source);
  assert.match(R.execute('x = 1\nruim()').error,/Linha 2/);
  assert.equal(R.execute('x'.repeat(4097)).ok,false);
  assert.equal(R.execute('\n'.repeat(41)).ok,false);
});
test('Testes exigem todos os campos e não permitem alterar relatório',()=>{
  const valid='conferir("total", 2400000)\nconferir("duplicatas", 0)\nconferir("destino", "producao")';
  assert.equal(R.execute(valid,'tests').success,true);
  assert.equal(R.execute(valid,'tests',{duplicates:1}).success,false);
  assert.equal(R.execute(valid.split('\n').slice(0,2).join('\n'),'tests').success,false);
  assert.equal(R.execute(valid+'\nconferir("total", 0)','tests').success,false);
  assert.equal(R.execute('total = 0\n'+valid,'tests').ok,false);
});

test('Painel de luzes é reversível e tem solução',()=>{let lights=[...R.lockStart];assert.ok(lights.some(Boolean));for(const i of [0,4,8])lights=R.toggleLock(lights,i);assert.ok(lights.every(v=>!v));const initial=[...R.lockStart];assert.equal(JSON.stringify(R.toggleLock(R.toggleLock(initial,3),3)),JSON.stringify(initial));});
test('Memória sempre possui quatro pares sem cartões sobrando',()=>{for(let n=0;n<10;n++){const deck=R.memoryDeck();assert.equal(deck.length,8);const keys=[...new Set(deck.map(c=>c.key))];assert.equal(keys.length,4);for(const key of keys)assert.equal(deck.filter(c=>c.key===key).length,2);}});
