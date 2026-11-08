// Page-local asynchronous relay. No network socket and no third-party traffic.
export class BrowserRelay {
 constructor(){this.readyState=0;this.url='browser-local://isolated-message-channel';this.channel=new MessageChannel();this.channel.port1.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type!=='relay'||typeof m.payload!=='string'||m.payload.length>2000)throw Error('Invalid envelope');this.channel.port1.postMessage(JSON.stringify({type:'relay',id:m.id,payload:m.payload}));}catch{this.onerror?.()}};this.channel.port2.onmessage=e=>{if(this.readyState===1)this.onmessage?.({data:e.data})};setTimeout(()=>{this.readyState=1;this.onopen?.()},0);}
 send(raw){if(this.readyState!==1)throw Error('Relay not ready');this.channel.port2.postMessage(raw)}
 close(){this.readyState=3;this.channel.port1.close();this.channel.port2.close();this.onclose?.({code:1000})}
}
