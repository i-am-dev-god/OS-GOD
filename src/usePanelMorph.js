import {useLayoutEffect,useRef} from 'react';
import {windowMorph} from './windowing';

// Overlay frames originate from their trigger and return to it on close.
export function usePanelMorph(anchor,motion,onClose){
 const panel=useRef(null),animation=useRef(null),closing=useRef(false),closeRef=useRef(onClose);closeRef.current=onClose;
 const enabled=()=>motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 useLayoutEffect(()=>{const node=panel.current;node?.querySelector('button')?.focus({preventScroll:true});if(!node||!enabled()||!node.animate)return;const source=anchor?.node?.isConnected?anchor.node.getBoundingClientRect():anchor?.rect;const from=windowMorph(source,node.getBoundingClientRect());if(!from)return;animation.current=node.animate([{...from,opacity:.55},{translate:'0px 0px',scale:'1',opacity:1,transformOrigin:'top left'}],{duration:440,easing:'cubic-bezier(.22,1,.36,1)'});return()=>animation.current?.cancel()},[]);
 const close=()=>{if(closing.current)return;closing.current=true;const node=panel.current;const finish=()=>{closeRef.current();if(anchor?.node?.isConnected)anchor.node.focus({preventScroll:true})};const target=anchor?.node?.isConnected?anchor.node.getBoundingClientRect():anchor?.rect;const to=node&&windowMorph(target,node.getBoundingClientRect());if(!enabled()||!node?.animate||!to){finish();return}animation.current?.cancel();node.style.pointerEvents='none';const a=node.animate([{translate:'0px 0px',scale:'1',opacity:1,transformOrigin:'top left'},{...to,opacity:0}],{duration:400,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});animation.current=a;a.onfinish=finish};
 return {panel,close};
}
