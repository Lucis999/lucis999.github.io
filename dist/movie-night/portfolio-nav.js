'use strict';
const portfolioMenu=document.querySelector('.portfolio-menu');
portfolioMenu.addEventListener('click',()=>{const open=portfolioMenu.getAttribute('aria-expanded')!=='true';portfolioMenu.setAttribute('aria-expanded',String(open));document.getElementById('portfolio-navigation').classList.toggle('open',open);});
// Use Blob URLs so CSV downloads work reliably in the self-contained file.
document.querySelectorAll('a[download]').forEach(link=>link.addEventListener('click',()=>{if(!link.href.startsWith('data:'))return;const encoded=link.href.split(',')[1];const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'text/csv;charset=utf-8'}));link.href=url;setTimeout(()=>URL.revokeObjectURL(url),60000);}));
