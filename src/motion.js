import {windowMorph} from './windowing';

// A restrained, asymmetric pull toward the destination. Scaling X slightly ahead
// of Y suggests a funnel without expensive per-frame mesh/filter rendering.
export function frameFlight(source,frame,opening=true,radius='13px'){
 const end=windowMorph(source,frame);
 if(!end)return null;
 const dx=source.left-frame.left,dy=source.top-frame.top;
 const sx=source.width/frame.width,sy=source.height/frame.height;
 const mid={translate:`${dx*.63}px ${dy*.48}px`,scale:`${1+(sx-1)*.72} ${1+(sy-1)*.48}`,transformOrigin:'top left',borderRadius:'20px'};
 const full={translate:'0px 0px',scale:'1 1',transformOrigin:'top left',borderRadius:radius,opacity:1};
 const small={...end,borderRadius:'24px',opacity:0};
 return opening?[small,{...mid,opacity:1,offset:.46},full]:[full,{...mid,opacity:1,offset:.54},small];
}
export const OPEN_TIMING={duration:420,easing:'cubic-bezier(.16,1,.3,1)'};
export const CLOSE_TIMING={duration:360,easing:'cubic-bezier(.4,0,.8,1)',fill:'forwards'};
export const LAYOUT_TIMING={duration:380,easing:'cubic-bezier(.2,.75,.25,1)'};
