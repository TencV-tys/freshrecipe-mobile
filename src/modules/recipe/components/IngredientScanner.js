import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import RecipeService from '../../recipe/services/recipe.service';
import colors from '../../shared/constants/colors';
import { BASE_IP } from '../../../api/apiConfig';

const IngredientScanner = ({ onClose, onScanComplete, navigation }) => {
  const [step, setStep] = useState('select');
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [showGeneratedRecipe, setShowGeneratedRecipe] = useState(false);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_IP}${imagePath}`;
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
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      await detectIngredients(result.assets[0].uri);
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
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      await detectIngredients(result.assets[0].uri);
    }
  };

  // Detect ingredients from image
  const detectIngredients = async (imageUri) => {
    setStep('scanning');
    setLoading(true);
    
    try {
      const result = await RecipeService.scanIngredients(imageUri);
      
      if (result.success) {
        const ingredients = result.data.detected;
        setDetectedIngredients(ingredients);
        setSelectedIngredients(ingredients.map(i => i.name));
        // Get matching recipes immediately
        await fetchMatchingRecipes(ingredients.map(i => i.name));
        setStep('results');
      } else {
        Alert.alert('Error', result.error || 'Failed to detect ingredients');
        setStep('select');
      }
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Error', 'Failed to detect ingredients. Please try again.');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  // Fetch matching recipes based on selected ingredients
  const fetchMatchingRecipes = async (ingredients) => {
    if (ingredients.length === 0) {
      setMatchingRecipes([]);
      return;
    }
    
    try {
      const result = await RecipeService.findRecipesByIngredients(ingredients);
      if (result.success) {
        // Filter out recipes with 0% match
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

  // Scan again - go back to camera/gallery
  const handleScanAgain = () => {
    setStep('select');
    setCapturedImage(null);
    setDetectedIngredients([]);
    setSelectedIngredients([]);
    setMatchingRecipes([]);
  };

  // Render select mode (camera or gallery)
  if (step === 'select') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Icon name="arrow-back" size={28} color={colors.black} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Icon name="camera-outline" size={64} color={colors.primary} />
          <Text style={styles.title}>Scan Ingredients</Text>
          <Text style={styles.subtitle}>
            Take a photo or upload an image to detect ingredients using AI
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Icon name="camera" size={32} color={colors.white} />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Icon name="images" size={32} color={colors.white} />
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipContainer}>
          <Icon name="bulb-outline" size={20} color={colors.gray} />
          <Text style={styles.tipText}>
            Tip: Place ingredients on a plain background for better detection
          </Text>
        </View>
      </View>
    );
  }

  // Render scanning mode
  if (step === 'scanning') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleScanAgain}>
          <Icon name="arrow-back" size={28} color={colors.black} />
        </TouchableOpacity>
        
        <View style={styles.scanningContainer}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          )}
          <ActivityIndicator size="large" color={colors.primary} />
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
        {/* Header with Back and Scan Again */}
        <View style={styles.resultHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleScanAgain} style={styles.headerButton}>
            <Icon name="refresh-outline" size={24} color={colors.primary} />
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {/* Captured Image Thumbnail */}
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.thumbnailImage} />
          )}
          
          {/* Detected Ingredients Section */}
          <Text style={styles.sectionTitle}>📋 Detected Ingredients</Text>
          <View style={styles.ingredientsWrapper}>
            <View style={styles.ingredientsList}>
              {detectedIngredients.map((ing, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.ingredientChip,
                    selectedIngredients.includes(ing.name) && styles.ingredientChipSelected
                  ]}
                  onPress={() => toggleIngredient(ing.name)}
                >
                  <Text style={[
                    styles.ingredientText,
                    selectedIngredients.includes(ing.name) && styles.ingredientTextSelected
                  ]}>
                    {selectedIngredients.includes(ing.name) ? '✓' : '○'} {ing.name} ({ing.confidence}%)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Matching Recipes Section */}
          <View style={styles.matchingSection}>
            <Text style={styles.sectionTitle}>
              🍽️ Matching Recipes ({matchingRecipes.length} found)
            </Text>
            
            {matchingRecipes.length === 0 ? (
              <View style={styles.noMatchesContainer}>
                <Icon name="restaurant-outline" size={48} color={colors.gray} />
                <Text style={styles.noMatchesText}>No matching recipes</Text>
                <Text style={styles.noMatchesSubtext}>
                  Try selecting different ingredients or generate a new recipe!
                </Text>
              </View>
            ) : (
              matchingRecipes.map((recipe, index) => (
                <TouchableOpacity
                  key={recipe.id || recipe._id || index}
                  style={styles.recipeCard}
                  onPress={() => {
                    onScanComplete(selectedIngredients);
                    onClose();
                    navigation?.navigate('RecipeDetail', { recipeId: recipe.id || recipe._id });
                  }}
                >
                  <View style={styles.recipeImageContainer}>
                    {recipe.image ? (
                      <Image source={{ uri: getImageUrl(recipe.image) }} style={styles.recipeImage} />
                    ) : (
                      <View style={styles.recipeImagePlaceholder}>
                        <Icon name="restaurant-outline" size={24} color={colors.gray} />
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
                      <Text style={styles.recipeMetaText}>
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                      </Text>
                      <Text style={styles.recipeMetaText}>•</Text>
                      <Text style={styles.recipeMetaText}>{recipe.mealType}</Text>
                      <Text style={styles.recipeMetaText}>•</Text>
                      <Text style={styles.recipeMetaText}>{recipe.difficulty}</Text>
                    </View>
                    <Text style={styles.recipeServings}>👥 {recipe.servings} servings</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Generate Filipino Recipe Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateFilipinoRecipe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Icon name="sparkles" size={20} color={colors.white} />
              <Text style={styles.generateButtonText}>Generate Filipino Recipe</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Generated Recipe Modal */}
        <Modal visible={showGeneratedRecipe} animationType="slide" presentationStyle="fullScreen">
          <ScrollView style={styles.generatedContainer}>
            <View style={styles.generatedHeader}>
              <TouchableOpacity onPress={() => setShowGeneratedRecipe(false)}>
                <Icon name="arrow-back" size={28} color={colors.black} />
              </TouchableOpacity>
              <Text style={styles.generatedTitle}>✨ AI-Generated Recipe</Text>
              <TouchableOpacity onPress={saveGeneratedRecipe}>
                <Icon name="bookmark-outline" size={28} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {generatedRecipe && (
              <>
                <Text style={styles.genRecipeTitle}>{generatedRecipe.title}</Text>
                <Text style={styles.genRecipeDescription}>{generatedRecipe.description}</Text>
                
                <View style={styles.genMetaRow}>
                  <View style={styles.genMetaItem}>
                    <Icon name="time-outline" size={14} color={colors.gray} />
                    <Text>{generatedRecipe.prepTime + generatedRecipe.cookTime} min</Text>
                  </View>
                  <View style={styles.genMetaItem}>
                    <Icon name="restaurant-outline" size={14} color={colors.gray} />
                    <Text>{generatedRecipe.mealType}</Text>
                  </View>
                  <View style={styles.genMetaItem}>
                    <Icon name="flame-outline" size={14} color={colors.gray} />
                    <Text>{generatedRecipe.difficulty}</Text>
                  </View>
                  <View style={styles.genMetaItem}>
                    <Icon name="people-outline" size={14} color={colors.gray} />
                    <Text>{generatedRecipe.servings} servings</Text>
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
                
                <TouchableOpacity style={styles.genSaveButton} onPress={saveGeneratedRecipe}>
                  <Icon name="bookmark" size={20} color={colors.white} />
                  <Text style={styles.genSaveButtonText}>Save to My Recipes</Text>
                </TouchableOpacity>
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
    backgroundColor: colors.white,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  scanAgainText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  galleryButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray,
    marginLeft: 10,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 30,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 20,
  },
  scanningSubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  thumbnailImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  ingredientsWrapper: {
    marginBottom: 24,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientChip: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientChipSelected: {
    backgroundColor: colors.primary,
  },
  ingredientText: {
    fontSize: 13,
    color: colors.gray,
  },
  ingredientTextSelected: {
    color: colors.white,
    fontWeight: '500',
  },
  matchingSection: {
    marginBottom: 20,
  },
  noMatchesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMatchesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 12,
  },
  noMatchesSubtext: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 6,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  recipeImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
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
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  recipeMatchBadge: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  recipeMatchText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  recipeMetaText: {
    fontSize: 10,
    color: colors.gray,
    marginRight: 4,
  },
  recipeServings: {
    fontSize: 10,
    color: colors.gray,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  generatedContainer: {
    flex: 1,
    backgroundColor: colors.white,
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
    borderBottomColor: colors.lightGray,
  },
  generatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  genRecipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  genRecipeDescription: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  genMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  genMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  genSection: {
    marginBottom: 24,
  },
  genSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  genIngredientText: {
    fontSize: 14,
    color: colors.black,
    marginBottom: 6,
  },
  genInstructionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  genStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  genStepNumberText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  genInstructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  genSaveButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  genSaveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IngredientScanner;