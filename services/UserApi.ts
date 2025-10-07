import apiFetch from "./api";

export interface User {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  countryOfOrigin?: string;
  city?: string;
  travelType?: string;
  bio?: string;
  avatar?: string;
  preferredLanguage?: string;
  preferences?: {
    notifications: boolean;
    culturalAlerts: boolean;
    healthAlerts: boolean;
    language: string;
  };
}

export const UserApi = {
  getCurrentUser: async (id: number): Promise<User> => {
    const res = await apiFetch(`/User/${id}`, { method: "GET" }, true);
    return res;
  },

  updateUser: async (id: number, data: Partial<User>) => {
    await apiFetch(`/User/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, true);
  },

  getUserTrips: async () => {
    const res = await apiFetch(`/Trip`, { method: "GET" }, true);
    return res || [];
  },

  getUserAlerts: async () => {
    const res = await apiFetch(`/Alert`, { method: "GET" }, true);
    return res || [];
  },
};
