// Match user text literally. Rendered as React text, never as HTML.
function match(text,term){if(!term)return null;const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(escaped,'i').exec(text||'')}
export function rankMatch(item,term){const title=(item.label||'').toLowerCase(),q=term.toLowerCase();if(title===q)return 100;if(title.startsWith(q))return 85;if(title.includes(q))return 70;if((item.tags||[]).some(t=>t.toLowerCase().includes(q)))return 55;if(item.body&&match(item.body,term))return 40;return 20}
export function excerpt(body,term){if(!body||!term)return null;const hit=match(body,term);if(!hit)return null;const start=Math.max(0,hit.index-45),end=Math.min(body.length,hit.index+hit[0].length+65);return {before:(start?'…':'')+body.slice(start,hit.index).replace(/\s+/g,' '),hit:hit[0],after:body.slice(hit.index+hit[0].length,end).replace(/\s+/g,' ')+(end<body.length?'…':'')};}
export function titleParts(text,term){const hit=match(text,term);return hit?{before:text.slice(0,hit.index),hit:hit[0],after:text.slice(hit.index+hit[0].length)}:null}

// Explicit filters are opt-in; unrecognised tokens remain literal search terms.
export function parseSearch(input){
 const tokens=(input.match(/(?:[^\s"]|"[^"]*")+/g)||[]).map(t=>t.replace(/"/g,''));
 const result={words:[],exclude:[],scope:'active',kind:'all',tag:null,flag:null,folder:null,before:null,after:null,error:''};
 for(const raw of tokens){const token=raw.toLowerCase();if(token.startsWith('-')&&token.length>1){result.exclude.push(token.slice(1));continue}const [key,...rest]=token.split(':');const val=rest.join(':');
  if(key==='in'&&['archive','trash','notes','reminders','personal','work','ideas'].includes(val)){if(['archive','trash'].includes(val))result.scope=val;else if(['notes','reminders'].includes(val))result.kind=val;else result.folder=val;continue}
  if(key==='tag'&&val){result.tag=val;continue}if(key==='is'&&['pinned','review','due','done'].includes(val)){result.flag=val;continue}
  if((key==='before'||key==='after')&&val){const m=val.match(/^(\d{4})-(\d{2})-(\d{2})$/),d=m?new Date(+m[1],+m[2]-1,+m[3]):null;if(!d||d.getFullYear()!==+m[1]||d.getMonth()!==+m[2]-1||d.getDate()!==+m[3])result.error='Use a valid date, for example after:2026-01-01.';else result[key]=d;continue}
  result.words.push(token)
 }
 return result;
}
export function searchItem(n,q,now=Date.now()){
 if(q.error)return false;const text=[n.title,n.body,n.folder,...(Array.isArray(n.tags)?n.tags:[])].filter(v=>typeof v==='string').join(' ').toLowerCase();
 if(!q.words.every(w=>text.includes(w))||q.exclude.some(w=>text.includes(w)))return false;
 if(q.tag&&!(Array.isArray(n.tags)?n.tags:[]).some(t=>typeof t==='string'&&t.toLowerCase()===q.tag))return false;
 if(q.folder&&(n.folder||'').toLowerCase()!==q.folder)return false;
 if(q.flag==='pinned'&&!n.starred||q.flag==='review'&&(!n.reviewLater||n.roomReadOnly)||q.flag==='done'&&!n.reminderCompletedAt||q.flag==='due'&&(!n.reminderAt||n.reminderCompletedAt||!Number.isFinite(Date.parse(n.reminderAt))||Date.parse(n.reminderAt)>now))return false;
 const updated=Date.parse(n.updatedAt);if(q.after&&!(updated>=q.after.getTime()))return false;if(q.before){const end=new Date(q.before);end.setDate(end.getDate()+1);if(!(updated<end.getTime()))return false}return true;
}
export function rankTokens(item,words){if(!words.length)return 0;const text=words.join(' ');return rankMatch(item,text)+words.reduce((score,w)=>score+rankMatch(item,w),0)/words.length}

// Suggest at most a one-character typo, only in titles and never silently run it.
export function nearTitle(title,term){if(!term||term.length<4||term.length>24)return false;return (title||'').toLowerCase().split(/[^\p{L}\p{N}]+/u).some(word=>{if(word.length<3||word.length>25||Math.abs(word.length-term.length)>1)return false;let i=0,j=0,edits=0;while(i<word.length&&j<term.length){if(word[i]===term[j]){i++;j++;continue}if(++edits>1)return false;if(word.length>term.length)i++;else if(word.length<term.length)j++;else{i++;j++}}return edits+(word.length-i)+(term.length-j)===1})}
