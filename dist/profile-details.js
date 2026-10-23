(()=>{
const table=(title,rows,first='Course / area',second='Details')=>`<h3>${title}</h3><div class="detail-table-wrap"><table><thead><tr><th scope="col">${first}</th><th scope="col">${second}</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}</tbody></table></div>`;
const data={
 ubc:{title:'University of British Columbia',meta:'Master of Business Analytics · 2026–Present',body:table('Selected learning topics',[
 ['Optimization','Linear and integer programming, network flow, sensitivity analysis and trade-offs between objectives.'],
 ['Statistics & probability','Probability distributions, conditional probability, statistical modelling and queueing models.'],
 ['Text analytics','Preparing and exploring text data using Python and natural language processing tools.']
 ])+'<p class="detail-footnote">Current studies. These are learning topics, rather than a complete list of official course titles.</p>'},
 nyit:{title:'New York Institute of Technology',meta:'MSc Cybersecurity · 2021–2023',body:'<p class="detail-lead">Graduated with Distinction · CGPA 3.84 / 4.00</p>'+table('Academic experience',[
 ['Introduction to Algorithms · Teaching assistant','Supported instruction, prepared learning materials and helped students work through algorithms and assignments. January–May 2023.'],
 ['Graduate capstone · PAQT','Designed and implemented an electronic signing workflow with email integration and end-to-end validation.'],
 ['Virtual BR41N.IO · Hackathon','Faculty-recommended participation in EEG data analysis and KNN classification. March–April 2023.']
 ],'Activity')+'<p class="detail-footnote">Teaching, capstone and hackathon activities are shown separately from coursework. A detailed course list can be added after review.</p>'},
 uvic:{title:'University of Victoria',meta:'BSc Statistics & Mathematics · Minor in Business · 2017–2021',body:table('Areas of study',[
 ['Statistics','Statistics component of the combined major.'],['Mathematics','Mathematics component of the combined major.'],['Business','Minor in Business.']
 ])+'<p class="detail-footnote">Specific course titles and descriptions will be added after the course list is confirmed.</p>'+table('Campus involvement',[
 ['Financial Management Club','General Secretary · January 2019–August 2020. Bookkeeping, meeting records, stakeholder communication and event coordination.'],
 ['English Language Centre','Ambassador · September 2018–September 2023. Answered inquiries and introduced prospective students to Victoria, UVic ELC and the Pathway Program.']
 ],'Role')},
 housing:{title:'Quality Assistant',meta:'BC Housing · Burnaby · January–April 2024',body:'<p class="detail-lead">Supported housing subsidy administration through accurate records, financial reviews and guidance for housing providers.</p>'+table('Responsibilities & contributions',[
 ['Data validation','Checked housing subsidy records, eligibility and rent calculations for accuracy and compliance.'],
 ['Financial review','Reviewed annual financial reports, subsidy allocations and funding requirements across housing programs.'],
 ['Reconciliation','Used Excel to identify discrepancies and support accurate subsidy administration.'],
 ['Provider support','Guided staff from nonprofit organizations through the Housing Registry system and program procedures.']
 ],'Work area')},
 ta:{title:'Teaching Assistant',meta:'Introduction to Algorithms · NYIT · January–May 2023',body:table('Responsibilities & contributions',[
 ['Instruction','Supported a class of 40 students through instructional materials and explanations of technical concepts.'],
 ['Assessment','Helped streamline grading workflows while maintaining accuracy and consistency.'],
 ['Student guidance','Provided individual support with problem-solving and course assignments.']
 ],'Work area')},
 paqt:{title:'Business & Technical Analyst',meta:'PAQT · Toronto · January–May 2023',body:'<p class="detail-lead">NYIT graduate capstone collaboration with a Toronto-based startup. Participated remotely from Vancouver, BC.</p>'+table('Responsibilities & contributions',[
 ['Workflow design','Collaborated on an end-to-end digital signing process within the startup’s online platform.'],
 ['Integration','Connected digital signatures and email functionality to support document execution and communication.'],
 ['Validation','Performed end-to-end testing to verify functionality and workflow reliability.'],
 ['Coordination','Supported project milestones, technical research and delivery documentation.']
 ],'Work area')}
};
const courses=window.portfolioCoursework;
if(courses){
 const courseTable=(title,rows)=>table(title,rows.map(([area,list])=>[area,'<ul class="course-list">'+list.map(c=>'<li>'+c+'</li>').join('')+'</ul>']),'Area','Representative Courses');
 data.ubc.body='<p class="detail-lead">Coursework by program period</p>'+courses.ubc.map(([status,rows])=>courseTable(status,rows)).join('');
 data.nyit.body='<p class="detail-lead">Graduated with Distinction · CGPA 3.84 / 4.00</p>'+courseTable('Areas of Study',courses.nyit);
 data.uvic.body=courseTable('Areas of Study',courses.uvic);
}
if(!document.querySelector('.geo-content'))return;
const panel=document.createElement('aside');panel.id='profile-detail';panel.className='profile-detail';panel.hidden=true;panel.setAttribute('aria-labelledby','detail-heading');
document.querySelector('main').append(panel);
const isEducation=document.body.dataset.atlas==='education';
const markSources={ubc:'school-marks/ubc.svg',nyit:'school-marks/nyit.svg',uvic:'school-marks/uvic.svg',housing:'company-marks/housing.svg',ta:'school-marks/nyit.svg',paqt:'company-marks/paqt.svg'};
const watermark=document.createElement('div');watermark.className='school-watermark';watermark.hidden=true;watermark.setAttribute('aria-hidden','true');
const mark=document.createElement('img');mark.alt='';mark.draggable=false;watermark.append(mark);document.body.append(watermark);
let lastTrigger=null;
function close(reset=false){panel.hidden=true;if(reset===true){watermark.hidden=true;watermark.classList.remove('is-uncovered')}else if(!watermark.hidden)watermark.classList.add('is-uncovered');panel.removeAttribute('data-school');document.querySelectorAll('[data-focus]').forEach(b=>b.setAttribute('aria-expanded','false'));if(lastTrigger)lastTrigger.focus({preventScroll:true})}
document.querySelectorAll('[data-focus]').forEach(b=>{b.setAttribute('aria-controls',panel.id);b.setAttribute('aria-expanded','false')});
function open(key,trigger){const d=data[key];if(!d)return;lastTrigger=trigger;if(markSources[key]){const src=markSources[key];mark.src=src;watermark.dataset.school=key;watermark.hidden=false;watermark.classList.remove('is-uncovered');panel.dataset.school=key;panel.style.setProperty('--school-mark','url("'+src+'")')}panel.innerHTML=`<button class="detail-close" aria-label="Close details">×</button><span class="eyebrow">${document.body.dataset.atlas==='education'?'Learning & background':'Experience in detail'}</span><h2 id="detail-heading">${d.title}</h2><p class="detail-meta">${d.meta}</p>${d.body}`;panel.hidden=false;panel.scrollTop=0;panel.querySelector('.detail-close').onclick=close;document.querySelectorAll('[data-focus]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.focus===key)));if(matchMedia('(max-width:1100px)').matches){document.querySelector(`[data-place="${key}"]`).after(panel);panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'})}else document.querySelector('main').append(panel)}
document.addEventListener('click',e=>{if(e.target.closest('[data-reset]')){close(true);return}const b=e.target.closest('[data-focus]');const c=e.target.closest('[data-place]');if(b)open(b.dataset.focus,b);else if(c&&!e.target.closest('a,details'))open(c.dataset.place,c.querySelector('[data-focus]'))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
})();
