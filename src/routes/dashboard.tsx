import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
    component: lazyRouteComponent(() => import('../pages/dashboard-page'), 'DashboardPage'),
});
