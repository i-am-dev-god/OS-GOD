// Keep a portion of the title bar reachable, even after a small viewport resize.
export function clampWindowPosition(x,y,width,height){return {x:Math.max(0,Math.min(Math.max(0,width-120),x)),y:Math.max(0,Math.min(Math.max(0,height-55),y))};}
export function taskAction(window,activeId){return !window?'open':window.id===activeId&&!window.minimized?'minimize':'focus';}
