// Explicit allowlist: exports contain workspace content, not internal room metadata.
const fields=['id','updatedAt','title','body','folder','starred','archived','tags','reviewLater','reminderAt','reminderCompletedAt'];
export function backupItem(item){
 const result={};for(const field of fields)if(item[field]!==undefined)result[field]=item[field];
 return result;
}
export function parseBackup(text){
 const data=JSON.parse(text);
 if(!data||data.format!=='stillspace-export-v1'||!Array.isArray(data.notes)||!Array.isArray(data.reminders))throw Error('This is not a supported Stillspace JSON export.');
 if(data.notes.length+data.reminders.length>5000)throw Error('This backup exceeds the 5,000 item import limit.');
 const parse=(item,kind)=>{
  if(!item||typeof item!=='object'||Array.isArray(item)||typeof item.title!=='string'||typeof item.body!=='string'||typeof item.folder!=='string')throw Error('The backup contains an invalid item. Nothing was imported.');
  if(item.tags!==undefined&&(!Array.isArray(item.tags)||item.tags.length>20||item.tags.some(t=>typeof t!=='string'||!t.length||t.length>32)))throw Error('The backup contains invalid tags. Nothing was imported.');
  for(const key of ['reminderAt','reminderCompletedAt'])if(item[key]!=null&&(typeof item[key]!=='string'||!Number.isFinite(Date.parse(item[key]))))throw Error('The backup contains an invalid reminder date. Nothing was imported.');
  for(const key of ['starred','archived','reviewLater'])if(item[key]!==undefined&&typeof item[key]!=='boolean')throw Error('The backup contains invalid note metadata. Nothing was imported.');
  const result=backupItem(item);if(kind==='reminder'){if(!result.reminderAt)throw Error('A reminder is missing its date. Nothing was imported.');result.kind='reminder'}return result;
 };
 return [...data.notes.map(n=>parse(n,'note')),...data.reminders.map(n=>parse(n,'reminder'))];
}
