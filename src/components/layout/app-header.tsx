import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from 'proqio-ui';

import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/get-initials';

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function Header({ children, className, ...props }: React.ComponentPropsWithRef<'header'>) {
    return (
        <header
            className={cn(
                'flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950',
                className,
            )}
            {...props}
        >
            {children}
        </header>
    );
}

// ---------------------------------------------------------------------------
// Section — groups elements on one side (left / right)
// ---------------------------------------------------------------------------

function HeaderSection({ children, className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return (
        <div className={cn('flex items-center gap-3', className)} {...props}>
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Brand — application name
// ---------------------------------------------------------------------------

function HeaderBrand({ children = 'Infinitus', className, ...props }: React.ComponentPropsWithRef<'span'>) {
    return (
        <span
            className={cn('text-base font-semibold text-slate-900 dark:text-white', className)}
            {...props}
        >
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Divider — vertical separator between header elements
// ---------------------------------------------------------------------------

function HeaderDivider({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
    return (
        <div
            className={cn('h-5 w-px bg-slate-200 dark:bg-slate-700', className)}
            aria-hidden="true"
            {...props}
        />
    );
}

// ---------------------------------------------------------------------------
// CompanyLogo — company logo image or generic building placeholder
// ---------------------------------------------------------------------------

interface HeaderCompanyLogoProps extends React.ComponentPropsWithRef<'img'> {
    src?: string;
    alt?: string;
}

function HeaderCompanyLogo({ src, alt = 'Company logo', className, ...props }: HeaderCompanyLogoProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={cn('h-7 w-auto rounded object-contain', className)}
                {...props}
            />
        );
    }

    return (
        <div
            className={cn(
                'flex h-7 w-7 items-center justify-center rounded bg-slate-100 dark:bg-slate-800',
                className,
            )}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-slate-500 dark:text-slate-400"
                aria-label={alt}
            >
                <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21V9h6v12" />
            </svg>
        </div>
    );
}

// ---------------------------------------------------------------------------
// UserAvatar — user profile image or initials fallback + dropdown menu
// ---------------------------------------------------------------------------

interface HeaderUserAvatarProps {
    src?: string;
    name?: string;
    className?: string;
}

function HeaderUserAvatar({ src, name = 'User', className }: HeaderUserAvatarProps) {
    const initials = getInitials(name);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400',
                        className,
                    )}
                    aria-label={`User menu for ${name}`}
                >
                    {src ? (
                        <img src={src} alt={name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                            <span className="text-xs font-semibold">{initials}</span>
                        </div>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Header, HeaderSection, HeaderBrand, HeaderDivider, HeaderCompanyLogo, HeaderUserAvatar };
export type { HeaderCompanyLogoProps, HeaderUserAvatarProps };
