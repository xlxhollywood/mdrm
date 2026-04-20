const rows = [
  ['서버-01',  'Physical',  '정상', '04-07'],
  ['DB-02',   'Virtual',   '경고', '04-06'],
  ['APP-03',  'Container', '정상', '04-05'],
];

export default function PreviewTable() {
  return (
    <div className="bg-white overflow-hidden shrink-0">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-[#f8f9fb] border-b border-[#eaedf1]">
            {['이름','유형','상태','변경일'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-[#8a9299] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[0]} className={i % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}>
              <td className="px-3 py-2 text-link">{row[0]}</td>
              <td className="px-3 py-2 text-muted">{row[1]}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-[1px] rounded text-[10px] font-semibold text-white ${row[2] === '정상' ? 'bg-success' : 'bg-warning'}`}>
                  {row[2]}
                </span>
              </td>
              <td className="px-3 py-2 text-[#9ba4ad]">{row[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
