import { ReactNode } from 'react';
import { cn } from './utils';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn("rounded-lg border bg-white text-slate-950 shadow-sm", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
    return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
