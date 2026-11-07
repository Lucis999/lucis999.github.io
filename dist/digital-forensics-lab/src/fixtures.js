import {audioBytes} from './audio-fixture.js';
export function samples(){
 const enc=new TextEncoder();let pdf='%PDF-1.4\n';const offsets=[0];const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];const content='BT /F1 14 Tf 20 100 Td (SYNTHETIC FORENSICS LAB SAMPLE) Tj ET';objects.push('<< /Length '+content.length+' >>\nstream\n'+content+'\nendstream');objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+o+'\nendobj\n';});const x=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+x+'\n%%EOF\n';
 const mp3=audioBytes();
 return [{name:'synthetic-disguised.jpg',bytes:enc.encode(pdf)},{name:'synthetic-audio-no-extension',bytes:mp3},{name:'synthetic-unknown.bin',bytes:enc.encode('Synthetic unknown control; no supported magic.')}];
}

