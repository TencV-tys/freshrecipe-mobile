import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const IngredientScanner = ({ onClose, onScanComplete }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  // Common ingredients for Filipino cooking
  const commonIngredients = [
    'chicken', 'pork', 'beef', 'fish', 'shrimp', 'garlic', 'onion', 'tomato',
    'ginger', 'rice', 'noodles', 'soy sauce', 'vinegar', 'coconut milk',
    'egg', 'potato', 'carrot', 'bell pepper', 'cabbage', 'spinach'
  ];

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      await detectIngredients(photo.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      await detectIngredients(result.assets[0].uri);
    }
  };

  const detectIngredients = async (imageUri) => {
    setLoading(true);
    // Mock detection - in real app, send to backend API
    setTimeout(() => {
      // Randomly select 3-5 ingredients from common list
      const shuffled = [...commonIngredients];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const detected = shuffled.slice(0, Math.floor(Math.random() * 5) + 3);
      setDetectedIngredients(detected.map(ing => ({ name: ing, confidence: 0.7 + Math.random() * 0.3 })));
      setLoading(false);
    }, 2000);
  };

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient.name)
        ? prev.filter(i => i !== ingredient.name)
        : [...prev, ingredient.name]
    );
  };

  const handleConfirm = () => {
    if (selectedIngredients.length > 0) {
      onScanComplete(selectedIngredients);
      onClose();
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Detecting ingredients...</Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.ingredientsContainer}>
              <Text style={styles.sectionTitle}>Detected Ingredients</Text>
              <View style={styles.ingredientsList}>
                {detectedIngredients.map((ing, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.ingredientChip,
                      selectedIngredients.includes(ing.name) && styles.ingredientChipSelected
                    ]}
                    onPress={() => toggleIngredient(ing)}
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
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedImage(null)}>
                <Icon name="refresh" size={24} color={colors.primary} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, !selectedIngredients.length && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={!selectedIngredients.length}
              >
                <Text style={styles.confirmText}>Find Recipes ({selectedIngredients.length})</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Icon name="images" size={32} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setCameraType(
                cameraType === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              )}
            >
              <Icon name="camera-reverse" size={32} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    margin: 20,
    padding: 10,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  galleryButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  flipButton: {
    padding: 15,
  },
  previewImage: {
    width: '100%',
    height: '50%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: colors.white,
  },
  ingredientsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 15,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  ingredientChipSelected: {
    backgroundColor: colors.primary,
  },
  ingredientText: {
    color: colors.white,
    fontSize: 14,
  },
  ingredientTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  retakeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.gray,
  },
  confirmText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IngredientScanner;