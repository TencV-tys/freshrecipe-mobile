import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../../recipe/services/recipe.service';
import colors from '../../shared/constants/colors';

const MyGeneratedRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGeneratedRecipes = async () => {
    try {
      const result = await RecipeService.getUserGeneratedRecipes();
      if (result.success) {
        setRecipes(result.recipes || []);
      }
    } catch (error) {
      console.error('Failed to fetch generated recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGeneratedRecipes();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGeneratedRecipes();
    setRefreshing(false);
  };

  const handleDelete = async (recipeId) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this AI-generated recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await RecipeService.deleteUserGeneratedRecipe(recipeId);
            if (result.success) {
              // ✅ Remove from state immediately
              setRecipes(prev => prev.filter(r => {
                const id = r?.id || r?._id;
                return id !== recipeId;
              }));
              Alert.alert('Success', 'Recipe deleted');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getRecipeId = (item) => {
    return item?.id || item?._id || null;
  };

  const renderRecipeCard = ({ item }) => {
    const recipeId = getRecipeId(item);
    if (!recipeId) return null;

    const totalTime = (item?.prepTime || 0) + (item?.cookTime || 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GeneratedRecipeDetail', { recipe: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.aiBadge}>
              <Icon name="sparkles" size={14} color={colors.white} />
              <Text style={styles.aiBadgeText}>AI Generated</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleDelete(recipeId)} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.title} numberOfLines={1}>
            {item?.title || 'Untitled Recipe'}
          </Text>
          
          <Text style={styles.description} numberOfLines={2}>
            {item?.description || 'No description available'}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={14} color={colors.gray} />
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="restaurant-outline" size={14} color={colors.gray} />
              <Text style={styles.metaText}>{item?.mealType || 'Meal'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="flame-outline" size={14} color={colors.gray} />
              <Text style={styles.metaText}>{item?.difficulty || 'Medium'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people-outline" size={14} color={colors.gray} />
              <Text style={styles.metaText}>{item?.servings || 4} serves</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Icon name="sparkles-outline" size={64} color={colors.gray} />
      <Text style={styles.emptyText}>No AI-generated recipes yet</Text>
      <Text style={styles.emptySubtext}>
        Scan ingredients and tap "Generate Filipino Recipe" to create one!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My AI Recipes</Text>
        <View style={styles.headerRight} />
      </View>

      {recipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => {
            const id = getRecipeId(item);
            return id ? id.toString() : Math.random().toString();
          }}
          renderItem={renderRecipeCard}
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
            <Text style={styles.countText}>
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} generated
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  countText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.gray,
  },
};

export default MyGeneratedRecipesScreen;