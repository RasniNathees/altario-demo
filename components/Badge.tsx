import { ReactNode } from 'react';
import { cn } from './utils';

export function Badge({ children, variant }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'destructive' }) {
    const styles = {
        default: "bg-slate-100 text-slate-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        destructive: "bg-red-100 text-red-800",
    };
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", styles[variant || 'default'])}>
            {children}
        </span>
    );
}
