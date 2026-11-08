// Pure synthetic threat model. Actual network connection security is never switched off.
export function evaluate(c, threat, action, changed=false){
 if(threat==='anonymous'&&c.auth)return {status:'blocked',reason:'Authentication rejected the synthetic unsigned sender.'};
 if(threat==='cross-origin'&&c.origin)return {status:'blocked',reason:'Origin allowlist rejected the synthetic foreign website.'};
 if(threat==='network'&&c.tls&&['view','edit'].includes(action))return {status:'blocked',reason:'TLS conceals payloads and rejects on-path modification.'};
 if(action==='drop')return {status:'dropped',reason:'Availability lost. TLS and integrity cannot force delivery.'};
 if(changed&&c.integrity)return {status:'blocked',reason:'Recipient rejected modified content: end-to-end integrity verification failed.'};
 return {status:'delivered',reason:changed?'Tampered message accepted by recipient.':action==='view'?'Payload exposed to the selected synthetic observer.':'Message delivered without modification.'};
}
