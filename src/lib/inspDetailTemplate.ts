let _seq = 0;
const uid = (prefix) => `id-${prefix}-${++_seq}`;

const SUMMARY_HTML = `<div style="font-family: 'Apple SD Gothic Neo', sans-serif; display: flex; gap: 12px; margin: 4px 0;">
  <div style="flex:1; background: linear-gradient(135deg, #0056a4 0%, #3571ce 100%); border-radius: 10px; padding: 18px; color: white;">
    <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">전체 점검</div>
    <div style="font-size: 32px; font-weight: 700;">223건</div>
    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">32대 서버</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">준수</div>
    <div style="font-size: 32px; font-weight: 700; color: #22c55e;">169건</div>
    <div style="margin-top: 8px; height: 6px; background: #e2e8f0; border-radius: 3px;"><div style="width: 75%; height: 100%; background: #22c55e; border-radius: 3px;"></div></div>
    <div style="font-size: 11px; color: #22c55e; margin-top: 4px;">75%</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">미준수</div>
    <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">50건</div>
    <div style="font-size: 11px; color: #f59e0b; margin-top: 8px;">● 파일시스템 32건<br/>● 메모리 7건 · CPU 3건 · I/O 8건</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">실패</div>
    <div style="font-size: 32px; font-weight: 700; color: #ef4444;">4건</div>
    <div style="font-size: 11px; color: #ef4444; margin-top: 8px;">● 로그 점검 스크립트 오류</div>
  </div>
</div>`;


export function createInspDetailTemplate() {
  _seq = 0;

  const blocks = [
    // 제목
    { id: uid('t'), type: 'text', subtype: 'h1', html: '나이스 시스템 정기 점검 결과 보고서' },
    { id: uid('t'), type: 'text', html: '점검일시: 2026.04.21 13:31 &nbsp;|&nbsp; 점검명: 나이스 시스템 정기 점검 &nbsp;|&nbsp; 대상: 32대 서버' },
    { id: uid('d'), type: 'divider' },

    // 1. 점검 결과 요약
    { id: uid('t'), type: 'text', subtype: 'h2', html: '1. 점검 결과 요약' },
    { id: uid('h'), type: 'html', code: SUMMARY_HTML },

    // 2. 항목별 준수율
    { id: uid('t'), type: 'text', subtype: 'h2', html: '2. 항목별 준수율' },
    {
      id: uid('tbl'), type: 'table', rows: 12, cols: 7,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '점검항목', '0,1': '대상', '0,2': '준수', '0,3': '미준수', '0,4': '실패', '0,5': '준수율', '0,6': '판정',
        '1,0': 'CPU 사용률',       '1,1': '31', '1,2': '28', '1,3': '3',  '1,4': '0', '1,5': '90%',  '1,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
        '2,0': '메모리 사용률',     '2,1': '31', '2,2': '24', '2,3': '7',  '2,4': '0', '2,5': '77%',  '2,6': '<span style="color:#f59e0b;font-weight:600">주의</span>',
        '3,0': '파일시스템 사용량', '3,1': '32', '3,2': '0',  '3,3': '32', '3,4': '0', '3,5': '<span style="color:#ef4444;font-weight:700">0%</span>',   '3,6': '<span style="color:#ef4444;font-weight:600">위험</span>',
        '4,0': 'Disk I/O',         '4,1': '31', '4,2': '23', '4,3': '8',  '4,4': '0', '4,5': '74%',  '4,6': '<span style="color:#f59e0b;font-weight:600">주의</span>',
        '5,0': 'NIC 이중화',       '5,1': '31', '5,2': '31', '5,3': '0',  '5,4': '0', '5,5': '100%', '5,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
        '6,0': 'Ping Loss',        '6,1': '31', '6,2': '31', '6,3': '0',  '6,4': '0', '6,5': '100%', '6,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
        '7,0': '로그 점검',        '7,1': '32', '7,2': '28', '7,3': '0',  '7,4': '4', '7,5': '87%',  '7,6': '<span style="color:#f59e0b;font-weight:600">주의</span>',
        '8,0': '프로세스 CPU',     '8,1': '1',  '8,2': '1',  '8,3': '0',  '8,4': '0', '8,5': '100%', '8,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
        '9,0': '프로세스 메모리',  '9,1': '1',  '9,2': '1',  '9,3': '0',  '9,4': '0', '9,5': '100%', '9,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
        '10,0': '프로세스 기동',   '10,1': '1', '10,2': '1', '10,3': '0', '10,4': '0','10,5': '100%','10,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
        '11,0': '서비스 포트',     '11,1': '1', '11,2': '1', '11,3': '0', '11,4': '0','11,5': '100%','11,6': '<span style="color:#22c55e;font-weight:600">정상</span>',
      },
      cellBg: {
        '3,5': '#fee2e2', '3,6': '#fee2e2',
        '2,6': '#fef9c3', '4,6': '#fef9c3', '7,6': '#fef9c3',
      },
    },

    // 3. 실패 항목 상세
    { id: uid('t'), type: 'text', subtype: 'h2', html: '3. 실패 항목 상세' },
    { id: uid('t'), type: 'text', subtype: 'callout', calloutIcon: '🚨', calloutBg: '#fef2f2', calloutBorder: '#fecaca',
      html: '<b>로그 점검 실패 4건 — 스크립트 실행 오류</b><br/><br/>● <b>icenshis02</b> (나이스_DB서버) — 로그 점검 스크립트 타임아웃<br/>● <b>icenspos01</b> (나이스_DB서버) — 로그 수집 경로 접근 불가<br/>● <b>icensbut02</b> (나이스_DB서버) — 로그 점검 스크립트 실행 권한 오류<br/>● <b>icensga01</b> (나이스_DB서버) — 원격 에이전트 응답 없음<br/><br/>공통 원인: 점검 에이전트 업데이트 후 로그 수집 스크립트 호환성 문제 발생. 에이전트 롤백 및 스크립트 패치 적용 완료.' },

    // 4. 주요 미준수 현황
    { id: uid('t'), type: 'text', subtype: 'h2', html: '4. 주요 미준수 현황' },

    // 4-1. 파일시스템
    { id: uid('t'), type: 'text', subtype: 'h3', html: '4-1. 파일시스템 사용량 (전체 미준수)' },
    { id: uid('t'), type: 'text', html: '32대 전체 서버에서 파일시스템 사용률이 임계치를 초과하였습니다. 나이스_CMP 5대 및 나이스_DB서버 중 사용률이 높은 주요 서버 현황은 다음과 같습니다.' },
    {
      id: uid('tbl'), type: 'table', rows: 11, cols: 5,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
        '1,0': 'icenscdb01', '1,1': '파일시스템 사용량 점검', '1,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '1,3': '디스크 사용률 높음', '1,4': '현재: 92% (임계치 초과)',
        '2,0': 'icenscld01', '2,1': '파일시스템 사용량 점검', '2,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '2,3': '디스크 사용률 높음', '2,4': '현재: 96% (임계치 초과)',
        '3,0': 'icenscsm01', '3,1': '파일시스템 사용량 점검', '3,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '3,3': '디스크 사용률 높음', '3,4': '현재: 91% (임계치 초과)',
        '4,0': 'icenscsn01', '4,1': '파일시스템 사용량 점검', '4,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '4,3': '디스크 사용률 높음', '4,4': '현재: 96% (임계치 초과)',
        '5,0': 'icenscw01',  '5,1': '파일시스템 사용량 점검', '5,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '5,3': '디스크 사용률 높음', '5,4': '현재: 88% (임계치 초과)',
        '6,0': 'icensmc01',  '6,1': '파일시스템 사용량 점검', '6,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '6,3': '디스크 사용률 높음', '6,4': '현재: 94% (임계치 초과)',
        '7,0': 'icensmi01',  '7,1': '파일시스템 사용량 점검', '7,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '7,3': '디스크 사용률 높음', '7,4': '현재: 96% (임계치 초과)',
        '8,0': 'icenssmc01', '8,1': '파일시스템 사용량 점검', '8,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '8,3': '디스크 사용률 높음', '8,4': '현재: 96% (임계치 초과)',
        '9,0': 'icenseag01', '9,1': '파일시스템 사용량 점검', '9,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '9,3': '디스크 사용률 높음', '9,4': '현재: 95% (임계치 초과)',
        '10,0': 'icensbut02','10,1': '파일시스템 사용량 점검','10,2': '<span style="color:#ef4444;font-weight:600">미준수</span>','10,3': '디스크 사용률 높음','10,4': '현재: 95% (임계치 초과)',
      },
      cellBg: {},
    },

    // 4-2. 메모리 사용률 초과
    { id: uid('t'), type: 'text', subtype: 'h3', html: '4-2. 메모리 사용률 초과 (7건)' },
    {
      id: uid('tbl'), type: 'table', rows: 8, cols: 5,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
        '1,0': 'icenshis01', '1,1': '메모리 사용률 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '1,3': '메모리 사용률 높음', '1,4': '현재: 87.0%',
        '2,0': 'icensele01', '2,1': '메모리 사용률 점검', '2,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '2,3': '메모리 사용률 높음', '2,4': '현재: 80.3%',
        '3,0': 'icenspos01', '3,1': '메모리 사용률 점검', '3,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '3,3': '메모리 사용률 높음', '3,4': '현재: 80.7%',
        '4,0': 'icenssmc01', '4,1': '메모리 사용률 점검', '4,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '4,3': '메모리 사용률 높음', '4,4': '현재: 84.8%',
        '5,0': 'icenseag01', '5,1': '메모리 사용률 점검', '5,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '5,3': '메모리 사용률 높음', '5,4': '현재: 81.9%',
        '6,0': 'icensbut01', '6,1': '메모리 사용률 점검', '6,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '6,3': '메모리 사용률 높음', '6,4': '현재: 82.8%',
        '7,0': 'icensns02',  '7,1': '메모리 사용률 점검', '7,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '7,3': '메모리 사용률 높음', '7,4': '현재: 86.8%',
      },
      cellBg: {},
    },

    // 4-3. CPU 사용률 초과
    { id: uid('t'), type: 'text', subtype: 'h3', html: '4-3. CPU 사용률 초과 (3건)' },
    {
      id: uid('tbl'), type: 'table', rows: 4, cols: 5,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
        '1,0': 'icensmis02', '1,1': 'CPU 사용률 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '1,3': 'CPU 사용률 높음', '1,4': '현재: 87.7%',
        '2,0': 'icenspp02',  '2,1': 'CPU 사용률 점검', '2,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '2,3': 'CPU 사용률 높음', '2,4': '현재: 86.8%',
        '3,0': 'icensbut02', '3,1': 'CPU 사용률 점검', '3,2': '<span style="color:#ef4444;font-weight:600">미준수</span>', '3,3': 'CPU 사용률 높음', '3,4': '현재: 94.7%',
      },
      cellBg: {
        '3,2': '#fee2e2',
      },
    },

    // 4-4. Disk I/O 이상
    { id: uid('t'), type: 'text', subtype: 'h3', html: '4-4. Disk I/O 이상 (8건)' },
    {
      id: uid('tbl'), type: 'table', rows: 9, cols: 5,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
        '1,0': 'icensmis02', '1,1': 'Disk I/O 점검', '1,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '1,3': 'I/O Wait 높음', '1,4': 'iowait: 12.46%',
        '2,0': 'icensele01', '2,1': 'Disk I/O 점검', '2,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '2,3': 'I/O Wait 높음', '2,4': 'iowait: 10.6%',
        '3,0': 'icensels02', '3,1': 'Disk I/O 점검', '3,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '3,3': 'I/O Wait 높음', '3,4': 'iowait: 14.78%',
        '4,0': 'icensks01',  '4,1': 'Disk I/O 점검', '4,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '4,3': 'I/O Wait 높음', '4,4': 'iowait: 11.9%',
        '5,0': 'icensksc01', '5,1': 'Disk I/O 점검', '5,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '5,3': 'I/O Wait 높음', '5,4': 'iowait: 12.93%',
        '6,0': 'icensksc02', '6,1': 'Disk I/O 점검', '6,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '6,3': 'I/O Wait 높음', '6,4': 'iowait: 11.29%',
        '7,0': 'icensns02',  '7,1': 'Disk I/O 점검', '7,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '7,3': 'I/O Wait 높음', '7,4': 'iowait: 14.58%',
        '8,0': 'icensga01',  '8,1': 'Disk I/O 점검', '8,2': '<span style="color:#f59e0b;font-weight:600">미준수</span>', '8,3': 'I/O Wait 높음', '8,4': 'iowait: 13.07%',
      },
      cellBg: {},
    },

    // 5. 조치 내역 요약
    { id: uid('t'), type: 'text', subtype: 'h2', html: '5. 조치 내역 요약' },
    { id: uid('t'), type: 'text', html: '점검 결과 확인된 미준수 및 실패 항목에 대해 다음과 같이 조치하였습니다. 파일시스템 전체 미준수 건은 디스크 용량 확보 작업을 일괄 진행 중이며, 로그 점검 실패 4건은 에이전트 패치로 즉시 해결하였습니다.' },
    { id: uid('t'), type: 'text', subtype: 'callout', calloutIcon: '📋',
      html: '<b>주요 조치 사항</b><br/><br/>● <b>파일시스템 (32건)</b>: 불필요 로그 및 덤프 파일 정리 진행 중, /backup 파티션 증설 요청 (4/25 예정)<br/>● <b>로그 점검 실패 (4건)</b>: 에이전트 v2.3.1 → v2.3.2 패치 적용 완료, 점검 스크립트 호환성 확인<br/>● <b>메모리 초과 (7건)</b>: DBA팀 협조하여 PGA/SGA 파라미터 최적화 진행 중<br/>● <b>CPU 초과 (3건)</b>: 비효율 쿼리 튜닝 요청 (DBA팀 4/23 처리 예정)<br/>● <b>Disk I/O (8건)</b>: 배치 스케줄 분산 및 I/O 경합 해소 작업 진행 중' },

    // 6. 종합 의견
    { id: uid('t'), type: 'text', subtype: 'h2', html: '6. 종합 의견' },
    { id: uid('t'), type: 'text', html: '금회 점검 결과 전체 223건 중 169건(75%)이 준수로 확인되었습니다. 파일시스템 사용량이 32대 전체 서버에서 임계치를 초과하여 준수율이 크게 하락하였으며, 이는 최근 데이터 증가량 대비 스토리지 증설이 지연된 것이 주요 원인입니다. 실패 4건은 에이전트 패치로 즉시 해결하였고, 메모리·CPU·Disk I/O 미준수 건은 DBA팀과 협조하여 순차적으로 조치 중입니다. 파일시스템 용량 확보를 위한 디스크 증설 및 데이터 아카이빙 정책 수립이 시급합니다.' },
    { id: uid('d'), type: 'divider' },
    { id: uid('t'), type: 'text', subtype: 'quote', html: '본 보고서는 나이스 시스템 인프라운영팀에서 작성하였으며, 문의사항은 인프라운영팀(내선 1234)으로 연락 바랍니다.' },
    { id: uid('t'), type: 'text', html: '' },
  ];

  return { blocks: blocks.flat(), configs: {} };
}
