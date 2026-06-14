import type { Request, Response, NextFunction } from 'express';

export interface Owner {
  id: string;
  name: string;
  timezone: string;
}

export interface EventType {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  createdAt: string;
}

export interface EventTypeCreate {
  title: string;
  description?: string;
}

export interface Slot {
  start: string;
  end: string;
  available: boolean;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  start: string;
  end: string;
  guestName: string;
  guestEmail: string;
  notes?: string | null;
  createdAt: string;
}

export interface BookingCreate {
  eventTypeId: string;
  start: string;
  guestName: string;
  guestEmail: string;
  notes?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export type Handler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
