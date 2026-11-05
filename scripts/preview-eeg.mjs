import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
 let target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);res.end();return}
 if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
 if(!fs.existsSync(target)){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');
 fs.createReadStream(target).pipe(res);
}).listen(8765,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:8765/eeg-br41n/'));
