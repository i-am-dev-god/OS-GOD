import {useCallback,useEffect,useState} from 'react';
// Ephemeral, deadline based: background throttling does not accumulate drift.
export function useFocusTimer(notify){
 const [duration,setDuration]=useState(25*60),[remaining,setRemaining]=useState(25*60),[deadline,setDeadline]=useState(null),[now,setNow]=useState(Date.now());
 useEffect(()=>{if(!deadline)return;const tick=()=>setNow(Date.now());tick();const id=setInterval(tick,500);document.addEventListener('visibilitychange',tick);return()=>{clearInterval(id);document.removeEventListener('visibilitychange',tick)}},[deadline]);
 useEffect(()=>{if(deadline&&now>=deadline){setDeadline(null);setRemaining(0);notify('Focus timer finished')}},[deadline,now,notify]);
 const seconds=deadline?Math.max(0,Math.ceil((deadline-now)/1000)):remaining;
 const configure=useCallback(minutes=>{if(deadline)return false;const n=Number(minutes);if(!Number.isInteger(n)||n<1||n>180)return false;setDuration(n*60);setRemaining(n*60);return true},[deadline]);
 const start=()=>{if(deadline)return;const value=remaining>0?remaining:duration;const time=Date.now();setNow(time);setDeadline(time+value*1000)};
 const pause=()=>{if(!deadline)return;const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setRemaining(left);setDeadline(null);if(left===0)notify('Focus timer finished')};
 const reset=()=>{setDeadline(null);setRemaining(duration)};
 return {seconds,duration,running:!!deadline,configure,start,pause,reset};
}
export function timerText(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
