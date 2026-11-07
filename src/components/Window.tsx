'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Minus, X } from 'lucide-react';
import type { WindowRect, WindowState } from '@/lib/types';
import { cn } from '@/lib/utils';

export type SnapZone = 'left' | 'right' | 'max' | null;

interface Props {
  window: WindowState;
  active: boolean;
  mobileActive: boolean;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onRectChange: (rect: WindowRect) => void;
  onSnapPreview: (zone: SnapZone) => void;
  onSnap: (zone: SnapZone) => void;
}

export default function WindowFrame(props: Props) {
  const { window: win } = props;
  const [liveRect, setLiveRect] = useState(win.rect);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ mode: 'move' | 'resize'; startX: number; startY: number; rect: WindowRect; zone: SnapZone } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!dragRef.current) setLiveRect(win.rect); }, [win.rect]);

  function bounds() {
    return frameRef.current?.parentElement?.getBoundingClientRect() ?? { left: 0, top: 0, width: globalThis.innerWidth, height: globalThis.innerHeight };
  }

  function startDrag(event: React.PointerEvent, mode: 'move' | 'resize') {
    if (win.maximized || globalThis.innerWidth < 768) return;
    if ((event.target as HTMLElement).closest('button,input,select,textarea,a')) return;
    event.preventDefault();
    props.onFocus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { mode, startX: event.clientX, startY: event.clientY, rect: liveRect, zone: null };
    setDragging(true);
  }

  function moveDrag(event: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const box = bounds();
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.mode === 'move') {
      const w = drag.rect.w;
      const h = drag.rect.h;
      const x = Math.min(Math.max(0, drag.rect.x + dx), Math.max(0, box.width - w));
      const y = Math.min(Math.max(0, drag.rect.y + dy), Math.max(0, box.height - h));
      setLiveRect({ ...drag.rect, x, y });
      let zone: SnapZone = null;
      if (event.clientY < box.top + 28) zone = 'max';
      else if (event.clientX < box.left + 28) zone = 'left';
      else if (event.clientX > box.left + box.width - 28) zone = 'right';
      drag.zone = zone;
      props.onSnapPreview(zone);
    } else {
      const w = Math.min(Math.max(320, drag.rect.w + dx), box.width - drag.rect.x);
      const h = Math.min(Math.max(240, drag.rect.h + dy), box.height - drag.rect.y);
      setLiveRect({ ...drag.rect, w, h });
    }
  }

  function endDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    props.onSnapPreview(null);
    if (drag.mode === 'move' && drag.zone) props.onSnap(drag.zone);
    else props.onRectChange(liveRect);
  }

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : { left: liveRect.x, top: liveRect.y, width: liveRect.w, height: liveRect.h, zIndex: win.z };

  return (
    <div ref={frameRef} className={cn('window glass', props.active && 'active', dragging && 'dragging', win.maximized && 'maximized', props.mobileActive && 'mobile-active')} style={style} role="dialog" aria-label={win.title} onPointerDown={props.onFocus}>
      <div className="window-header" onPointerDown={(event) => startDrag(event, 'move')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={props.onMaximize}>
        <div className="window-title"><span className="window-dot" /><strong>{win.title}</strong></div>
        <div className="window-actions">
          <button className="icon-button" onClick={props.onMinimize} aria-label="Minimize"><Minus size={15} /></button>
          <button className="icon-button" onClick={props.onMaximize} aria-label={win.maximized ? 'Restore' : 'Maximize'}>{win.maximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
          <button className="icon-button" onClick={props.onClose} aria-label="Close"><X size={15} /></button>
        </div>
      </div>
      <div className="window-body">{props.children}</div>
      {!win.maximized && <div className="resize-handle" onPointerDown={(event) => startDrag(event, 'resize')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} aria-hidden="true" />}
    </div>
  );
}
