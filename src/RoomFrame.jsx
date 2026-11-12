import React from 'react';
import {X} from 'lucide-react';
import {usePanelMorph} from './usePanelMorph';

export default function RoomFrame({title,anchor,motion,onClose,locked=false,sidebar,children}){
 const {panel,dimmer,close}=usePanelMorph(anchor,motion,onClose);
 const handleKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!locked)close();return}if(e.key!=='Tab')return;const items=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);if(!items.length)return;const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};
 return <div className="room-backdrop room-studio-backdrop" onPointerDown={e=>e.stopPropagation()}><div ref={dimmer} className="room-dimmer" aria-hidden="true"/><section ref={panel} className="room-studio glass-window morph-panel" role="dialog" aria-modal="true" aria-label={title} onKeyDown={handleKey}><aside className="room-studio-side">{sidebar}</aside><div className="room-studio-main"><div className="room-studio-bar"><span>STILLSPACE <i>/</i> LIVE ROOM</span><button type="button" className="room-studio-close" onClick={close} disabled={locked} aria-label="Close room settings"><X size={18}/></button></div>{children}</div></section></div>;
}
