import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import { useAuth } from '../../../context/AuthContext';
import ServingAdjuster from '../components/ServingAdjuster';
import styles from '../styles/recipe.styles';
import colors from '../../shared/constants/colors';
import { formatTime } from '../../shared/utils/formatters';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { user, toggleSaveRecipe } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [servings, setServings] = useState(4);

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  useEffect(() => {
    if (recipe && servings !== recipe.servings) {
      adjustServings();
    }
  }, [servings]);

  const fetchRecipe = async () => {
    setLoading(true);
    const result = await RecipeService.getRecipeById(recipeId);
    if (result.success) {
      setRecipe(result.recipe);
      setServings(result.recipe.servings);
      setIsSaved(user?.savedRecipes?.includes(recipeId) || false);
    }
    setLoading(false);
  };

  const adjustServings = async () => {
    const result = await RecipeService.adjustServings(recipeId, servings);
    if (result.success) {
      setRecipe(result.recipe);
    }
  };

  const handleSave = async () => {
    const result = await toggleSaveRecipe(recipeId);
    if (result.success) {
      setIsSaved(result.isSaved);
      Alert.alert('Success', result.isSaved ? 'Recipe saved!' : 'Recipe removed from saved');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\n${recipe.description}`,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <ScrollView style={styles.detailContainer}>
      <View style={styles.imageContainer}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.detailImage} />
        ) : (
          <View style={[styles.detailImage, styles.imagePlaceholder]}>
            <Icon name="restaurant-outline" size={64} color={colors.gray} />
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Icon name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>{recipe.title}</Text>
        
        <View style={styles.detailInfoRow}>
          <View style={styles.detailInfoItem}>
            <Icon name="time-outline" size={20} color={colors.gray} />
            <Text style={styles.detailInfoText}>{formatTime(totalTime)}</Text>
          </View>
          <View style={styles.detailInfoItem}>
            <Icon name="restaurant-outline" size={20} color={colors.gray} />
            <Text style={styles.detailInfoText}>{recipe.mealType}</Text>
          </View>
          <View style={styles.detailInfoItem}>
            <Icon name="flame-outline" size={20} color={colors.gray} />
            <Text style={styles.detailInfoText}>{recipe.difficulty}</Text>
          </View>
          <View style={styles.detailInfoItem}>
            <Icon name="people-outline" size={20} color={colors.gray} />
            <Text style={styles.detailInfoText}>{recipe.servings} servings</Text>
          </View>
        </View>

        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        <ServingAdjuster servings={servings} onServingsChange={setServings} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients?.map((ing, index) => (
            <View key={index} style={styles.ingredientRow}>
              <Icon name="ellipse" size={8} color={colors.primary} />
              <Text style={styles.ingredientText}>
                {ing.quantity} {ing.unit} {ing.name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions?.map((inst, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{inst.step || index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{inst.text || inst.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default RecipeDetailScreen;