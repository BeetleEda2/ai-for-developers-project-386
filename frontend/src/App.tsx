import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuestLayout } from './routes/guest/Layout';
import { AdminLayout } from './routes/admin/Layout';
import { GuestEventTypesPage } from './routes/guest/EventTypesPage';
import { BookingPage } from './routes/guest/BookingPage';
import { DashboardPage } from './routes/admin/DashboardPage';
import { AdminEventTypesPage } from './routes/admin/EventTypesPage';

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestLayout />}>
        <Route index element={<GuestEventTypesPage />} />
        <Route path="event-types/:id" element={<BookingPage />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="event-types" element={<AdminEventTypesPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
