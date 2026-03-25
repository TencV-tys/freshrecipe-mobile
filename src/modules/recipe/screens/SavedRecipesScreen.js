import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import RecipeCard from '../components/RecipeCard';
import styles from '../styles/savedRecipes.styles';
import colors from '../../shared/constants/colors';

const SavedRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedRecipes = async () => {
    try { 
      const result = await RecipeService.getSavedRecipes();
      if (result.success) {
        setRecipes(result.recipes || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedRecipes();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
    }, [])
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Icon name="bookmark-outline" size={64} color={colors.gray} />
      <Text style={styles.emptyText}>No saved recipes yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the bookmark icon on any recipe to save it here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={colors.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Saved Recipes</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading saved recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {renderHeader()}
      
      {recipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => (item.id || item._id)?.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id || item._id })}
            />
          )}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            recipes.length > 0 ? (
              <Text style={styles.savedCount}>
                {recipes.length} {recipes.length === 1 ? 'recipe saved' : 'recipes saved'}
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SavedRecipesScreen;