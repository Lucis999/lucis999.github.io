(function(){
/* Pure descriptive functions are shared with the executed offline tests. */
const Lab = {
  filter(rows, state) { return rows.filter(r => (state.storage === 'all' || r.storage === state.storage) && (state.block === 'all' || String(r.block) === state.block) && !(state.exclude && r.trial === 20)); },
  mean(rows,key) { return rows.length ? rows.reduce((a,r)=>a+r[key],0)/rows.length : null; },
  groups(rows) { return [90,120,150].flatMap(time=>['H','M'].map(power=>{const bags=rows.filter(r=>r.time===time&&r.power===power);return {time,power,bags,rate:Lab.mean(bags,'rate'),success:Lab.mean(bags,'success'),failed:Lab.mean(bags,'failed')};})); },
  best(rows,measure) { const groups=Lab.groups(rows).filter(g=>g.bags.length);return groups.sort((a,b)=>measure==='failed'?a[measure]-b[measure]:b[measure]-a[measure])[0] || null; },
  summary(rows) { const total=rows.reduce((a,r)=>a+r.total,0),success=rows.reduce((a,r)=>a+r.success,0);return {n:rows.length,total,success,pooled:total?success/total:null,rate:Lab.mean(rows,'rate')}; }
};
if (typeof module !== 'undefined') module.exports=Lab;
if (typeof document !== 'undefined') {
 const D=window.POPCORN,$=id=>document.getElementById('rep-'+id),pct=x=>x==null?'—':(100*x).toFixed(2)+'%',fmt=x=>x==null?'—':Number(x).toPrecision(4),pp=x=>(100*x).toFixed(2),colors={H:'#71efdb',M:'#f2bd71'};
 const state=()=>({storage:$('storage').value,block:$('block').value,exclude:$('exclude').checked});
 const table=(headers,rows)=>'<table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
 function interaction(rows,measure){
  const W=640,H=350,left=54,right=17,top=28,bottom=47,groups=Lab.groups(rows),max=measure==='rate'?1:Math.ceil(Math.max(1,...rows.map(r=>r[measure]))/100)*100;
  const x=t=>left+(t-90)/60*(W-left-right),y=v=>H-bottom-v/max*(H-top-bottom);
  let s=`<svg role="img" aria-label="${measure} by cooking time and microwave power" viewBox="0 0 ${W} ${H}">`;
  for(let i=0;i<=4;i++){const v=i*max/4;s+=`<line x1="${left}" x2="${W-right}" y1="${y(v)}" y2="${y(v)}" stroke="#26364a"/><text x="${left-11}" y="${y(v)+4}" text-anchor="end" fill="#a5b5c7" font-size="11">${measure==='rate'?Math.round(v*100)+'%':Math.round(v)}</text>`;}
  [90,120,150].forEach(t=>{s+=`<text x="${x(t)}" y="${H-21}" text-anchor="middle" fill="#a5b5c7" font-size="12">${t}s</text>`;});
  for(const power of ['H','M']){const gs=groups.filter(g=>g.power===power&&g.bags.length);s+=`<polyline points="${gs.map(g=>x(g.time)+','+y(g[measure])).join(' ')}" fill="none" stroke="${colors[power]}" stroke-width="2.5"/>`;gs.forEach(g=>{g.bags.forEach((r,i)=>{s+=`<circle cx="${x(g.time)+(i-(g.bags.length-1)/2)*7}" cy="${y(r[measure])}" r="3.5" fill="${colors[power]}" opacity=".35"><title>Trial ${r.trial}: ${measure==='rate'?pct(r.rate):r[measure]}</title></circle>`;});s+=`<circle cx="${x(g.time)}" cy="${y(g[measure])}" r="5" fill="${colors[power]}"><title>${g.time}s / ${power}: ${measure==='rate'?pct(g.rate):g[measure].toFixed(2)}; ${g.bags.length} bags</title></circle>`;});}
  return s+'</svg>';
 }
 function intervalChart(){let s='<svg viewBox="0 0 560 350" role="img" aria-label="Observed and model rates with conditional confidence intervals">';const x=v=>90+v*435;
 for(let i=0;i<=4;i++){const v=i/4;s+=`<line x1="${x(v)}" x2="${x(v)}" y1="20" y2="310" stroke="#26364a"/><text x="${x(v)}" y="337" text-anchor="middle" font-size="11" fill="#a5b5c7">${v*100}%</text>`;}
 D.optimized.forEach((r,i)=>{const y=40+i*49,o=D.observed.find(o=>o.time===r.time&&o.power===r.power);s+=`<text x="76" y="${y+4}" text-anchor="end" fill="#d8e8ee" font-size="12">${r.time}s / ${r.power}</text><line x1="${x(r.lower)}" x2="${x(r.upper)}" y1="${y}" y2="${y}" stroke="${colors[r.power]}" stroke-width="2"/><circle cx="${x(r.rate)}" cy="${y}" r="5" fill="#101a29" stroke="${colors[r.power]}" stroke-width="2"><title>Model ${pct(r.rate)}; interval ${pct(r.lower)} to ${pct(r.upper)}</title></circle><circle cx="${x(o.mean_bag_rate)}" cy="${y+10}" r="4" fill="${colors[r.power]}"><title>Observed ${pct(o.mean_bag_rate)}</title></circle>`;});return s+'</svg>';}
 function render(){const st=state(),rows=Lab.filter(D.rows,st),measure=$('measure').value,time=+$('time').value,power=$('power').value,bags=rows.filter(r=>r.time===time&&r.power===power),s=Lab.summary(bags);
 $('chart-title').textContent=(measure==='rate'?'Success rate':measure==='success'?'Success count':'Failed count')+' by time × power';$('interaction').innerHTML=interaction(rows,measure);
 $('selected').innerHTML=s.n?`<div class="big-rate">${measure==='rate'?pct(s.rate):Lab.mean(bags,measure).toFixed(1)}</div><div class="stat-label">Observed ${measure==='rate'?'equal-bag success rate':'mean '+measure+' count'}</div><div class="mini-stats"><div><span>Recorded bags</span><b>${s.n}</b></div><div><span>Success / total</span><b>${s.success} / ${s.total}</b></div><div><span>Pooled kernel rate</span><b>${pct(s.pooled)}</b></div></div>`:'<div class="empty">No bags for this selection. Choose another setting or include trial 20.</div>';
 $('scope').textContent=`${rows.length} recorded bags shown · ${st.storage==='all'?'Both storage groups':st.storage==='N'?'New bags':'Old bags'} · ${st.block==='all'?'Both position blocks':'Block '+st.block}${st.exclude?' · Trial 20 excluded from descriptive views':''}. Model tests and uncertainty below retain all 24 bags.`;
 $('data-table').innerHTML=table(['Trial','Block','Time','Power','Storage','Success','Failed','Rate'],rows.map(r=>[r.trial,r.block,r.time+'s',r.power==='H'?'High':'Medium',r.storage==='N'?'New':'Old',r.success,r.failed,pct(r.rate)]));
 $('data-count').textContent=rows.length+' of 24 recorded rows · downloadable CSV includes all observations.';
 }
 ['storage','block','measure','exclude','time','power'].forEach(id=>$(id).addEventListener('change',render));
 $('best').addEventListener('click',()=>{const best=Lab.best(Lab.filter(D.rows,state()),$('measure').value);if(best){$('time').value=String(best.time);$('power').value=best.power;render();}});
 $('diagnostic').addEventListener('change',()=>{const sel=$('diagnostic');$('diagnostic-image').src='research/'+sel.value;$('diagnostic-image').alt='Recomputed diagnostics: '+sel.options[sel.selectedIndex].text;$('diagnostic-caption').textContent=sel.value==='rate_diagnostics.png'?'Smooth rate model: inspect residual patterns and influence. Quasi variance inflation does not correct the mean function.':'Recomputed original model diagnostics. Q–Q plots cannot establish independence. No bags were removed because of Cook’s distance.';});
 $('interval-chart').innerHTML=intervalChart();
 $('original-anova').innerHTML=table(['Term','df','SS','F'],D.originalAnova.map(r=>[r.term,r.Df,Math.round(r['Sum Sq']),fmt(r['F value'])]));
 $('quasi-tests').innerHTML=table(['Nested comparison','F','p'],D.tests.map(r=>[r.test.replaceAll('_',' '),fmt(r.F),fmt(r.p)]));
 $('paired').innerHTML=table(['Matched contrast','Δ pp','95% CI, pp'],D.paired.map(r=>[r.contrast,pp(r.difference),pp(r.lower)+' to '+pp(r.upper)]));
 $('sensitivity').innerHTML=table(['Refit','Best tested setting','Model rate'],D.sensitivity.map(r=>[r.scenario,r.best,pct(r.best_rate)]));
 $('cv').textContent='Leave-one-bag-out validation: '+pp(D.validation.bag_MAE)+' percentage point MAE, '+pp(D.validation.bag_RMSE)+' point RMSE. This is internal validation, not a new experiment.';
 render();
}

})();