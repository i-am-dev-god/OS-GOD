import {useEffect,useLayoutEffect,useRef} from 'react';
import {frameFlight,OPEN_TIMING,CLOSE_TIMING} from './motion';

// The dimmer is a separate, compositor-animated layer. It never contains the
// moving panel, so fading it cannot fade or interrupt the panel's return flight.
export function usePanelMorph(anchor,motion,onClose){
 const panel=useRef(null),dimmer=useRef(null),animation=useRef(null),shade=useRef(null),closing=useRef(false),closeRef=useRef(onClose);closeRef.current=onClose;
 const enabled=()=>motion&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 useLayoutEffect(()=>{const node=panel.current;node?.querySelector('button')?.focus({preventScroll:true});if(!node||!enabled()||!node.animate)return;const source=anchor?.node?.isConnected?anchor.node.getBoundingClientRect():anchor?.rect;const frames=frameFlight(source,node.getBoundingClientRect());if(frames)animation.current=node.animate(frames,OPEN_TIMING);if(dimmer.current?.animate)shade.current=dimmer.current.animate([{opacity:0},{opacity:1}],{duration:250,easing:'ease-out'});return()=>{animation.current?.cancel();shade.current?.cancel()}},[]);
 useEffect(()=>{const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');const settle=()=>{if(motion&&!media?.matches)return;for(const a of [shade.current,animation.current])if(a){try{a.finish()}catch{a.cancel()}}};settle();media?.addEventListener?.('change',settle);return()=>media?.removeEventListener?.('change',settle)},[motion]);
 const close=()=>{if(closing.current)return;closing.current=true;const node=panel.current;const finish=()=>{closeRef.current();if(anchor?.node?.isConnected)anchor.node.focus({preventScroll:true})};if(animation.current){try{animation.current.finish()}catch{animation.current.cancel()}}const target=anchor?.node?.isConnected?anchor.node.getBoundingClientRect():anchor?.rect;const frames=node&&frameFlight(target,node.getBoundingClientRect(),false);if(!enabled()||!node?.animate||!frames){finish();return}animation.current?.cancel();shade.current?.cancel();node.style.pointerEvents='none';if(dimmer.current?.animate)shade.current=dimmer.current.animate([{opacity:1},{opacity:0}],{duration:CLOSE_TIMING.duration,easing:'ease-out',fill:'forwards'});const a=node.animate(frames,CLOSE_TIMING);animation.current=a;a.onfinish=finish};
 return {panel,dimmer,close};
}
