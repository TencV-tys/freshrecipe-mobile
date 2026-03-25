import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';
import { BASE_IP } from '../../../api/apiConfig';

const RecipeCard = ({ recipe, onPress, onSave, isSaved }) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  // Get the correct image URL
  const getImageUrl = () => {
    if (!recipe.image) return null;
    if (recipe.image.startsWith('http')) return recipe.image;
    return `${BASE_IP}${recipe.image}`;
  };

  const imageUrl = getImageUrl();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Left: Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="restaurant-outline" size={32} color={colors.gray} />
          </View>
        )}
      </View>
      
      {/* Right: Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={14} color={colors.gray} />
            <Text style={styles.infoText}>{totalTime} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="restaurant-outline" size={14} color={colors.gray} />
            <Text style={styles.infoText}>{recipe.mealType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="flame-outline" size={14} color={colors.gray} />
            <Text style={styles.infoText}>{recipe.difficulty}</Text>
          </View>
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={styles.servings}>
            👥 {recipe.servings} servings
          </Text>
          
          {onSave && (
            <TouchableOpacity onPress={onSave} style={styles.saveButton}>
              <Icon
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? colors.primary : colors.gray}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {recipe.matchPercentage && (
          <View style={styles.matchContainer}>
            <View style={styles.matchBar}>
              <View style={[styles.matchFill, { width: `${recipe.matchPercentage}%` }]} />
            </View>
            <Text style={styles.matchText}>{recipe.matchPercentage}% match</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  servings: {
    fontSize: 11,
    color: colors.gray,
  },
  saveButton: {
    padding: 4,
  },
  matchContainer: {
    marginTop: 8,
  },
  matchBar: {
    height: 3,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  matchFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  matchText: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 4,
  },
});

export default RecipeCard;