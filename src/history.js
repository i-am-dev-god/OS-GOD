// Device-local checkpoints. Never replace a note with a checkpoint until the user confirms.
export const HISTORY_LIMIT=20;
export const HISTORY_BYTES=512*1024;
const size=entry=>new TextEncoder().encode(entry.title+entry.body).length;
export function readHistory(key){try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return {}}}
export function checkpoint(history,note,force=false,now=Date.now()){
 if(!note||typeof note.title!=='string'||typeof note.body!=='string')return {history,saved:false};
 const entries=Array.isArray(history[note.id])?history[note.id]:[];
 if(entries[0]?.title===note.title&&entries[0]?.body===note.body)return {history,saved:false};
 if(!force&&entries[0]&&now-Date.parse(entries[0].savedAt)<30000)return {history,saved:false};
 const entry={id:crypto.randomUUID(),title:note.title,body:note.body,savedAt:new Date(now).toISOString()};
 if(size(entry)>HISTORY_BYTES)return {history,saved:false,tooLarge:true};
 let used=0;const kept=[entry,...entries].filter(item=>{if(typeof item.title!=='string'||typeof item.body!=='string')return false;used+=size(item);return used<=HISTORY_BYTES}).slice(0,HISTORY_LIMIT);
 return {history:{...history,[note.id]:kept},saved:true};
}
