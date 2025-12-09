
import { configureStore, createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Registration, Invoice, RegistrationStatus, AppState, PaginationParams, PaginatedResponse, DashboardStats } from '../types';
import { api } from '../services/api';

// --- Thunks ---

// Dashboard
export const fetchDashboardStats = createAsyncThunk('dashboard/fetch', async () => {
    return await api.dashboard.getStats();
});

// Registrations
export const fetchRegistrations = createAsyncThunk('registrations/fetch', async (params: PaginationParams) => {
  return await api.registrations.getAll(params);
});

// Helper to fetch full list for dropdowns (not stored in main pagination state)
export const fetchAllRegistrationsList = createAsyncThunk('registrations/fetchList', async () => {
    return await api.registrations.getAllList();
});

export const addRegistration = createAsyncThunk('registrations/add', async (data: Omit<Registration, 'id' | 'createdAt'>) => {
  return await api.registrations.add(data);
});

export const updateRegistrationStatus = createAsyncThunk('registrations/updateStatus', async ({ id, status }: { id: string, status: RegistrationStatus }) => {
  return await api.registrations.updateStatus(id, status);
});

export const deleteRegistration = createAsyncThunk('registrations/delete', async (id: string) => {
  return await api.registrations.delete(id);
});

// Invoices
export const fetchInvoices = createAsyncThunk('invoices/fetch', async (params: PaginationParams) => {
  return await api.invoices.getAll(params);
});

export const addInvoice = createAsyncThunk('invoices/add', async (data: Omit<Invoice, 'id' | 'createdAt'>) => {
  return await api.invoices.create(data);
});

export const updateInvoice = createAsyncThunk('invoices/update', async ({ id, data }: { id: string, data: Partial<Invoice> }) => {
  return await api.invoices.update(id, data);
});

export const deleteInvoice = createAsyncThunk('invoices/delete', async (id: string) => {
  return await api.invoices.delete(id);
});

// --- Slices ---

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        stats: null,
        loading: false,
        error: null
    } as AppState['dashboard'],
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Error';
            });
    }
});

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: {
    items: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: false,
    error: null,
  } as AppState['registrations'],
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Paginated
      .addCase(fetchRegistrations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegistrations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchRegistrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      })
      // Add
      .addCase(addRegistration.fulfilled, (state, action) => {
        // If we are on page 1, we can prepend. Otherwise, just reload or ignore.
        // For simplicity, we assume we want to see it, so we prepend and pop last if limit reached
        if (state.meta.page === 1) {
            state.items.unshift(action.payload);
            if (state.items.length > state.meta.limit) {
                state.items.pop();
            }
        }
        state.meta.total++;
      })
      // Update Status
      .addCase(updateRegistrationStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteRegistration.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.meta.total--;
      });
  },
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: {
    items: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    loading: false,
    error: null,
  } as AppState['invoices'],
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Paginated
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      })
      // Add
      .addCase(addInvoice.fulfilled, (state, action) => {
        if (state.meta.page === 1) {
            state.items.unshift(action.payload);
            if (state.items.length > state.meta.limit) {
                state.items.pop();
            }
        }
        state.meta.total++;
      })
      // Update
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
            state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.meta.total--;
      })
      // Cascading Delete
      .addCase(deleteRegistration.fulfilled, (state, action) => {
        state.items = state.items.filter(inv => inv.registrationId !== action.payload);
      });
  },
});

// --- Store Configuration ---
export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    registrations: registrationsSlice.reducer,
    invoices: invoicesSlice.reducer,
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
