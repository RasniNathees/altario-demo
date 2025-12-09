import { Button } from './Button';

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-lg animate-in fade-in zoom-in duration-200 border border-slate-200">
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
