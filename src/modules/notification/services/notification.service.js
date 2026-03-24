import api from '../../../api/api';

class NotificationService {
  // Get all notifications
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  // Get unread notifications
  async getUnreadNotifications() {
    try {
      const response = await api.get('/notifications/unread');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to mark as read:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }
}

export default new NotificationService();