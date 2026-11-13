import {useCallback,useEffect,useState} from 'react';
// Session-only, deadline based: throttled intervals don't accumulate drift.
export function useFocusTimer(notify){
 const [duration,setDuration]=useState(25*60),[remaining,setRemaining]=useState(25*60),[deadline,setDeadline]=useState(null),[now,setNow]=useState(Date.now()),[notifyOnFinish,setNotifyOnFinish]=useState(false),[permission,setPermission]=useState(()=>typeof Notification==='undefined'?'unsupported':Notification.permission);
 const finish=useCallback(()=>{notify('Focus timer finished');if(!notifyOnFinish||typeof Notification==='undefined'||Notification.permission!=='granted')return;try{new Notification('Stillspace timer finished',{body:'Your timer is complete.',tag:'stillspace-focus-timer'})}catch{navigator.serviceWorker?.getRegistration().then(reg=>reg?.showNotification('Stillspace timer finished',{body:'Your timer is complete.',tag:'stillspace-focus-timer'})).catch(()=>{})}},[notify,notifyOnFinish]);
 useEffect(()=>{if(!deadline)return;const tick=()=>setNow(Date.now());tick();const id=setInterval(tick,1000);document.addEventListener('visibilitychange',tick);return()=>{clearInterval(id);document.removeEventListener('visibilitychange',tick)}},[deadline]);
 useEffect(()=>{if(deadline&&now>=deadline){setDeadline(null);setRemaining(0);finish()}},[deadline,now,finish]);
 const seconds=deadline?Math.max(0,Math.ceil((deadline-now)/1000)):remaining;
 const configure=useCallback(minutes=>{if(deadline)return false;const n=Number(minutes);if(!Number.isInteger(n)||n<1||n>180)return false;setDuration(n*60);setRemaining(n*60);return true},[deadline]);
 const start=()=>{if(deadline)return;const value=remaining>0?remaining:duration;const time=Date.now();setNow(time);setDeadline(time+value*1000)};
 const pause=()=>{if(!deadline)return;const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setRemaining(left);setDeadline(null);if(left===0)finish()};
 const reset=()=>{setDeadline(null);setRemaining(duration)};
 const setNotifications=async enabled=>{if(!enabled){setNotifyOnFinish(false);return}if(typeof Notification==='undefined'){setPermission('unsupported');return}try{const next=Notification.permission==='granted'?'granted':await Notification.requestPermission();setPermission(next);setNotifyOnFinish(next==='granted')}catch{setNotifyOnFinish(false);setPermission('unsupported')}};
 return {seconds,duration,running:!!deadline,configure,start,pause,reset,notifyOnFinish,permission,setNotifications};
}
export function timerText(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
