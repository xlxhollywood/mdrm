// 위젯 = 제목(텍스트) + 콘텐츠(테이블 or HTML)를 하나로 묶은 블록
// 좌측 패널에서 클릭하면 캔버스에 widget 블록이 삽입됨

const SUMMARY_CODE = `<div style="font-family: 'Apple SD Gothic Neo', sans-serif; display: flex; gap: 12px; margin: 4px 0;">
  <div style="flex:1; background: linear-gradient(135deg, #0056a4 0%, #3571ce 100%); border-radius: 10px; padding: 18px; color: white;">
    <div style="font-size: 11px; opacity: 0.8; margin-bottom: 6px;">전체 점검</div>
    <div style="font-size: 32px; font-weight: 700;">223건</div>
    <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">32대 · 11항목</div>
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
      code: SUMMARY_CODE,
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
