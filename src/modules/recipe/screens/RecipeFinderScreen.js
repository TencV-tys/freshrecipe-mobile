import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  StatusBar,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import RecipeCard from '../components/RecipeCard';
import IngredientScanner from '../components/IngredientScanner';
import styles from '../styles/recipeFinder.styles';
import colors from '../../shared/constants/colors';
import { useAuth } from '../../../context/AuthContext';

const RecipeFinderScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, selectedMealType]);

  const fetchRecipes = async () => {
    setLoading(true);
    const result = await RecipeService.getAllRecipes({
      search: searchQuery,
      mealType: selectedMealType,
    });
    if (result.success) {
      setRecipes(result.recipes);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  const handleScanComplete = async (ingredients) => {
    setLoading(true);
    const result = await RecipeService.findRecipesByIngredients(ingredients);
    if (result.success) {
      setRecipes(result.recipes);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleRecipePress = (recipe) => {
    const recipeId = recipe.id || recipe._id;
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleSave = async (recipe) => {
    const recipeId = recipe.id || recipe._id;
    const result = await RecipeService.toggleSaveRecipe(recipeId);
    if (result.success) {
      await fetchRecipes();
      Alert.alert('Success', result.isSaved ? 'Recipe saved!' : 'Recipe removed from saved');
    } else {
      Alert.alert('Error', result.error || 'Failed to save recipe');
    }
  };

  const isRecipeSaved = (recipeId) => {
    return user?.savedRecipes?.includes(recipeId) || false;
  };

  const renderHeader = () => (
    <>
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => fetchRecipes()}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, !selectedMealType && styles.filterChipActive]}
            onPress={() => setSelectedMealType('')}
          >
            <Text style={[styles.filterText, !selectedMealType && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {mealTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, selectedMealType === type && styles.filterChipActive]}
              onPress={() => setSelectedMealType(type)}
            >
              <Text style={[styles.filterText, selectedMealType === type && styles.filterTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.scannerButton} onPress={() => setShowScanner(true)}>
        <Icon name="camera" size={24} color={colors.white} />
        <Text style={styles.scannerButtonText}>Scan Ingredients</Text>
      </TouchableOpacity>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Icon name="restaurant-outline" size={64} color={colors.gray} />
      <Text style={styles.emptyText}>No recipes found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery || selectedMealType 
          ? 'Try adjusting your search or filters' 
          : 'Start by searching for recipes or scanning ingredients'}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      );
    }

    if (recipes.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={recipes}
        keyExtractor={(item) => (item.id || item._id)?.toString()}
        renderItem={({ item }) => {
          const recipeId = item.id || item._id;
          const saved = isRecipeSaved(recipeId);
          return (
            <RecipeCard
              recipe={item}
              onPress={() => handleRecipePress(item)}
              onSave={() => handleSave(item)}
              isSaved={saved}
            />
          );
        }}
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
        ListHeaderComponent={renderHeader}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {renderContent()}

      <Modal 
        visible={showScanner} 
        animationType="slide" 
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <IngredientScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
          navigation={navigation}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default RecipeFinderScreen;