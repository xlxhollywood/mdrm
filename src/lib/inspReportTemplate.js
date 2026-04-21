let _seq = 0;
const uid = (prefix) => `ir-${prefix}-${++_seq}`;

const SUMMARY_HTML = `<div style="font-family: 'Apple SD Gothic Neo', sans-serif; display: flex; gap: 12px; margin: 4px 0;">
  <div style="flex:1; background: linear-gradient(135deg, #0056a4 0%, #3571ce 100%); border-radius: 10px; padding: 18px; color: white;">
    <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">전체 점검</div>
    <div style="font-size: 32px; font-weight: 700;">1,470건</div>
    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">35대 × 42항목</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">정상</div>
    <div style="font-size: 32px; font-weight: 700; color: #22c55e;">1,461건</div>
    <div style="margin-top: 8px; height: 6px; background: #e2e8f0; border-radius: 3px;"><div style="width: 99.4%; height: 100%; background: #22c55e; border-radius: 3px;"></div></div>
    <div style="font-size: 11px; color: #22c55e; margin-top: 4px;">99.4%</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">경고</div>
    <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">7건</div>
    <div style="font-size: 11px; color: #f59e0b; margin-top: 8px;">● 임계치 근접 3건<br/>● 디스크 80%↑ 4건</div>
  </div>
  <div style="flex:1; background: white; border-radius: 10px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
    <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">실패</div>
    <div style="font-size: 32px; font-weight: 700; color: #ef4444;">2건</div>
    <div style="font-size: 11px; color: #ef4444; margin-top: 8px;">● 즉시 조치 완료</div>
  </div>
</div>`;


export function createInspReportTemplate() {
  _seq = 0;

  const blocks = [
    // 제목
    { id: uid('t'), type: 'text', subtype: 'h1', html: '2026년 4월 3주차 나이스 시스템 주간 점검 보고서' },
    { id: uid('t'), type: 'text', html: '작성일: 2026.04.21 (월) &nbsp;|&nbsp; 작성자: 인프라운영팀 홍길동 &nbsp;|&nbsp; 배포: 정보시스템운영과' },
    { id: uid('d'), type: 'divider' },

    // 1. 점검 개요
    { id: uid('t'), type: 'text', subtype: 'h2', html: '1. 점검 개요' },
    { id: uid('t'), type: 'text', html: '본 보고서는 나이스 시스템 인프라 35대 서버에 대한 주간 정기 점검 결과를 정리한 문서입니다. 점검 대상은 CMP 플랫폼 서버 5대와 DB 서버 30대이며, 총 42개 점검 항목(필수 41건, 권고 1건)에 대해 자동화 스크립트 및 수동 점검을 병행하여 수행하였습니다.' },
    { id: uid('t'), type: 'text', subtype: 'callout', html: '점검 기간: 2026.04.14(월) 09:00 ~ 2026.04.18(금) 18:00 (5일간 상시 모니터링)' },

    // 2. 점검 결과 요약 (HTML 대시보드)
    { id: uid('t'), type: 'text', subtype: 'h2', html: '2. 점검 결과 요약' },
    { id: uid('h'), type: 'html', code: SUMMARY_HTML },

    // 3. CMP 점검 상세
    { id: uid('t'), type: 'text', subtype: 'h2', html: '3. CMP 플랫폼 점검 상세' },
    { id: uid('t'), type: 'text', html: 'CMP WEB/WAS 서버(icenscw01)에 대해 프로세스, 파일시스템, 서비스 3개 영역 10개 항목을 점검하였습니다.' },
    {
      id: uid('tbl'), type: 'table', rows: 11, cols: 8,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '점검분류', '0,1': '점검항목', '0,2': '월', '0,3': '화', '0,4': '수', '0,5': '목', '0,6': '금', '0,7': '판정',
        '1,0': '프로세스', '1,1': 'CPU 사용률',       '1,2': '23%', '1,3': '31%', '1,4': '28%', '1,5': '45%', '1,6': '22%', '1,7': '정상',
        '2,0': '프로세스', '2,1': '메모리 사용률',     '2,2': '61%', '2,3': '63%', '2,4': '58%', '2,5': '72%', '2,6': '60%', '2,7': '정상',
        '3,0': '프로세스', '3,1': '사용 상태 점검',    '3,2': 'OK',  '3,3': 'OK',  '3,4': 'OK',  '3,5': 'OK',  '3,6': 'OK',  '3,7': '정상',
        '4,0': '프로세스', '4,1': '기동 점검',         '4,2': 'OK',  '4,3': 'OK',  '4,4': 'OK',  '4,5': 'OK',  '4,6': 'OK',  '4,7': '정상',
        '5,0': '프로세스', '5,1': 'WEB 엔진 FS',      '5,2': '45%', '5,3': '45%', '5,4': '46%', '5,5': '46%', '5,6': '46%', '5,7': '정상',
        '6,0': '파일시스템', '6,1': '어플리케이션 FS', '6,2': '67%', '6,3': '67%', '6,4': '68%', '6,5': '68%', '6,6': '68%', '6,7': '정상',
        '7,0': '파일시스템', '7,1': '로그 저장 FS',    '7,2': '72%', '7,3': '74%', '7,4': '76%', '7,5': '78%', '7,6': '<b style="color:#f59e0b">81%</b>', '7,7': '<span style="color:#f59e0b;font-weight:600">경고</span>',
        '8,0': '서비스',    '8,1': '포트 오픈 상태',   '8,2': 'OK',  '8,3': 'OK',  '8,4': 'OK',  '8,5': 'OK',  '8,6': 'OK',  '8,7': '정상',
        '9,0': '서비스',    '9,1': '포트 접속 정상',   '9,2': 'OK',  '9,3': 'OK',  '9,4': 'OK',  '9,5': 'OK',  '9,6': 'OK',  '9,7': '정상',
        '10,0': '서비스',   '10,1': '요청 처리 수',    '10,2': '1.2K','10,3': '1.5K','10,4': '1.3K','10,5': '2.1K','10,6': '1.1K','10,7': '정상',
      },
      cellBg: {
        '7,6': '#fef9c3', '7,7': '#fef9c3',
      },
    },
    { id: uid('t'), type: 'text', subtype: 'callout', html: '<b>icenscw01 로그 저장 파일시스템</b>이 금요일 기준 81%에 도달하여 경고 상태입니다. Access Log 로테이션 주기를 7일 → 3일로 단축 조치하였습니다.' },

    // 4. DB 서버 점검 상세
    { id: uid('t'), type: 'text', subtype: 'h2', html: '4. DB 서버 점검 상세' },
    { id: uid('t'), type: 'text', html: '30대 DB 서버에 대해 OS 레벨(시스템/커널/메모리/I·O) 로그 점검을 실시하였습니다. 대부분 정상이나 2대에서 이상 징후가 발견되어 즉시 조치하였습니다.' },
    // 2열 레이아웃 + 콜아웃 이슈 카드
    (() => {
      const layoutId = uid('layout');
      const c1 = uid('callout');
      const c2 = uid('callout');
      return [
        { id: layoutId, type: 'layout', cols: 2 },
        { id: c1, type: 'text', subtype: 'callout', calloutIcon: '🚨',
          html: '<b>icensga01 — 일반행정DB#1</b><br/><b>현상:</b> 4/16(수) 03:22 커널 로그에 I/O 에러 다수 발생<br/><b>원인:</b> 스토리지 HBA 포트 간헐적 링크 다운<br/><b>조치:</b> HBA 펌웨어 업데이트 및 멀티패스 경로 전환 (4/16 09:15 완료)<br/><b>현재:</b> 정상 운영 중, 48시간 모니터링 후 종결 예정',
          layoutRef: { layoutId, colIdx: 0 },
        },
        { id: c2, type: 'text', subtype: 'callout', calloutIcon: '⚠️',
          html: '<b>icenspp02 — 업무포털DB#2</b><br/><b>현상:</b> 메모리 사용률 92% 지속 (임계치 90%)<br/><b>원인:</b> 배치 쿼리 실행 후 PGA 미반환<br/><b>조치:</b> DBA팀 협조하여 세션 정리 및 PGA_AGGREGATE_TARGET 조정<br/><b>현재:</b> 메모리 사용률 71%로 안정화',
          layoutRef: { layoutId, colIdx: 1 },
        },
      ];
    })(),

    // 5. 디스크 사용률 현황
    { id: uid('t'), type: 'text', subtype: 'h2', html: '5. 디스크 사용률 현황 (80% 이상)' },
    { id: uid('t'), type: 'text', html: '전체 서버 디스크 사용률 점검 결과, 80% 이상 사용 중인 파일시스템 4건이 확인되었습니다.' },
    {
      id: uid('tbl'), type: 'table', rows: 5, cols: 5,
      headerRow: true, headerCol: false,
      cells: {
        '0,0': '서버', '0,1': '마운트 포인트', '0,2': '용량', '0,3': '사용률', '0,4': '조치 계획',
        '1,0': 'icenscw01',  '1,1': '/logs',     '1,2': '100G', '1,3': '<span style="color:#f59e0b;font-weight:600">81%</span>',  '1,4': '로그 로테이션 주기 단축',
        '2,0': 'icensga01',  '2,1': '/oradata',   '2,2': '500G', '2,3': '<span style="color:#ef4444;font-weight:600">87%</span>',  '2,4': '아카이브 로그 정리 (4/22 예정)',
        '3,0': 'icenspp02',  '3,1': '/backup',    '3,2': '200G', '3,3': '<span style="color:#f59e0b;font-weight:600">83%</span>',  '3,4': '백업 보관주기 30→14일 변경',
        '4,0': 'icensbut01', '4,1': '/app/logs',  '4,2': '50G',  '4,3': '<span style="color:#f59e0b;font-weight:600">85%</span>',  '4,4': '불필요 덤프 파일 삭제 완료',
      },
      cellBg: {
        '2,3': '#fee2e2',
      },
    },

    // 6. 조치 사항
    { id: uid('t'), type: 'text', subtype: 'h2', html: '6. 조치 사항 및 권고' },
    { id: uid('t'), type: 'text', subtype: 'bullet', html: '<li>icenscw01 로그 파일시스템: 로테이션 주기 단축 완료, 다음 주 사용률 재확인 필요</li><li>icensga01 스토리지 I/O: HBA 펌웨어 패치 완료, 벤더사 RCA 보고서 수령 대기 중</li><li>icenspp02 메모리: PGA 파라미터 변경 후 안정화 확인, 배치 쿼리 최적화는 DBA팀 진행 중</li><li>전체 서버 디스크 80% 이상 4건: 개별 정리 작업 진행 중이며 4/25까지 완료 목표</li>' },
    { id: uid('t'), type: 'text', subtype: 'callout', html: '다음 주 점검 시 icensga01 스토리지 경로 이중화 상태와 icenspp02 메모리 추이를 중점 모니터링할 예정입니다.' },

    // 7. 종합 의견
    { id: uid('t'), type: 'text', subtype: 'h2', html: '7. 종합 의견' },
    { id: uid('t'), type: 'text', html: '금주 점검 결과 전체 1,470건 중 1,461건(99.4%)이 정상으로 확인되었습니다. 실패 2건은 당일 내 조치 완료하였으며, 경고 7건은 임계치 근접 상태로 추이를 지속 관찰 중입니다. 나이스 시스템 전반적으로 안정적인 운영 상태를 유지하고 있으나, 일부 서버의 디스크 사용률 증가 추세에 대한 선제적 용량 관리가 필요합니다.' },
    { id: uid('d'), type: 'divider' },
    { id: uid('t'), type: 'text', subtype: 'quote', html: '본 보고서는 나이스 시스템 인프라운영팀에서 작성하였으며, 문의사항은 인프라운영팀(내선 1234)으로 연락 바랍니다.' },
    { id: uid('t'), type: 'text', html: '' },
  ];

  return { blocks: blocks.flat(), configs: {} };
}
