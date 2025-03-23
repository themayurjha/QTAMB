import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { Login } from './pages/auth/login';
import { SignUp } from './pages/auth/signup';
import { Chat } from './pages/chat';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/chat',
    element: <Chat />,
  },
]);