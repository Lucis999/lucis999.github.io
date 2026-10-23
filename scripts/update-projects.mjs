import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const projects=JSON.parse(fs.readFileSync(path.join(root,'projects-data.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const href=p=>'project-'+p.id+'.html';
const tags=p=>`<ul class="project-tags" aria-label="Skills">${p.skills.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul>`;
const cover=(p,i)=>`<div class="cover ${esc(p.theme)}"><small>${String(i+1).padStart(2,'0')} / ${esc(p.category.toUpperCase())}</small><strong>${p.cover}</strong><span>${esc(p.label)}</span></div>`;
const card=(p,i)=>`<a aria-label="Open ${esc(p.title)}" class="gallery-card" href="${href(p)}">${cover(p,i)}<h3>${esc(p.title)}</h3><span class="project-card-status">${esc(p.status)}</span><p>${esc(p.summary)}</p>${tags(p)}</a>`;
const original=fs.readFileSync(path.join(dist,'project-eeg.html'),'utf8');
for(const [i,p] of projects.entries()){
 const prev=projects[(i-1+projects.length)%projects.length],next=projects[(i+1)%projects.length];
 const sections=p.sections.map(s=>`<section class="project-section"><h2>${esc(s.title)}</h2>${s.text?'<p>'+esc(s.text)+'</p>':''}${s.items?'<ul>'+s.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}</section>`).join('');
 const main=`<main><article class="project-detail case-study"><a class="back-link" href="projects.html">← All projects</a><header class="page-intro"><div class="eyebrow">${esc(p.course)}</div><h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p><div class="project-status">${esc(p.status)}</div>${tags(p)}</header>${cover(p,i)}<section class="project-section project-overview"><h2>Project overview</h2><p>${esc(p.overview)}</p></section>${sections}<section class="project-section contribution-section"><h2>My contribution</h2><p class="pending-label">Contribution details to be added</p><p>${esc(p.contribution)}</p></section><aside class="project-pending"><h2>Next additions</h2><p>Supporting details and materials planned for this project page.</p><ul>${p.pending.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></aside><nav class="project-pagination" aria-label="Browse projects"><a href="${href(prev)}"><small>← Previous project</small>${esc(prev.title)}</a><a href="${href(next)}"><small>Next project →</small>${esc(next.title)}</a></nav></article><footer><span>© 2026 Lucis</span><a href="projects.html">All projects ↗</a></footer></main>`;
 let html=original.replace(/<title>.*?<\/title>/,`<title>${esc(p.title)} — Lucis</title>`).replace(/<main>[\s\S]*?<\/main>/,main);
 if(!html.includes('href="projects.css"'))html=html.replace('</head>','<link href="projects.css" rel="stylesheet"/></head>');
 fs.writeFileSync(path.join(dist,href(p)),html);
}
for(const filename of ['index.html','projects.html']){
 let html=fs.readFileSync(path.join(dist,filename),'utf8');
 html=html.replace(/<div class="gallery-track">[\s\S]*?<\/div><\/div><div class="gallery-controls">/,`<div class="gallery-track">${projects.map(card).join('')}</div></div><div class="gallery-controls">`);
 html=html.replace(/class="gallery-status">[^<]+</,'class="gallery-status">01 / '+String(projects.length).padStart(2,'0')+'<');
 html=html.replace('status.textContent=`0${index+1} / 03`;','status.textContent=`${String(index+1).padStart(2,\'0\')} / ${String(cards.length).padStart(2,\'0\')}`;');
 if(!html.includes('href="projects.css"'))html=html.replace('</head>','<link href="projects.css" rel="stylesheet"/></head>');
 fs.writeFileSync(path.join(dist,filename),html);
}
console.log(`Updated ${projects.length} unique projects and both galleries.`);
