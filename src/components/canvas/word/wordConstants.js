export const PAPER_SIZES = {
  A4:     { w: 794,  h: 1123 },
  A3:     { w: 1123, h: 1587 },
  B5:     { w: 669,  h: 945  },
  Letter: { w: 816,  h: 1056 },
  Legal:  { w: 816,  h: 1344 },
};

export const MM_TO_PX = 3.7795;

export const BLOCK_FORMATS = [
  { icon: 'T',  label: '일반 텍스트', value: 'p',  fontSize: '13px', fontWeight: 'normal' },
  { icon: 'H1', label: '제목 1',     value: 'h1', fontSize: '30px', fontWeight: 'bold'   },
  { icon: 'H2', label: '제목 2',     value: 'h2', fontSize: '24px', fontWeight: 'bold'   },
  { icon: 'H3', label: '제목 3',     value: 'h3', fontSize: '20px', fontWeight: 'bold'   },
  { icon: 'H4', label: '제목 4',     value: 'h4', fontSize: '16px', fontWeight: 'bold'   },
  { icon: 'H5', label: '제목 5',     value: 'h5', fontSize: '14px', fontWeight: 'bold'   },
];

export const PLUS_MENU_ITEMS = [
  { id: 'textSize', label: '텍스트 크기 조정', icon: 'T', hasSub: true },
  { id: 'bullet',   label: '글머리 기호 목록', icon: '•' },
  { id: 'numbered', label: '번호 매기기 목록', icon: '1.' },
  { id: 'todo',     label: '할일 목록',        icon: '☐' },
  { id: 'callout',  label: '콜아웃',           icon: '💡' },
  { id: 'quote',    label: '인용',             icon: '❝' },
  { id: 'table',    label: '표',               icon: '⊞' },
  { id: 'divider',  label: '구분선',           icon: '―' },
  { id: 'layout',   label: '열 레이아웃',      icon: '◫' },
];

export const HEADING_FORMATS = [
  { label: '일반 텍스트', subtype: null,  fontSize: '13px', fontWeight: 'normal' },
  { label: '제목 1',      subtype: 'h1',  fontSize: '22px', fontWeight: 'bold'   },
  { label: '제목 2',      subtype: 'h2',  fontSize: '18px', fontWeight: 'bold'   },
  { label: '제목 3',      subtype: 'h3',  fontSize: '15px', fontWeight: 'bold'   },
  { label: '제목 4',      subtype: 'h4',  fontSize: '13px', fontWeight: 'bold'   },
  { label: '제목 5',      subtype: 'h5',  fontSize: '12px', fontWeight: 'bold'   },
];
