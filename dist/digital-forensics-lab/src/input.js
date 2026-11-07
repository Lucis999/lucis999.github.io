// File.bytes is a browser method, while synthetic fixtures use a byte-array field.
export async function readEvidence(file){
 const data=file.bytes instanceof Uint8Array?file.bytes:new Uint8Array(await file.arrayBuffer());
 if(typeof file.size==='number'&&data.byteLength!==file.size)throw new Error('File read length differs from its declared size. Analysis stopped.');
 return data;
}
