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
import { formatTime } from '../../shared/utils/formatters';

const RecipeCard = ({ recipe, onPress, onSave, isSaved }) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {recipe.image ? (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Icon name="restaurant-outline" size={40} color={colors.gray} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {recipe.title}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={14} color={colors.gray} />
            <Text style={styles.infoText}>{formatTime(totalTime)}</Text>
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
        
        {recipe.matchPercentage && (
          <View style={styles.matchContainer}>
            <View style={styles.matchBar}>
              <View style={[styles.matchFill, { width: `${recipe.matchPercentage}%` }]} />
            </View>
            <Text style={styles.matchText}>{recipe.matchPercentage}% match</Text>
          </View>
        )}
      </View>
      
      {onSave && (
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Icon
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? colors.primary : colors.gray}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  matchContainer: {
    marginTop: 4,
  },
  matchBar: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  matchFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  matchText: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 4,
  },
  saveButton: {
    padding: 8,
  },
});

export default RecipeCard;