import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const files=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
for(const name of files){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1],{filename:name});
 for(const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
  const target=m[1];if(/^(https?:|mailto:|data:)/.test(target))continue;
  if(!fs.existsSync(path.resolve(root,target)))throw Error(`${name}: missing ${target}`);
 }
}
for(const name of fs.readdirSync(root).filter(x=>x.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
console.log(`Validated links and JavaScript across ${files.length} pages.`);
