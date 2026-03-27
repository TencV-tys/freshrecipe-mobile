import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
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

// Filter Chip Component with animation
const FilterChip = ({ label, isActive, onPress, animationDelay = 0 }) => {
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
    outputRange: [10, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }] }}>
      <PressableScale onPress={onPress}>
        <View style={[styles.filterChip, isActive && styles.filterChipActive]}>
          <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
            {label}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const RecipeFinderScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filtersAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    fetchRecipes();
  }, [searchQuery, selectedMealType]);

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(searchAnim, { toValue: 1, tension: 55, friction: 9, delay: 50, useNativeDriver: true }).start();
    Animated.spring(filtersAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(buttonAnim, { toValue: 1, tension: 55, friction: 9, delay: 150, useNativeDriver: true }).start();
  }, []);

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

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const searchTranslateY = searchAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] });
  const filtersTranslateY = filtersAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] });
  const buttonTranslateY = buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  // Header Section - Sticky at top
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.stickyHeader,
        { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }
      ]}
    >
      {/* Search Bar */}
      <Animated.View style={[styles.searchContainer, { transform: [{ translateY: searchTranslateY }] }]}>
        <Icon name="search" size={20} color={theme.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor={theme.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => fetchRecipes()}
        />
        {searchQuery ? (
          <PressableScale onPress={clearSearch}>
            <Icon name="close-circle" size={20} color={theme.gray} />
          </PressableScale>
        ) : null}
      </Animated.View>

      {/* Filter Chips */}
      <Animated.View style={[styles.filterContainer, { transform: [{ translateY: filtersTranslateY }] }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <FilterChip
            label="All"
            isActive={!selectedMealType}
            onPress={() => setSelectedMealType('')}
            animationDelay={0}
          />
          {mealTypes.map((type, index) => (
            <FilterChip
              key={type}
              label={type}
              isActive={selectedMealType === type}
              onPress={() => setSelectedMealType(type)}
              animationDelay={(index + 1) * 30}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Scan Button */}
      <Animated.View style={{ transform: [{ translateY: buttonTranslateY }] }}>
        <PressableScale onPress={() => setShowScanner(true)}>
          <View style={styles.scannerButton}>
            <Icon name="camera" size={24} color={theme.white} />
            <Text style={styles.scannerButtonText}>Scan Ingredients</Text>
          </View>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <Icon name="restaurant-outline" size={64} color={theme.gray} />
      <Text style={styles.emptyText}>No recipes found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery || selectedMealType 
          ? 'Try adjusting your search or filters' 
          : 'Start by searching for recipes or scanning ingredients'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        {/* Soft decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        {renderHeader()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading recipes...</Text>
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
      
      {/* Sticky Header - Always visible */}
      {renderHeader()}

      {/* Scrollable Content - Only recipes scroll */}
      {recipes.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => (item.id || item._id)?.toString()}
          renderItem={({ item, index }) => {
            const recipeId = item.id || item._id;
            const saved = isRecipeSaved(recipeId);
            return (
              <Animated.View style={{ marginBottom: 12 }}>
                <RecipeCard
                  recipe={item}
                  onPress={() => handleRecipePress(item)}
                  onSave={() => handleSave(item)}
                  isSaved={saved}
                />
              </Animated.View>
            );
          }}
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
      )}

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