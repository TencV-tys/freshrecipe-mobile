import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../../recipe/services/recipe.service';
import colors from '../../shared/constants/colors';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#ff6b6b',
  primaryDark: '#e85555',
  primaryFaint: '#fff0f0',
  primaryLight: '#ff8e8e',
  secondary: '#ff9f43',
  secondaryFaint: '#fff8f0',
  teal: '#00c9a7',
  tealFaint: '#f0fdf9',
  blue: '#33b5e5',
  blueFaint: '#f0f8ff',
  dark: '#1a1a2e',
  gray: '#8a8a9a',
  lightGray: '#f4f4f8',
  white: '#ffffff',
  black: '#1a1a2e',
  error: '#ff4444',
};

// Pressable with scale feedback (same as all screens)
const PressableScale = ({ onPress, style, children, activeOpacity = 0.82 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Recipe Card Component
const AnimatedRecipeCard = ({ item, index, onPress, onDelete }) => {
  const [animValue] = React.useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  const totalTime = (item?.prepTime || 0) + (item?.cookTime || 0);
  
  return (
    <Animated.View 
      style={[
        styles.cardWrapper,
        { opacity: animValue, transform: [{ translateY }] }
      ]}
    >
      <PressableScale onPress={onPress}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.aiBadge}>
              <Icon name="sparkles" size={12} color={theme.white} />
              <Text style={styles.aiBadgeText}>AI Generated</Text>
            </View>
            <PressableScale onPress={onDelete}>
              <View style={styles.deleteButton}>
                <Icon name="trash-outline" size={18} color={theme.error} />
              </View>
            </PressableScale>
          </View>
          
          <Text style={styles.title} numberOfLines={1}>
            {item?.title || 'Untitled Recipe'}
          </Text>
          
          <Text style={styles.description} numberOfLines={2}>
            {item?.description || 'No description available'}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={12} color={theme.gray} />
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="restaurant-outline" size={12} color={theme.gray} />
              <Text style={styles.metaText}>{item?.mealType || 'Meal'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="flame-outline" size={12} color={theme.gray} />
              <Text style={styles.metaText}>{item?.difficulty || 'Medium'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people-outline" size={12} color={theme.gray} />
              <Text style={styles.metaText}>{item?.servings || 4} serves</Text>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const MyGeneratedRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    
    if (recipes.length > 0) {
      Animated.spring(countAnim, { toValue: 1, tension: 55, friction: 9, delay: 150, useNativeDriver: true }).start();
    }
  }, [recipes.length]);

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

  const renderRecipeCard = ({ item, index }) => {
    const recipeId = getRecipeId(item);
    if (!recipeId) return null;

    return (
      <AnimatedRecipeCard
        item={item}
        index={index}
        onPress={() => navigation.navigate('GeneratedRecipeDetail', { recipe: item })}
        onDelete={() => handleDelete(recipeId)}
      />
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.centerContainer,
        { opacity: contentAnim }
      ]}
    >
      <Icon name="sparkles-outline" size={80} color={theme.gray} />
      <Text style={styles.emptyText}>No AI-generated recipes yet</Text>
      <Text style={styles.emptySubtext}>
        Scan ingredients and tap "Generate Filipino Recipe" to create one!
      </Text>
    </Animated.View>
  );

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const countTranslateY = countAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        {/* Soft decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading your recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      
      {/* Soft decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }
        ]}
      >
        <PressableScale onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.dark} />
          </View>
        </PressableScale>
        <Text style={styles.headerTitle}>My AI Recipes</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      {recipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Animated.View style={[styles.countContainer, { transform: [{ translateY: countTranslateY }] }]}>
            <Icon name="sparkles" size={14} color={theme.secondary} />
            <Text style={styles.countText}>
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} generated
            </Text>
          </Animated.View>
          
          <Animated.View style={{ flex: 1, opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }}>
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
                  colors={[theme.primary]}
                  tintColor={theme.primary}
                />
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Background blobs (matching all screens)
  blob1: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#ffeded',
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    top: 200,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff8f0',
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.dark,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: 14,
    color: theme.gray,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.gray,
    marginTop: 20,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.gray,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  countText: {
    fontSize: 13,
    color: theme.gray,
    fontWeight: '500',
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: theme.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.lightGray,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBadgeText: {
    fontSize: 10,
    color: theme.white,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.dark,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: theme.gray,
    lineHeight: 18,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.gray,
    fontWeight: '500',
  },
};

export default MyGeneratedRecipesScreen;