import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';
import { storage } from '../utils/storage';

// 创建 Axios 实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动注入 Token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      '网络请求失败';
    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  },
);

// ==================== Auth ====================
export const authApi = {
  sendCode: (phone: string) =>
    api.post('/auth/send-code', { phone }) as Promise<{ message: string }>,

  login: (phone: string, code: string) =>
    api.post('/auth/login', { phone, code }) as Promise<{
      access_token: string;
      user: User;
    }>,
};

// ==================== Checkin ====================
export const checkinApi = {
  doCheckin: () =>
    api.post('/checkin') as Promise<{
      message: string;
      checkinDate: string;
      consecutiveDays: number;
      totalDays: number;
    }>,

  getStatus: () =>
    api.get('/checkin/status') as Promise<{
      checkedInToday: boolean;
      consecutiveDays: number;
      totalDays: number;
      monthlyDays: number;
    }>,

  getHistory: () =>
    api.get('/checkin/history') as Promise<CheckinRecord[]>,
};

// ==================== Contacts ====================
export const contactsApi = {
  list: () => api.get('/contacts') as Promise<Contact[]>,

  create: (data: Partial<Contact>) =>
    api.post('/contacts', data) as Promise<Contact>,

  update: (id: string, data: Partial<Contact>) =>
    api.put(`/contacts/${id}`, data) as Promise<Contact>,

  remove: (id: string) =>
    api.delete(`/contacts/${id}`) as Promise<void>,
};

// ==================== Users ====================
export const usersApi = {
  getProfile: () => api.get('/users/profile') as Promise<User>,

  updateProfile: (data: Partial<User>) =>
    api.put('/users/profile', data) as Promise<User>,
};

// ==================== Types ====================
export interface User {
  id: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  lastCheckinAt?: string;
  createdAt: string;
}

export interface CheckinRecord {
  id: string;
  checkinDate: string;
  checkinTime: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  priority: number;
  isVerified: boolean;
}
