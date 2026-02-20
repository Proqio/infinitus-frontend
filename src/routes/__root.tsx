import { Suspense } from 'react';
import { createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';

import { AppLayout } from '@/components/layout/app-layout';

interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
});

function RootLayout() {
    return (
        <Suspense>
            <AppLayout />
        </Suspense>
    );
}
