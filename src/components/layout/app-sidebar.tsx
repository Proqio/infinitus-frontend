import { Link } from '@tanstack/react-router';
import { ChevronsLeft, ChevronsRight, House } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from 'proqio-ui';

import { cn } from '@/utils/cn';

type NavItem = {
    label: string;
    to: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [{ label: 'Home', to: '/', Icon: House }];

export function AppSidebar() {
    const { state } = useSidebar();
    const isExpanded = state === 'expanded';

    return (
        <Sidebar
            collapsible="icon"
            className="absolute h-(--content-height) max-h-(--content-height)"
        >
            <SidebarHeader className={cn('flex', isExpanded ? 'justify-end' : 'justify-center')}>
                <SidebarTrigger>
                    {isExpanded ? (
                        <ChevronsLeft className="size-4" />
                    ) : (
                        <ChevronsRight className="size-4" />
                    )}
                </SidebarTrigger>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map(({ label, to, Icon }) => (
                        <SidebarMenuItem key={to}>
                            <SidebarMenuButton
                                asChild
                                tooltip={label}
                                className="group-data-[collapsible=icon]:mx-auto"
                            >
                                <Link to={to}>
                                    <Icon className="size-4" />
                                    <span>{label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
