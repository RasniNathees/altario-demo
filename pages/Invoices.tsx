
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addInvoice, updateInvoice, deleteInvoice, fetchInvoices, fetchAllRegistrationsList } from '../store/store';
import { InvoiceStatus, Invoice, InvoiceItem, Registration } from '../types';
import { Card, CardContent, Button, Badge, Modal, Input, ConfirmationModal, Pagination } from '../components';
import { Trash, Plus, Eye, Pencil, Printer, Loader2 } from 'lucide-react';
import * as yup from 'yup';

// --- Validation Schemas ---
const itemSchema = yup.object().shape({
    description: yup.string().required('Description required'),
    quantity: yup.number().min(1, 'Min 1').required(),
    price: yup.number().min(0, 'Positive price').required(),
});

const schema = yup.object().shape({
    dueDate: yup.string().required('Due date is required'),
});

// --- Helper Functions ---
const calculateSubtotal = (items: InvoiceItem[]) => items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
const calculateVat = (subtotal: number, rate: number) => subtotal * rate;
const calculateTotal = (subtotal: number, vat: number) => subtotal + vat;

interface InvoiceFormData {
    dueDate: string;
    registrationId: string;
    status: InvoiceStatus;
    items: InvoiceItem[];
}

export default function Invoices() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: invoices, meta, loading } = useSelector((state: RootState) => state.invoices);
    // We need a list of users for the dropdown, but we don't want to use the main paginated list from Redux
    // as it might only contain 10 items. We'll fetch a list specifically for the dropdown.
    const [userOptions, setUserOptions] = useState<Registration[]>([]);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Edit State
    const [editId, setEditId] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Processing state for deletes/updates
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    // Form State
    const [formData, setFormData] = useState<InvoiceFormData>({
        dueDate: '',
        registrationId: '',
        status: InvoiceStatus.UNPAID,
        items: [{ description: 'VAT Registration Service', quantity: 1, price: 250 }]
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const initialized = useRef(false);

    useEffect(() => {
        // Client-side caching: If we already have invoices loaded, don't refetch on tab switch
        if (!initialized.current && invoices.length > 0) {
            initialized.current = true;
        } else {
            // Fetch first page of invoices if empty
            dispatch(fetchInvoices({ page: 1, limit: 10 }));
            initialized.current = true;
        }

        // Fetch users for dropdown (always ensure we have this list)
        if (userOptions.length === 0) {
            dispatch(fetchAllRegistrationsList()).then((result: any) => {
                if (result.payload) setUserOptions(result.payload);
            });
        }
    }, [dispatch]); // Removed other deps to run once on mount (cached)

    const handlePageChange = (page: number) => {
        dispatch(fetchInvoices({ page, limit: meta.limit }));
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            setProcessingIds(prev => new Set(prev).add(itemToDelete));
            await dispatch(deleteInvoice(itemToDelete));
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(itemToDelete);
                return next;
            });
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleCreate = () => {
        setEditId(null);
        setFormData({
            dueDate: '',
            registrationId: userOptions[0]?.id || '',
            status: InvoiceStatus.UNPAID,
            items: [{ description: 'VAT Registration Service', quantity: 1, price: 250 }]
        });
        setIsFormModalOpen(true);
    };

    const handleEdit = (invoice: Invoice) => {
        setEditId(invoice.id);
        setFormData({
            dueDate: invoice.dueDate,
            registrationId: invoice.registrationId,
            status: invoice.status,
            items: invoice.items
        });
        setIsFormModalOpen(true);
    };

    const handleView = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await schema.validate(formData, { abortEarly: false });
            
            if (formData.items.some(i => !i.description || i.price <= 0)) {
                setErrors({ form: 'Please complete all item fields correctly.' });
                return;
            }

            if (!formData.registrationId) {
                setErrors({ registrationId: 'Please select a registered user first' });
                return;
            }

            const payload = {
                dueDate: formData.dueDate,
                registrationId: formData.registrationId,
                status: formData.status,
                items: formData.items,
                vatRate: 0.20,
                notes: 'Payment due within 30 days.'
            };

            if (editId) {
                // Update existing
                setProcessingIds(prev => new Set(prev).add(editId));
                await dispatch(updateInvoice({ id: editId, data: payload }));
                setProcessingIds(prev => {
                    const next = new Set(prev);
                    next.delete(editId);
                    return next;
                });
            } else {
                // Create new
                await dispatch(addInvoice(payload));
            }

            setIsFormModalOpen(false);
            setErrors({});
        } catch (err) {
            if (err instanceof yup.ValidationError) {
                const newErrors: { [key: string]: string } = {};
                err.inner.forEach(error => {
                    if (error.path) newErrors[error.path] = error.message;
                });
                setErrors(newErrors);
            }
        }
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, price: 0 }] });
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = [...formData.items];
            newItems.splice(index, 1);
            setFormData({ ...formData, items: newItems });
        }
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const getUser = (regId: string) => userOptions.find(r => r.id === regId);
    const isProcessing = (id: string) => processingIds.has(id);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">VAT Invoices</h1>
                    <p className="text-muted-foreground">Manage registration invoices and payments.</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Invoice #</th>
                                    <th className="p-4 font-medium">Registration (Bill To)</th>
                                    <th className="p-4 font-medium">Total (Inc. VAT)</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && invoices.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                                ) : invoices.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No invoices generated.</td></tr>
                                ) : (
                                    invoices.map((inv) => {
                                        const user = getUser(inv.registrationId);
                                        const sub = calculateSubtotal(inv.items);
                                        const total = calculateTotal(sub, calculateVat(sub, inv.vatRate));

                                        return (
                                            <tr key={inv.id} className="border-t hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-medium text-slate-700">{inv.invoiceNumber}</td>
                                                <td className="p-4">
                                                    <div className="font-medium">{user?.company || 'Unknown User'}</div>
                                                    <div className="text-xs text-muted-foreground">{user?.fullName || 'N/A'}</div>
                                                </td>
                                                <td className="p-4 font-semibold">${total.toFixed(2)}</td>
                                                <td className="p-4">{inv.dueDate}</td>
                                                <td className="p-4">
                                                    <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'destructive' : 'default'}>
                                                        {inv.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <Button size="icon" variant="outline" onClick={() => handleView(inv)} title="View Detail">
                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                    </Button>

                                                    <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-900" onClick={() => handleEdit(inv)} disabled={isProcessing(inv.id)} title="Edit / Change Status">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-slate-400 hover:text-red-600"
                                                        onClick={() => handleDeleteClick(inv.id)}
                                                        disabled={isProcessing(inv.id)}
                                                        title="Delete"
                                                    >
                                                        {isProcessing(inv.id) ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                    />
                </CardContent>
            </Card>

            {/* --- Create/Edit Invoice Modal --- */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editId ? "Edit Invoice" : "Generate VAT Invoice"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Bill To Registration</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                            value={formData.registrationId}
                            onChange={(e) => setFormData({ ...formData, registrationId: e.target.value })}
                            disabled={!!editId} // Disable changing user on edit to avoid confusion
                        >
                            {userOptions.length === 0 && <option value="">Loading users...</option>}
                            {userOptions.map(r => (
                                <option key={r.id} value={r.id}>{r.company} - {r.fullName}</option>
                            ))}
                        </select>
                        {editId && <p className="text-xs text-muted-foreground mt-1">To change the user, delete this invoice and create a new one.</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Invoice Items</label>
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <Input
                                    placeholder="Description"
                                    className="flex-grow"
                                    value={item.description}
                                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    className="w-16"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                                />
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    className="w-24"
                                    value={item.price}
                                    onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                                />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(idx)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full mt-2">
                            <Plus className="h-3 w-3 mr-1" /> Add Item
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Due Date</label>
                            <Input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                error={errors.dueDate}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Status</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
                            >
                                <option value={InvoiceStatus.UNPAID}>UNPAID</option>
                                <option value={InvoiceStatus.PAID}>PAID</option>
                                <option value={InvoiceStatus.OVERDUE}>OVERDUE</option>
                            </select>
                        </div>
                    </div>

                    {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={userOptions.length === 0}>
                            {editId ? (isProcessing(editId) ? 'Saving...' : 'Save Changes') : 'Generate'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* --- View Invoice Detail Modal --- */}
            {selectedInvoice && (
                <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Invoice Detail">
                    <div className="bg-white p-2" id="invoice-print">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start border-b pb-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">R</div>
                                    <span className="font-bold text-lg">RegiFlow Systems</span>
                                </div>
                                <p className="text-sm text-slate-500">123 Innovation Drive</p>
                                <p className="text-sm text-slate-500">Tech City, TC 90210</p>
                                <p className="text-sm text-slate-500">VAT Reg: GB 123 456 789</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-slate-800">INVOICE</h2>
                                <p className="text-sm text-slate-500">#{selectedInvoice.id}</p>
                                <div className="mt-2">
                                    <Badge variant={selectedInvoice.status === 'PAID' ? 'success' : selectedInvoice.status === 'OVERDUE' ? 'destructive' : 'warning'}>{selectedInvoice.status}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Bill To & Info */}
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bill To</h3>
                                {(() => {
                                    const u = getUser(selectedInvoice.registrationId);
                                    return u ? (
                                        <>
                                            <p className="font-medium text-slate-900">{u.company}</p>
                                            <p className="text-sm text-slate-600">{u.fullName}</p>
                                            <p className="text-sm text-slate-600">{u.email}</p>
                                        </>
                                    ) : <p className="text-red-500 italic">User Deleted or Not Loaded</p>
                                })()}
                            </div>
                            <div className="text-right">
                                <div className="mb-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Date:</span>
                                    <span className="text-sm font-medium">{selectedInvoice.createdAt || '2023-10-25'}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Due Date:</span>
                                    <span className="text-sm font-medium">{selectedInvoice.dueDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-6">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="py-2 px-3 text-left font-medium">Description</th>
                                        <th className="py-2 px-3 text-right font-medium">Qty</th>
                                        <th className="py-2 px-3 text-right font-medium">Price</th>
                                        <th className="py-2 px-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedInvoice.items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-2 px-3 text-slate-700">{item.description}</td>
                                            <td className="py-2 px-3 text-right text-slate-700">{item.quantity}</td>
                                            <td className="py-2 px-3 text-right text-slate-700">${item.price.toFixed(2)}</td>
                                            <td className="py-2 px-3 text-right font-medium text-slate-900">${(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end border-t pt-4">
                            <div className="w-48 space-y-2">
                                {(() => {
                                    const sub = calculateSubtotal(selectedInvoice.items);
                                    const vat = calculateVat(sub, selectedInvoice.vatRate);
                                    const total = calculateTotal(sub, vat);
                                    return (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Subtotal:</span>
                                                <span className="font-medium">${sub.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">VAT ({(selectedInvoice.vatRate * 100).toFixed(0)}%):</span>
                                                <span className="font-medium">${vat.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-slate-900 border-t pt-2 mt-2">
                                                <span>Total:</span>
                                                <span>${total.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>

                        {/* Footer Notes */}
                        {selectedInvoice.notes && (
                            <div className="mt-8 pt-4 border-t text-xs text-slate-400">
                                <p><strong>Notes:</strong> {selectedInvoice.notes}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-2 print:hidden">
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="h-4 w-4 mr-2" /> Print
                            </Button>
                            <Button size="sm" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                description="Are you sure you want to delete this invoice? This action cannot be undone."
                isLoading={itemToDelete ? isProcessing(itemToDelete) : false}
            />
        </div>
    );
}
