(function(root){
'use strict';
const scenarios=[
 {id:'ransom',name:'Ransomware spread',zone:'员工终端 → 文件服务',weight:25,detail:'抽象事件：受影响终端尝试触达共享文件。无文件读写、加密或真实载荷。'},
 {id:'mitm',name:'Guest Wi-Fi interception',zone:'公共区域 / 客房 → HSIA 通信',weight:20,detail:'原案例第 1 页：中间人攻击干扰访客通信。此处仅模拟通信受扰状态，无拦截、凭据采集或真实请求。'},
 {id:'guest',name:'Lobby port intrusion',zone:'Lobby port → 酒店内网',weight:20,detail:'原案例第 1 页：访客通过大厅网口接入酒店内网。此处仅计算访问边界，无扫描、网络探测或设备操作。'},
 {id:'data',name:'Booking & payment data exposure',zone:'预订系统 → 敏感记录',weight:20,detail:'原案例第 1 页：预订资料泄露，包括信用卡等敏感信息。此处用抽象记录表示，无真实客户资料。'},
 {id:'outage',name:'DDoS booking outage',zone:'Internet → 预订服务可用性',weight:15,detail:'原案例第 1 页：DDoS 导致预订服务中断。此处只计算可用性风险，不生成流量或进行压力测试。'}
];
const controls=[
 {id:'segment',name:'Segmentation, 802.1X / RADIUS & guest isolation',cost:12,e:[.55,.05,.90,.10,.05]},
 {id:'mfa',name:'WPA3 / TLS & remote authentication',cost:7,e:[.10,.75,0,.10,0]},
 {id:'rbac',name:'Least privilege & RBAC',cost:6,e:[.20,.25,.10,.75,0]},
 {id:'edr',name:'Endpoint detection & response',cost:10,e:[.65,.20,0,.10,0]},
 {id:'backup',name:'Isolated backups & recovery exercises',cost:8,e:[.55,0,0,0,.25]},
 {id:'edge',name:'Edge protection & service resilience',cost:14,e:[0,.10,.15,0,.65]},
 {id:'training',name:'Staff training & response procedures',cost:4,e:[.20,.25,0,.15,.10]}
];
const roles=['Sales & Marketing','Finance','Human Resources','IT'];
const resources=['Customer information','Employee information','Payment records','Reservation records'];
// Original report Appendix Table 2 and presentation slide 11, transposed by role.
const matrix=[['RW','—','R','RW'],['RW','RW','RW','—'],['—','R','—','—'],['R','R','R','RW']];
const modernMatrix=[['R','—','—','RW'],['R','—','RW','R'],['—','RW','—','—'],['—','—','—','—']];
function residual(selected,factor=1){return scenarios.map((s,i)=>Math.min(100,s.weight*factor)*controls.reduce((r,c)=>r*(selected.includes(c.id)?1-c.e[i]:1),1));}
function risk(selected,factor=1){return residual(selected,factor).reduce((a,b)=>a+b,0);}
function cost(ids){return controls.filter(c=>ids.includes(c.id)).reduce((a,c)=>a+c.cost,0);}
function optimize(budget,factor=1){let best={ids:[],cost:0,risk:risk([],factor)};for(let mask=0;mask<2**controls.length;mask++){const ids=controls.filter((c,i)=>mask&(1<<i)).map(c=>c.id),spend=cost(ids),score=risk(ids,factor);if(spend<=budget&&(score<best.risk-1e-9||Math.abs(score-best.risk)<1e-9&&spend<best.cost))best={ids,cost:spend,risk:score};}return best;}
function authorize(role,resource,action,policy=matrix){const value=policy[role]?.[resource]||'—';return action==='Read'?value.includes('R'):value.includes('W');}
function guestAccess(after,target,isolation=true){return target==='Internet'||(!after||!isolation);}
// V2: one plan feeds network rules, authorization, event paths and scoring.
function clone(value){return JSON.parse(JSON.stringify(value));}
function defaults(){return {after:true,isolation:true,selected:['segment','mfa','rbac'],budget:30,policy:clone(matrix),policyMode:'original',factor:1,focus:4,importance:1,uncertainControl:'edge',effectScale:1,costScale:1};}
function enabled(p,id){return p.selected.includes(id)&&(id!=='segment'&&id!=='mfa'||p.after);}
function permissionDensity(policy){return policy.flat().reduce((n,v)=>n+(v.includes('R')?1:0)+(v.includes('W')?2:0),0)/48;}
function unitCost(c,p){return c.cost*(c.id===p.uncertainControl?p.costScale:1);}
function planCost(p){return controls.filter(c=>p.selected.includes(c.id)).reduce((n,c)=>n+unitCost(c,p),0);}
function weights(p){return scenarios.map((s,i)=>s.weight*p.factor*(i===p.focus?p.importance:1));}
function effectiveness(c,i,p){
 if(!enabled(p,c.id))return 0;
 let e=c.e[i];
 // Half of the segment package's MITM effect depends on HSIA isolation.
 if(c.id==='segment'&&!p.isolation)e*=i===1?0.5:1;
 // RBAC exposure depends on all 16 editable cells; this is a heuristic, not telemetry.
 if(c.id==='rbac')e*=0.4+0.6*(1-permissionDensity(p.policy));
 return Math.min(.95,Math.max(0,e*(c.id===p.uncertainControl?p.effectScale:1)));
}
function evaluate(p){const base=weights(p);const values=base.map((v,i)=>controls.reduce((n,c)=>n*(1-effectiveness(c,i,p)),v));
 return {base,values,baseline:base.reduce((a,b)=>a+b,0),risk:values.reduce((a,b)=>a+b,0),cost:planCost(p),feasible:planCost(p)<=p.budget+1e-9};}
function solve(p,budget=p.budget){let best=null;for(let mask=0;mask<2**controls.length;mask++){const ids=controls.filter((c,i)=>mask&(1<<i)).map(c=>c.id),q={...p,selected:ids,budget},v=evaluate(q);if(v.feasible&&(!best||v.risk<best.risk-1e-9||Math.abs(v.risk-best.risk)<1e-9&&v.cost<best.cost-1e-9))best={ids,cost:v.cost,risk:v.risk};}return best;}
function planGuest(p,target){return target==='Internet'||!(enabled(p,'segment')&&p.isolation);}
function planAuthorize(p,role,resource,action){return !enabled(p,'rbac')||authorize(role,resource,action,p.policy);}
function preset(key,p=defaults()){
 const q=clone(p);q.policyMode=key==='modern'?'modern':'original';q.policy=clone(key==='modern'?modernMatrix:matrix);
 q.after=key!=='before';q.isolation=key!=='before';
 q.selected=key==='before'?[]:key==='report'?['segment','mfa','rbac','edr','backup','training']:[];
 if(key==='modern')q.selected=solve(q).ids;
 return q;
}
function event(p,i,request={role:3,resource:2,action:'Read'}){
 const seg=enabled(p,'segment'),tls=enabled(p,'mfa'),rbac=enabled(p,'rbac');
 const routes=[['staff','finance','db'],['guest','internet','dmz'],['lobby','staff','db'],['staff','finance','db'],['internet','dmz','finance']];
 const guarded=[seg,tls,seg,!planAuthorize(p,request.role,request.resource,request.action),enabled(p,'edge')][i];
 const gate=[seg?'Segmentation constrains lateral movement':'No effective segmentation; cross-zone access remains exposed',tls?'Secure communications constrain this simulated interception path':'Communications protection is inactive; the disruption path remains',seg?'802.1X / RADIUS denies the untrusted device':'The simulated lobby-to-business path is open',rbac?(guarded?'RBAC rejects this request':'RBAC permits this request; auditing is still needed'):'RBAC is disabled; the local model treats access as unconstrained',enabled(p,'edge')?'Edge protection and resilience mitigate service pressure':'Edge capacity protection is missing; availability is affected'][i];
 const recover=[enabled(p,'backup')?'隔离备份支持恢复；恢复时间未建模':'缺少隔离备份，恢复能力未建模','复核无线配置、证书与访客隔离','复核物理网口与准入日志','复核数据授权、访问审计与最小权限','与上游服务商协调，验证连续性方案'][i];
 return {route:routes[i],guarded,steps:[{node:routes[i][0],title:'事件出现',text:scenarios[i].detail},{node:routes[i][1],title:'访问尝试',text:scenarios[i].zone+' · 仅本地抽象移动'},{node:routes[i][1],title:'控制检查',text:gate},{node:routes[i][guarded?1:2],title:'剩余影响',text:'本场景残余指数 '+evaluate(p).values[i].toFixed(1)+'；路径受限不代表完全消除事件风险。'},{node:routes[i][2],title:'响应与恢复',text:recover}]};
}
// Fictional physical layout: no original floor/room placement is claimed.
const hotelFloors=[{id:3,name:'3F 客房层',sub:'301–308 / Guest rooms'},{id:2,name:'2F 部门办公室',sub:'Sales · Finance · HR · IT'},{id:1,name:'1F 大厅与公共区',sub:'Lobby · Front desk · HSIA'},{id:-1,name:'B1 机房与服务区',sub:'Web · Business · Data tiers'}];
const hotelRooms=[
 ...Array.from({length:8},(_,i)=>({id:'room'+(301+i),floor:3,name:'客房 '+(301+i),sub:'访客终端 / Wi-Fi',x:30+(i%4)*175,y:i<4?45:265,w:155,h:120,controls:['segment','mfa'],source:'原报告 §IV 的客房 HSIA；房号与位置为虚构扩展。'})),
 {id:'sales',floor:2,name:'Sales & Marketing',sub:'S&M · 员工终端',x:30,y:45,w:155,h:120,controls:['rbac','edr','segment'],role:0,source:'报告 Table 2 / PPT 11 的 S&M；办公室布局为虚构。'},
 {id:'financeOffice',floor:2,name:'财务部',sub:'Finance · 付款记录',x:205,y:45,w:155,h:120,controls:['rbac','edr'],role:1,source:'原始矩阵 Finance 权限保留；房间为虚构。'},
 {id:'hr',floor:2,name:'Human Resources',sub:'HR · 员工资料',x:380,y:45,w:155,h:120,controls:['rbac','edr'],role:2,source:'原始矩阵 HR 权限保留；房间为虚构。'},
 {id:'it',floor:2,name:'IT Operations办公室',sub:'IT · 管理终端',x:555,y:45,w:155,h:120,controls:['rbac','edr','training'],role:3,source:'原始矩阵 IT 权限与现代化职责分离可切换；房间为虚构。'},
 {id:'meeting',floor:2,name:'会议与培训室',sub:'响应演练 / 员工培训',x:30,y:265,w:330,h:120,controls:['training'],source:'原报告培训建议；此房间为虚构。'},
 {id:'lobbyPort',floor:1,name:'大厅公共网口',sub:'不可信接入点',x:30,y:45,w:155,h:120,controls:['segment'],source:'案例 p1–2 明确提到大厅网口；位置为虚构。'},
 {id:'wifi',floor:1,name:'Guest Wi-Fi 区',sub:'HSIA AP / 接入边界',x:205,y:45,w:155,h:120,controls:['segment','mfa'],source:'原报告 §IV / PPT 10 的 HSIA；AP 位置为虚构。'},
 {id:'reception',floor:1,name:'前台接待处',sub:'预订 / 入住业务终端',x:380,y:45,w:330,h:120,controls:['rbac','edr','edge'],source:'案例酒店预订服务的业务映射；前台位置为虚构。'},
 {id:'lounge',floor:1,name:'大厅休息与餐饮区',sub:'访客设备 / 公共空间',x:30,y:265,w:330,h:120,controls:['segment','mfa'],source:'案例公共区域 HSIA 的示意空间。'},
 {id:'web',floor:-1,name:'Web booking器',sub:'Web tier / 公共服务',x:30,y:45,w:155,h:120,controls:['mfa','edge'],source:'案例 p2 的 Web tier；报告 §V 外部服务区。机房位置为虚构，安全域独立。'},
 {id:'business',floor:-1,name:'业务应用服务器',sub:'Business tier',x:205,y:45,w:155,h:120,controls:['segment','rbac','edge'],source:'案例 p2 的 Business tier；机柜位置为虚构。'},
 {id:'database',floor:-1,name:'数据库机柜',sub:'Data tier / 敏感资料',x:380,y:45,w:155,h:120,controls:['rbac','segment','backup'],source:'案例 p2 / 报告 §V 的数据库；敏感资料为抽象符号。'},
 {id:'files',floor:-1,name:'文件服务机柜',sub:'共享文件 / 部门资料',x:555,y:45,w:155,h:120,controls:['edr','segment','backup'],source:'报告 §V 的文件服务器；摆放位置为虚构。'},
 {id:'backupRoom',floor:-1,name:'Recovery console',sub:'连接独立隔离备份（逻辑）',x:30,y:265,w:330,h:120,controls:['backup','training'],source:'原报告建议异地备份。此处是Recovery console，不把隔离备份本体放在同一机房。'}
];
function hotelState(p,i,step,req={role:3,resource:2,action:'Read'}){
 const states=Object.fromEntries(hotelRooms.map(r=>[r.id,step<0?'idle':'clear'])),ev=event(p,i,req);
 const origin=['sales','room301','lobbyPort','web','web'][i];
 let affected=step<0?[]:[origin];
 if(step>=3&&!ev.guarded){const targets=[['financeOffice','hr','it','files','database'],['wifi','room302','lounge'],['sales','financeOffice','hr','it','database'],['database',...(['sales','financeOffice','hr','it'][req.role]?[['sales','financeOffice','hr','it'][req.role]]:[])],['business','reception']][i];affected.push(...targets);}
 // Without guest isolation, a modeled MITM incident can affect other guest endpoints.
 if(i===1&&step>=3&&!ev.guarded&&planGuest(p,'Finance'))affected.push('reception');
 affected=[...new Set(affected)];affected.forEach(id=>states[id]='affected');
 const recovered=step===4&&(i===0?enabled(p,'backup'):i===1?enabled(p,'mfa'):i===2?enabled(p,'segment'):i===4?enabled(p,'edge'):false);
 if(recovered)affected.forEach(id=>states[id]='recovered');
 const paths=[['sales','sales','sales',ev.guarded?'sales':'database','backupRoom'],['room301','wifi','wifi',ev.guarded?'room301':'room302','wifi'],['lobbyPort','lobbyPort','lobbyPort',ev.guarded?'lobbyPort':'financeOffice','lobbyPort'],['web','business','business',ev.guarded?'business':'database','database'],['web','web','web',ev.guarded?'web':'reception','web']];
 const focus=paths[i][Math.max(0,step)],room=hotelRooms.find(r=>r.id===focus);
 if(step>=0&&step<3&&states[focus]==='clear')states[focus]='checking';
 const departments=['sales','financeOffice','hr','it'].filter(id=>states[id]==='affected');
 return {states,origin,focus,floor:room.floor,affected:affected.filter(id=>states[id]==='affected'),recovered:affected.filter(id=>states[id]==='recovered'),departments,guarded:ev.guarded,note:i===3&&step===4?'已泄露的数据不能通过恢复撤回；红色保留，需调查与响应。':recovered?'蓝色为按已选控制演示的恢复/隔离完成，不代表真实设备已修复。':step===4?'缺少本场景恢复所需控制，受影响区域保持红色；不会自动恢复。':'房间颜色表示本次抽象事件影响，不代表真实入侵或真实安全状态。'};
}
const api={scenarios,controls,roles,resources,matrix,modernMatrix,residual,risk,cost,optimize,authorize,guestAccess,clone,defaults,enabled,permissionDensity,unitCost,weights,effectiveness,evaluate,solve,preset,planGuest,planAuthorize,event,hotelFloors,hotelRooms,hotelState};
if(typeof module!=='undefined')module.exports=api;else root.Model=api;
})(typeof globalThis!=='undefined'?globalThis:this);
