import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
} from '@tanstack/react-router';
import Home from './routes/Home.jsx';
import About from './routes/About.jsx';
import './styles.css';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/about" data-testid="nav-about">About</Link>
      </nav>
      <Outlet />
    </>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: About });

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
const router = createRouter({ routeTree });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
