'use strict';
let shipPlayback=null,shipFrame=null,shipDebounce=null,shipManualPause=false,shipMotionOverride=false;
const shipReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const SVG_NS='http://www.w3.org/2000/svg';
function stopShipFrame(){if(shipFrame!==null)cancelAnimationFrame(shipFrame);shipFrame=null;}
function boatPosition(index){return {x:340-(index%6)*52,y:index<6?180:index<12?110:250};}
function createBoat(id,color){let el=document.createElementNS(SVG_NS,'use');el.setAttribute('href','#tanker');el.setAttribute('color',color);el.setAttribute('data-boat-id',id);el.setAttribute('aria-hidden','true');return el;}
function prepareShippingPlayback(z){
 stopShipFrame();clearTimeout(shipDebounce);
 const svg=$('shippingDiagram').querySelector('svg');if(!svg)return;
 // Retain the tested queue-and-buffer graphic; replace its schematic boat icons with actual moving samples.
 svg.querySelectorAll('use,.shipping-flow').forEach(el=>el.remove());
 const queueLayer=document.createElementNS(SVG_NS,'g'),trafficLayer=document.createElementNS(SVG_NS,'g');queueLayer.id='shipQueueLayer';trafficLayer.id='shipTrafficLayer';svg.append(queueLayer,trafficLayer);
 const initial=z.queue>0?Math.min(15,Math.max(4,Math.ceil(z.queue))):2;
 shipPlayback={z,svg,queueLayer,trafficLayer,queue:[],moving:[],served:0,nextId:0,elapsed:0,last:0,nextArrival:30/z.arrivals,nextRelease:.45,arrivalGap:30/z.arrivals,releaseGap:30/z.capacity,travel:10+4*(1-z.open/100)};
 for(let i=0;i<initial;i++)enqueueBoat(shipPlayback);
 prepareHouseholdFlow(shipPlayback);updatePlaybackButton();renderShipFrame(shipPlayback,0);
 $('shipPlaybackNote').textContent='Boats move from the left, through the bottleneck, to the receiving side. Playback is illustrative; icons are samples and animation seconds are not real voyage days. Results below still describe the full chosen duration.';
 $('shipProgress').textContent=z.days===0?'Set the disruption duration above zero to play the flow.':shipReducedMotion.matches&&!shipMotionOverride?'Motion is off for your reduced-motion preference. Select Play animation to start.':'Settings applied · sample boats will pass one at a time.';
 if(!z.days||$('shipping').hidden)return;
 shipDebounce=setTimeout(startShipFrame,220);
}
function enqueueBoat(s){
 if(s.queue.length>=24)return;
 const id='boat-'+(++s.nextId),p=boatPosition(Math.min(s.queue.length,17)),el=createBoat(id,s.z.unbuffered>0?'#b66e46':'#507e7b');
 const b={id,x:p.x,y:p.y,el};el.setAttribute('transform',`translate(${b.x} ${b.y})`);s.queueLayer.append(el);s.queue.push(b);
}
function updatePlaybackButton(){const stopped=shipManualPause||(shipReducedMotion.matches&&!shipMotionOverride);$('shipMotion').textContent=stopped?'Play animation':'Pause animation';$('shipMotion').setAttribute('aria-pressed',String(stopped));}
function startShipFrame(){
 if(!shipPlayback||shipPlayback.elapsed>=shipPlayback.supplyDuration||shipManualPause||(shipReducedMotion.matches&&!shipMotionOverride)||$('shipping').hidden||document.hidden||!shipPlayback.z.days)return;
 stopShipFrame();shipPlayback.last=0;shipFrame=requestAnimationFrame(tickShips);
}
function tickShips(now){
 shipFrame=null;const s=shipPlayback;
 if(!s||shipManualPause||$('shipping').hidden||document.hidden)return;
 const dt=s.last?Math.min((now-s.last)/1000,.10):0;s.last=now;s.elapsed+=dt;
 s.releaseGap=30/(s.elapsed/s.supplyDuration*s.supplyEnd<s.z.days?s.z.capacity:20);
 if(s.elapsed>=s.nextArrival){enqueueBoat(s);s.nextArrival=s.elapsed+s.arrivalGap;}
 if(s.elapsed>=s.nextRelease&&s.queue.length){
  let b=s.queue.shift();b.startX=b.x;b.startY=b.y;b.born=s.elapsed;b.el.setAttribute('color','#087e83');b.el.setAttribute('data-state','sailing');s.trafficLayer.append(b.el);s.moving.push(b);s.nextRelease=s.elapsed+s.releaseGap;
 }
 renderShipFrame(s,dt);if(s.elapsed<s.supplyDuration)shipFrame=requestAnimationFrame(tickShips);else $('shipMotion').textContent='Replay flow';
}
function renderShipFrame(s,dt){
 const easing=dt?1-Math.exp(-dt*2.5):1;
 s.queue.forEach((b,i)=>{let p=boatPosition(Math.min(i,17));b.x+=(p.x-b.x)*easing;b.y+=(p.y-b.y)*easing;b.el.setAttribute('transform',`translate(${b.x.toFixed(2)} ${b.y.toFixed(2)})`);b.el.setAttribute('data-state','waiting');b.el.style.opacity=i<18?'1':'0';});
 const keep=[];
 for(const b of s.moving){
  const p=(s.elapsed-b.born)/s.travel;
  if(p>=1){b.el.remove();s.served++;continue;}
  const x=b.startX+(735-b.startX)*p,y=b.startY+(180-b.startY)*Math.min(1,p*3);b.el.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);b.el.style.opacity=p>.94?String((1-p)/.06):'1';keep.push(b);
 }
 s.moving=keep;renderHouseholdFlow(s);s.svg.dataset.playbackSeconds=s.elapsed.toFixed(2);s.svg.dataset.sampleArrivals=String(s.nextId);s.svg.dataset.sampleDelivered=String(s.served);
 if(s.z.days&&!(shipReducedMotion.matches&&!shipMotionOverride)){
  const text=`Illustrative flow · ${s.served} sample ${s.served===1?'boat has':'boats have'} reached the right side. ${s.elapsed/s.supplyDuration*s.supplyEnd>=s.z.days?'The route has reopened; spare capacity clears the queue.':s.z.capacity<s.z.arrivals?'Arrivals outpace the bottleneck, so waiting traffic builds.':'Transit capacity can keep up with arrivals.'}`;
  if($('shipProgress').textContent!==text)$('shipProgress').textContent=text;
 }
}
$('shipMotion').onclick=()=>{
 if(shipPlayback&&shipPlayback.elapsed>=shipPlayback.supplyDuration){shipManualPause=false;shipMotionOverride=true;shippingLab();return;}

 if(shipManualPause||(shipReducedMotion.matches&&!shipMotionOverride)){shipManualPause=false;shipMotionOverride=true;startShipFrame();}
 else{shipManualPause=true;stopShipFrame();}
 updatePlaybackButton();
};
$('shipReplay').onclick=()=>{shipManualPause=false;shipMotionOverride=true;shippingLab();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopShipFrame();else startShipFrame();});
shipReducedMotion.addEventListener('change',()=>{if(shipReducedMotion.matches&&!shipMotionOverride)stopShipFrame();else startShipFrame();updatePlaybackButton();});
shippingLab();
