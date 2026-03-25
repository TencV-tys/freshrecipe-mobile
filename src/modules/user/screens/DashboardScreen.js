import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
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

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
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
        console.log('✅ AI recipes loaded:', result.recipes.length);
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
        console.log('✅ Recent recipes loaded:', result.recipes.length);
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
        console.log('✅ Popular recipes loaded:', result.recipes.length);
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

  const StatCard = ({ icon, value, label, onPress, color }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, onSeeAll }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const FeatureCard = ({ icon, title, description, onPress, color }) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Welcome Section with Profile Picture on Right */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username || 'User'}!</Text>
            <Text style={styles.welcomeSubtext}>Discover and save your favorite recipes</Text>
          </View>
          <TouchableOpacity onPress={goToProfile} style={styles.avatarContainer}>
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
          </TouchableOpacity>
        </View>

        {/* Stats Cards - Two cards side by side */}
        <View style={styles.statsRow}>
          <StatCard
            icon="bookmark-outline"
            value={savedRecipes.length}
            label="Saved Recipes"
            onPress={goToSavedRecipes}
            color={colors.primary}
          />
          <StatCard
            icon="sparkles-outline"
            value={generatedRecipes.length}
            label="AI Recipes"
            onPress={goToGeneratedRecipes}
            color={colors.secondary}
          />
        </View>

        {/* Feature Cards - Quick Actions */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.featuresRow}>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="search-outline"
                title="Find Recipes"
                description="Search by name or ingredients"
                onPress={goToRecipeFinder}
                color={colors.primary}
              />
            </View>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="camera-outline"
                title="Scan Ingredients"
                description="Take photo to detect ingredients"
                onPress={goToScan}
                color={colors.secondary}
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
                color="#ff6b6b"
              />
            </View>
            <View style={styles.featuresColumn}>
              <FeatureCard
                icon="sparkles-outline"
                title="My AI Recipes"
                description="View your AI-generated recipes"
                onPress={goToGeneratedRecipes}
                color={colors.secondary}
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
                color="#4ecdc4"
              />
            </View>
          </View>
        </View>

        {/* Recently Added Recipes */}
        <View style={styles.section}>
          <SectionHeader
            title="🆕 Recently Added"
            onSeeAll={goToRecipeFinder}
          />
          
          {recentRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={48} color={colors.gray} />
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
          />
          
          {savedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="bookmark-outline" size={48} color={colors.gray} />
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
          />
          
          {generatedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="sparkles-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>No AI recipes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Scan ingredients and tap "Generate Filipino Recipe" to create one!
              </Text>
            </View>
          ) : (
            generatedRecipes.slice(0, 3).map((recipe, index) => (
              <TouchableOpacity
                key={recipe.id || index}
                style={styles.aiRecipeCard}
                onPress={() => navigation.navigate('GeneratedRecipeDetail', { recipe })}
              >
                <View style={styles.aiRecipeContent}>
                  <View style={styles.aiBadge}>
                    <Icon name="sparkles" size={12} color={colors.white} />
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
                      <Icon name="time-outline" size={12} color={colors.gray} />
                      <Text style={styles.aiMetaText}>
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                      </Text>
                    </View>
                    <View style={styles.aiMetaItem}>
                      <Icon name="restaurant-outline" size={12} color={colors.gray} />
                      <Text style={styles.aiMetaText}>{recipe.mealType || 'Meal'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Popular This Week */}
        <View style={styles.section}>
          <SectionHeader
            title="🔥 Popular This Week"
            onSeeAll={goToRecipeFinder}
          />
          
          {popularRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="flame-outline" size={48} color={colors.gray} />
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

export default DashboardScreen;