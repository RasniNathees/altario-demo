import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from './utils';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}) {
    // Always show pagination if totalPages > 0 or if we're on any page
    if (totalPages === 0 && currentPage === 1) return null;

    return (
        <div className={cn("flex items-center justify-between px-2 py-4", className)}>
            <div className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-900">{currentPage}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
