(() => {
  'use strict';
  let group='medical_devices',view='cloud',cloudScale=1;
  const cloudLayouts={};
  const $=id=>document.getElementById(id);
  const cell=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
  function value(t,year,method,study){
    const a=t[String(year)];
    return method==='tfidf'?a.tfidf:a.count/Math.max(1,study.years[String(year)].filtered_word_tokens)*10000;
  }
  function cloud(year,ranked,maxValue,method,study){
    if(view==='cloud')return classicCloud(year,ranked,maxValue,method,study);
    const canvas=$('cloud-'+year),ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,720,420);
    const used=[],palette=['#18382f','#47755e','#6a816b','#967645','#506674'];
    let placed=0;
    const positions=[];
    for(let i=0;i<ranked.length;i++){
      const t=ranked[i],weight=value(t,year,method,study);
      const size=11+Math.sqrt(weight/maxValue)*25;
      ctx.font=`${Math.round(size)}px Arial`;
      const width=ctx.measureText(t.term).width+12,height=size+8;
      if(width>690)continue;
      let position=null;
      for(let attempt=0;attempt<6000;attempt++){
        const angle=attempt*.25+(i%3)*.4,radius=2.5*Math.sqrt(attempt);
        const x=360+Math.cos(angle)*radius*2.45-width/2;
        const y=210+Math.sin(angle)*radius*1.4-height/2;
        if(x<12||y<10||x+width>708||y+height>410)continue;
        if(!used.some(b=>x<b.x+b.w&&x+width>b.x&&y<b.y+b.h&&y+height>b.y)){
          position={x,y,w:width,h:height};break;
        }
      }
      if(!position)continue;
      used.push(position);ctx.fillStyle=palette[i%palette.length];ctx.textBaseline='middle';
      ctx.fillText(t.term,position.x+6,position.y+height/2);placed++;
      positions.push({...position,term:t.term,weight});
    }
    canvas.setAttribute('aria-label',year+" keyword map, "+placed+" terms. Highest weights: "+ranked.slice(0,6).map(t=>t.term).join(', ')+". Exact values are in the table below.");
    canvas.dataset.placed=placed;
    canvas.dataset.view='keywords';
    canvas.onmousemove=e=>{
      const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*720,y=(e.clientY-rect.top)/rect.height*420;
      const p=positions.find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);
      canvas.title=p?p.term+' · '+(method==='tfidf'?'TF-IDF ':"per 10k words ")+p.weight.toFixed(method==='tfidf'?4:1):'';
    };
    const a=study.years[String(year)];
    $('cloud-meta-'+year).textContent=placed+" keywords · "+a.filtered_word_tokens.toLocaleString()+" cleaned tokens";
  }
  function classicCloud(year,ranked,maxValue,method,study){
    const canvas=$('cloud-'+year),ctx=canvas.getContext('2d');ctx.clearRect(0,0,720,420);
    const cellSize=3,cols=240,rows=140,occupied=new Uint8Array(cols*rows),positions=[];
    const colors=['#443983','#21918c','#31688e','#35a878','#7554a3','#657c36','#287e8c'];
    let placed=0;
    for(let i=0;i<ranked.length;i++){
      const term=ranked[i].term,weight=value(ranked[i],year,method,study),size=Math.max(8,Math.round((10+Math.pow(weight/maxValue,2.3)*92)*cloudScale));
      const temp=document.createElement('canvas'),tc=temp.getContext('2d');tc.font=size+'px Arial';
      const measure=tc.measureText(term),width=Math.ceil(measure.width)+10,height=Math.ceil(size*1.35)+8;
      if(width>700||height>400)continue;
      temp.width=width;temp.height=height;tc.font=size+'px Arial';tc.fillStyle=colors[i%colors.length];tc.textBaseline='middle';tc.fillText(term,5,height/2);
      let sprite=temp;
      if(i>2&&i%5===3&&width<390){
        sprite=document.createElement('canvas');sprite.width=height;sprite.height=width;
        const sc=sprite.getContext('2d');sc.translate(0,width);sc.rotate(-Math.PI/2);sc.drawImage(temp,0,0);
      }
      const w=Math.ceil(sprite.width/cellSize),h=Math.ceil(sprite.height/cellSize);
      const pixels=sprite.getContext('2d').getImageData(0,0,sprite.width,sprite.height).data,mask=[];
      for(let gy=0;gy<h;gy++)for(let gx=0;gx<w;gx++){
        let ink=false;
        for(let dy=0;dy<cellSize&&!ink;dy++)for(let dx=0;dx<cellSize;dx++){
          const px=gx*cellSize+dx,py=gy*cellSize+dy;
          if(px<sprite.width&&py<sprite.height&&pixels[(py*sprite.width+px)*4+3]>12){ink=true;break;}
        }
        if(ink)mask.push([gx,gy]);
      }
      let point=null;
      for(let attempt=0;attempt<12000;attempt++){
        const angle=attempt*.24,radius=.32*Math.sqrt(attempt),x=Math.round(cols/2+Math.cos(angle)*radius*2.6-w/2),y=Math.round(rows/2+Math.sin(angle)*radius*1.5-h/2);
        if(x<3||y<3||x+w>cols-3||y+h>rows-3)continue;
        if(!mask.some(([px,py])=>occupied[(y+py)*cols+x+px])){point={x,y};break;}
      }
      if(!point)continue;
      for(const [px,py] of mask){
        // One-cell breathing space prevents adjacent letter strokes from touching.
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const x=point.x+px+dx,y=point.y+py+dy;if(x>=0&&x<cols&&y>=0&&y<rows)occupied[y*cols+x]=1;
        }
      }
      ctx.drawImage(sprite,point.x*cellSize,point.y*cellSize);placed++;
      positions.push({x:point.x*cellSize,y:point.y*cellSize,w:sprite.width,h:sprite.height,term,weight});
    }
    canvas.dataset.placed=placed;canvas.dataset.view='cloud';
    const image=document.createElement('canvas');image.width=720;image.height=420;image.getContext('2d').drawImage(canvas,0,0);
    cloudLayouts[year]={image,positions};
    canvas.setAttribute('aria-label',year+" Word Cloud, "+placed+" terms placed. Highest weights: "+ranked.slice(0,6).map(t=>t.term).join(', ')+"; exact values are in the table below.");
    canvas.onmousemove=e=>{
      const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*720,y=(e.clientY-rect.top)/rect.height*420;
      const p=positions.find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);
      canvas.title=p?p.term+' · '+(method==='tfidf'?'TF-IDF ':"per 10k words ")+p.weight.toFixed(method==='tfidf'?4:1):'';
    };
    $('cloud-meta-'+year).textContent=placed+' / '+ranked.length+" keywords · "+study.years[String(year)].filtered_word_tokens.toLocaleString()+" cleaned tokens";
    return placed;
  }
  function render(){
    const study=window.KEYWORD_STUDY?.[group];if(!study)return;
    const method=$('keyword-method').value,limit=Number($('keyword-limit').value);
    const ranked={};
    for(const year of [2020,2025])ranked[year]=[...study.terms].filter(t=>value(t,year,method,study)>0).sort((a,b)=>value(b,year,method,study)-value(a,year,method,study)||a.term.localeCompare(b.term)).slice(0,limit);
    const maximum=Math.max(...[2020,2025].flatMap(year=>ranked[year].map(t=>value(t,year,method,study))));
    if(view==='cloud'){
      // Shrink the common mapping for BOTH years together, preserving cross-year scale.
      cloudScale=1;
      for(let attempt=0;attempt<8;attempt++){
        const counts=[2020,2025].map(year=>cloud(year,ranked[year],maximum,method,study));
        if(counts.every((n,i)=>n===ranked[[2020,2025][i]].length))break;
        cloudScale*=.85;
      }
      // Expand the packed glyphs into the available rectangle using ONE zoom for both years.
      const bounds=[2020,2025].map(year=>{
        const p=cloudLayouts[year].positions;
        return {year,left:Math.min(...p.map(b=>b.x)),top:Math.min(...p.map(b=>b.y)),
          right:Math.max(...p.map(b=>b.x+b.w)),bottom:Math.max(...p.map(b=>b.y+b.h))};
      });
      const zoom=Math.min(696/Math.max(...bounds.map(b=>b.right-b.left)),396/Math.max(...bounds.map(b=>b.bottom-b.top)));
      for(const b of bounds){
        const layout=cloudLayouts[b.year],canvas=$('cloud-'+b.year),ctx=canvas.getContext('2d');
        const tx=(720-(b.right-b.left)*zoom)/2-b.left*zoom,ty=(420-(b.bottom-b.top)*zoom)/2-b.top*zoom;
        ctx.clearRect(0,0,720,420);ctx.setTransform(zoom,0,0,zoom,tx,ty);ctx.drawImage(layout.image,0,0);ctx.setTransform(1,0,0,1,0,0);
        for(const p of layout.positions){p.x=p.x*zoom+tx;p.y=p.y*zoom+ty;p.w*=zoom;p.h*=zoom;}
        canvas.dataset.commonZoom=zoom.toFixed(5);
        canvas.dataset.inkWidth=((b.right-b.left)*zoom).toFixed(1);canvas.dataset.inkHeight=((b.bottom-b.top)*zoom).toFixed(1);
      }
    }else for(const year of [2020,2025])cloud(year,ranked[year],maximum,method,study);
    $('mining-method-note').textContent=method==='tfidf'?"TF-IDF highlights terms prominent in this document and less common across the study corpus. Both years share a vocabulary and IDF.":"Frequency counts cleaned words and phrases, normalized per 10,000 tokens to reduce the effect of different document lengths.";
    const selected=new Set([...(ranked[2020].map(t=>t.term)),...(ranked[2025].map(t=>t.term))]);
    const rows=study.terms.filter(t=>selected.has(t.term)).sort((a,b)=>Math.abs(value(b,2025,method,study)-value(b,2020,method,study))-Math.abs(value(a,2025,method,study)-value(a,2020,method,study))).slice(0,12);
    const body=$('keyword-table');body.replaceChildren();
    for(const t of rows){
      const a=value(t,2020,method,study),b=value(t,2025,method,study),delta=b-a,format=n=>n.toFixed(method==='tfidf'?4:1);
      const row=document.createElement('tr');row.append(cell('td',t.term),cell('td',format(a)),cell('td',format(b)),cell('td',(delta>0?'+':'')+format(delta)));body.append(row);
    }
    $('keyword-table-note').textContent="The 12 largest absolute changes among the two years' selected keywords. Unit: "+(method==='tfidf'?"normalized TF-IDF weight":"mentions per 10,000 tokens")+". Lower weight does not imply disappearance or business deterioration.";
    $('mining-corpus-note').textContent="Model corpus: "+(study.shared_corpus_firms||study.paired_corpus_firms)+" paired firms across four subgroups and both years (this subgroup: "+study.paired_corpus_firms+" firms); vocabulary: "+study.vocabulary_size.toLocaleString()+" features. Nine confirmed identity mismatches are excluded. Other review flags may affect IDF and rankings; this is not a verified industry-wide conclusion.";
  }
  window.drawMining=g=>{group=g;render();};
  document.querySelectorAll('[data-keyword-view]').forEach(button=>{
    button.addEventListener('click',()=>{
      view=button.dataset.keywordView;
      document.querySelectorAll('[data-keyword-view]').forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});
      $('keyword-view-panel').setAttribute('aria-labelledby',button.id);render();
    });
    button.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();const buttons=[...document.querySelectorAll('[data-keyword-view]')];
      const target=e.key==='Home'?buttons[0]:e.key==='End'?buttons[1]:buttons[1-buttons.indexOf(button)];target.click();target.focus();
    });
  });
  $('keyword-method').addEventListener('change',render);$('keyword-limit').addEventListener('change',render);
})();
