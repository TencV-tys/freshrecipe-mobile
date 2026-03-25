import api from '../../../api/api';

class UserService {
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Failed to get profile:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  async updateProfile(profileData, imageFile = null) {
    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
          if (profileData[key] !== undefined) {
            formData.append(key, profileData[key]);
          }
        });
        formData.append('profileImage', {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.fileName,
        });
        
        response = await api.put('/users/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.put('/users/profile', profileData);
      }
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  async toggleSaveRecipe(recipeId) {
    try {
      const response = await api.post(`/users/saved/${recipeId}`);
      return { success: true, isSaved: response.data.isSaved };
    } catch (error) {
      console.error('Failed to toggle save recipe:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  async getSavedRecipes() {
    try {
      const response = await api.get('/users/saved');
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to get saved recipes:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to logout:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }

  // ✅ Add this to check user status (banned/suspended)
  async getUserStatus() {
    try {
      const response = await api.get('/auth/status');
      return { success: true, status: response.data };
    } catch (error) {
      console.error('Failed to get user status:', error);
      return { success: false, error: error.response?.data?.message };
    }
  }
}

export default new UserService();