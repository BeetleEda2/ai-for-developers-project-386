import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export function useOwner() {
  return useQuery({
    queryKey: ['owner'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/owner');
      if (error) throw error;
      return data;
    },
  });
}

export function useEventTypes() {
  return useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/event-types');
      if (error) throw error;
      return data;
    },
  });
}

export function useEventType(id: string | undefined) {
  return useQuery({
    queryKey: ['event-types', id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/event-types/{id}', {
        params: { path: { id: id! } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; description?: string }) => {
      const { data, error } = await apiClient.POST('/event-types', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}

export function useSlots(
  eventTypeId: string | undefined,
  from?: string,
  to?: string
) {
  return useQuery({
    queryKey: ['slots', eventTypeId, from, to],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/event-types/{id}/slots', {
        params: {
          path: { id: eventTypeId! },
          query: { from, to },
        },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!eventTypeId,
  });
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/bookings');
      if (error) throw error;
      return data;
    },
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/bookings/{id}', {
        params: { path: { id: id! } },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      eventTypeId: string;
      start: string;
      guestName: string;
      guestEmail: string;
      notes?: string;
    }) => {
      const { data, error } = await apiClient.POST('/bookings', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
