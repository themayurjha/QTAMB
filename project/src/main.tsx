import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, useNavigate } from 'react-router-dom';
import { router } from './router';
import { trackPageView } from './lib/analytics';
import './index.css';

// Track page views when route changes
router.subscribe((state) => {
  trackPageView(state.location.pathname);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);