import '@fontsource-variable/onest';
import '@fontsource-variable/wix-madefor-display';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { hideSplash } from './lib/splash';
import './styles/tokens.css';
import './styles/app.css';
import './styles/studio.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

hideSplash();
