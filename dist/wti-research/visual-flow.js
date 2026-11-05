'use strict';
if($('odeChart'))odeChart();robustness();
const flowParams=new URLSearchParams(location.search);
if(flowParams.get('period')==='2026'){$('period').value='2026';market();}
if(flowParams.get('embed')==='portfolio'){
 document.body.classList.add('portfolio-flow');
 let pending=false,lastHeight=0;
 function sendFlowHeight(){pending=false;const height=Math.ceil(document.body.getBoundingClientRect().height);if(Math.abs(height-lastHeight)>2){lastHeight=height;parent.postMessage({type:'oil-flow-height',height},location.origin);}}
 new ResizeObserver(()=>{if(!pending){pending=true;requestAnimationFrame(sendFlowHeight);}}).observe(document.body);
 window.addEventListener('load',sendFlowHeight);sendFlowHeight();
}
