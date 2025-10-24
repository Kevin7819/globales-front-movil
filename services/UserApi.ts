import { Alert, User } from '../types';
import apiFetch from './api';

export const userService = {
  async getCurrentUser(): Promise<User> {
    return await apiFetch(`/User/me`, { method: 'GET' }, true);
  },

  async updateUser(id: number, data: Partial<User>): Promise<void> {
    await apiFetch(`/User/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  },

  async getUserAlerts(): Promise<Alert[]> {
    const res = await apiFetch(`/Alert`, { method: 'GET' }, true);
    return res || [];
  },
};