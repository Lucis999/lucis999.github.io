'use strict';
// The playground uses counts, not the trained study-corpus embeddings or IDF.
const stop=new Set(('a about above after again against all am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just may me might more most must my myself no nor not now of off on once only or other our ours ourselves out over own same shall she should so some such than that the their theirs them themselves then there these they this those through to too under until up upon us very was we were what when where which while who whom why will with would you your yours yourself yourselves also across within without however therefore thus one two first second new use used using many much'.split(' ')));
function processText(text,extra,phrases){
 const counts=new Map();let raw=0,kept=0;const blocked=new Set([...stop,...extra]);
 // Sentence boundaries prevent phrases joining unrelated sentences.
 for(const sentence of text.normalize('NFKC').toLowerCase().split(/[.!?;:\n\r]+/)){
  const tokens=sentence.match(/[a-z]+(?:['’-][a-z]+)*/g)||[];raw+=tokens.length;let previous=null;
  for(let word of tokens){word=word.replace(/['’]s$/,'');if(word.length<3||blocked.has(word)){previous=null;continue;}
   kept++;counts.set(word,(counts.get(word)||0)+1);
   if(phrases&&previous){const phrase=previous+' '+word;counts.set(phrase,(counts.get(phrase)||0)+1);}previous=word;
  }
 }
 const terms=[...counts].filter(([t,c])=>!t.includes(' ')||c>=2).map(([term,count])=>({term,count,rate:kept?count/kept*10000:0})).sort((a,b)=>b.count-a.count||a.term.localeCompare(b.term));
 return {raw,kept,terms};
}
onmessage=({data})=>{try{const extra=(data.extra.toLowerCase().match(/[a-z]+/g)||[]);postMessage({a:processText(data.a,extra,data.phrases),b:data.b.trim()?processText(data.b,extra,data.phrases):null});}catch(e){postMessage({error:'The text could not be processed. Try a shorter plain-text extract.'});}};
