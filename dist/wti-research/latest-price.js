/* Display-only prices are separate from the frozen RESEARCH bundle. */
'use strict';
(async function(){
 const price=document.getElementById('currentWtiPrice'),date=document.getElementById('currentWtiDate'),status=document.getElementById('currentWtiStatus'),note=document.getElementById('scenarioAnchorNote');
 const remote='https://lucis999.github.io/wti-research/latest-wti.json';
 const urls=location.hostname==='lucis999.github.io'?['latest-wti.json']:[remote,'latest-wti.json'];
 for(const url of urls){try{
  const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Unavailable');
  const data=await response.json();
  const observed=Date.parse(data.observation_date+'T00:00:00Z'),checked=Date.parse(data.checked_at);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(data.observation_date)||!Number.isFinite(observed)||observed>Date.now()||!Number.isFinite(checked)||!Number.isFinite(data.price)||data.price<=0||data.price>10000||data.observation_date<R.forecast_origin)throw Error('Invalid observation');
  price.textContent=money(data.price)+' / barrel';date.textContent='Observation: '+data.observation_date+' · EIA RWTC daily spot';
  const stale=Date.now()-checked>48*3600000;
  status.textContent=(stale?'Update check is overdue. Last checked: ':'Source checked: ')+new Date(checked).toISOString().slice(0,16).replace('T',' ')+' UTC. Official spot data can lag today; this is not an intraday quote.';
  scenarioAnchor=data.price;note.textContent='Scenario starts from the published '+data.observation_date+' WTI spot price. Historical tests stay frozen.';scenario();return;
 }catch(error){/* Try the locally saved official observation next. */}}
 price.textContent=money(R.last_wti)+' / barrel';date.textContent='Saved research observation: '+R.forecast_origin;
 status.textContent='Latest update unavailable. Showing the saved research price, not today’s quote.';
 note.textContent='Using the saved research price from '+R.forecast_origin+'.';
})();
