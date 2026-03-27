import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../services/recipe.service';
import { useAuth } from '../../../context/AuthContext';
import styles from '../styles/recipeDetail.styles';
import colors from '../../shared/constants/colors';
import { formatTime } from '../../shared/utils/formatters';
import { BASE_IP } from '../../../api/apiConfig';

const { width, height } = Dimensions.get('window');

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

// Info Item Component with animation
const InfoItem = ({ icon, text, animationDelay = 0 }) => {
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
    <Animated.View style={[styles.detailInfoItem, { opacity: animValue, transform: [{ translateY }] }]}>
      <Icon name={icon} size={20} color={theme.gray} />
      <Text style={styles.detailInfoText}>{text}</Text>
    </Animated.View>
  );
};

// Ingredient Row Component with animation
const IngredientRow = ({ ingredient, index }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 30,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [15, 0]
  });
  
  return (
    <Animated.View style={[styles.ingredientRow, { opacity: animValue, transform: [{ translateX }] }]}>
      <Icon name="ellipse" size={8} color={theme.primary} />
      <Text style={styles.ingredientText}>
        {ingredient.quantity} {ingredient.unit} {ingredient.name}
      </Text>
    </Animated.View>
  );
};

// Instruction Step Component with animation
const InstructionStep = ({ instruction, index }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={[styles.instructionRow, { opacity: animValue, transform: [{ translateX }] }]}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{instruction.step || index + 1}</Text>
      </View>
      <Text style={styles.instructionText}>{instruction.text || instruction.description}</Text>
    </Animated.View>
  );
};

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRecipe();
    
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(imageAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, [recipeId]);

  const fetchRecipe = async () => {
    setLoading(true);
    const result = await RecipeService.getRecipeById(recipeId);
    if (result.success) {
      setRecipe(result.recipe);
      const saved = user?.savedRecipes?.includes(parseInt(recipeId)) || false;
      setIsSaved(saved);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const result = await RecipeService.toggleSaveRecipe(recipeId);
    if (result.success) {
      setIsSaved(result.isSaved);
      Alert.alert('Success', result.isSaved ? 'Recipe saved!' : 'Recipe removed from saved');
    } else {
      Alert.alert('Error', result.error || 'Failed to save recipe');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe.title}\n\n${recipe.description}`,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getImageUrl = () => {
    if (!recipe?.image) return null;
    if (recipe.image.startsWith('http')) return recipe.image;
    return `${BASE_IP}${recipe.image}`;
  };

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const imageScale = imageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  
  // Parallax effect for header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const headerBackground = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={64} color={theme.gray} />
          <Text style={styles.errorText}>Recipe not found</Text>
          <PressableScale onPress={() => navigation.goBack()}>
            <View style={styles.backButtonContainer}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      
      {/* Animated Header with Parallax */}
      <Animated.View style={[styles.animatedHeader, { backgroundColor: headerBackground }]}>
        <View style={styles.header}>
          <PressableScale onPress={() => navigation.goBack()}>
            <View style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={theme.dark} />
            </View>
          </PressableScale>
          <Animated.Text 
            style={[styles.headerTitle, { opacity: headerOpacity }]} 
            numberOfLines={1}
          >
            {recipe.title}
          </Animated.Text>
          <View style={styles.headerRight} />
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.detailContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Section */}
        <Animated.View 
          style={[
            styles.imageContainer,
            { transform: [{ scale: imageScale }] }
          ]}
        >
          {getImageUrl() ? (
            <Image source={{ uri: getImageUrl() }} style={styles.detailImage} />
          ) : (
            <View style={[styles.detailImage, styles.imagePlaceholder]}>
              <Icon name="restaurant-outline" size={64} color={theme.gray} />
            </View>
          )}
          
          <Animated.View style={[styles.actionButtons, { opacity: imageAnim }]}>
            <PressableScale onPress={handleSave}>
              <View style={styles.actionButton}>
                <Icon name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={theme.white} />
              </View>
            </PressableScale>
            <PressableScale onPress={handleShare}>
              <View style={styles.actionButton}>
                <Icon name="share-outline" size={24} color={theme.white} />
              </View>
            </PressableScale>
          </Animated.View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View 
          style={[
            styles.detailContent,
            { opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }
          ]}
        >
          <Text style={styles.detailTitle}>{recipe.title}</Text>
          
          <View style={styles.detailInfoRow}>
            <InfoItem icon="time-outline" text={formatTime(totalTime)} animationDelay={0} />
            <InfoItem icon="restaurant-outline" text={recipe.mealType} animationDelay={50} />
            <InfoItem icon="flame-outline" text={recipe.difficulty} animationDelay={100} />
            <InfoItem icon="people-outline" text={`${recipe.servings} servings`} animationDelay={150} />
          </View>

          {recipe.description && (
            <Animated.View 
              style={[
                styles.descriptionContainer,
                {
                  opacity: contentAnim,
                  transform: [{ translateY: contentTranslateY }]
                }
              ]}
            >
              <Text style={styles.description}>{recipe.description}</Text>
            </Animated.View>
          )}

          {/* Ingredients Section */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: contentAnim,
                transform: [{ translateY: contentTranslateY }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients?.map((ing, index) => (
              <IngredientRow key={index} ingredient={ing} index={index} />
            ))}
          </Animated.View>

          {/* Instructions Section */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: contentAnim,
                transform: [{ translateY: contentTranslateY }]
              }
            ]}
          >
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions?.map((inst, index) => (
              <InstructionStep key={index} instruction={inst} index={index} />
            ))}
          </Animated.View>
        </Animated.View>
        
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </View>
  );
};

export default RecipeDetailScreen;