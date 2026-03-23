import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import RecipeCard from '../components/RecipeCard';
import styles from '../styles/recipe.styles';
import colors from '../../shared/constants/colors';

const SavedRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    setLoading(true);
    const result = await RecipeService.getSavedRecipes();
    if (result.success) {
      setRecipes(result.recipes);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedRecipes();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="bookmark-outline" size={64} color={colors.gray} />
          <Text style={styles.emptyText}>No saved recipes yet</Text>
          <Text style={styles.emptySubtext}>Start saving recipes to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default SavedRecipesScreen;