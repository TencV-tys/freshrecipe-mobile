import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../../recipe/services/recipe.service';
import colors from '../../shared/constants/colors';
import { BASE_IP } from '../../../api/apiConfig';
import * as ImageManipulator from 'expo-image-manipulator';

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

// Animated Chip Component
const AnimatedChip = ({ ingredient, isSelected, onPress, index }) => {
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
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [10, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }] }}>
      <PressableScale onPress={() => onPress(ingredient.name)}>
        <View style={[
          styles.ingredientChip,
          isSelected && styles.ingredientChipSelected
        ]}>
          <Text style={[
            styles.ingredientText,
            isSelected && styles.ingredientTextSelected
          ]}>
            {isSelected ? '✓' : '○'} {ingredient.name} ({ingredient.confidence}%)
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

// Animated Recipe Card Component
const AnimatedRecipeCard = ({ recipe, index, onPress, getImageUrl }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateX }] }}>
      <PressableScale onPress={onPress}>
        <View style={styles.recipeCard}>
          <View style={styles.recipeImageContainer}>
            {recipe.image ? (
              <Image source={{ uri: getImageUrl(recipe.image) }} style={styles.recipeImage} />
            ) : (
              <View style={styles.recipeImagePlaceholder}>
                <Icon name="restaurant-outline" size={24} color={theme.gray} />
              </View>
            )}
          </View>
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle} numberOfLines={1}>
              {recipe.title}
            </Text>
            <View style={styles.recipeMatchBadge}>
              <Text style={styles.recipeMatchText}>{recipe.matchPercentage}% match</Text>
            </View>
            <View style={styles.recipeMeta}>
              <Icon name="time-outline" size={10} color={theme.gray} />
              <Text style={styles.recipeMetaText}>
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </Text>
              <Text style={styles.recipeMetaText}>•</Text>
              <Icon name="restaurant-outline" size={10} color={theme.gray} />
              <Text style={styles.recipeMetaText}>{recipe.mealType}</Text>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const IngredientScanner = ({ onClose, onScanComplete, navigation }) => {
  const [step, setStep] = useState('select');
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [showGeneratedRecipe, setShowGeneratedRecipe] = useState(false);
  
  // Animation values
  const selectAnim = useRef(new Animated.Value(0)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 'select') {
      Animated.spring(selectAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    } else if (step === 'results') {
      Animated.spring(resultsAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
    }
  }, [step]);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_IP}${imagePath}`;
  };

 const compressImage = async (uri) => {
  try {
    console.log('📦 Compressing image...');
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    console.log('✅ Image compressed successfully');
    return result.uri;
  } catch (error) {
    console.error('❌ Image compression error:', error);
    return uri; // Return original if compression fails
  }
};

// Open camera
const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please grant camera permission to scan ingredients');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.5,
    base64: false,
    exif: false,
  });

  if (!result.canceled) {
    const originalUri = result.assets[0].uri;
    setCapturedImage(originalUri);
    
    // ✅ Compress the image before detecting
    const compressedUri = await compressImage(originalUri);
    await detectIngredients(compressedUri);
  }
};

// Open gallery
const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please grant permission to access your photos');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.5,
    base64: false,
    exif: false,
  });

  if (!result.canceled) {
    const originalUri = result.assets[0].uri;
    setCapturedImage(originalUri);
    
    // ✅ Compress the image before detecting
    const compressedUri = await compressImage(originalUri);
    await detectIngredients(compressedUri);
  }
};
 

// Detect ingredients from image
const detectIngredients = async (imageUri) => {
  setStep('scanning');
  setLoading(true);
  
  try {
    const result = await RecipeService.scanIngredients(imageUri);
    
    if (result.success && result.data.detected && result.data.detected.length > 0) {
      const ingredients = result.data.detected;
      console.log('✅ Ingredients detected:', ingredients);
      
      setDetectedIngredients(ingredients);
      setSelectedIngredients(ingredients.map(i => i.name));
      
      // ✅ USE THE RECIPES FROM THE SCAN RESPONSE
      // The backend already found matching recipes during the scan
      const matchingRecipesFromScan = result.data.recipes || [];
      console.log('📊 Matching recipes from scan:', matchingRecipesFromScan.length);
      
      // Filter out 0% matches
      const filteredRecipes = matchingRecipesFromScan.filter(r => r.matchPercentage > 0);
      setMatchingRecipes(filteredRecipes);
      
      setStep('results'); // Go to results screen
    } else {
      // No ingredients detected - go back to select screen
      console.log('⚠️ No ingredients detected');
      setStep('select');
      
      Alert.alert(
        'No Ingredients Detected',
        result.error || 'Could not detect any ingredients in this image.\n\nPlease try:\n• Using a clearer image\n• Placing ingredients on a plain background\n• Making sure ingredients are well-lit',
        [{ text: 'Try Again' }]
      );
    }
  } catch (error) {
    console.error('Detection error:', error);
    setStep('select');
    
    Alert.alert(
      'Scan Failed',
      'Failed to detect ingredients. Please try again with a clearer image.',
      [{ text: 'OK' }]
    );
  } finally {
    setLoading(false);
  }
};

// Fetch matching recipes based on selected ingredients (for when user toggles ingredients)
const fetchMatchingRecipes = async (ingredients) => {
  if (ingredients.length === 0) {
    setMatchingRecipes([]);
    return;
  }
  
  try {
    const result = await RecipeService.findRecipesByIngredients(ingredients);
    if (result.success) {
      const filtered = (result.recipes || []).filter(r => r.matchPercentage > 0);
      setMatchingRecipes(filtered);
    }
  } catch (error) {
    console.error('Fetch recipes error:', error);
  }
};

  // Toggle ingredient selection
  const toggleIngredient = (ingredientName) => {
    const newSelected = selectedIngredients.includes(ingredientName)
      ? selectedIngredients.filter(i => i !== ingredientName)
      : [...selectedIngredients, ingredientName];
    
    setSelectedIngredients(newSelected);
    fetchMatchingRecipes(newSelected);
  };

  // Generate Filipino recipe using AI
  const generateFilipinoRecipe = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert('No ingredients', 'Please select at least one ingredient');
      return;
    }
    
    setLoading(true);
    try {
      const result = await RecipeService.generateFilipinoRecipe(selectedIngredients);
      
      if (result.success) {
        setGeneratedRecipe(result.recipe);
        setShowGeneratedRecipe(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate recipe');
      }
    } catch (error) {
      console.error('Generate recipe error:', error);
      Alert.alert('Error', 'Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  // Save generated recipe
  const saveGeneratedRecipe = async () => {
    if (!generatedRecipe) return;
    
    setLoading(true);
    try {
      const result = await RecipeService.saveGeneratedRecipe(generatedRecipe);
      
      if (result.success) {
        Alert.alert('Saved!', 'AI-generated recipe added to your collection');
        setShowGeneratedRecipe(false);
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  // Scan again
  const handleScanAgain = () => {
    setStep('select');
    setCapturedImage(null);
    setDetectedIngredients([]);
    setSelectedIngredients([]);
    setMatchingRecipes([]);
    Animated.spring(selectAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
  };

  const selectTranslateY = selectAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const resultsTranslateY = resultsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  // Render select mode
  if (step === 'select') {
    return (
      <View style={styles.container}>
        {/* Soft decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        
        <PressableScale onPress={onClose} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.dark} />
        </PressableScale>

        <Animated.View 
          style={[
            styles.header,
            { opacity: selectAnim, transform: [{ translateY: selectTranslateY }] }
          ]}
        >
          <View style={styles.headerIcon}>
            <Icon name="camera-outline" size={64} color={theme.primary} />
          </View>
          <Text style={styles.title}>Scan Ingredients</Text>
          <Text style={styles.subtitle}>
            Take a photo or upload an image to detect ingredients using AI
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonRow,
            { opacity: selectAnim, transform: [{ translateY: selectTranslateY }] }
          ]}
        >
          <PressableScale onPress={takePhoto} style={{ flex: 1, marginRight: 10 }}>
            <View style={styles.cameraButton}>
              <Icon name="camera" size={28} color={theme.white} />
              <Text style={styles.buttonText}>Take Photo</Text>
            </View>
          </PressableScale>

          <PressableScale onPress={pickImage} style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.galleryButton}>
              <Icon name="images" size={28} color={theme.white} />
              <Text style={styles.buttonText}>Gallery</Text>
            </View>
          </PressableScale>
        </Animated.View>

        <Animated.View 
          style={[
            styles.tipContainer,
            { opacity: selectAnim, transform: [{ translateY: selectTranslateY }] }
          ]}
        >
          <Icon name="bulb-outline" size={20} color={theme.secondary} />
          <Text style={styles.tipText}>
            Tip: Place ingredients on a plain background for better detection
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Render scanning mode
  if (step === 'scanning') {
    return (
      <View style={styles.container}>
        <View style={styles.scanningContainer}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          )}
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.scanningText}>Analyzing image...</Text>
          <Text style={styles.scanningSubtext}>Detecting ingredients with AI</Text>
        </View>
      </View>
    );
  }

  // Render results mode
  if (step === 'results') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.resultHeader, { opacity: resultsAnim }]}>
          <PressableScale onPress={onClose}>
            <View style={styles.headerButton}>
              <Icon name="arrow-back" size={24} color={theme.dark} />
            </View>
          </PressableScale>
          <Text style={styles.resultTitle}>Scan Results</Text>
          <PressableScale onPress={handleScanAgain}>
            <View style={styles.headerButton}>
              <Icon name="refresh-outline" size={24} color={theme.primary} />
              <Text style={styles.scanAgainText}>Scan</Text>
            </View>
          </PressableScale>
        </Animated.View>

        <ScrollView 
          style={styles.resultsContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsContent}
        >
          {/* Captured Image Thumbnail */}
          {capturedImage && (
            <Animated.View style={{ opacity: resultsAnim }}>
              <Image source={{ uri: capturedImage }} style={styles.thumbnailImage} />
            </Animated.View>
          )}
          
          {/* Detected Ingredients Section */}
          <Animated.View style={{ opacity: resultsAnim }}>
            <Text style={styles.sectionTitle}>📋 Detected Ingredients</Text>
            <View style={styles.ingredientsList}>
              {detectedIngredients.map((ing, index) => (
                <AnimatedChip
                  key={index}
                  ingredient={ing}
                  isSelected={selectedIngredients.includes(ing.name)}
                  onPress={toggleIngredient}
                  index={index}
                />
              ))}
            </View>
          </Animated.View>

          {/* Matching Recipes Section */}
          <View style={styles.matchingSection}>
            <Text style={styles.sectionTitle}>
              🍽️ Matching Recipes ({matchingRecipes.length})
            </Text>
            
            {matchingRecipes.length === 0 ? (
              <Animated.View style={[styles.noMatchesContainer, { opacity: resultsAnim }]}>
                <Icon name="restaurant-outline" size={64} color={theme.gray} />
                <Text style={styles.noMatchesText}>No matching recipes</Text>
                <Text style={styles.noMatchesSubtext}>
                  Try selecting different ingredients or generate a new recipe!
                </Text>
              </Animated.View>
            ) : (
              matchingRecipes.map((recipe, index) => (
                <AnimatedRecipeCard
                  key={recipe.id || recipe._id || index}
                  recipe={recipe}
                  index={index}
                  onPress={() => {
                    onScanComplete(selectedIngredients);
                    onClose();
                    navigation?.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id });
                  }}
                  getImageUrl={getImageUrl}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Generate Filipino Recipe Button */}
        <Animated.View style={[styles.generateButtonWrapper, { opacity: resultsAnim }]}>
          <PressableScale onPress={generateFilipinoRecipe} disabled={loading}>
            <View style={styles.generateButton}>
              {loading ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <Icon name="sparkles" size={20} color={theme.white} />
                  <Text style={styles.generateButtonText}>Generate Filipino Recipe</Text>
                </>
              )}
            </View>
          </PressableScale>
        </Animated.View>

        {/* Generated Recipe Modal */}
        <Modal visible={showGeneratedRecipe} animationType="slide" presentationStyle="fullScreen">
          <ScrollView style={styles.generatedContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.generatedHeader}>
              <PressableScale onPress={() => setShowGeneratedRecipe(false)}>
                <Icon name="arrow-back" size={24} color={theme.dark} />
              </PressableScale>
              <Text style={styles.generatedTitle}>✨ AI Recipe</Text>
              <PressableScale onPress={saveGeneratedRecipe}>
                <Icon name="bookmark-outline" size={24} color={theme.primary} />
              </PressableScale>
            </View>
            
            {generatedRecipe && (
              <>
                <Text style={styles.genRecipeTitle}>{generatedRecipe.title}</Text>
                <Text style={styles.genRecipeDescription}>{generatedRecipe.description}</Text>
                
                <View style={styles.genMetaRow}>
                  <View style={styles.genMetaItem}>
                    <Icon name="time-outline" size={14} color={theme.gray} />
                    <Text style={styles.genMetaText}>
                      {generatedRecipe.prepTime + generatedRecipe.cookTime} min
                    </Text>
                  </View>
                  <View style={styles.genMetaItem}>
                    <Icon name="restaurant-outline" size={14} color={theme.gray} />
                    <Text style={styles.genMetaText}>{generatedRecipe.mealType}</Text>
                  </View>
                  <View style={styles.genMetaItem}>
                    <Icon name="people-outline" size={14} color={theme.gray} />
                    <Text style={styles.genMetaText}>{generatedRecipe.servings} servings</Text>
                  </View>
                </View>
                
                <View style={styles.genSection}>
                  <Text style={styles.genSectionTitle}>🍳 Ingredients</Text>
                  {generatedRecipe.ingredients?.map((ing, i) => (
                    <Text key={i} style={styles.genIngredientText}>
                      • {ing.quantity} {ing.unit} {ing.name}
                    </Text>
                  ))}
                </View>
                
                <View style={styles.genSection}>
                  <Text style={styles.genSectionTitle}>📝 Instructions</Text>
                  {generatedRecipe.instructions?.map((inst, i) => (
                    <View key={i} style={styles.genInstructionRow}>
                      <View style={styles.genStepNumber}>
                        <Text style={styles.genStepNumberText}>{inst.step || i + 1}</Text>
                      </View>
                      <Text style={styles.genInstructionText}>{inst.text}</Text>
                    </View>
                  ))}
                </View>
                
                <PressableScale onPress={saveGeneratedRecipe}>
                  <View style={styles.genSaveButton}>
                    <Icon name="bookmark" size={20} color={theme.white} />
                    <Text style={styles.genSaveButtonText}>Save to My Recipes</Text>
                  </View>
                </PressableScale>
              </>
            )}
          </ScrollView>
        </Modal>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Background blobs
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  headerIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.dark,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.gray,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 30,
  },
  cameraButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  galleryButton: {
    backgroundColor: theme.secondary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: theme.gray,
    marginLeft: 12,
    lineHeight: 18,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: width - 80,
    height: 200,
    borderRadius: 16,
    marginBottom: 30,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.dark,
    marginTop: 20,
  },
  scanningSubtext: {
    fontSize: 14,
    color: theme.gray,
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.dark,
  },
  scanAgainText: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  thumbnailImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.dark,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  ingredientChip: {
    backgroundColor: theme.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    marginBottom: 10,
  },
  ingredientChipSelected: {
    backgroundColor: theme.primary,
  },
  ingredientText: {
    fontSize: 13,
    color: theme.gray,
    fontWeight: '500',
  },
  ingredientTextSelected: {
    color: theme.white,
  },
  matchingSection: {
    marginBottom: 20,
  },
  noMatchesContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noMatchesText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.gray,
    marginTop: 16,
  },
  noMatchesSubtext: {
    fontSize: 13,
    color: theme.gray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.lightGray,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.dark,
    marginBottom: 6,
  },
  recipeMatchBadge: {
    backgroundColor: theme.primaryFaint,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  recipeMatchText: {
    fontSize: 10,
    color: theme.primary,
    fontWeight: '700',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 10,
    color: theme.gray,
  },
  generateButtonWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: theme.secondary,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonText: {
    color: theme.white,
    fontSize: 15,
    fontWeight: '700',
  },
  generatedContainer: {
    flex: 1,
    backgroundColor: theme.white,
    padding: 20,
  },
  generatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
  },
  generatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
  },
  genRecipeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.dark,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  genRecipeDescription: {
    fontSize: 14,
    color: theme.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  genMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  genMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  genMetaText: {
    fontSize: 12,
    color: theme.gray,
  },
  genSection: {
    marginBottom: 24,
  },
  genSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.dark,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  genIngredientText: {
    fontSize: 14,
    color: theme.dark,
    marginBottom: 8,
    lineHeight: 20,
  },
  genInstructionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  genStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  genStepNumberText: {
    color: theme.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  genInstructionText: {
    flex: 1,
    fontSize: 14,
    color: theme.dark,
    lineHeight: 20,
  },
  genSaveButton: {
    flexDirection: 'row',
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  genSaveButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default IngredientScanner;