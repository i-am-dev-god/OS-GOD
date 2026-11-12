import { gzipSync, gunzipSync, strToU8, strFromU8 } from 'fflate';
export function encodeNote(note) {
  const json=JSON.stringify(note); const raw=strToU8(json); const zipped=gzipSync(raw,{level:6});
  let binary=''; for (const b of zipped) binary+=String.fromCharCode(b);
  const packed='g:'+btoa(binary); const plain='j:'+json;
  return strToU8(packed).length < strToU8(plain).length ? packed : plain;
}
// Row metadata already exists in database columns. Old and new payloads both
// use the existing j:/g: codecs, so older clients can still decode them.
export function encodeCloudNote(note) {
  const {id,updatedAt,deleted,...content}=note;
  const compact=encodeNote(content),legacy=encodeNote(note);
  return bytes(compact)<=bytes(legacy)?compact:legacy;
}
export function decodeNote(data) {
  if(data.startsWith('j:')) return JSON.parse(data.slice(2));
  if(data.startsWith('g:')){const binary=atob(data.slice(2));return JSON.parse(strFromU8(gunzipSync(Uint8Array.from(binary,c=>c.charCodeAt(0)))));}
  throw Error('Unknown note format');
}
export function mergeNotes(local,remote) {
  const result=new Map(local.map(n=>[n.id,n]));
  for(const n of remote){const current=result.get(n.id);if(!current || Date.parse(n.updatedAt)>Date.parse(current.updatedAt))result.set(n.id,n);}
  return [...result.values()];
}
export function bytes(str){return strToU8(str).length;}
export function noteSize(notes){const usable=notes.filter(n=>!n.deleted);return {original:usable.reduce((s,n)=>s+bytes(JSON.stringify(n)),0),stored:usable.reduce((s,n)=>s+bytes(encodeCloudNote(n)),0)};}
export function readNotes(key, fallback=[]){try{const data=JSON.parse(localStorage.getItem(key));return Array.isArray(data)?data:fallback;}catch{return fallback;}}
