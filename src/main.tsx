import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installAuthFetchInterceptor } from './utils/session';

const queryClient = new QueryClient();

installAuthFetchInterceptor();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
)
