import './globals.css';

export const metadata = {
  title: 'MDRM - 리포트 대시보드',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
      </body>
    </html>
  );
}
