import fs from 'node:fs';
import path from 'node:path';
export function updateMovieNightShell(root,projects){
 const file=path.join(root,'dist/movie-night/index.html');
 if(!fs.existsSync(file))return;
 const launched=projects.filter(p=>['road-safety','eeg','home-affordability','oil','hotel-security','movie-night','cryptography','digital-forensics','websocket-security'].includes(p.id));
 const index=launched.findIndex(p=>p.id==='movie-night');
 if(index<0)return;
 const href=p=>p.id==='websocket-security'?'../websocket-security/':p.id==='digital-forensics'?'../digital-forensics-lab/':p.id==='cryptography'?'../cryptography/':p.id==='hotel-security'?'../hotel-security/':p.id==='eeg'?'../eeg-br41n/':p.id==='movie-night'?'./':'../project-'+p.id+'.html';
 const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const previous=launched[index-1],next=launched[index+1];
 const navigation=`<nav class="project-pagination" aria-label="Browse projects">${previous?`<a href="${href(previous)}"><small>← Previous project</small>${esc(previous.title)}</a>`:'<a href="../projects.html"><small>← Browse</small>All launched projects</a>'}${next?`<a href="${href(next)}"><small>Next project →</small>${esc(next.title)}</a>`:'<a href="../projects.html"><small>Browse →</small>All launched projects</a>'}</nav>`;
 const text=fs.readFileSync(file,'utf8');
 if(!text.includes('<!-- MOVIE_PROJECT_NAV -->'))throw Error('Movie Night navigation marker is missing');
 fs.writeFileSync(file,text.replace(/<!-- MOVIE_PROJECT_NAV -->[\s\S]*?<!-- \/MOVIE_PROJECT_NAV -->/,'<!-- MOVIE_PROJECT_NAV -->'+navigation+'<!-- /MOVIE_PROJECT_NAV -->'));
}
