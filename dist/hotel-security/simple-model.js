(function(root){
'use strict';
const M=typeof module!=='undefined'?require('./model.js'):root.Model;
const request={role:2,resource:2,action:'Read'}; // Fixed illustrative unauthorized payment-data request; no role UI needed.
function initial(){const p=M.defaults();return {mode:'improved',improved:M.preset('modern',p),scenario:0,step:-1,view:'hotel',follow:true};}
function current(s){return s.mode==='original'?M.preset('before',s.improved):M.clone(s.improved);}
function impact(s){return M.hotelState(current(s),s.scenario,s.step,request);}
function switchMode(s,mode){return {...s,mode};} // Keep the same phase for a direct comparison; UI pauses first.
function recommend(s){const q=M.clone(s.improved);q.after=true;q.isolation=true;q.policyMode='modern';q.policy=M.clone(M.modernMatrix);q.selected=M.solve(q).ids;return {...s,mode:'improved',improved:q,step:-1};}
function story(s){const p=current(s),h=impact(s),i=s.scenario,step=s.step,guard=M.event(p,i,request).guarded;
 if(step<0)return {title:'准备播放',text:'选择事件，点击播放。可在同一阶段切换原始环境与改进方案。'};
 const intros=['销售部终端出现异常，部门文件可能受到影响。','访客通信受到干扰，事件从客房网络进入。','访客通过大厅网口尝试接入酒店业务网络。','预订系统出现可疑访问，试图读取不应获得的付款资料。','外部请求使预订服务承压，影响在线预订。'];
 if(step===0)return {title:'事件出现',text:intros[i]};
 if(step===1)return {title:'访问与扩散',text:['异常终端尝试访问共享文件和其他业务系统。','事件尝试经过公共接入点影响通信。','接入请求正在到达员工网络与业务系统。','请求从预订应用进入业务层，准备访问敏感记录。','压力从 Web 入口传递到预订业务服务。'][i]};
 if(step===2)return {title:'防护检查',text:M.event(p,i,request).steps[2].text+'。'};
 if(step===3)return {title:'影响范围',text:i===3?(guard?'本次越权请求被拒绝，数据库未显示受影响。':'付款资料出现越权暴露，数据库和相关业务区域标红。'):guard?'关键路径受到限制；仍有 '+h.affected.length+' 个区域显示事件影响。':'事件继续影响 '+h.affected.length+' 个区域'+(h.departments.length?'，涉及 '+h.departments.length+' 个部门':'')+'。'};
 return {title:'响应与恢复',text:i===3?'已经暴露的资料无法靠恢复撤回，需继续调查。':h.recovered.length?'按当前控制演示恢复 '+h.recovered.length+' 个区域；蓝色不代表真实设备已修复。':'缺少本场景恢复所需的控制，受影响区域保持红色。'};
}
function layout(compact=false){const width=compact?460:860,cols=compact?2:4,start=compact?84:112,gap=12,w=compact?168:172,cellH=43,stride=56;let top=75,rooms=[];
 const floors=M.hotelFloors.map(f=>{const rr=M.hotelRooms.filter(r=>r.floor===f.id),rows=Math.ceil(rr.length/cols),height=rows*stride+17;rr.forEach((r,i)=>rooms.push({...r,bx:start+(i%cols)*(w+gap),by:top+8+Math.floor(i/cols)*stride,bw:w,bh:cellH}));const out={...f,y:top,h:height};top+=height+10;return out;});return {width,height:top+27,rooms,floors};}
const palette={idle:'#6f879b',clear:'#55c69e',checking:'#f2bd6d',affected:'#f27f91',recovered:'#76baff'};
function hotel(s,compact=false){const l=layout(compact),h=impact(s),phase=story(s);let svg=`<svg viewBox="0 0 ${l.width} ${l.height}" class="hotel-drawing" role="img" aria-label="多层酒店事件示意"><rect x="12" y="48" width="${l.width-24}" height="${l.height-62}" rx="14" fill="#0a1622" stroke="#3c566b"/><path d="M30 48 L${l.width*.27} 18 H${l.width*.73} L${l.width-30} 48" fill="#1d3546" stroke="#537184"/><text x="${l.width/2}" y="39" text-anchor="middle" class="hotel-sign">VAN615 HOTEL</text>`;
 for(const f of l.floors){svg+=`<rect x="22" y="${f.y}" width="${l.width-44}" height="${f.h}" rx="8" fill="#112130"/><text x="37" y="${f.y+28}" class="floor-title">${f.id===-1?'B1':f.id+'F'}</text><text x="37" y="${f.y+46}" class="floor-kind">${f.id===3?'客房':f.id===2?'办公':f.id===1?'大厅':'机房'}</text>`;}
 for(const r of l.rooms){const color=palette[h.states[r.id]],focus=s.step>=0&&h.focus===r.id;svg+=`<g class="simple-room ${h.states[r.id]} ${focus?'focused':''}" data-area="${r.id}"><rect x="${r.bx}" y="${r.by}" width="${r.bw}" height="${r.bh}" rx="6" fill="${h.states[r.id]==='affected'?'#422532':h.states[r.id]==='recovered'?'#17364d':'#172d3a'}" stroke="${color}"/><circle cx="${r.bx+13}" cy="${r.by+14}" r="3.5" fill="${color}"/><text x="${r.bx+23}" y="${r.by+18}" class="area-title">${r.name.replace('办公室','').replace('服务器','服务').replace('大厅公共','公共').replace('大厅休息与餐饮区','大厅休息区')}</text><path d="M${r.bx+10} ${r.by+r.bh+7} h${r.bw-20}" stroke="#3a5267" stroke-dasharray="5 6"/>`;
 if(r.floor===3)svg+=`<rect x="${r.bx+r.bw-39}" y="${r.by+25}" width="24" height="11" rx="2" fill="#446675"/><rect x="${r.bx+r.bw-37}" y="${r.by+27}" width="5" height="7" fill="#93b6bf"/>`;
 else if(r.floor===-1)svg+=`<rect x="${r.bx+r.bw-31}" y="${r.by+25}" width="16" height="12" rx="2" fill="#36576b"/><path d="M${r.bx+r.bw-28} ${r.by+29} h10 m-10 4 h10" stroke="#80c6c5"/>`;
 else svg+=`<rect x="${r.bx+r.bw-34}" y="${r.by+26}" width="19" height="10" rx="2" fill="#446675"/>`;
 svg+='</g>';}
 if(s.follow&&s.step>=1){const a=l.rooms.find(r=>r.id===h.origin),b=l.rooms.find(r=>r.id===h.focus);let start=[a.bx+a.bw/2,a.by+a.bh/2],end=[b.bx+b.bw/2,b.by+b.bh/2];if(s.step===4&&s.scenario===0&&h.recovered.length)[start,end]=[end,start];if(a.id===b.id)start=[end[0]-45,end[1]-24];const d=`M${start} Q${(start[0]+end[0])/2-30},${Math.min(start[1],end[1])-30} ${end}`;svg+=`<path class="event-trail ${s.step===4&&h.recovered.length?'restore':''}" d="${d}"/><circle class="event-dot" r="4"><animateMotion dur="1.7s" repeatCount="indefinite" path="${d}"/></circle>`;}
 svg+=`<title>${phase.title}：${phase.text}</title></svg>`;return svg;}
function network(s,compact=false){const width=compact?460:860,height=compact?540:500,h=impact(s),p=current(s),guard=M.event(p,s.scenario,request).guarded;
 const nn=[['internet','Internet',.5,.08],['public','访客 / 大厅网口',.16,.3],['web','Web 预订服务',.5,.3],['boundary','隔离 / 身份检查',.84,.3],['staff','部门终端',.16,.59],['business','业务服务',.5,.59],['database','数据库 / 文件',.5,.87],['backup','隔离备份',.84,.87]];
 const links=[[0,2],[1,3],[3,4],[2,5],[4,5],[5,6],[7,6]];
 let svg=`<svg viewBox="0 0 ${width} ${height}" class="network-drawing" role="img" aria-label="与酒店同步的事件网络图">`;
 const pos=id=>{const n=nn.find(n=>n[0]===id);return [n[2]*width,n[3]*height];};
 svg+=links.map(([a,b])=>`<line x1="${nn[a][2]*width}" y1="${nn[a][3]*height}" x2="${nn[b][2]*width}" y2="${nn[b][3]*height}" stroke="#3d596e" stroke-width="2"/>`).join('');
 const route=[['staff','business','database'],['public','web','business'],['public','boundary','staff','database'],['web','business','database'],['internet','web','business']][s.scenario];
 if(s.follow&&s.step>=1){let rr=route.slice(0,s.step<3||guard?2:route.length);if(s.step===4&&h.recovered.length&&s.scenario===0)rr=['backup','staff'];const d=rr.map((id,i)=>(i?'L':'M')+pos(id)).join(' ');svg+=`<path class="event-trail ${s.step===4&&h.recovered.length?'restore':''}" d="${d}"/><circle class="event-dot" r="4"><animateMotion dur="1.7s" repeatCount="indefinite" path="${d}"/></circle>`;}
 const nodeState=id=>id==='database'?(h.states.database==='affected'||h.states.files==='affected'?'affected':h.states.database):id==='staff'?(h.departments.length?'affected':h.recovered.some(r=>['sales','financeOffice','hr','it'].includes(r))?'recovered':s.step<0?'idle':'clear'):id==='public'?(h.states.lobbyPort==='affected'||h.states.room301==='affected'?'affected':s.step<0?'idle':'clear'):id==='boundary'&&s.step===2?'checking':h.states[id]|| (s.step<0?'idle':'clear');
 svg+=nn.map(([id,label,x,y])=>{const color=palette[nodeState(id)],w=compact?124:170;return `<g data-network-node="${id}"><rect x="${x*width-w/2}" y="${y*height-23}" width="${w}" height="46" rx="8" fill="#142938" stroke="${color}"/><text x="${x*width}" y="${y*height+5}" text-anchor="middle" class="node-label">${label}</text></g>`;}).join('');
 return svg+'</svg>';}
const api={request,initial,current,impact,switchMode,recommend,story,layout,hotel,network};if(typeof module!=='undefined')module.exports=api;else root.SimpleDemo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
