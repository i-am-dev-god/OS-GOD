export const CHUNK_SIZE = 320;
export const GROUP_SIZE = 20;
export const MAX_SIZE = 10 * 1024 * 1024;
export const MAX_CHUNKS = Math.ceil(MAX_SIZE / CHUNK_SIZE);
export function encodeBytes(bytes) { let s=''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); }
export function decodeBytes(str) { const s=atob(str); return Uint8Array.from(s, c=>c.charCodeAt(0)); }
export function hex(bytes) { return Array.from(bytes, b=>b.toString(16).padStart(2,'0')).join(''); }
export async function digest(bytes) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))); }
export function makeFrames(bytes, name, hash, id) {
  const total=Math.ceil(bytes.length/CHUNK_SIZE);
  return Array.from({length:total},(_,i)=>JSON.stringify({v:1,id,n:name,s:bytes.length,h:hash,t:total,i,d:encodeBytes(bytes.subarray(i*CHUNK_SIZE,(i+1)*CHUNK_SIZE))}));
}
export function parseFrame(text) {
  try {
    const f=JSON.parse(text);
    if(f.v!==1 || !/^[a-f0-9]{16}$/.test(f.id) || typeof f.n!=='string' || f.n.length<1 || f.n.length>255 || !Number.isInteger(f.s) || f.s<1 || f.s>MAX_SIZE || !/^[a-f0-9]{64}$/.test(f.h) || !Number.isInteger(f.t) || f.t!==Math.ceil(f.s/CHUNK_SIZE) || !Number.isInteger(f.i) || f.i<0 || f.i>=f.t || typeof f.d!=='string' || f.d.length>Math.ceil(CHUNK_SIZE/3)*4) return null;
    const data=decodeBytes(f.d); const expected=Math.min(CHUNK_SIZE,f.s-f.i*CHUNK_SIZE);
    if(data.length!==expected) return null;
    return {...f,data};
  } catch { return null; }
}
export function nextMissingGroup(chunks, total) { for(let i=0;i<total;i++) if(!chunks.has(i)) return Math.floor(i/GROUP_SIZE)+1; return null; }
export function groupRange(group,total) { if(!Number.isInteger(group)||group<1||group>Math.ceil(total/GROUP_SIZE)) return null; return [ (group-1)*GROUP_SIZE, Math.min(group*GROUP_SIZE,total) ]; }
export function matchesTransfer(a,b) { return a.id===b.id && a.n===b.n && a.s===b.s && a.h===b.h && a.t===b.t; }
