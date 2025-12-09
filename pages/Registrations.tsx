
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addRegistration, updateRegistrationStatus, deleteRegistration, fetchRegistrations } from '../store/store';
import { RegistrationStatus } from '../types';
import { Card, CardContent, CardHeader, Button, Badge, Modal, Input, ConfirmationModal, Pagination } from '../components';
import { Check, X, Trash, Plus, Search, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';


// Validation Schema
const schema = yup.object().shape({
  fullName: yup.string().required('Full Name is required').min(3, 'Name must be at least 3 chars'),
  email: yup.string().email('Invalid email').required('Email is required'),
  company: yup.string().required('Company is required'),
});

export default function Registrations() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, meta, loading } = useSelector((state: RootState) => state.registrations);



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const initialized = useRef(false);

  // Smart Fetching: Only fetch if we have no items (first load) or if searching
  useEffect(() => {
    // Prevent re-fetching if we already have data and are just switching tabs (Caching)
    if (!initialized.current && items.length > 0 && searchTerm === '') {
      initialized.current = true;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      // If initialized and search is empty and we have items, don't auto-refresh on simple re-renders
      // But if search changed, we must fetch.
      dispatch(fetchRegistrations({ page: meta.page > 0 ? meta.page : 1, limit: 10, search: searchTerm }));
      initialized.current = true;
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dispatch]); // Removed items.length dependency to avoid loops

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({ fullName: '', email: '', company: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});



  const handlePageChange = (page: number) => {
    dispatch(fetchRegistrations({ page, limit: meta.limit, search: searchTerm }));
  };

  const handleStatusChange = async (id: string, status: RegistrationStatus) => {
    setProcessingIds(prev => new Set(prev).add(id));
    await dispatch(updateRegistrationStatus({ id, status }));
    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      setProcessingIds(prev => new Set(prev).add(itemToDelete));
      await dispatch(deleteRegistration(itemToDelete));
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(itemToDelete);
        return next;
      });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schema.validate(formData, { abortEarly: false });
      dispatch(addRegistration({ ...formData, status: RegistrationStatus.PENDING }));
      setIsModalOpen(false);
      setFormData({ fullName: '', email: '', company: '' });
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

  const isProcessing = (id: string) => processingIds.has(id);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">Manage incoming VAT registration requests.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Registration
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, name or email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Business / Applicant</th>
                  <th className="p-4 font-medium hidden md:table-cell">Contact</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No registrations found.</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{item.company}</div>
                        <div className="text-xs text-muted-foreground">{item.fullName}</div>
                        {(item._count?.invoices ?? 0) > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            <FileText className="h-3 w-3" /> Invoice Generated
                          </div>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-slate-600">{item.email}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          item.status === RegistrationStatus.APPROVED ? 'success' :
                            item.status === RegistrationStatus.REJECTED ? 'destructive' :
                              'warning'
                        }>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* Action Buttons */}
                          {isProcessing(item.id) ? (
                            <Button size="icon" variant="ghost" disabled className="h-8 w-8">
                              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                            </Button>
                          ) : item.status === RegistrationStatus.PENDING ? (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                onClick={() => handleStatusChange(item.id, RegistrationStatus.APPROVED)}
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => handleStatusChange(item.id, RegistrationStatus.REJECTED)}
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium px-2">
                              {item.status === RegistrationStatus.APPROVED ? 'Approved' : 'Rejected'}
                            </span>
                          )}

                          <div className="h-4 w-px bg-slate-200 mx-1"></div>

                          {(item._count?.invoices ?? 0) > 0 && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50" onClick={() => navigate('/invoices')} title="View Invoice">
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(item.id)}
                            title="Delete"
                            disabled={isProcessing(item.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
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

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New VAT Registration">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Company / Business Name</label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              error={errors.company}
              placeholder="Business Ltd."
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this registration? WARNING: This will also delete any associated invoices. This action cannot be undone."
        isLoading={itemToDelete ? isProcessing(itemToDelete) : false}
      />
    </div>
  );
}
