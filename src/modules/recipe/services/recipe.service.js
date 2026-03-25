import api from '../../../api/api';

class RecipeService { 
  async getAllRecipes(filters = {}) {
    try {
      const { mealType, difficulty, search, limit = 20, sort = 'newest' } = filters;
      const params = { mealType, difficulty, search, limit, sort };
      const response = await api.get('/recipes', { params });
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      return { success: false, recipes: [], error: error.response?.data?.message };
    }
  }

  async getRecipeById(recipeId) {
    try {
      const response = await api.get(`/recipes/${recipeId}`);
      return { success: true, recipe: response.data };
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
      return { success: false, recipe: null, error: error.response?.data?.message };
    }
  }

  async findRecipesByIngredients(ingredients, mealType = null) {
    try {
      const response = await api.post('/recipes/find-by-ingredients', {
        ingredients,
        mealType,
      });
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to find recipes:', error);
      return { success: false, recipes: [], error: error.response?.data?.message };
    }
  }

  async adjustServings(recipeId, servings) {
    try {
      const response = await api.put(`/recipes/${recipeId}/servings`, { servings });
      return { success: true, recipe: response.data };
    } catch (error) {
      console.error('Failed to adjust servings:', error);
      return { success: false, recipe: null, error: error.response?.data?.message };
    }
  }

  async getSavedRecipes() {
    try {
      const response = await api.get('/recipes/saved');
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to get saved recipes:', error);
      return { success: false, recipes: [], error: error.response?.data?.message };
    }
  }

  async toggleSaveRecipe(recipeId) {
    try {
      const response = await api.post(`/users/saved/${recipeId}`);
      return { success: true, isSaved: response.data.isSaved };
    } catch (error) {
      console.error('Failed to toggle save recipe:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to save recipe',
        isSaved: false
      };
    }
  }

  async getPopularRecipes(limit = 6) {
    try {
      const response = await api.get('/recipes/popular', { params: { limit } });
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to fetch popular recipes:', error);
      return { success: false, recipes: [], error: error.response?.data?.message };
    }
  }

  async getRecentRecipes(limit = 6) {
    try {
      const response = await api.get('/recipes/recent', { params: { limit } });
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to fetch recent recipes:', error);
      return { success: false, recipes: [], error: error.response?.data?.message };
    }
  }

  // ✅ Scan method for ingredient detection
  async scanIngredients(imageUri) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'scan_photo.jpg',
      });

      const response = await api.post('/recipes/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to scan ingredients:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to scan ingredients',
        data: null
      };
    }
  }

  // ✅ Generate Filipino recipe from ingredients
  async generateFilipinoRecipe(ingredients) {
    try {
      const response = await api.post('/recipes/generate-from-ingredients', {
        ingredients,
      });
      return { success: true, recipe: response.data.recipe };
    } catch (error) {
      console.error('Failed to generate recipe:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to generate recipe',
        recipe: null
      };
    }
  }

  // ✅ NEW: Save AI-generated recipe to user's collection
  async saveGeneratedRecipe(recipeData) {
    try {
      const response = await api.post('/users/save-generated-recipe', {
        recipe: recipeData
      });
      return { success: true, recipe: response.data.recipe };
    } catch (error) {
      console.error('Failed to save generated recipe:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to save recipe',
        recipe: null
      };
    }
  }

  // ✅ NEW: Get all user-generated recipes
  async getUserGeneratedRecipes() {
    try {
      const response = await api.get('/users/generated-recipes');
      return { success: true, recipes: response.data };
    } catch (error) {
      console.error('Failed to get user generated recipes:', error);
      return { success: false, recipes: [], error: error.response?.data?.message };
    }
  }

  // ✅ NEW: Delete a user-generated recipe
  async deleteUserGeneratedRecipe(recipeId) {
    try {
      const response = await api.delete(`/users/generated-recipes/${recipeId}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Failed to delete user generated recipe:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete recipe'
      };
    }
  }


}

export default new RecipeService();