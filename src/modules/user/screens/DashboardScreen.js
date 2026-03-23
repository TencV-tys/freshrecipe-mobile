import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import RecipeService from '../../recipe/services/recipe.service';
import RecipeCard from '../../recipe/components/RecipeCard';
import styles from '../styles/user.styles';
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

  const fetchData = async () => {
    const [savedResult, popularResult] = await Promise.all([
      RecipeService.getSavedRecipes(),
      RecipeService.getAllRecipes({ limit: 6 }),
    ]);
    
    if (savedResult.success) setSavedRecipes(savedResult.recipes);
    if (popularResult.success) setPopularRecipes(popularResult.recipes);
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const StatCard = ({ icon, value, label, color }) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={32} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.username}!</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="bookmark-outline" value={savedRecipes.length} label="Saved" color={colors.primary} />
        <StatCard icon="restaurant-outline" value="0" label="Created" color={colors.secondary} />
        <StatCard icon="chatbubble-outline" value="0" label="Tips" color={colors.info} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Saved</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SavedRecipes')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {savedRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bookmark-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyStateText}>No saved recipes yet</Text>
          </View>
        ) : (
          savedRecipes.slice(0, 3).map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Recipes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Find')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {popularRecipes.slice(0, 3).map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;