export const RULES = [
 {type:'PDF',ext:['pdf'],hex:'255044462d',trailer:'2525454f46'},
 {type:'JPEG',ext:['jpg','jpeg'],hex:'ffd8ff',trailer:'ffd9'},
 {type:'PNG',ext:['png'],hex:'89504e470d0a1a0a',trailer:'49454e44ae426082'},
 {type:'GIF',ext:['gif'],hex:'474946383761'}, {type:'GIF',ext:['gif'],hex:'474946383961'},
 {type:'ZIP container',ext:['zip','docx','xlsx','pptx','jar','odt'],hex:'504b0304'},
 {type:'GZIP',ext:['gz','tgz'],hex:'1f8b08'}, {type:'Windows executable',ext:['exe','dll'],hex:'4d5a'},
 {type:'WAV',ext:['wav'],hex:'52494646',at:8,extra:'57415645'}
];
export const hex = b => Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
const match=(b,h,o=0)=>hex(b.subarray(o,o+h.length/2))===h;
function frame(b,o){
 if(o+4>b.length||b[o]!==255||(b[o+1]&224)!==224)return null;
 const v=(b[o+1]>>3)&3,l=(b[o+1]>>1)&3,br=b[o+2]>>4,sr=(b[o+2]>>2)&3;
 if(v===1||l!==1||br===0||br===15||sr===3)return null;
 const rates=v===3?[44100,48000,32000]:v===2?[22050,24000,16000]:[11025,12000,8000];
 const kb=(v===3?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[br];
 return {length:Math.floor((v===3?144:72)*kb*1000/rates[sr])+((b[o+2]>>1)&1),sampleRate:rates[sr],channels:(b[o+3]>>6)===3?1:2};
}
export function identify(b){
 const candidates=RULES.filter(r=>match(b,r.hex)&&(!r.extra||match(b,r.extra,r.at)));
 if(candidates.length){const r=candidates[0];let trailerOffset=null;if(r.trailer){for(let i=b.length-r.trailer.length/2;i>=0;i--)if(match(b,r.trailer,i)){trailerOffset=i;break;}}
 return {...r,headerLength:r.hex.length/2,headerOffset:0,trailerOffset,confidence:'signature match',warnings:r.trailer&&trailerOffset===null?['Expected trailer not found; file may be truncated.']:[]};}
 let offset=0;
 if(match(b,'494433')) {if(b.length<10||[6,7,8,9].some(i=>b[i]>127))return unknown('Invalid ID3 header.');offset=10+((b[6]<<21)|(b[7]<<14)|(b[8]<<7)|b[9])+((b[5]&16)?10:0);}
 const f=frame(b,offset),n=f&&frame(b,offset+f.length);
 if(f&&n&&f.sampleRate===n.sampleRate)return {type:'MP3',ext:['mp3'],headerOffset:offset,headerLength:4,trailerOffset:null,confidence:'two consistent MPEG Layer III frames',audio:f,warnings:[]};
 return unknown(match(b,'494433')?'ID3 tag alone does not prove MP3 audio.':'No supported signature found.');
}
function unknown(w){return {type:'Unknown',ext:[],headerOffset:null,headerLength:0,trailerOffset:null,confidence:'unconfirmed',warnings:[w]};}
export function safeName(n){return n.replace(/[\\/<>:"|?*\u0000-\u001f]/g,'_').replace(/^\.+/,'_').slice(0,160)||'evidence';}
export function explain(r){
 const d=r.detection, declared=RULES.find(x=>x.ext.includes(r.extension));
 const claimedType=r.extension==='mp3'?'MP3':declared?.type;
 const filenameClaim=!r.extension?'No extension':claimedType?`${claimedType} (.${r.extension})`:`Unmapped extension (.${r.extension})`;
 const observedHeader=hex(r.bytes.subarray(d.headerOffset??0,(d.headerOffset??0)+(d.headerLength||Math.min(12,r.size)))).toUpperCase().match(/.{2}/g)?.join(' ')||'(empty file)';
 const expected=r.extension==='mp3'?'two consistent MPEG Layer III frame headers':declared?[declared.hex.toUpperCase().match(/.{2}/g).join(' '),declared.extra?`plus ${declared.extra.toUpperCase()} at offset ${declared.at}`:''].filter(Boolean).join(' '):null;
 const rules=d.type==='Unknown'?'No supported signature rule matched.':d.type==='MP3'?`Two consistent MPEG Layer III frame headers were found, beginning at offset ${d.headerOffset}.`:`The bytes at offset ${d.headerOffset} match the ${d.type} signature rule${d.extra?`, with the required subtype at offset ${d.at}`:''}.`;
 const reason=r.status==='Mismatch'?`The filename ends in .${r.extension}, but the detected signature indicates ${d.type}. Its accepted extensions are ${d.ext.map(x=>'.'+x).join(', ')}.`:r.status==='Missing extension'?`The filename has no extension, but the content matches ${d.type}. A .${d.ext[0]} extension is suggested.`:r.status==='Unknown'?`The type is unconfirmed because no supported signature was identified. This can mean an unsupported format, an empty or truncated file, or altered bytes; it does not prove corruption or malicious content.`:`The .${r.extension} extension is compatible with the detected ${d.type} signature. This checks format consistency, not authenticity or safety.`;
 return {label:r.status==='Unknown'?'Unconfirmed':r.status,filenameClaim,observedHeader,expectedHeader:expected,signatureReason:rules,reason,scope:d.type==='ZIP container'?'Only the ZIP container is detected. DOCX, XLSX and other ZIP-based subtypes are not independently verified.':'A signature match is a format clue, not full file validation.'};
}
export async function analyze(name,bytes,origin='user upload'){
 const data=new Uint8Array(bytes);const detection=identify(data);const extension=name.includes('.')?name.split('.').pop().toLowerCase():'';
 const status=detection.type==='Unknown'?'Unknown':!extension?'Missing extension':detection.ext.includes(extension)?'Consistent':'Mismatch';
 const sha256=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',data)));
 const base=safeName(name).replace(/\.[^.]+$/,'');
 const result={name,size:data.length,origin,sha256,extension,status,detection,recoveredName:detection.ext.length?base+'.recovered.'+detection.ext[0]:null,bytes:data};
 return {...result,explanation:explain(result)};
}
export function report(items,caseName,notes){return {schemaVersion:1,caseName,notes,createdAt:new Date().toISOString(),method:'Local signature triage; not full format validation or forensic acquisition.',sourceLimit:'Original Technical Report converted to PDF; 9 standalone original screenshots available. Paper and PPT unavailable. Synthetic results are separate from historical evidence.',results:items.map(({bytes,...r})=>r)};}
export function csv(items){const q=v=>'"'+String(/^[=+@-]/.test(String(v))?"'"+v:v).replace(/"/g,'""')+'"';return ['name,type,status,bytes,sha256,origin,reason,observed_header,expected_header',...items.map(r=>[r.name,r.detection.type,r.status,r.size,r.sha256,r.origin,r.explanation.reason,r.explanation.observedHeader,r.explanation.expectedHeader??''].map(q).join(','))].join('\r\n');}

