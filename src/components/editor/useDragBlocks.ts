import { useState, useRef, useEffect, useCallback } from 'react';

const DRAG_THRESHOLD = 6;

export default function useDragBlocks({
  docBlocks, blockRefs, onReorderBlocks, layoutColRefs, onDropToColumn,
  colBlockRefs, onDropColToMain, onMoveColBlock,
}) {
  const [draggingIdx,        setDraggingIdx]        = useState(null);
  const [draggingColBlockId, setDraggingColBlockId] = useState(null);
  const [dropIdx,            setDropIdx]            = useState(null);
  const [hoveredColKey,      setHoveredColKey]      = useState(null);
  // 열 내 드롭 위치: { colKey, insertBeforeBlockId }  (null이면 맨 끝)
  const [colDropInfo,        setColDropInfo]        = useState(null);
  const dragRef = useRef(null);

  const getDropIndex = useCallback((clientY) => {
    let idx = docBlocks.length;
    for (let i = 0; i < blockRefs.current.length; i++) {
      const el = blockRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) continue; // display:none (col blocks)
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

  // 열 안에서 어떤 블록 앞에 드롭할지 반환 (null = 맨 끝에 추가)
  const getColDropTargetBlockId = useCallback((clientY, colKey) => {
    if (!colBlockRefs?.current) return null;
    const [layoutId, colIdxStr] = colKey.split('::');
    const colIdx = parseInt(colIdxStr, 10);
    const blocks = docBlocks.filter(
      b => b.layoutRef?.layoutId === layoutId && b.layoutRef?.colIdx === colIdx
    );
    for (const b of blocks) {
      const el = colBlockRefs.current[b.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return b.id;
    }
    return null;
  }, [docBlocks, colBlockRefs]);

  // 메인 캔버스 블록 드래그 핸들
  const handleDragHandleMouseDown = useCallback((e, idx, blockId, setActiveBlockId) => {
    e.preventDefault();
    setActiveBlockId(blockId);
    dragRef.current = { fromIdx: idx, startX: e.clientX, startY: e.clientY, started: false, isColDrag: false };
  }, []);

  // 열 내부 블록 드래그 핸들
  const handleColDragHandleMouseDown = useCallback((e, blockId) => {
    e.preventDefault();
    dragRef.current = { fromBlockId: blockId, startX: e.clientX, startY: e.clientY, started: false, isColDrag: true };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const { startX, startY, started, fromIdx, fromBlockId, isColDrag } = dragRef.current;
      if (!started) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        dragRef.current.started = true;
        if (isColDrag) setDraggingColBlockId(fromBlockId);
        else           setDraggingIdx(fromIdx);
      }
      const colKey = getHoveredCol(e.clientX, e.clientY);
      setHoveredColKey(colKey);
      setDropIdx(colKey ? null : getDropIndex(e.clientY));
      if (colKey) {
        setColDropInfo({ colKey, insertBeforeBlockId: getColDropTargetBlockId(e.clientY, colKey) });
      } else {
        setColDropInfo(null);
      }
    };

    const onUp = (e) => {
      if (!dragRef.current) return;
      const { fromIdx, fromBlockId, started, isColDrag } = dragRef.current;

      if (started) {
        const colKey = getHoveredCol(e.clientX, e.clientY);

        if (isColDrag) {
          if (colKey) {
            const [layoutId, colIdxStr] = colKey.split('::');
            const insertBeforeBlockId = getColDropTargetBlockId(e.clientY, colKey);
            onMoveColBlock?.(fromBlockId, layoutId, parseInt(colIdxStr, 10), insertBeforeBlockId);
          } else {
            const docIdx = docBlocks.findIndex(b => b.id === fromBlockId);
            const to = getDropIndex(e.clientY);
            onDropColToMain?.(docIdx, to);
          }
        } else {
          if (colKey && onDropToColumn) {
            const [layoutBlockId, colIdxStr] = colKey.split('::');
            onDropToColumn(fromIdx, layoutBlockId, parseInt(colIdxStr, 10));
          } else {
            const to = getDropIndex(e.clientY);
            if (to !== fromIdx && to !== fromIdx + 1) onReorderBlocks(fromIdx, to);
          }
        }

        setDraggingIdx(null);
        setDraggingColBlockId(null);
        setDropIdx(null);
        setHoveredColKey(null);
        setColDropInfo(null);
      }
      dragRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [getDropIndex, getHoveredCol, getColDropTargetBlockId, onReorderBlocks, onDropToColumn,
      onDropColToMain, onMoveColBlock, docBlocks]);

  return { draggingIdx, draggingColBlockId, dropIdx, hoveredColKey, colDropInfo, handleDragHandleMouseDown, handleColDragHandleMouseDown };
}
