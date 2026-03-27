import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import RecipeService from '../../recipe/services/recipe.service';
import RecipeCard from '../../recipe/components/RecipeCard';
import styles from '../styles/dashboard.styles';
import colors from '../../shared/constants/colors';
import { BASE_IP } from '../../../api/apiConfig';

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

// Pressable with scale feedback (same as HomeScreen)
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

// Stat Card Component with animation
const StatCard = ({ icon, value, label, onPress, color, animationDelay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }], flex: 1 }}>
      <PressableScale onPress={onPress}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={28} color={color} />
          </View>
          <Text style={[styles.statValue, { color: color }]}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

// Feature Card Component with animation
const FeatureCard = ({ icon, title, description, onPress, color, animationDelay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [15, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }] }}>
      <PressableScale onPress={onPress}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={32} color={color} />
          </View>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

// Section Header Component
const SectionHeader = ({ title, onSeeAll, animationDelay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 50,
      friction: 9,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [10, 0]
  });
  
  return (
    <Animated.View style={[styles.sectionHeader, { opacity: animValue, transform: [{ translateX }] }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <PressableScale onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </PressableScale>
      )}
    </Animated.View>
  );
};

// AI Recipe Card Component
const AIRecipeCard = ({ recipe, onPress, animationDelay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }] }}>
      <PressableScale onPress={onPress}>
        <View style={styles.aiRecipeCard}>
          <View style={styles.aiRecipeContent}>
            <View style={styles.aiBadge}>
              <Icon name="sparkles" size={12} color={theme.white} />
              <Text style={styles.aiBadgeText}>AI Generated</Text>
            </View>
            <Text style={styles.aiRecipeTitle} numberOfLines={1}>
              {recipe.title || 'Untitled Recipe'}
            </Text>
            <Text style={styles.aiRecipeDescription} numberOfLines={2}>
              {recipe.description || 'No description available'}
            </Text>
            <View style={styles.aiMetaRow}>
              <View style={styles.aiMetaItem}>
                <Icon name="time-outline" size={12} color={theme.gray} />
                <Text style={styles.aiMetaText}>
                  {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                </Text>
              </View>
              <View style={styles.aiMetaItem}>
                <Icon name="restaurant-outline" size={12} color={theme.gray} />
                <Text style={styles.aiMetaText}>{recipe.mealType || 'Meal'}</Text>
              </View>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    
    // Entrance animations
    Animated.spring(welcomeAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(statsAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(featuresAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
      fetchGeneratedRecipes();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSavedRecipes(), 
      fetchRecentRecipes(), 
      fetchPopularRecipes(),
      fetchGeneratedRecipes()
    ]);
    setLoading(false);
  };

  const fetchSavedRecipes = async () => {
    try {
      const result = await RecipeService.getSavedRecipes();
      if (result.success) {
        setSavedRecipes(result.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    }
  };

  const fetchGeneratedRecipes = async () => {
    try {
      const result = await RecipeService.getUserGeneratedRecipes();
      if (result.success) {
        setGeneratedRecipes(result.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching AI recipes:', error);
    }
  };

  const fetchRecentRecipes = async () => {
    try {
      const result = await RecipeService.getRecentRecipes(6);
      if (result.success) {
        setRecentRecipes(result.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recent recipes:', error);
    }
  };

  const fetchPopularRecipes = async () => {
    try {
      const result = await RecipeService.getPopularRecipes(6);
      if (result.success) {
        setPopularRecipes(result.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching popular recipes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const goToProfile = () => {
    const parent = navigation.getParent();
    parent?.navigate('Profile');
  };

  const goToScan = () => {
    navigation.navigate('Scan');
  };

  const goToRecipeFinder = () => {
    navigation.navigate('Scan');
  };

  const goToSavedRecipes = () => {
    navigation.navigate('SavedRecipes');
  };

  const goToGeneratedRecipes = () => {
    navigation.navigate('MyGeneratedRecipes');
  };

  const welcomeTranslateY = welcomeAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const statsTranslateY = statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section with Profile Picture on Right */}
        <Animated.View 
          style={[
            styles.welcomeRow,
            { opacity: welcomeAnim, transform: [{ translateY: welcomeTranslateY }] }
          ]}
        >
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username || 'User'}!</Text>
            <Text style={styles.welcomeSubtext}>Discover and save your favorite recipes</Text>
          </View>
          <PressableScale onPress={goToProfile} style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${BASE_IP}${user.avatar}` }} 
                style={styles.profileAvatar} 
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </PressableScale>
        </Animated.View>

        {/* Stats Cards - Two cards side by side */}
        <Animated.View style={[styles.statsRow, { opacity: statsAnim, transform: [{ translateY: statsTranslateY }] }]}>
          <StatCard
            icon="bookmark-outline"
            value={savedRecipes.length}
            label="Saved Recipes"
            onPress={goToSavedRecipes}
            color={theme.primary}
            animationDelay={0}
          />
          <StatCard
            icon="sparkles-outline"
            value={generatedRecipes.length}
            label="AI Recipes"
            onPress={goToGeneratedRecipes}
            color={theme.secondary}
            animationDelay={50}
          />
        </Animated.View>

        {/* Feature Cards - Quick Actions */}
        <View style={styles.featuresSection}>
          <SectionHeader title="Quick Actions" animationDelay={150} />
          <View style={styles.featuresRow}>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="search-outline"
                title="Find Recipes"
                description="Search by name or ingredients"
                onPress={goToRecipeFinder}
                color={theme.primary}
                animationDelay={200}
              />
            </View>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="camera-outline"
                title="Scan Ingredients"
                description="Take photo to detect ingredients"
                onPress={goToScan}
                color={theme.secondary}
                animationDelay={250}
              />
            </View>
          </View>
          <View style={styles.featuresRow}>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="bookmark-outline"
                title="Saved Recipes"
                description="View your saved recipes"
                onPress={goToSavedRecipes}
                color={theme.primary}
                animationDelay={300}
              />
            </View>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="sparkles-outline"
                title="My AI Recipes"
                description="View your AI-generated recipes"
                onPress={goToGeneratedRecipes}
                color={theme.secondary}
                animationDelay={350}
              />
            </View>
          </View>
          <View style={styles.featuresRow}>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="person-outline"
                title="Profile"
                description="Manage your account"
                onPress={goToProfile}
                color={theme.teal}
                animationDelay={400}
              />
            </View>
          </View>
        </View>

        {/* Recently Added Recipes */}
        <View style={styles.section}>
          <SectionHeader title="🆕 Recently Added" onSeeAll={goToRecipeFinder} animationDelay={450} />
          
          {recentRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={48} color={theme.gray} />
              <Text style={styles.emptyStateText}>No recent recipes</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new recipes!</Text>
            </View>
          ) : (
            recentRecipes.slice(0, 3).map((recipe, index) => (
              <RecipeCard
                key={recipe.id || recipe._id || index}
                recipe={recipe}
                onPress={() => navigation.navigate('RecipeDetail', { 
                  recipeId: recipe.id || recipe._id 
                })}
                onSave={() => {}}
                isSaved={savedRecipes.some(saved => (saved.id || saved._id) === (recipe.id || recipe._id))}
              />
            ))
          )}
        </View>

        {/* Your Saved Recipes */}
        <View style={styles.section}>
          <SectionHeader 
            title="⭐ Your Saved Recipes" 
            onSeeAll={savedRecipes.length > 0 ? goToSavedRecipes : null}
            animationDelay={500}
          />
          
          {savedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="bookmark-outline" size={48} color={theme.gray} />
              <Text style={styles.emptyStateText}>No saved recipes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the bookmark icon on any recipe to save it
              </Text>
            </View>
          ) : (
            savedRecipes.slice(0, 3).map((recipe, index) => (
              <RecipeCard
                key={recipe.id || recipe._id || index}
                recipe={recipe}
                onPress={() => navigation.navigate('RecipeDetail', { 
                  recipeId: recipe.id || recipe._id 
                })}
                onSave={() => {}}
                isSaved={true}
              />
            ))
          )}
        </View>

        {/* Your AI Generated Recipes */}
        <View style={styles.section}>
          <SectionHeader 
            title="✨ Your AI Recipes" 
            onSeeAll={generatedRecipes.length > 0 ? goToGeneratedRecipes : null}
            animationDelay={550}
          />
          
          {generatedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="sparkles-outline" size={48} color={theme.gray} />
              <Text style={styles.emptyStateText}>No AI recipes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Scan ingredients and tap "Generate Filipino Recipe" to create one!
              </Text>
            </View>
          ) : (
            generatedRecipes.slice(0, 3).map((recipe, index) => (
              <AIRecipeCard
                key={recipe.id || index}
                recipe={recipe}
                onPress={() => navigation.navigate('GeneratedRecipeDetail', { recipe })}
                animationDelay={600 + (index * 50)}
              />
            ))
          )}
        </View>

        {/* Popular This Week */}
        <View style={styles.section}>
          <SectionHeader 
            title="🔥 Popular This Week" 
            onSeeAll={goToRecipeFinder}
            animationDelay={650}
          />
          
          {popularRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="flame-outline" size={48} color={theme.gray} />
              <Text style={styles.emptyStateText}>No popular recipes yet</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for trending recipes!</Text>
            </View>
          ) : (
            popularRecipes.slice(0, 3).map((recipe, index) => (
              <RecipeCard
                key={recipe.id || recipe._id || index}
                recipe={recipe}
                onPress={() => navigation.navigate('RecipeDetail', { 
                  recipeId: recipe.id || recipe._id 
                })}
                onSave={() => {}}
                isSaved={savedRecipes.some(saved => (saved.id || saved._id) === (recipe.id || recipe._id))}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Update styles with blobs
const stylesWithBlobs = {
  ...styles,
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
  scrollContent: {
    paddingBottom: 12,
  },
};

export default DashboardScreen;