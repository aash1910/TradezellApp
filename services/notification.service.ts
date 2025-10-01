import api from './api';

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  isNew?: boolean;
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await api.post(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const refreshNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error refreshing notifications:', error);
    throw error;
  }
}; 