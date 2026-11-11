import {useEffect,useMemo,useRef,useState} from 'react';
import {cloud} from './cloud';

// The room transports live views only; canonical data belongs to each participant.
const clean=n=>({id:n.id,title:n.title||'',body:n.body||'',folder:n.folder||'Personal',starred:!!n.starred,deleted:!!n.deleted,updatedAt:n.updatedAt,kind:n.kind==='reminder'?'reminder':'note',reminderAt:n.reminderAt||null,reminderCompletedAt:n.reminderCompletedAt||null});
const valid=n=>n&&typeof n.id==='string'&&n.id.length<=80&&typeof n.title==='string'&&typeof n.body==='string'&&typeof n.folder==='string'&&typeof n.updatedAt==='string'&&n.title.length<=10000&&n.body.length<=100000&&n.folder.length<=100;
export function useLiveWorkspace(room,personal,notify,onEnd){
 const peerId=useRef(crypto.randomUUID()),extraRef=useRef(new Set());
 const [extra,setExtra]=useState([]),[peers,setPeers]=useState({}),[status,setStatus]=useState('Connecting to shared workspace…');
 extraRef.current=new Set(extra);
 const local=useMemo(()=>room&&personal.ready&&(personal.session?.user?.id||'guest')===room.ownerId?[...personal.notes,...personal.reminderItems].filter(n=>!n.deleted&&(room.scope[n.kind==='reminder'?'reminders':'notes']||extraRef.current.has(n.id))):[],[room,personal.ready,personal.session?.user?.id,personal.notes,personal.reminderItems,extra]);
 const localRef=useRef(local);localRef.current=local;
 useEffect(()=>{setExtra([]);setPeers({});if(!room)return;let alive=true;let subscribed=false,lastValidated=Date.now();setStatus('Connecting to shared workspace…');const channel=cloud.channel('stillspace-live-v1:'+room.code,{config:{broadcast:{self:false}}});
 const send=()=>{if(!alive||!subscribed)return;if(Date.now()-lastValidated>15000){setStatus('Room validation unavailable; sharing paused');return}const items=localRef.current.map(clean);const payload={v:1,id:peerId.current,name:room.name,items};if(items.length>500||!items.every(valid)||JSON.stringify(payload).length>180000){setStatus('Too much data to share live. Reduce the selected app data.');return}channel.send({type:'broadcast',event:'snapshot',payload}).then(result=>{if(alive&&result!=='ok')setStatus('Connection interrupted; your originals remain local')}).catch(()=>{if(alive)setStatus('Connection interrupted; your originals remain local')})};
 channel.on('broadcast',{event:'snapshot'},({payload})=>{if(!alive||!payload||payload.v!==1||typeof payload.id!=='string'||payload.id===peerId.current||typeof payload.name!=='string'||payload.name.length>40||!Array.isArray(payload.items)||payload.items.length>500||!payload.items.every(valid))return;setPeers(old=>({...old,[payload.id]:{name:payload.name,items:payload.items,seen:Date.now()}}))});
 channel.on('broadcast',{event:'hello'},()=>send());channel.subscribe(s=>{if(!alive)return;if(s==='SUBSCRIBED'){subscribed=true;setStatus('Live · your shared data is visible');channel.send({type:'broadcast',event:'hello',payload:{v:1}});send()}else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(s)){subscribed=false;setStatus('Connection interrupted; shared data may be out of date')}});
 const refresh=setInterval(()=>{send();setPeers(old=>{const now=Date.now(),next=Object.fromEntries(Object.entries(old).filter(([,p])=>now-p.seen<12000));return Object.keys(next).length===Object.keys(old).length?old:next})},2000);
 const check=async()=>{try{const {data,error}=await cloud.rpc('stillspace_room_get',{p_code:room.code});if(!alive)return;if(error){setStatus('Room validation unavailable; sharing paused');return}if(!data){setStatus('Room deleted or expired');onEnd('This shared workspace was deleted or expired.');return}lastValidated=Date.now()}catch{if(alive)setStatus('Room validation unavailable; sharing paused')}};
 const expiry=setInterval(check,10000);return()=>{alive=false;clearInterval(refresh);clearInterval(expiry);cloud.removeChannel(channel)};
 },[room?.code]);
 const remote=useMemo(()=>Object.values(peers).flatMap(p=>p.items.map(n=>({...n,roomReadOnly:true,roomOwner:p.name}))),[peers]);
 const localIds=useMemo(()=>new Set(local.map(n=>n.id)),[local]);
 const all=[...local,...remote.filter(n=>!localIds.has(n.id))];
 const canEdit=id=>localIds.has(id);
 const update=(id,patch)=>{if(canEdit(id))personal.update(id,patch);else notify('This item is view-only; its owner can edit it')};
 const create=(folder,initial)=>{const id=personal.create(folder,initial);setExtra(old=>[...old,id]);return id};
 const createReminder=(title,time)=>{const id=personal.createReminder(title,time);setExtra(old=>[...old,id]);return id};
 return {session:null,ready:personal.ready,notes:all.filter(n=>n.kind!=='reminder'),reminderItems:all.filter(n=>n.kind==='reminder'),history:personal.history,status,update,create,createReminder,sync:()=>{},importGuest:()=>0,guestHasNotes:false,restoreVersion:(id,v)=>canEdit(id)&&personal.restoreVersion(id,v),peers:Object.values(peers).map(p=>p.name)};
}
