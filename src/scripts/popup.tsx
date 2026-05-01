import { createRoot } from 'react-dom/client';

import { PopupApp } from '@/components/PopupApp';

const rootElement = document.getElementById('popup-root');

if (!rootElement) {
  throw new Error('Popup root element not found.');
}

createRoot(rootElement).render(<PopupApp />);