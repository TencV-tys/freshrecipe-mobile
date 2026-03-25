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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import { useAuth } from '../../../context/AuthContext';
import styles from '../styles/recipeDetail.styles';
import colors from '../../shared/constants/colors';
import { formatTime } from '../../shared/utils/formatters';
import { BASE_IP } from '../../../api/apiConfig';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    setLoading(true);
    const result = await RecipeService.getRecipeById(recipeId);
    if (result.success) {
      setRecipe(result.recipe);
      const saved = user?.savedRecipes?.includes(parseInt(recipeId)) || false;
      setIsSaved(saved);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const result = await RecipeService.toggleSaveRecipe(recipeId);
    if (result.success) {
      setIsSaved(result.isSaved);
      Alert.alert('Success', result.isSaved ? 'Recipe saved!' : 'Recipe removed from saved');
    } else {
      Alert.alert('Error', result.error || 'Failed to save recipe');
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

  const getImageUrl = () => {
    if (!recipe?.image) return null;
    if (recipe.image.startsWith('http')) return recipe.image;
    return `${BASE_IP}${recipe.image}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity 
            style={styles.backButtonContainer} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.detailContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {getImageUrl() ? (
            <Image source={{ uri: getImageUrl() }} style={styles.detailImage} />
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
    </SafeAreaView>
  );
};

export default RecipeDetailScreen;