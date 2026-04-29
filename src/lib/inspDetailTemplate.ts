let _seq = 0;
const uid = (prefix) => `id-${prefix}-${++_seq}`;

export function createInspDetailTemplate() {
  _seq = 0;

  const blocks = [
    // 문서 헤더
    { id: uid('w'), type: 'widget', title: '서버 및 WEB 점검 결과 보고서', titleSubtype: 'h1', headerItems: [
      { icon: 'clock', text: '2026-04-21', fontSize: 12 },
      { icon: 'user', text: '김세훈', fontSize: 12 },
    ]},

    // 1. 점검 결과 요약
    { id: uid('w'), type: 'widget', title: '점검 결과 요약', titleSubtype: 'h3', titleIcon: 'chart', code: `<div style="font-family: 'Apple SD Gothic Neo', sans-serif; display: flex; gap: 12px; margin: 4px 0;">
  <div style="flex:1; background: linear-gradient(135deg, #0056a4 0%, #3571ce 100%); border-radius: 10px; padding: 18px; color: white; box-shadow: 0 2px 8px rgba(0,86,164,0.25), 0 1px 2px rgba(0,0,0,0.06);">
    <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">전체 점검</div>
    <div style="font-size: 32px; font-weight: 700;">223건</div>
    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">32대 · 11항목</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">정상</div>
    <div style="font-size: 32px; font-weight: 700; color: #22c55e;">169건</div>
    <div style="margin-top: 8px; height: 6px; background: #e2e8f0; border-radius: 3px;"><div style="width: 75%; height: 100%; background: #22c55e; border-radius: 3px;"></div></div>
    <div style="font-size: 11px; color: #22c55e; margin-top: 4px;">75%</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">비정상</div>
    <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">50건</div>
    <div style="font-size: 11px; color: #f59e0b; margin-top: 8px;">● 파일시스템 32건<br/>● 메모리 7건 · CPU 3건 · I/O 8건</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">실패</div>
    <div style="font-size: 32px; font-weight: 700; color: #ef4444;">4건</div>
    <div style="font-size: 11px; color: #ef4444; margin-top: 8px;">● 로그 점검 스크립트 오류</div>
  </div>
</div>` },

    // 2. 항목별 준수율
    { id: uid('w'), type: 'widget', title: '항목별 준수율', titleSubtype: 'h3', titleIcon: 'table', table: {
      rows: 12, cols: 5, headerRow: true, headerCol: false,
      cells: {
        '0,0': '<span style="display:inline-flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>점검항목</span>',
        '0,1': '<span style="display:inline-flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>정상</span>',
        '0,2': '<span style="display:inline-flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>비정상</span>',
        '0,3': '<span style="display:inline-flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>실패</span>',
        '0,4': '<span style="display:inline-flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>준수율</span>',
        '1,0': 'CPU 사용률',       '1,1': '28', '1,2': '3',  '1,3': '0', '1,4': '90%',
        '2,0': '메모리 사용률',     '2,1': '24', '2,2': '7',  '2,3': '0', '2,4': '77%',
        '3,0': '파일시스템 사용량', '3,1': '0',  '3,2': '32', '3,3': '0', '3,4': '<span style="color:#ef4444;font-weight:700">0%</span>',
        '4,0': 'Disk I/O',         '4,1': '23', '4,2': '8',  '4,3': '0', '4,4': '74%',
        '5,0': 'NIC 이중화',       '5,1': '31', '5,2': '0',  '5,3': '0', '5,4': '100%',
        '6,0': 'Ping Loss',        '6,1': '31', '6,2': '0',  '6,3': '0', '6,4': '100%',
        '7,0': '로그 점검',        '7,1': '28', '7,2': '0',  '7,3': '4', '7,4': '87%',
        '8,0': '프로세스 CPU',     '8,1': '1',  '8,2': '0',  '8,3': '0', '8,4': '100%',
        '9,0': '프로세스 메모리',  '9,1': '1',  '9,2': '0',  '9,3': '0', '9,4': '100%',
        '10,0': '프로세스 기동',   '10,1': '1', '10,2': '0', '10,3': '0', '10,4': '100%',
        '11,0': '서비스 포트',     '11,1': '1', '11,2': '0', '11,3': '0', '11,4': '100%',
      },
    }},

    // 3. 비정상 항목 (하나의 블록에 4개 테이블)
    { id: uid('w'), type: 'widget', title: '비정상 항목', titleSubtype: 'h3', titleIcon: 'xmark', sections: [
      { subtitle: '파일시스템 사용량', subtitleIcon: 'clipboard', table: {
        rows: 11, cols: 4, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '결과', '0,2': '요약', '0,3': '상세 메시지',
          '1,0': 'icenscdb01', '1,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,2': '디스크 사용률 높음', '1,3': '현재: 92% (임계치 초과)',
          '2,0': 'icenscld01', '2,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,2': '디스크 사용률 높음', '2,3': '현재: 96% (임계치 초과)',
          '3,0': 'icenscsm01', '3,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '3,2': '디스크 사용률 높음', '3,3': '현재: 91% (임계치 초과)',
          '4,0': 'icenscsn01', '4,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '4,2': '디스크 사용률 높음', '4,3': '현재: 96% (임계치 초과)',
          '5,0': 'icenscw01',  '5,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '5,2': '디스크 사용률 높음', '5,3': '현재: 88% (임계치 초과)',
          '6,0': 'icensmc01',  '6,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '6,2': '디스크 사용률 높음', '6,3': '현재: 94% (임계치 초과)',
          '7,0': 'icensmi01',  '7,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '7,2': '디스크 사용률 높음', '7,3': '현재: 96% (임계치 초과)',
          '8,0': 'icenssmc01', '8,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '8,2': '디스크 사용률 높음', '8,3': '현재: 96% (임계치 초과)',
          '9,0': 'icenseag01', '9,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '9,2': '디스크 사용률 높음', '9,3': '현재: 95% (임계치 초과)',
          '10,0': 'icensbut02','10,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>','10,2': '디스크 사용률 높음','10,3': '현재: 95% (임계치 초과)',
        },
      }},
      { subtitle: '메모리 사용률 초과', subtitleIcon: 'clipboard', table: {
        rows: 8, cols: 4, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '결과', '0,2': '요약', '0,3': '상세 메시지',
          '1,0': 'icenshis01', '1,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,2': '메모리 사용률 높음', '1,3': '현재: 87.0%',
          '2,0': 'icensele01', '2,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,2': '메모리 사용률 높음', '2,3': '현재: 80.3%',
          '3,0': 'icenspos01', '3,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '3,2': '메모리 사용률 높음', '3,3': '현재: 80.7%',
          '4,0': 'icenssmc01', '4,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '4,2': '메모리 사용률 높음', '4,3': '현재: 84.8%',
          '5,0': 'icenseag01', '5,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '5,2': '메모리 사용률 높음', '5,3': '현재: 81.9%',
          '6,0': 'icensbut01', '6,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '6,2': '메모리 사용률 높음', '6,3': '현재: 82.8%',
          '7,0': 'icensns02',  '7,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '7,2': '메모리 사용률 높음', '7,3': '현재: 86.8%',
        },
      }},
      { subtitle: 'CPU 사용률 초과', subtitleIcon: 'clipboard', table: {
        rows: 4, cols: 4, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '결과', '0,2': '요약', '0,3': '상세 메시지',
          '1,0': 'icensmis02', '1,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,2': 'CPU 사용률 높음', '1,3': '현재: 87.7%',
          '2,0': 'icenspp02',  '2,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,2': 'CPU 사용률 높음', '2,3': '현재: 86.8%',
          '3,0': 'icensbut02', '3,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '3,2': 'CPU 사용률 높음', '3,3': '현재: 94.7%',
        },
      }},
      { subtitle: 'Disk I/O 이상', subtitleIcon: 'clipboard', table: {
        rows: 9, cols: 4, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '결과', '0,2': '요약', '0,3': '상세 메시지',
          '1,0': 'icensmis02', '1,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,2': 'I/O Wait 높음', '1,3': 'iowait: 12.46%',
          '2,0': 'icensele01', '2,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,2': 'I/O Wait 높음', '2,3': 'iowait: 10.6%',
          '3,0': 'icensels02', '3,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '3,2': 'I/O Wait 높음', '3,3': 'iowait: 14.78%',
          '4,0': 'icensks01',  '4,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '4,2': 'I/O Wait 높음', '4,3': 'iowait: 11.9%',
          '5,0': 'icensksc01', '5,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '5,2': 'I/O Wait 높음', '5,3': 'iowait: 12.93%',
          '6,0': 'icensksc02', '6,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '6,2': 'I/O Wait 높음', '6,3': 'iowait: 11.29%',
          '7,0': 'icensns02',  '7,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '7,2': 'I/O Wait 높음', '7,3': 'iowait: 14.58%',
          '8,0': 'icensga01',  '8,1': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '8,2': 'I/O Wait 높음', '8,3': 'iowait: 13.07%',
        },
      }},
    ]},

    // 4. 실패 항목 — 로그 점검
    { id: uid('w'), type: 'widget', title: '실패 항목', titleSubtype: 'h3', titleIcon: 'alert', subtitle: '로그 점검', subtitleIcon: 'clipboard', table: {
      rows: 5, cols: 4, headerRow: true, headerCol: false,
      cells: {
        '0,0': '시스템', '0,1': '결과', '0,2': '요약', '0,3': '상세 메시지',
        '1,0': 'icenshis02', '1,1': '<span style="color:#ef4444;font-weight:600">실패</span>', '1,2': '로그 점검 스크립트 오류', '1,3': '스크립트 실행 시간 초과 (타임아웃)',
        '2,0': 'icenspos01', '2,1': '<span style="color:#ef4444;font-weight:600">실패</span>', '2,2': '로그 수집 경로 오류', '2,3': '로그 수집 경로 접근 불가',
        '3,0': 'icensbut02', '3,1': '<span style="color:#ef4444;font-weight:600">실패</span>', '3,2': '로그 점검 스크립트 오류', '3,3': '스크립트 실행 권한 오류',
        '4,0': 'icensga01',  '4,1': '<span style="color:#ef4444;font-weight:600">실패</span>', '4,2': '원격 에이전트 오류', '4,3': '원격 에이전트 응답 없음',
      },
    }},

    { id: uid('t'), type: 'text', html: '' },
  ];

  return { blocks: blocks.flat(), configs: {} };
}
