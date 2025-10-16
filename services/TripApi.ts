import apiFetch from './api';

export interface Trip {
  tripId: number;
  destination: string;
  departureDate: string;
  returnDate: string;
  flightNumber: string;
  type: string;
  countryCode: string; 
  latitude?: number;
  longitude?: number;
}

export interface CreateTripRequest {
  destination: string;
  departureDate: string;
  returnDate: string;
  flightNumber: string;
  type: string;
}

export const tripService = {
  async getNearestTrip(): Promise<Trip> {
    return await apiFetch('/Trip/nearest', { method: 'GET' }, true);
  },

  async getUserTrips(): Promise<Trip[]> {
    return await apiFetch('/Trip', { method: 'GET' }, true);
  },

  async createTrip(tripData: CreateTripRequest): Promise<Trip> {
    return await apiFetch('/Trip/create', {
      method: 'POST',
      body: JSON.stringify(tripData),
    }, true);
  },

  async getTripById(id: number): Promise<Trip> {
    return await apiFetch(`/Trip/${id}`, { method: 'GET' }, true);
  },

  async updateTrip(id: number, tripData: Partial<CreateTripRequest>): Promise<Trip> {
    return await apiFetch(`/Trip/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    }, true);
  },

  async deleteTrip(id: number): Promise<void> {
    await apiFetch(`/Trip/${id}`, { method: 'DELETE' }, true);
  }
};

export default tripService;