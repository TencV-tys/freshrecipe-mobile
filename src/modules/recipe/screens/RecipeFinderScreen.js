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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import RecipeCard from '../components/RecipeCard';
import IngredientScanner from '../components/IngredientScanner';
import styles from '../styles/recipe.styles';
import colors from '../../shared/constants/colors';

const RecipeFinderScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedIngredients, setScannedIngredients] = useState([]);

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
    setScannedIngredients(ingredients);
    setLoading(true);
    const result = await RecipeService.findRecipesByIngredients(ingredients);
    if (result.success) {
      setRecipes(result.recipes);
    }
    setLoading(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
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

      <TouchableOpacity style={styles.scannerButton} onPress={() => setShowScanner(true)}>
        <Icon name="camera" size={24} color={colors.white} />
        <Text style={styles.scannerButtonText}>Scan Ingredients</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="restaurant-outline" size={64} color={colors.gray} />
          <Text style={styles.emptyText}>No recipes found</Text>
          <Text style={styles.emptySubtext}>Try searching for something else</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={showScanner} animationType="slide" presentationStyle="fullScreen">
        <IngredientScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
        />
      </Modal>
    </View>
  );
};

export default RecipeFinderScreen;