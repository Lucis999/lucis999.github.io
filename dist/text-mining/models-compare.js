(() => {
 'use strict';
 let group='medical_devices',year='2025',baseline='tfidf_full',alpha='50',selected=null;
 const $=id=>document.getElementById(id);
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const observations={software:{'2020':"Reading note: Salesforce has explicit marketing-journey support. Verb mentions Adobe partly through partner integrations. Chegg shares an education context with Adobe's eLearning, but comparable product functionality remains weakly supported.",'2025':"Reading note: Box's document signing and Salesforce/Twilio's customer-data and marketing functions have concrete support. Phunware's generative platform includes development plans; AI and creator language alone does not establish equivalent products."},semiconductors:{'2020':"Reading note: Ambarella and Qualcomm have specific AI-vision or GPU-graphics evidence. Micron and SMART Global fit a memory/systems ecosystem reading. Word2Vec also retrieves Summit, whose main business is wireless audio.",'2025':"Reading note: Qualcomm, Ambarella and Broadcom appear in both lists with specific business-line support. TF-IDF also retrieves memory/systems candidates. Skyworks focuses on analog and wireless connectivity; shared end markets do not establish equivalent computing products."}};
 function qualityFlags(text){return text.split('; ').map(f=>f==='large_length_change'?"Large change in document length":f==='filing_name_changed'?"Filing name changed between years":f.startsWith('shell_or_spac_language_')?f.slice(-4)+" source includes shell-company / SPAC language":f.startsWith('name_anchor_missing_')?f.slice(-4)+" source lacks a company-name anchor":f).join('; ');}
 function highlight(node,text,terms){
  const escape=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(!terms.length){node.textContent=text;return;}
  const pattern=new RegExp('\\b('+terms.map(escape).join('|')+')\\b','gi');let start=0;
  for(const m of text.matchAll(pattern)){node.append(document.createTextNode(text.slice(start,m.index)),el('mark','',m[0]));start=m.index+m[0].length;}
  node.append(document.createTextNode(text.slice(start)));
 }
 function evidence(a,p,review){
  const wrap=el('div','model-evidence-pair');
  for(const [role,name,text,file,rows] of [["Focal company",a.focal_name,review?.focal_evidence.text||p.focal_excerpt,a.source_file,a.source_rows],["Candidate company",p.name,review?.peer_evidence.text||p.peer_excerpt,p.source_file,p.source_rows]]){
   const card=el('article','evidence-card');card.append(el('div','evidence-label',role+' / '+year),el('div','evidence-name',name));
   const picked=role==="Focal company"?review?.focal_evidence:review?.peer_evidence;
   const words=[...(role==="Focal company"?a.keywords:p.keywords),...(picked?[picked.anchor]:[])];
   const short=el('blockquote','excerpt');highlight(short,text.slice(0,360),words);short.lang='en';card.append(short);
   const details=el('details','source-expand');details.append(el('summary','',"Full extract and source"));
   const full=el('blockquote','excerpt full-excerpt');highlight(full,text,words);full.lang='en';
   details.append(full,el('div','source',file+" · CSV data row (zero-based): "+rows.join(', ')+(picked?" · Character range ["+picked.start+', '+picked.end+')':'')));card.append(details);wrap.append(card);
  }
  return wrap;
 }
 function render(){
  const study=window.MODEL_COMPARISON?.groups[group];if(!study)return;
  const a=study.years[year],mount=$('model-comparison');if(!mount)return;
  const reading=window.READING_REVIEW?.groups[group]?.[year];
  mount.replaceChildren();
  const intro=el('div','model-experiment-note');intro.append(el('strong','',"Same texts. Different representations."),el('p','',year+" · "+a.candidate_count+" same-subgroup candidates. Nine confirmed identity mismatches are excluded from both training and retrieval pools; other review flags remain visible."));
  mount.append(intro);
  if(reading){
   const scope=el('div','reading-scope');scope.append(el('strong','',"Source-reading review: full TF-IDF and Word2Vec Top 5"),el('p','',"This case/year covers 10 ranked positions and "+reading.unique_pairs+" distinct candidates. These are assistant-led reading judgments awaiting independent confirmation, not accuracy scores or company ratings."));mount.append(scope);
   mount.append(el('p','reading-observation',observations[group][year]));
  }else mount.append(el('p','small subtle',"This reading review covers Adobe and NVIDIA only. This case has not been reviewed candidate by candidate."));
  const controls=el('div','model-controls');const lab=el('label','',"TF-IDF comparison: ");
  const select=el('select','');select.id='model-baseline';
  for(const [value,label] of [['tfidf_full',"Full text: words + phrases"],['tfidf_top10',"Top 10 keywords: controlled input"]]){const opt=el('option','',label);opt.value=value;select.append(opt);}
  select.value=baseline;select.onchange=()=>{baseline=select.value;selected=null;render();};lab.append(select);controls.append(lab);mount.append(controls);
  const t=a.rankings[baseline],w=a.rankings.word2vec,common=t.filter(id=>w.includes(id));
  if(!selected)selected={id:w[0],key:'word2vec'};
  const summary=el('div','model-result-summary');summary.append(el('strong','',"Top 5 overlap: "+common.length+' / 5'),el('span','',"Different rankings or score distributions do not establish better accuracy. Compare scores within each method, not across methods."));mount.append(summary);
  const grid=el('div','model-rank-grid');
  function list(title,subtitle,ids,key){
   const panel=el('section','model-rank-panel');panel.append(el('h4','',title),el('p','small subtle',subtitle));
   const dist=reading?.distribution[key];
   if(dist)panel.append(el('p','reading-distribution',"Reading review: supported "+dist.supported+" · partial "+dist.partial+" · weak "+dist.weak));
   ids.forEach((id,index)=>{
    const p=a.peers[String(id)],button=el('button','model-peer');button.type='button';button.dataset.peer=id;button.dataset.method=key;
    button.setAttribute('aria-pressed',String(selected?.id===id&&selected?.key===key));
    const name=el('span','');name.append(el('strong','',p.name),el('span','model-peer-tags',(common.includes(id)?"In both Top 5 lists":"Only in this Top 5")+(p.quality_status==='review_required'?" · data review needed":'')));
    const note=reading?.records[String(id)];
    name.append(el('span','reading-badge '+(note?'reading-'+note.status:'reading-unreviewed'),note?note.label:"Not reviewed in this round"));
    if(note)name.append(el('span','reading-row-reason',note.title));
    const score=key==='hybrid'?(1-Number(alpha)/100)*p.scores.tfidf_top10+Number(alpha)/100*p.scores.word2vec:p.scores[key];
    button.append(el('span','rank',String(index+1).padStart(2,'0')),name,el('span','score',score.toFixed(3)));
    button.onclick=()=>{selected={id,key};render();$('model-detail').scrollIntoView({behavior:'auto',block:'nearest'});};panel.append(button);
   });return panel;
  }
  grid.append(list('TF-IDF',baseline==='tfidf_full'?"Direct overlap in words and phrases":"The same 10 TF-IDF keywords only",t,baseline),list("Word2Vec · adapted original method","Top 10 words → summed 50-D embeddings → cosine ranking",w,'word2vec'));mount.append(grid);
  const changes=el('p','model-difference');
  changes.textContent="Word2Vec-only Top 5: "+(w.filter(id=>!t.includes(id)).map(id=>a.peers[String(id)].name).join(', ')||"none")+". TF-IDF-only: "+(t.filter(id=>!w.includes(id)).map(id=>a.peers[String(id)].name).join(', ')||"none")+'. ';mount.append(changes);
  if(group==='software'&&year==='2025'&&baseline==='tfidf_top10')mount.append(el('p','model-quality',"Failure case: the control retrieves Firefly Neuroscience. Adobe's Firefly product name overlaps with the candidate's company name, and the candidate carries a review flag. A prominent word can misdirect retrieval without establishing a comparable business."));
  const hybrid=el('details','hybrid-panel');hybrid.open=selected?.key==='hybrid';hybrid.append(el('summary','',"Experiment: mix the two representations"));
  const weightLabel=el('label','hybrid-label','Word2Vec '+alpha+"% / top-10 TF-IDF "+(100-Number(alpha))+'%');
  const slider=el('input','');slider.id='hybrid-weight';slider.type='range';slider.min='0';slider.max='100';slider.step='25';slider.value=alpha;slider.setAttribute('aria-label',"Word2Vec mixture weight");
  slider.oninput=()=>{alpha=slider.value;selected={id:a.mix_rankings[alpha][0],key:'hybrid'};render();};
  hybrid.append(weightLabel,slider,el('p','small subtle',"Concatenate normalized representations with square-root weights, then rank by cosine. At 0%, use top-10 TF-IDF; at 100%, use Word2Vec. This is exploratory, not a validated optimum."),list("Mixed-representation candidates","The same top-10 keyword input",a.mix_rankings[alpha],'hybrid'));mount.append(hybrid);
  const p=a.peers[String(selected.id)],detail=el('section','model-detail');detail.id='model-detail';
  const review=reading?.records[String(selected.id)];
  detail.append(el('h4','',"Investigate: "+p.name),el('p','model-quality',(p.quality_status==='review_required'?"Data review needed: "+qualityFlags(p.quality_flags):"Automated screen passed. Original filing identity and business relevance are not fully verified.")));
  if(review){
   const note=el('section','reading-note reading-'+review.status);note.append(el('div','reading-note-label',"Source-reading judgment · "+review.label),el('h5','',review.title),el('p','reading-judgment',review.judgment),el('p','reading-pitfall',"Watch for: "+review.pitfall));detail.append(note);
  }else detail.append(el('p','reading-scope',"This candidate was not covered by the reading review. These model-selected extracts do not automatically establish business relevance."));
  const keywords=el('div','model-keywords');keywords.append(el('p','',"Focal top-10 keywords: "+a.keywords.join(' · ')),el('p','',"Candidate top-10 keywords: "+p.keywords.join(' · ')),el('p','small subtle',"Word2Vec vocabulary coverage — focal "+a.in_vocab+'/'+a.keywords.length+"; candidate "+p.in_vocab+'/'+p.keywords.length+'. '));detail.append(keywords);
  if(selected.key==='word2vec'||selected.key==='hybrid'){
   detail.append(el('h5','',"Contextually similar word pairs"));
   const pairs=el('div','model-pairs');p.word_pairs.slice(0,4).forEach(pair=>pairs.append(el('span','term static',pair.focal+' ↔ '+pair.peer+' · '+pair.cosine.toFixed(2))));detail.append(pairs,el('p','small subtle',"These word-vector associations are not proof of a business relationship or causal contributions to the final rank."));
  }else {
   const direct=selected.key==='tfidf_top10'?a.keywords.filter(k=>p.keywords.includes(k)):p.shared_terms;
   detail.append(el('p','',(selected.key==='tfidf_top10'?"Direct overlap among the top 10: ":"Direct full-text overlap: ")+(direct.join(' · ')||"none; a zero-score candidate may enter through a ranking tie.")));
  }
  detail.append(el('h5','',review?"Evidence for the judgment · reading-selected extracts":"Source evidence · model-selected extracts"),el('p','small subtle',"Highlights mark keywords and extract anchors, not a claim that every sentence supports the match. Extracts may start or end mid-sentence; expand for context and source locations."),evidence(a,p,review));
  if(review){
   const extra=el('details','model-method');extra.append(el('summary','',"Compare the original model-selected extracts"),evidence(a,p));detail.append(extra);
  }
  mount.append(detail);
  const rubric=el('details','model-method');rubric.append(el('summary','',"Reading rubric and limitations"));
  rubric.append(el('p','',"Business-line support: both texts describe a specific overlapping function, technology use or business line. Partial / ecosystem link: a concrete connection exists, but roles, product layers or commercial stages differ. Weak / possible mismatch: the passages lack sufficiently specific support; this does not prove no connection exists."),el('p','',"This is an assistant-led, post-ranking reading review awaiting independent human confirmation, not blind review or an independent gold standard. No accuracy is calculated. Control and mixed lists inherit labels only for already-reviewed candidates; all others remain explicitly unreviewed."));mount.append(rubric);
  const method=el('details','model-method');method.append(el('summary','',"Model parameters, controls and boundaries"));
  const m=window.MODEL_COMPARISON.method;
  method.append(el('p','',"Word2Vec: Skip-gram, 50 dimensions, window=5, min_count=5, epochs=5, seed=508, one worker. Sum available vectors for the top 10 keywords without TF-IDF weighting, adapting the original notebook."),
   el('p','',"Training adaptation: the original notebook used all filings by year and four workers. This study uses a joint 2020/2025 four-subgroup corpus: "+m.training_firms+" firms, "+m.training_documents+" documents. One worker and a stable hash support reproducibility. This is retrospective exploration, not historical prediction."),
   el('p','',"Control: full TF-IDF versus Word2Vec changes both input compression and representation. The same top 10 words better isolate representation differences, while vocabulary coverage still matters. Both models use the same corpus and exclusions. This experiment refits global IDF across four subgroups, unlike the earlier per-subgroup prototype."),
   el('p','',"Top 5 overlap measures agreement, not accuracy. There is no independent relevance benchmark or evidence that a mixture weight improves relevance. Generic terms, corpus size and residual source issues can distort embeddings."));
  mount.append(method);
 }
 window.drawModelComparison=(g,y)=>{if(g!==group||y!==year)selected=null;group=g;year=String(y);render();};
})();
