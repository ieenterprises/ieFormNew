
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Lazy load App component
const App = lazy(() => import('./App.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading application...</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
