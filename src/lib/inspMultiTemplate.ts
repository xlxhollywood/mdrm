let _seq = 0;
const uid = (prefix) => `id-${prefix}-${++_seq}`;

/* ── 세트 1: 서버 및 WEB 점검 ── */
function createWebInspBlocks() {
  return [
    // 헤더
    { id: uid('w'), type: 'widget', title: '서버 및 WEB 점검', titleSubtype: 'h1', headerItems: [
      { icon: 'clock', text: '2026-04-21', fontSize: 12 },
      { icon: 'user', text: '김세훈', fontSize: 12 },
    ]},

    // 점검 결과 요약
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

    // 항목별 준수율
    { id: uid('w'), type: 'widget', title: '항목별 준수율', titleSubtype: 'h3', titleIcon: 'table', table: {
      rows: 12, cols: 5, headerRow: true, headerCol: false,
      cells: {
        '0,0': '점검항목', '0,1': '정상', '0,2': '비정상', '0,3': '실패', '0,4': '준수율',
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

    // 비정상 항목
    { id: uid('w'), type: 'widget', title: '비정상 항목', titleSubtype: 'h3', titleIcon: 'xmark', sections: [
      { subtitle: '파일시스템 사용량', subtitleIcon: 'clipboard', table: {
        rows: 6, cols: 5, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
          '1,0': 'icenscdb01', '1,1': '파일시스템 사용량 점검', '1,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '1,3': '디스크 사용률 높음', '1,4': '현재: 92%',
          '2,0': 'icenscld01', '2,1': '파일시스템 사용량 점검', '2,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '2,3': '디스크 사용률 높음', '2,4': '현재: 96%',
          '3,0': 'icenscsm01', '3,1': '파일시스템 사용량 점검', '3,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '3,3': '디스크 사용률 높음', '3,4': '현재: 91%',
          '4,0': 'icensmc01',  '4,1': '파일시스템 사용량 점검', '4,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '4,3': '디스크 사용률 높음', '4,4': '현재: 94%',
          '5,0': 'icensmi01',  '5,1': '파일시스템 사용량 점검', '5,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '5,3': '디스크 사용률 높음', '5,4': '현재: 96%',
        },
      }},
      { subtitle: 'CPU 사용률 초과', subtitleIcon: 'clipboard', table: {
        rows: 4, cols: 5, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
          '1,0': 'icensmis02', '1,1': 'CPU 사용률 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,3': 'CPU 사용률 높음', '1,4': '현재: 87.7%',
          '2,0': 'icenspp02',  '2,1': 'CPU 사용률 점검', '2,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,3': 'CPU 사용률 높음', '2,4': '현재: 86.8%',
          '3,0': 'icensbut02', '3,1': 'CPU 사용률 점검', '3,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '3,3': 'CPU 사용률 높음', '3,4': '현재: 94.7%',
        },
      }},
    ]},

    // 실패 항목
    { id: uid('w'), type: 'widget', title: '실패 항목', titleSubtype: 'h3', titleIcon: 'alert', subtitle: '로그 점검', subtitleIcon: 'clipboard', table: {
      rows: 5, cols: 3, headerRow: true, headerCol: false,
      cells: {
        '0,0': '시스템', '0,1': '점검항목', '0,2': '실패 원인',
        '1,0': 'icenshis02', '1,1': '로그 점검 스크립트 점검', '1,2': '스크립트 실행 시간 초과 (타임아웃)',
        '2,0': 'icenspos01', '2,1': '로그 수집 경로 점검', '2,2': '로그 수집 경로 접근 불가',
        '3,0': 'icensbut02', '3,1': '로그 점검 스크립트 점검', '3,2': '스크립트 실행 권한 오류',
        '4,0': 'icensga01',  '4,1': '원격 에이전트 점검', '4,2': '원격 에이전트 응답 없음',
      },
    }},
  ];
}

/* ── 세트 2: WAS 서버 점검 ── */
function createWasInspBlocks() {
  return [
    // 헤더
    { id: uid('w'), type: 'widget', title: 'WAS 서버 점검', titleSubtype: 'h1', headerItems: [
      { icon: 'clock', text: '2026-04-21', fontSize: 12 },
      { icon: 'user', text: '김세훈', fontSize: 12 },
    ]},

    // 점검 결과 요약
    { id: uid('w'), type: 'widget', title: '점검 결과 요약', titleSubtype: 'h3', titleIcon: 'chart', code: `<div style="font-family: 'Apple SD Gothic Neo', sans-serif; display: flex; gap: 12px; margin: 4px 0;">
  <div style="flex:1; background: linear-gradient(135deg, #0056a4 0%, #3571ce 100%); border-radius: 10px; padding: 18px; color: white; box-shadow: 0 2px 8px rgba(0,86,164,0.25), 0 1px 2px rgba(0,0,0,0.06);">
    <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">전체 점검</div>
    <div style="font-size: 32px; font-weight: 700;">45건</div>
    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">9대 · 5항목</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">정상</div>
    <div style="font-size: 32px; font-weight: 700; color: #22c55e;">39건</div>
    <div style="margin-top: 8px; height: 6px; background: #e2e8f0; border-radius: 3px;"><div style="width: 87%; height: 100%; background: #22c55e; border-radius: 3px;"></div></div>
    <div style="font-size: 11px; color: #22c55e; margin-top: 4px;">87%</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">비정상</div>
    <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">6건</div>
    <div style="font-size: 11px; color: #f59e0b; margin-top: 8px;">● 힙 메모리 3건<br/>● 스레드 풀 2건 · 세션 1건</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">실패</div>
    <div style="font-size: 32px; font-weight: 700; color: #ef4444;">0건</div>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">실패 항목 없음</div>
  </div>
</div>` },

    // 항목별 준수율
    { id: uid('w'), type: 'widget', title: '항목별 준수율', titleSubtype: 'h3', titleIcon: 'table', table: {
      rows: 6, cols: 5, headerRow: true, headerCol: false,
      cells: {
        '0,0': '점검항목', '0,1': '정상', '0,2': '비정상', '0,3': '실패', '0,4': '준수율',
        '1,0': '힙 메모리 사용률',   '1,1': '6', '1,2': '3', '1,3': '0', '1,4': '67%',
        '2,0': '스레드 풀 사용률',   '2,1': '7', '2,2': '2', '2,3': '0', '2,4': '78%',
        '3,0': '활성 세션 수',       '3,1': '8', '3,2': '1', '3,3': '0', '3,4': '89%',
        '4,0': 'DB 커넥션 풀',      '4,1': '9', '4,2': '0', '4,3': '0', '4,4': '100%',
        '5,0': '응답 시간',         '5,1': '9', '5,2': '0', '5,3': '0', '5,4': '100%',
      },
    }},

    // 비정상 항목
    { id: uid('w'), type: 'widget', title: '비정상 항목', titleSubtype: 'h3', titleIcon: 'xmark', sections: [
      { subtitle: '힙 메모리 사용률 초과', subtitleIcon: 'clipboard', table: {
        rows: 4, cols: 5, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
          '1,0': 'was-prod-01', '1,1': '힙 메모리 사용률 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,3': '힙 메모리 높음', '1,4': '현재: 89.2% (Old Gen 92%)',
          '2,0': 'was-prod-03', '2,1': '힙 메모리 사용률 점검', '2,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,3': '힙 메모리 높음', '2,4': '현재: 85.7% (Old Gen 88%)',
          '3,0': 'was-stg-01',  '3,1': '힙 메모리 사용률 점검', '3,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '3,3': '힙 메모리 높음', '3,4': '현재: 82.4% (Old Gen 85%)',
        },
      }},
      { subtitle: '스레드 풀 사용률 초과', subtitleIcon: 'clipboard', table: {
        rows: 3, cols: 5, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
          '1,0': 'was-prod-02', '1,1': '스레드 풀 사용률 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,3': '스레드 풀 임계치 초과', '1,4': '활성: 180/200 (90%)',
          '2,0': 'was-prod-04', '2,1': '스레드 풀 사용률 점검', '2,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '2,3': '스레드 풀 임계치 초과', '2,4': '활성: 175/200 (87.5%)',
        },
      }},
      { subtitle: '활성 세션 수 초과', subtitleIcon: 'clipboard', table: {
        rows: 2, cols: 5, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
          '1,0': 'was-prod-01', '1,1': '활성 세션 수 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">비정상</span>', '1,3': '세션 수 임계치 초과', '1,4': '현재: 4,820 (임계치 4,000)',
        },
      }},
    ]},
  ];
}

/* ── 2세트 합본 템플릿 ── */
export function createInspMultiTemplate() {
  _seq = 0;
  const blocks = [
    ...createWebInspBlocks(),
    ...createWasInspBlocks(),
  ];
  return { blocks, configs: {} };
}
