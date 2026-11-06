'use strict';
function renderComparison(){
 const t=+$('compare-time').value,p=$('compare-power').value;
 for(const [exp,id,groups] of [['B','storage-compare',['New','Old']],['A','flavour-compare',['Butter','Salt']]]){
  const source=LAB_DATA[exp].rows,selected=source.filter(r=>r.time===t&&r.power===p);
  const summaries=groups.map(third=>{const bags=selected.filter(r=>r.third===third);return{third,n:bags.length,failed:mean(bags.map(r=>r.failed)),success:exp==='B'?mean(bags.map(r=>r.success)):null,rate:exp==='B'?mean(bags.map(r=>r.success/(r.success+r.failed))):null};});
  const before=summaries[0],after=summaries[1],difference=after.failed-before.failed;
  $(id).innerHTML=`<p class="eyebrow">${exp==='B'?'STUDY B · STORAGE':'STUDY A · FLAVOUR'}</p><h3>${exp==='B'?'Do older bags pop differently?':'Does flavour affect yield?'}</h3><div class="compare-pair">${summaries.map(g=>`<div><span>${g.third}</span><strong>${fmt(g.failed)}</strong><small>mean failed / bag · n = ${g.n}</small>${exp==='B'?`<small>${fmt(100*g.rate)}% mean bag success rate</small>`:''}</div>`).join('')}</div><p>${after.third} − ${before.third}: <b>${difference>=0?'+':''}${fmt(difference)} failed kernels per bag</b> at ${t}s / ${p}. Lower failed counts are better.</p><p class="quiet">${exp==='B'?'Rate = successful / (successful + failed), averaged equally across bags. Storage also differs by batch and packaging.':'Only unpopped and burnt counts were recorded. No successful-count or success-rate comparison is possible.'} This is a matched-condition descriptive comparison, not a taste test.</p>`;
 }
}
['compare-time','compare-power'].forEach(id=>$(id).onchange=renderComparison);
renderComparison();
