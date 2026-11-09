(() => {
 'use strict';
 const data=window.PEER_CASES;
 const names={software:'Adobe',semiconductors:'NVIDIA',medical_devices:'Medtronic',biopharma:'Amgen'};
 const labels={software:'Software & IT services',semiconductors:'Semiconductors',medical_devices:'Medical devices',biopharma:'Biopharma & diagnostics'};
 let caseIndex=0,year='2025';const $=id=>document.getElementById(id);
 function render(){
  const current=data[caseIndex],annual=current.years[year];$('cases').replaceChildren();
  data.forEach((item,i)=>{
   const button=document.createElement('button');button.type='button';button.className='case-button';button.setAttribute('aria-pressed',String(i===caseIndex));
   for(const [cls,text] of [['case-number','CASE 0'+(i+1)],['case-name',names[item.group]],['case-industry',labels[item.group]]]){
    const n=document.createElement(cls==='case-name'?'strong':'span');n.className=cls;n.textContent=text;button.append(n);
   }
   button.onclick=()=>{caseIndex=i;render();$('cases').children[i].focus({preventScroll:true});};$('cases').append(button);
  });
  $('group-label').textContent=labels[current.group];$('company').textContent=names[current.group];
  $('company-context').textContent=annual.filing_name+' · SIC '+annual.sic+' · source identity not independently verified';
  $('open-review').hidden=!['software','semiconductors'].includes(current.group);
  document.querySelectorAll('[data-year]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===year)));
  window.drawMining(current.group);window.drawModelComparison(current.group,year);
  $('live-status').textContent='Updated '+names[current.group]+' keyword comparison and '+year+' peer-model results.';
 }
 document.querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>{year=b.dataset.year;render();});
 $('open-review').onclick=()=>{$('peer-analysis').open=true;$('peer-analysis').scrollIntoView({behavior:'auto',block:'start'});};
 render();
})();
