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
import { IP } from '../../../api/api';
// Base URL for images (without /api)
const BASE_URL = `http://${IP}:5000`;

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSavedRecipes(), fetchRecommendedRecipes()]);
    setLoading(false);
  };

  const fetchSavedRecipes = async () => {
    const result = await RecipeService.getSavedRecipes();
    if (result.success) {
      setSavedRecipes(result.recipes || []);
    }
  };

  const fetchRecommendedRecipes = async () => {
    const result = await RecipeService.getAllRecipes({ limit: 6 });
    if (result.success) {
      setRecommendedRecipes(result.recipes || []);
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
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}` }} 
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

        {/* Stats Card - Total Saved Recipes */}
        <View style={styles.statsRow}>
          <StatCard
            icon="bookmark-outline"
            value={savedRecipes.length}
            label="Saved Recipes"
            onPress={() => navigation.navigate('SavedRecipes')}
            color={colors.primary}
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
                onPress={goToScan}
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
                icon="heart-outline"
                title="Favorites"
                description="Your saved recipes"
                onPress={() => navigation.navigate('SavedRecipes')}
                color="#ff6b6b"
              />
            </View>
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

        {/* Personalized Recommendations */}
        <View style={styles.section}>
          <SectionHeader
            title="Personalized Recommendations"
            onSeeAll={goToScan}
          />
          
          {recommendedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>No recommendations yet</Text>
              <Text style={styles.emptyStateSubtext}>Try scanning some ingredients!</Text>
            </View>
          ) : (
            recommendedRecipes.slice(0, 3).map(recipe => (
              <RecipeCard
                key={recipe.id || recipe._id}
                recipe={recipe}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id })}
              />
            ))
          )}
        </View>

        {/* Recently Saved Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Recently Saved"
            onSeeAll={savedRecipes.length > 0 ? () => navigation.navigate('SavedRecipes') : null}
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
            savedRecipes.slice(0, 3).map(recipe => (
              <RecipeCard
                key={recipe.id || recipe._id}
                recipe={recipe}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id })}
              />
            ))
          )}
        </View>

        {/* Discover New Recipes */}
        <View style={styles.section}>
          <SectionHeader
            title="Discover New Recipes"
            onSeeAll={goToScan}
          />
          
          {recommendedRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="restaurant-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>No recipes available</Text>
              <Text style={styles.emptyStateSubtext}>
                Check back later for new recipes from our chefs!
              </Text>
            </View>
          ) : (
            recommendedRecipes.slice(3, 6).map(recipe => (
              <RecipeCard
                key={recipe.id || recipe._id}
                recipe={recipe}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id })}
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