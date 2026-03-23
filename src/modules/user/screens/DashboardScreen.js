import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import RecipeService from '../../recipe/services/recipe.service';
import RecipeCard from '../../recipe/components/RecipeCard';
import styles from '../styles/dashboard.styles';
import colors from '../../shared/constants/colors';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
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
    await Promise.all([fetchSavedRecipes(), fetchPopularRecipes()]);
    setLoading(false);
  };

  const fetchSavedRecipes = async () => {
    const result = await RecipeService.getSavedRecipes();
    if (result.success) {
      setSavedRecipes(result.recipes || []);
    }
  };

  const fetchPopularRecipes = async () => {
    const result = await RecipeService.getAllRecipes({ limit: 6 });
    if (result.success) {
      setPopularRecipes(result.recipes || []);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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

  const renderRecentlySaved = () => {
    if (savedRecipes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="bookmark-outline" size={48} color={colors.gray} />
          <Text style={styles.emptyStateText}>No saved recipes yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap the bookmark icon on any recipe to save it
          </Text>
        </View>
      );
    }
    
    return savedRecipes.slice(0, 3).map(recipe => (
      <RecipeCard
        key={recipe.id || recipe._id}
        recipe={recipe}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id })}
      />
    ));
  };

  const renderPopularRecipes = () => {
    if (popularRecipes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="restaurant-outline" size={48} color={colors.gray} />
          <Text style={styles.emptyStateText}>No recipes available</Text>
          <Text style={styles.emptyStateSubtext}>
            Check back later for new recipes
          </Text>
        </View>
      );
    }
    
    return popularRecipes.slice(0, 3).map(recipe => (
      <RecipeCard
        key={recipe.id || recipe._id}
        recipe={recipe}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id })}
      />
    ));
  };

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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.username || 'User'}!</Text>
          <Text style={styles.welcomeSubtext}>Discover and save your favorite recipes</Text>
        </View>

        {/* Stats Cards - Only 2 for regular users */}
        <View style={styles.statsRow}>
          <StatCard
            icon="bookmark-outline"
            value={savedRecipes.length}
            label="Saved Recipes"
            onPress={() => navigation.navigate('SavedRecipes')}
            color={colors.primary}
          />
          <StatCard
            icon="chatbubble-outline"
            value="0"
            label="Chat Tips"
            onPress={() => navigation.navigate('ChatbotMain')}
            color={colors.secondary}
          />
        </View>

        {/* Recently Saved Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Recently Saved"
            onSeeAll={savedRecipes.length > 0 ? () => navigation.navigate('SavedRecipes') : null}
          />
          {renderRecentlySaved()}
        </View>

        {/* Popular Recipes Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Popular Recipes"
            onSeeAll={popularRecipes.length > 0 ? () => navigation.navigate('Find') : null}
          />
          {renderPopularRecipes()}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;