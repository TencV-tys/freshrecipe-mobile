import api from '../../../api/api';

class RecipeService {
  async getAllRecipes(filters = {}) {
    try {
      const { mealType, difficulty, search, limit = 20 } = filters;
      const params = { mealType, difficulty, search, limit };
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
}

export default new RecipeService();