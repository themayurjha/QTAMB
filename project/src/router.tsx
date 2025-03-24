import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { Login } from './pages/auth/login';
import { SignUp } from './pages/auth/signup';
import { Chat } from './pages/chat';
import { NotFound } from './pages/not-found';
import { StoriesIndex } from './pages/web-stories/index';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
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
  {
    path: '/web-stories',
    element: <StoriesIndex />,
  },
]);