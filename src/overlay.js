// Place a panel near its trigger without letting it escape the visible viewport.
export function overlayPosition(anchor, panel, viewport, gap=8){
 const margin=8, width=Math.min(panel.width,Math.max(0,viewport.width-2*margin)), height=Math.min(panel.height,Math.max(0,viewport.height-2*margin));
 const below=viewport.height-anchor.bottom-gap-margin,above=anchor.top-gap-margin;
 const side=below>=height||below>=above?'below':'above';
 const left=Math.max(margin,Math.min(anchor.left,viewport.width-width-margin));
 const ideal=side==='below'?anchor.bottom+gap:anchor.top-gap-height;
 const top=Math.max(margin,Math.min(ideal,viewport.height-height-margin));
 return {left,top,side};
}
