// 위젯 = 제목(텍스트) + 콘텐츠(테이블 or HTML)를 하나로 묶은 블록
// 좌측 패널에서 클릭하면 캔버스에 widget 블록이 삽입됨

const SUMMARY_CODE = `<div style="font-family: 'Apple SD Gothic Neo', sans-serif; display: flex; gap: 12px; margin: 4px 0;">
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
</div>`;

export interface WidgetDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  // widget 블록 생성 시 사용할 기본값
  defaultBlock: {
    title: string;
    code?: string;
    table?: {
      rows: number;
      cols: number;
      cells: Record<string, string>;
      headerRow?: boolean;
      headerCol?: boolean;
    };
  };
}

export const WIDGET_LIST: WidgetDef[] = [
  {
    id: 'insp-summary',
    name: '점검 결과 요약',
    desc: '전체·정상·경고·실패 현황 카드',
    icon: '📊',
    defaultBlock: {
      title: '점검 결과 요약',
      titleSubtype: 'h3',
      titleIcon: 'chart',
      code: SUMMARY_CODE,
    },
  },
  {
    id: 'insp-compliance',
    name: '항목별 준수율',
    desc: '점검항목별 정상·비정상·실패 준수율',
    icon: '📋',
    defaultBlock: {
      title: '항목별 준수율',
      titleSubtype: 'h3',
      titleIcon: 'table',
      table: {
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
      },
    },
  },
  {
    id: 'insp-detail-filesystem',
    name: '파일시스템 사용량',
    desc: '시스템별 파일시스템 점검 상세 현황',
    icon: '💾',
    defaultBlock: {
      title: '파일시스템 사용량',
      titleSubtype: 'h3',
      titleIcon: 'shield',
      table: {
        rows: 11, cols: 5, headerRow: true, headerCol: false,
        cells: {
          '0,0': '시스템', '0,1': '점검항목', '0,2': '결과', '0,3': '요약', '0,4': '상세 메시지',
          '1,0': 'icenscdb01', '1,1': '파일시스템 사용량 점검', '1,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '1,3': '디스크 사용률 높음', '1,4': '현재: 92% (임계치 초과)',
          '2,0': 'icenscld01', '2,1': '파일시스템 사용량 점검', '2,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '2,3': '디스크 사용률 높음', '2,4': '현재: 96% (임계치 초과)',
          '3,0': 'icenscsm01', '3,1': '파일시스템 사용량 점검', '3,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '3,3': '디스크 사용률 높음', '3,4': '현재: 91% (임계치 초과)',
          '4,0': 'icenscsn01', '4,1': '파일시스템 사용량 점검', '4,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '4,3': '디스크 사용률 높음', '4,4': '현재: 96% (임계치 초과)',
          '5,0': 'icenscw01',  '5,1': '파일시스템 사용량 점검', '5,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '5,3': '디스크 사용률 높음', '5,4': '현재: 88% (임계치 초과)',
          '6,0': 'icensmc01',  '6,1': '파일시스템 사용량 점검', '6,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '6,3': '디스크 사용률 높음', '6,4': '현재: 94% (임계치 초과)',
          '7,0': 'icensmi01',  '7,1': '파일시스템 사용량 점검', '7,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '7,3': '디스크 사용률 높음', '7,4': '현재: 96% (임계치 초과)',
          '8,0': 'icenssmc01', '8,1': '파일시스템 사용량 점검', '8,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '8,3': '디스크 사용률 높음', '8,4': '현재: 96% (임계치 초과)',
          '9,0': 'icenseag01', '9,1': '파일시스템 사용량 점검', '9,2': '<span style="color:#ef4444;font-weight:600">비정상</span>', '9,3': '디스크 사용률 높음', '9,4': '현재: 95% (임계치 초과)',
          '10,0': 'icensbut02','10,1': '파일시스템 사용량 점검','10,2': '<span style="color:#ef4444;font-weight:600">비정상</span>','10,3': '디스크 사용률 높음','10,4': '현재: 95% (임계치 초과)',
        },
      },
    },
  },
];

// widgetId로 블록 데이터 생성
export function createWidgetBlock(widgetId: string): any | null {
  const def = WIDGET_LIST.find(w => w.id === widgetId);
  if (!def) return null;
  return {
    id: `widget-${Date.now()}`,
    type: 'widget',
    ...def.defaultBlock,
  };
}
