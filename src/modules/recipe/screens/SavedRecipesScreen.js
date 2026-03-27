import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import RecipeCard from '../components/RecipeCard';
import styles from '../styles/savedRecipes.styles';
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

const SavedRecipesScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 150, useNativeDriver: true }).start();
    
    if (recipes.length > 0) {
      Animated.spring(countAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
    }
  }, [recipes.length]);

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const countTranslateY = countAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.centerContainer,
        { opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }
      ]}
    >
      <Icon name="bookmark-outline" size={80} color={theme.gray} />
      <Text style={styles.emptyText}>No saved recipes yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the bookmark icon on any recipe to save it here
      </Text>
    </Animated.View>
  );

  const renderHeader = () => (
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
      <Text style={styles.headerTitle}>Saved Recipes</Text>
      <View style={styles.headerRight} />
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        {/* Soft decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading saved recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      
      {/* Soft decorative blobs (matching all screens) */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      
      {renderHeader()}
      
      {recipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Animated.View style={[styles.countContainer, { transform: [{ translateY: countTranslateY }] }]}>
            <Icon name="bookmark" size={16} color={theme.primary} />
            <Text style={styles.savedCount}>
              {recipes.length} {recipes.length === 1 ? 'recipe saved' : 'recipes saved'}
            </Text>
          </Animated.View>
          
          <Animated.View style={{ flex: 1, opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }}>
            <FlatList
              data={recipes}
              keyExtractor={(item) => (item.id || item._id)?.toString()}
              renderItem={({ item, index }) => (
                <Animated.View 
                  style={{
                    marginBottom: 12,
                    opacity: contentAnim,
                    transform: [{ translateY: contentTranslateY }]
                  }}
                >
                  <RecipeCard
                    recipe={item}
                    onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id || item._id })}
                  />
                </Animated.View>
              )}
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

export default SavedRecipesScreen;