import { useState, useRef, useEffect, useCallback } from 'react';

const DRAG_THRESHOLD = 6;

export default function useDragBlocks({ docBlocks, blockRefs, onReorderBlocks, layoutColRefs, onDropToColumn }) {
  const [draggingIdx,   setDraggingIdx]   = useState(null);
  const [dropIdx,       setDropIdx]       = useState(null);
  const [hoveredColKey, setHoveredColKey] = useState(null);
  const dragRef = useRef(null);

  const getDropIndex = useCallback((clientY) => {
    let idx = docBlocks.length;
    for (let i = 0; i < blockRefs.current.length; i++) {
      const el = blockRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) { idx = i; break; }
    }
    return idx;
  }, [docBlocks.length, blockRefs]);

  const getHoveredCol = useCallback((clientX, clientY) => {
    if (!layoutColRefs?.current) return null;
    for (const [key, el] of Object.entries(layoutColRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top  && clientY <= rect.bottom) {
        return key;
      }
    }
    return null;
  }, [layoutColRefs]);

  const handleDragHandleMouseDown = useCallback((e, idx, blockId, setActiveBlockId) => {
    e.preventDefault();
    setActiveBlockId(blockId);
    dragRef.current = { fromIdx: idx, startX: e.clientX, startY: e.clientY, started: false };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const { startX, startY, started, fromIdx } = dragRef.current;
      if (!started) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        dragRef.current.started = true;
        setDraggingIdx(fromIdx);
      }
      const colKey = getHoveredCol(e.clientX, e.clientY);
      setHoveredColKey(colKey);
      setDropIdx(colKey ? null : getDropIndex(e.clientY));
    };
    const onUp = (e) => {
      if (!dragRef.current) return;
      const { fromIdx, started } = dragRef.current;
      if (started) {
        const colKey = getHoveredCol(e.clientX, e.clientY);
        if (colKey && onDropToColumn) {
          const [layoutBlockId, colIdxStr] = colKey.split('::');
          onDropToColumn(fromIdx, layoutBlockId, parseInt(colIdxStr, 10));
        } else {
          const to = getDropIndex(e.clientY);
          if (to !== fromIdx && to !== fromIdx + 1) onReorderBlocks(fromIdx, to);
        }
        setDraggingIdx(null);
        setDropIdx(null);
        setHoveredColKey(null);
      }
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [getDropIndex, getHoveredCol, onReorderBlocks, onDropToColumn]);

  return { draggingIdx, dropIdx, hoveredColKey, handleDragHandleMouseDown };
}
