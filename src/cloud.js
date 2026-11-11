import { createClient } from '@supabase/supabase-js';
import {decodeNote,encodeNote} from './storage.js';
const url=import.meta.env.VITE_SUPABASE_URL || 'https://rydahqolemnvoedkufpm.supabase.co';
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_EfDC1O0rVV0U9kQ3S2YqXQ_O49_dtK9';
export const cloud=createClient(url,key);
export async function pullNotes(userId){
  const {data,error}=await cloud.from('memo_os_notes').select('id,data,updated_at,deleted').eq('user_id',userId);
  if(error)throw error;
  return data.map(row=>({...decodeNote(row.data),id:row.id,updatedAt:row.updated_at,deleted:row.deleted}));
}
export async function pushNotes(userId,notes){
  if(!notes.length)return;
  const rows=notes.map(note=>({id:note.id,user_id:userId,data:encodeNote(note),updated_at:note.updatedAt,deleted:!!note.deleted}));
  const {error}=await cloud.from('memo_os_notes').upsert(rows,{onConflict:'user_id,id'});
  if(error)throw error;
}
