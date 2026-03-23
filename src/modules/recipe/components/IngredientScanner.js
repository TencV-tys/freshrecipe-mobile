import React, { useState } from 'react';
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
import colors from '../../shared/constants/colors';
import api from '../../../api/api';

// Common ingredients for mock detection (in real app, send to AI service)
const COMMON_INGREDIENTS = [
  'chicken', 'pork', 'beef', 'fish', 'shrimp', 'garlic', 'onion', 'tomato',
  'ginger', 'rice', 'noodles', 'soy sauce', 'vinegar', 'coconut milk',
  'egg', 'potato', 'carrot', 'bell pepper', 'cabbage', 'spinach',
  'adobo', 'sinigang', 'calamansi', 'patis', 'bagoong', 'toyo'
];

const IngredientScanner = ({ onClose, onScanComplete }) => {
  const [step, setStep] = useState('select'); // select, scanning, results
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);

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

  // In the detectIngredients function, replace with:
const detectIngredients = async (imageUri) => {
  setStep('scanning');
  setLoading(true);
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'scan.jpg',
    });
    
    // Call your backend scan endpoint
    const response = await api.post('/recipes/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    setDetectedIngredients(response.data.detected);
    setSelectedIngredients(response.data.detected.map(i => i.name));
    setSuggestedRecipes(response.data.recipes);
    setStep('results');
  } catch (error) {
    console.error('Detection error:', error);
    Alert.alert('Error', 'Failed to detect ingredients');
    setStep('select');
  } finally {
    setLoading(false);
  }
};

  // Find recipes with selected ingredients
  const findRecipes = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert('No ingredients', 'Please select at least one ingredient');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/recipes/find-by-ingredients', {
        ingredients: selectedIngredients,
      });
      
      setSuggestedRecipes(response.data);
      setShowRecipes(true);
    } catch (error) {
      console.error('Find recipes error:', error);
      Alert.alert('Error', 'Failed to find recipes');
    } finally {
      setLoading(false);
    }
  };

  // Toggle ingredient selection
  const toggleIngredient = (ingredientName) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientName)
        ? prev.filter(i => i !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  // Handle confirm and go back to finder
  const handleConfirm = () => {
    if (selectedIngredients.length > 0) {
      onScanComplete(selectedIngredients);
      onClose();
    } else {
      Alert.alert('No ingredients', 'Please select at least one ingredient');
    }
  };

  // Render select mode (camera or gallery)
  if (step === 'select') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={28} color={colors.black} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Icon name="camera-outline" size={64} color={colors.primary} />
          <Text style={styles.title}>Scan Ingredients</Text>
          <Text style={styles.subtitle}>
            Take a photo or upload an image to detect ingredients
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
        <TouchableOpacity style={styles.closeButton} onPress={() => setStep('select')}>
          <Icon name="arrow-back" size={28} color={colors.black} />
        </TouchableOpacity>
        
        <View style={styles.scanningContainer}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          )}
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.scanningText}>Analyzing image...</Text>
          <Text style={styles.scanningSubtext}>Detecting ingredients</Text>
        </View>
      </View>
    );
  }

  // Render results mode (detected ingredients)
  if (step === 'results') {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setStep('select')}>
          <Icon name="arrow-back" size={28} color={colors.black} />
        </TouchableOpacity>

        <ScrollView style={styles.resultsContainer}>
          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.resultImage} />
          )}
          
          <Text style={styles.sectionTitle}>Detected Ingredients</Text>
          <Text style={styles.sectionSubtitle}>Tap to select ingredients you have:</Text>
          
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
                  {ing.name} ({Math.round(ing.confidence * 100)}%)
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setStep('select')}>
              <Icon name="refresh" size={20} color={colors.primary} />
              <Text style={styles.retakeText}>Scan Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.findButton, !selectedIngredients.length && styles.findButtonDisabled]}
              onPress={findRecipes}
              disabled={!selectedIngredients.length || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Icon name="restaurant-outline" size={20} color={colors.white} />
                  <Text style={styles.findButtonText}>
                    Find Recipes ({selectedIngredients.length})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Recipe Suggestions Modal */}
        <Modal visible={showRecipes} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.recipesModalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRecipes(false)}>
                <Icon name="arrow-back" size={28} color={colors.black} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Suggested Recipes</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Icon name="checkmark" size={28} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {suggestedRecipes.length === 0 ? (
              <View style={styles.noRecipesContainer}>
                <Icon name="restaurant-outline" size={64} color={colors.gray} />
                <Text style={styles.noRecipesText}>No recipes found</Text>
                <Text style={styles.noRecipesSubtext}>
                  Try selecting different ingredients
                </Text>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setShowRecipes(false)}
                >
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={suggestedRecipes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.recipeCard}
                    onPress={() => {
                      onScanComplete(selectedIngredients);
                      onClose();
                      // Navigate to recipe detail
                      navigation?.navigate('RecipeDetail', { recipeId: item.id });
                    }}
                  >
                    {item.image && (
                      <Image source={{ uri: item.image }} style={styles.recipeImage} />
                    )}
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeTitle}>{item.title}</Text>
                      <Text style={styles.recipeMatch}>
                        {item.matchPercentage}% match
                      </Text>
                      <View style={styles.recipeTags}>
                        <Text style={styles.recipeTag}>{item.mealType}</Text>
                        <Text style={styles.recipeTag}>{item.difficulty}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.recipesList}
              />
            )}
          </View>
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
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
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
    padding: 20,
    paddingTop: 80,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  ingredientChip: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
  },
  ingredientChipSelected: {
    backgroundColor: colors.primary,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.gray,
  },
  ingredientTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  retakeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  findButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  findButtonDisabled: {
    backgroundColor: colors.gray,
  },
  findButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipesModalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  noRecipesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noRecipesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 16,
  },
  noRecipesSubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipesList: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  recipeMatch: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  recipeTags: {
    flexDirection: 'row',
    marginTop: 6,
  },
  recipeTag: {
    fontSize: 10,
    color: colors.gray,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
});

export default IngredientScanner;