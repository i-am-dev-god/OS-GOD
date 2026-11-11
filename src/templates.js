// Templates describe window geometry only. They never contain note text or credentials.
const allowed=new Set(['library','reminders','settings','editor']);
export const builtInTemplates=[
 {id:'focus',name:'Focus',description:'A clear canvas for your notes.',windows:[{type:'library',maximized:true,x:0,y:0,w:1,h:1}]},
 {id:'planning',name:'Daily planning',description:'Notes and reminders, side by side.',windows:[{type:'library',x:.01,y:.07,w:.52,h:.80},{type:'reminders',x:.54,y:.07,w:.45,h:.80}]},
 {id:'setup',name:'Make it yours',description:'Keep Notes open while you adjust Settings.',windows:[{type:'library',x:.01,y:.07,w:.54,h:.80},{type:'settings',x:.56,y:.07,w:.43,h:.80}]},
];
export function readTemplates(key){try{const parsed=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(parsed))return [];return parsed.filter(t=>t&&typeof t.id==='string'&&typeof t.name==='string'&&t.name.length<=48&&Array.isArray(t.windows)&&t.windows.length>0&&t.windows.length<=12&&t.windows.every(w=>w&&allowed.has(w.type)&&(!('maximized'in w)||typeof w.maximized==='boolean')&&(w.type!=='editor'||typeof w.noteId==='string'&&w.noteId.length<=80)&&['x','y','w','h'].every(k=>Number.isFinite(w[k])&&w[k]>=0&&w[k]<=1.5))).slice(0,20)}catch{return []}}
export function captureWindows(windows,stage){
 if(!stage)return [];const bounds=stage.getBoundingClientRect();if(!bounds.width||!bounds.height)return [];
 const safe=(n)=>Math.max(0,Math.min(1.5,Math.round(n*1000)/1000));
 return [...windows].sort((a,b)=>a.z-b.z).filter(w=>!w.minimized&&allowed.has(w.type)).map(w=>{const node=[...stage.querySelectorAll('[data-window-id]')].find(el=>el.dataset.windowId===w.id);if(!node)return null;const r=node.getBoundingClientRect();return {type:w.type,...(w.type==='editor'?{noteId:w.noteId}:{}),x:safe((r.left-bounds.left)/bounds.width),y:safe((r.top-bounds.top)/bounds.height),w:safe(r.width/bounds.width),h:safe(r.height/bounds.height),maximized:!!w.maximized}}).filter(Boolean).slice(0,12);
}
