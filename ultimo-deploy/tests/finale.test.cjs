const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c={window:{},matchMedia:()=>({matches:false})};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/finale.js'),'utf8'),c);
test('Encerramento percorre saída, copa, lua, trenó e foto nessa ordem',()=>{
  const phase=c.window.Finale.phase;
  for(const [time,stage] of [[0,'exit'],[5.99,'exit'],[6,'walk'],[10,'party'],[17,'moon'],[22,'santa'],[27,'photo'],[100,'photo']])assert.equal(phase(time),stage);
});
