const RESULT_COLOR = {
  '정상':   '#00bc7d',
  '경고':   '#fd9a00',
  '불합격': '#fb2c36',
};

const DAYS = [
  {
    label: '월',
    date: '04-14',
    items: [
      { name: 'CPU 사용률',   result: '정상' },
      { name: '메모리',       result: '경고' },
      { name: '디스크',       result: '정상' },
    ],
  },
  {
    label: '화',
    date: '04-15',
    items: [
      { name: 'DB 연결',      result: '정상' },
      { name: '쿼리 응답',    result: '불합격' },
    ],
  },
  {
    label: '수',
    date: '04-16',
    items: [
      { name: '포트 상태',    result: '정상' },
      { name: '라우팅',       result: '정상' },
    ],
  },
  {
    label: '목',
    date: '04-17',
    items: [
      { name: 'BGP 세션',     result: '경고' },
    ],
  },
  {
    label: '금',
    date: '04-18',
    items: [
      { name: 'CPU 사용률',   result: '정상' },
      { name: '메모리',       result: '정상' },
      { name: 'DB 연결',      result: '정상' },
    ],
  },
];

export default function PreviewInspTimeline() {
  return (
    <div className="w-full bg-white px-4 py-4">
      <div className="relative flex gap-0">
        {/* 가로 연결선 */}
        <div className="absolute top-[16px] left-[16px] right-[16px] h-[2px] bg-[#dde3ea] z-0" />

        {DAYS.map((day, i) => (
          <div key={day.label} className="flex-1 flex flex-col items-center relative z-10 gap-2">
            {/* 날짜 노드 */}
            <div className="flex flex-col items-center gap-0.5">
              <div className={`w-8 h-8 rounded-full border-2 flex flex-col items-center justify-center bg-white
                ${day.items.some(it => it.result === '불합격') ? 'border-[#fb2c36]' :
                  day.items.some(it => it.result === '경고')   ? 'border-[#fd9a00]' : 'border-[#3571ce]'}`}>
                <span className="text-[10px] font-bold text-dark leading-none">{day.label}</span>
              </div>
              <span className="text-[9px] text-[#9ba4ad]">{day.date}</span>
            </div>

            {/* 점검 항목 칩 */}
            <div className="flex flex-col gap-[3px] w-full px-[3px]">
              {day.items.map((item, j) => (
                <div key={j}
                  className="w-full px-[5px] py-[2px] rounded text-[9px] font-medium text-center truncate"
                  style={{
                    background: RESULT_COLOR[item.result] + '22',
                    color: RESULT_COLOR[item.result],
                    border: `1px solid ${RESULT_COLOR[item.result]}44`,
                  }}>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
