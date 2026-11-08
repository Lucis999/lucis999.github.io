import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const launchedIds=['road-safety','eeg','home-affordability','oil','hotel-security','movie-night','cryptography','digital-forensics','websocket-security','nfe-security'];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export function updateProjectShells(root,projects){
 const dist=path.join(root,'dist');
 const canonical=id=>id==='nfe-security'?'nfe-security/':id==='websocket-security'?'websocket-security/':id==='digital-forensics'?'digital-forensics-lab/':id==='eeg'?'eeg-br41n/':['hotel-security','movie-night','cryptography'].includes(id)?id+'/':'project-'+id+'.html';
 const targets=projects.flatMap(p=>{
  const candidates=['project-'+p.id+'.html'];
  if(['eeg','hotel-security','movie-night','cryptography','digital-forensics','websocket-security','nfe-security'].includes(p.id))candidates.push(canonical(p.id)+'index.html');
  return candidates.filter(file=>fs.existsSync(path.join(dist,file))).map(file=>({project:p,file}));
 });
 for(const {project:p,file} of targets){
  const target=path.join(dist,file),prefix=path.relative(path.dirname(target),dist).replaceAll('\\','/'),base=prefix?prefix+'/':'';
  let html=fs.readFileSync(target,'utf8');
  const group=projects.filter(x=>launchedIds.includes(p.id)===launchedIds.includes(x.id)),index=group.findIndex(x=>x.id===p.id),previous=group[index-1],next=group[index+1];
  const link=(item,which)=>item?`<a href="${base+canonical(item.id)}"><small>${which==='previous'?'← Previous project':'Next project →'}</small>${escape(item.title)}</a>`:`<a href="${base}projects.html"><small>${which==='previous'?'← Browse':'Browse →'}</small>All launched projects</a>`;
  const pager=`<nav class="project-pagination" aria-label="Browse projects">${link(previous,'previous')}${link(next,'next')}</nav>`;
  const footer=`<footer class="project-footer"><span>© 2026 Lucis</span><a href="${base}projects.html">All projects ↗</a></footer>`;
  // Clear only the page footer. All research notes and section content remain intact.
  html=html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g,'');
  html=html.replace(/<main\b[^>]*>([\s\S]*?)<\/main>/,(_,content)=>{
   let inner=content.replace(/<!-- MOVIE_PROJECT_NAV -->[\s\S]*?<!-- \/MOVIE_PROJECT_NAV -->/,'').replace(/<nav\b[^>]*class="[^"]*project-pagination[^"]*"[^>]*>[\s\S]*?<\/nav>/g,'');
   if(p.id==='cryptography'){
    inner=inner.replace(/<div class="project-path">[\s\S]*?<\/div>/,`<a class="back-link project-back" href="${base}projects.html">← All projects</a>`);
    if(!inner.includes('class="project-animation-link"'))inner=inner.replace('<div class="intro-line">',`<div class="hero-actions"><a class="project-animation-link" href="${base}cryptography-entry.html">Preview opening animation ↗</a></div><div class="intro-line">`);
   }
   if(p.id==='hotel-security'&&!inner.includes('class="project-context"')){
    let brief='';inner=inner.replace(/<aside class="project-brief"[^>]*>[\s\S]*?<\/aside>/,s=>{brief=s;return '';});
    if(brief)inner=inner.replace(/(<section class="intro"[^>]*>[\s\S]*?<\/section>)/,`$1<details class="project-context"><summary>Project context and decision</summary>${brief}</details>`);
   }
   if(!inner.includes('project-back')){
    if(/class="[^"]*back-link/.test(inner))inner=inner.replace(/class="([^"]*\bback-link\b[^"]*)"/,(_,classes)=>`class="${classes} project-back"`);
    else inner=`<a class="back-link project-back" href="${base}projects.html">← All projects</a>`+inner;
   }
   inner=inner.replace(/<(header|section)\b([^>]*class=")([^"]*\b(?:page-intro|hero|intro)\b[^"]*)("[^>]*>)/,(all,tag,before,classes,after)=>`<${tag}${before}${classes.includes('project-opening')?classes:classes+' project-opening'}${after}`);
   if(!inner.includes('project-frame')){
    if(/<article\b[^>]*class="[^"]*case-study/.test(inner))inner=inner.replace(/(<article\b[^>]*class=")([^"]*\bcase-study\b[^"]*)(")/,(_,before,classes,after)=>before+classes+' project-frame'+after);
    else inner='<article class="project-frame">'+inner+'</article>';
   }
   const notes={eeg:'2023 BR41N.IO Hackathon · Historical project reconstructed as an educational portfolio experience. No live EEG reading is performed.','hotel-security':'Browser-local prototype · Synthetic scenarios · No live attacks or hotel connection.',cryptography:'Educational browser-local lab · Synthetic accounts and attacks · Real WebCrypto computations.'};
   const boundary=notes[p.id]&&!inner.includes('class="project-boundary"')?`<p class="project-boundary">${notes[p.id]}</p>`:'';
   const nav=p.id==='movie-night'?`<!-- MOVIE_PROJECT_NAV -->${pager}<!-- /MOVIE_PROJECT_NAV -->`:pager;
   const end=inner.lastIndexOf('</article>');inner=inner.slice(0,end)+boundary+nav+inner.slice(end);
   return `<main class="project-page-main" data-project="${p.id}">${inner}${footer}</main>`;
  });
  if(/<body\b[^>]*class="/.test(html))html=html.replace(/(<body\b[^>]*class=")([^"]*)(")/,(all,before,classes,after)=>before+(classes.includes('project-page')?classes:classes+' project-page')+after);
  else html=html.replace('<body','<body class="project-page"');
  if(!html.includes('project-shell.css'))html=html.replace('</head>',`<link rel="stylesheet" href="${base}project-shell.css"></head>`);
  fs.writeFileSync(target,html);
 }
 console.log(`Unified project frames and navigation on ${targets.length} pages.`);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 updateProjectShells(root,JSON.parse(fs.readFileSync(path.join(root,'projects-data.json'),'utf8')));
}
