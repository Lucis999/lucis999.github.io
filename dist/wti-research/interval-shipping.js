'use strict';
function intervalLab(){
 const I=window.INTERVALS,h=+$('intervalHorizon').value,model=$('intervalModel').value,period=$('intervalPeriod').value;
 const metrics=I.metrics.filter(z=>z.horizon===h&&z.model===model&&z.period===period),base=metrics.find(z=>z.method==='Legacy 250'),choice=I.selection.find(z=>z.horizon===h&&z.model===model);
 $('intervalIntro').textContent=`Same ${metrics[0].n} dated forecasts and unchanged point predictions. Coverage targets 90%; width and score are in USD per barrel. Lower interval score is better. Method selected on pre-2026 outcomes: ${choice.selected_before2026}. This extension was designed after inspecting the historical failure.`;
 $('intervalScores').innerHTML=table(['Interval method','Coverage','Mean width','Width vs legacy','90% interval score','Score vs legacy'],metrics.map(z=>[z.method+(z.method===choice.selected_before2026?' · pre-2026 choice':''),fmt(z.coverage*100,1)+'%',fmt(z.mean_width),fmt((z.mean_width/base.mean_width-1)*100,1)+'%',fmt(z.mean_interval_score),fmt((z.mean_interval_score/base.mean_interval_score-1)*100,1)+'%']));
 const candidates=metrics.map(z=>({...z,label:z.method,coveragePct:z.coverage*100}));
 intervalScatter(candidates);
 $('intervalInflation').innerHTML=table(['Fixed legacy width multiplier','2026 coverage','Mean width','90% interval score'],I.fixed_width_controls.filter(z=>z.horizon===h&&z.model===model).map(z=>[fmt(z.multiplier,1)+'×',fmt(z.coverage*100,1)+'%',fmt(z.mean_width),fmt(z.mean_interval_score)]));
 $('intervalControlNote').textContent='These fixed 1.5×, 2× and 3× widening controls always refer to 2026. They are disclosed alongside the adaptive methods; higher coverage alone does not establish a better forecast. A second set of controls, calibrated to candidate coverage before 2026, is in the evidence download.';
 $('intervalBootstrap').innerHTML=table(['Method','2026 score difference','Exploratory 95% range'],I.comparisons.filter(z=>z.horizon===h&&z.model===model).map(z=>[z.method,fmt(z.score_difference),fmt(z.bootstrap95[0])+' to '+fmt(z.bootstrap95[1])]));
 const method=$('intervalMethod').value;
 $('intervalLatest').innerHTML=table(['Research interval','Point','Lower','Upper','Width'],I.latest.filter(z=>z.horizon===h&&z.model===model&&z.method===method).map(z=>[z.method,money(z.prediction),money(z.lower),money(z.upper),fmt(z.width)]));
 $('intervalSelection').textContent=`For ${model}, horizon ${h}, the pre-2026 choice (${choice.selected_before2026}) has 2026 coverage ${fmt(choice.selected_2026.coverage*100,1)}%, mean width ${fmt(choice.selected_2026.mean_width)}, and interval score ${fmt(choice.selected_2026.mean_interval_score)}, versus legacy score ${fmt(choice.legacy_2026.mean_interval_score)}. This is a historical comparison, not independent prospective validation.`;
 $('intervalLimitations').innerHTML=I.limitations.map(z=>'<li>'+z+'</li>').join('');if(typeof renderPlainIntervals==='function')renderPlainIntervals();
}
function intervalScatter(rows){
 const W=1000,H=330,L=65,B=55,T=25,R=260,maxW=Math.max(...rows.map(z=>z.mean_width))*1.12,minC=Math.min(50,...rows.map(z=>z.coveragePct))-5;
 const x=v=>L+v/maxW*(W-L-R),y=v=>T+(100-v)/(100-minC)*(H-T-B);let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="Coverage against mean interval width"><text x="${L}" y="15" font-size="11" fill="#566d69">Coverage % · target 90%</text>`;
 for(let v=Math.ceil(minC/10)*10;v<=100;v+=10)svg+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#dde5df"/><text x="${L-10}" y="${y(v)+4}" text-anchor="end" font-size="11">${v}</text>`;
 svg+=`<line x1="${L}" x2="${W-R}" y1="${y(90)}" y2="${y(90)}" stroke="#bd6a34" stroke-dasharray="5 5"/>`;
 rows.forEach((z,i)=>{const color=['#89938e','#bd6a34','#087e83','#4f697e','#87668d','#797a38'][i];svg+=`<circle cx="${x(z.mean_width)}" cy="${y(z.coveragePct)}" r="6" fill="${color}"><title>${z.method}: ${fmt(z.coveragePct,1)}% coverage; width ${fmt(z.mean_width)}</title></circle><text x="${W-R+15}" y="${30+i*36}" font-size="11" fill="${color}">${z.method}</text>`;});
 [0,maxW/2,maxW].forEach(v=>svg+=`<text x="${x(v)}" y="${H-B+23}" font-size="11" text-anchor="middle">${fmt(v,1)}</text>`);svg+=`<text x="${L}" y="${H-5}" font-size="11">Mean width · USD per barrel · left is narrower, up is higher coverage</text></svg>`;$('intervalPlot').innerHTML=svg;
}
['intervalHorizon','intervalModel','intervalPeriod','intervalMethod'].forEach(id=>$(id).onchange=intervalLab);

function shippingState(arrivals,open,days,buffer){
 const capacity=20*open/100,queue=Math.max(0,(arrivals-capacity)*days),wait=queue/capacity,bufferVessels=arrivals*buffer,unbuffered=Math.max(0,queue-bufferVessels),clear=queue/(20-arrivals);
 return {arrivals,capacity,queue,wait,bufferVessels,unbuffered,clear,days,buffer,open};
}
function shippingLab(){
 const a=+$('shipArrivals').value,o=+$('shipOpen').value,d=+$('shipDays').value,b=+$('shipBuffer').value,z=shippingState(a,o,d,b);
 $('shipArrivalsOut').textContent=fmt(a,0)+' vessels / day';$('shipOpenOut').textContent=fmt(o,0)+'%';$('shipDaysOut').textContent=fmt(d,0)+' days';$('shipBufferOut').textContent=fmt(b,0)+' days';
 $('shippingMetrics').innerHTML=table(['Queue after disruption','Backlog / current capacity','Unbuffered delayed cargo','Clearance after reopening'],[[fmt(z.queue,0)+' vessel-equivalents',fmt(z.wait,1)+' days',fmt(z.unbuffered*.2,1)+' million barrels',fmt(z.clear,1)+' days']]);
 $('shippingStatus').textContent=z.queue===0?'Flow is stable under these assumptions. Capacity covers arrivals; no backlog accumulates.':z.unbuffered===0?'A queue builds, but the assumed inventory buffer covers its cumulative delayed cargo.': 'The queue exceeds the assumed inventory buffer. Some cargo remains unbuffered in this simplified balance.';
 const N=Math.min(24,Math.ceil(z.queue)),gate=50+o*1.2;let svg=`<svg viewBox="0 0 1000 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrative shipping bottleneck, queued vessels and inventory buffer"><defs><pattern id="waves" width="45" height="25" patternUnits="userSpaceOnUse"><path d="M0 15 Q12 5 24 15 T48 15" stroke="#b5d4d2" fill="none"/></pattern><g id="tanker"><path d="M-16 -5 L15 -5 L11 7 L-11 7 Z" fill="currentColor"/><rect x="-9" y="-11" width="9" height="6" rx="1" fill="currentColor"/><rect x="5" y="-10" width="4" height="5" fill="currentColor"/></g></defs><rect width="1000" height="370" fill="#eaf2ef"/><rect x="0" y="55" width="1000" height="250" fill="url(#waves)"/><text x="35" y="35" font-size="14" fill="#183737">UPSTREAM · ${fmt(a,0)} vessel-equivalents/day arrive</text><text x="640" y="35" font-size="14" fill="#183737">DOWNSTREAM · inventory buffer</text><path id="shipShoalTop" d="M420 55 L550 55 L525 ${180-gate/2} L445 ${180-gate/2} Z" fill="#c7d4bd"/><path id="shipShoalBottom" d="M420 305 L550 305 L525 ${180+gate/2} L445 ${180+gate/2} Z" fill="#c7d4bd"/><line id="shipGate" x1="480" y1="${180-gate/2}" x2="480" y2="${180+gate/2}" stroke="#bd6a34" stroke-width="3" stroke-dasharray="5 5"/><text id="shipCapacityLabel" x="480" y="330" font-size="13" text-anchor="middle" fill="#183737">${fmt(z.capacity,1)} vessels/day capacity · ${fmt(o,0)}% open</text>`;
 for(let i=0;i<N;i++)svg+=`<use href="#tanker" x="${55+(i%6)*53}" y="${105+Math.floor(i/6)*48}" color="${z.unbuffered>0?'#bd6a34':'#507e7b'}"/>`;
 if(!N)svg+='<use href="#tanker" x="250" y="180" color="#087e83"/>';
 svg+=`<text id="shipQueueLabel" x="35" y="330" font-size="13" fill="#183737">Backlog ${fmt(z.queue,0)} · icons are schematic</text><path d="M555 180 H720" fill="none" stroke="#087e83" stroke-width="3" stroke-dasharray="10 9" class="shipping-flow"/><use href="#tanker" x="625" y="155" color="#087e83"/>`;
 const fill=z.bufferVessels>0?Math.max(0,1-z.queue/z.bufferVessels):0;
 for(let i=0;i<3;i++)svg+=`<rect x="${770+i*65}" y="120" width="45" height="130" rx="5" fill="#fff" stroke="#7d9c91"/><rect x="${772+i*65}" y="${248-126*fill}" class="live-buffer-fill" width="41" height="${126*fill}" fill="${fill<.15?'#bd6a34':'#72a69c'}"/><ellipse cx="${792.5+i*65}" cy="120" rx="22.5" ry="7" fill="#d5e4dc" stroke="#7d9c91"/>`;
 svg+=`<text id="liveBufferLabel" x="835" y="280" font-size="13" text-anchor="middle" fill="#183737">${fmt(fill*100,0)}% illustrative buffer remaining</text><text x="35" y="362" font-size="11" fill="#566d69">ASSUMED FLUID QUEUE · initial queue 0 · normal capacity 20/day · cargo 0.2 million barrels/vessel · no live AIS data</text></svg>`;$('shippingDiagram').innerHTML=svg;if(typeof prepareShippingPlayback==='function')prepareShippingPlayback(z);
}
['shipArrivals','shipOpen','shipDays','shipBuffer'].forEach(id=>$(id).oninput=shippingLab);
document.querySelectorAll('[data-shipping]').forEach(el=>el.onclick=()=>{const s=el.dataset.shipping==='clear'?[10,100,14,7]:el.dataset.shipping==='severe'?[14,30,21,5]:[10,40,14,7];['shipArrivals','shipOpen','shipDays','shipBuffer'].forEach((id,i)=>$(id).value=s[i]);shippingLab();});
shippingLab();


