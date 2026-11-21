// Servidor estático local; nenhuma dependência ou instalação necessária.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname,port=Number(process.argv[2]||8080);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg'};
http.createServer((req,res)=>{
  let target;
  try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);target=path.resolve(root,'.'+name);if(target!==root&&!target.startsWith(root+path.sep))throw Error();if(name.split('/').some(p=>p.startsWith('.')))throw Error();if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');}
  catch{res.writeHead(404);res.end('Não encontrado');return;}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);res.end('Não encontrado');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(port,'127.0.0.1',()=>console.log(`Jogo: http://127.0.0.1:${port}/ultimo-deploy/`));
