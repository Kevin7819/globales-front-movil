import { ApiResponse, Trip } from '../types';
import apiFetch from './api';

export const tripService = {
  async getNearestTrip(): Promise<Trip> {
    return await apiFetch('/Trip/nearest', { method: 'GET' }, true);
  },

  async getUserTrips(): Promise<Trip[]> {
    return await apiFetch('/Trip', { method: 'GET' }, true);
  },

  async getTripById(id: number): Promise<Trip> {
    return await apiFetch(`/Trip/${id}`, { method: 'GET' }, true);
  },

  async claimTripByReservationCode(reservationCode: string): Promise<ApiResponse<Trip>> {
    return await apiFetch('/Trip/claim', {
      method: 'POST',
      body: JSON.stringify(reservationCode),
      headers: {
        'Content-Type': 'application/json',
      },
    }, true);
  },

  // Métodos comentados - disponibles cuando el backend los active
  /*
  async createTrip(tripData: CreateTripRequest): Promise<Trip> {
    return await apiFetch('/Trip/Create', {
      method: 'POST',
      body: JSON.stringify(tripData),
      headers: {
        'Content-Type': 'application/json',
      },
    }, true);
  },

  async updateTrip(id: number, tripData: UpdateTripRequest): Promise<Trip> {
    return await apiFetch(`/Trip/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
      headers: {
        'Content-Type': 'application/json',
      },
    }, true);
  },

  async deleteTrip(id: number): Promise<void> {
    await apiFetch(`/Trip/${id}`, { method: 'DELETE' }, true);
  }
  */
};

export default tripService;