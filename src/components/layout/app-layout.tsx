import { Outlet } from '@tanstack/react-router';
import { SidebarProvider } from 'proqio-ui';

import { Header, HeaderBrand, HeaderSection, HeaderUserAvatar } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';

export function AppLayout() {
    return (
        <div className="flex h-screen flex-col">
            <Header>
                <HeaderSection>
                    <HeaderBrand />
                </HeaderSection>
                <HeaderSection>
                    <HeaderUserAvatar />
                </HeaderSection>
            </Header>
            <SidebarProvider className="relative min-h-0 flex-1" style={{ '--content-height': '100%' } as React.CSSProperties}>
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </SidebarProvider>
        </div>
    );
}
