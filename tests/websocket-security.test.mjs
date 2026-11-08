import test from 'node:test';import assert from 'node:assert/strict';import {evaluate} from '../dist/websocket-security/model.js';
const off={tls:false,auth:false,origin:false,integrity:false};
test('plain network payload can be exposed and changed',()=>{for(const a of ['view','edit'])assert.equal(evaluate(off,'network',a,true).status,'delivered')});
test('TLS prevents network inspection and modification, permits forwarding',()=>{const c={...off,tls:true};for(const a of ['view','edit'])assert.equal(evaluate(c,'network',a,true).status,'blocked');assert.equal(evaluate(c,'network','forward').status,'delivered')});
test('TLS does not stop compromised relay',()=>assert.equal(evaluate({...off,tls:true},'relay','edit',true).status,'delivered'));
test('integrity stops edits but not listening',()=>{const c={...off,integrity:true};assert.equal(evaluate(c,'relay','edit',true).status,'blocked');assert.equal(evaluate(c,'relay','view').status,'delivered')});
test('authentication and origin are independent',()=>{assert.equal(evaluate({...off,auth:true},'anonymous','forward').status,'blocked');assert.equal(evaluate({...off,auth:true},'cross-origin','forward').status,'delivered');assert.equal(evaluate({...off,origin:true},'cross-origin','forward').status,'blocked');assert.equal(evaluate({...off,origin:true},'anonymous','forward').status,'delivered')});
test('all defense combinations cannot prevent dropping',()=>{for(let bits=0;bits<16;bits++){const c=Object.fromEntries(Object.keys(off).map((k,i)=>[k,Boolean(bits&(1<<i))]));for(const t of ['network','relay'])assert.equal(evaluate(c,t,'drop').status,'dropped')}});
test('unmodified signed messages pass',()=>assert.equal(evaluate({...off,integrity:true},'relay','forward').status,'delivered'));

import {BrowserRelay} from '../dist/websocket-security/transport.js';
const ready=()=>new Promise(resolve=>{const s=new BrowserRelay();s.onopen=()=>resolve(s)});
test('browser relay echoes asynchronous envelopes without sharing between sessions',async()=>{const a=await ready(),b=await ready();try{let leaked=false;b.onmessage=()=>leaked=true;const reply=new Promise(resolve=>a.onmessage=e=>resolve(JSON.parse(e.data)));a.send(JSON.stringify({type:'relay',id:1,payload:'synthetic'}));assert.deepEqual(await reply,{type:'relay',id:1,payload:'synthetic'});await new Promise(r=>setTimeout(r,30));assert.equal(leaked,false)}finally{a.close();b.close()}});
test('browser relay rejects malformed and oversized payloads',async()=>{const a=await ready();try{let error=new Promise(resolve=>a.onerror=resolve);a.send('invalid');await error;error=new Promise(resolve=>a.onerror=resolve);a.send(JSON.stringify({type:'relay',payload:'x'.repeat(2001)}));await error}finally{a.close()}});
test('closed browser relay refuses sends',async()=>{const a=await ready();a.close();assert.throws(()=>a.send('{}'),/not ready/)});
