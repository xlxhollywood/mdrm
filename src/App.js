import { useEffect } from 'react';
import WidgetDashboard from './WidgetDashboard';

function App() {
  useEffect(() => {
    let px = 0, py = 0;
    const track = (e) => { px = e.clientX; py = e.clientY; };
    const revive = () => {
      document.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: px, clientY: py })
      );
    };
    window.addEventListener('mousemove', track, true);
    document.addEventListener('keydown', revive, true);
    return () => {
      window.removeEventListener('mousemove', track, true);
      document.removeEventListener('keydown', revive, true);
    };
  }, []);

  return <WidgetDashboard />;
}

export default App;
