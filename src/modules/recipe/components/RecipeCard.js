import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';
import { BASE_IP } from '../../../api/apiConfig';

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

const RecipeCard = ({ recipe, onPress, onSave, isSaved = false, index = 0 }) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  // Animation values
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Entrance animation with staggered delay based on index
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index]);
  
  // Get the correct image URL
  const getImageUrl = () => {
    if (!recipe.image) return null;
    if (recipe.image.startsWith('http')) return recipe.image;
    return `${BASE_IP}${recipe.image}`;
  };
  
  const imageUrl = getImageUrl();
  
  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };
  
  const handleCardPress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: cardAnim,
          transform: [{ translateY: cardTranslateY }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.card}
          onPress={handleCardPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
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
                <Icon name="restaurant-outline" size={32} color={theme.gray} />
              </View>
            )}
            {recipe.matchPercentage && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>{recipe.matchPercentage}%</Text>
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
                <Icon name="time-outline" size={12} color={theme.gray} />
                <Text style={styles.infoText}>{totalTime} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="restaurant-outline" size={12} color={theme.gray} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {recipe.mealType}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="flame-outline" size={12} color={theme.gray} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {recipe.difficulty}
                </Text>
              </View>
            </View>
            
            <View style={styles.bottomRow}>
              <View style={styles.servingsContainer}>
                <Icon name="people-outline" size={10} color={theme.gray} />
                <Text style={styles.servings}>
                  {recipe.servings} servings
                </Text>
              </View>
              
              {onSave && (
                <PressableScale onPress={onSave}>
                  <View style={styles.saveButton}>
                    <Icon
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isSaved ? theme.primary : theme.gray}
                    />
                  </View>
                </PressableScale>
              )}
            </View>
            
            {recipe.matchPercentage && (
              <View style={styles.matchContainer}>
                <View style={styles.matchBar}>
                  <Animated.View
                    style={[
                      styles.matchFill,
                      {
                        width: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${recipe.matchPercentage}%`],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.matchText}>{recipe.matchPercentage}% match</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.lightGray,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: theme.lightGray,
    position: 'relative',
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
    backgroundColor: theme.lightGray,
  },
  matchBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: theme.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.white,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.dark,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  infoText: {
    fontSize: 11,
    color: theme.gray,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servings: {
    fontSize: 11,
    color: theme.gray,
    fontWeight: '500',
  },
  saveButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: theme.lightGray,
  },
  matchContainer: {
    marginTop: 8,
  },
  matchBar: {
    height: 4,
    backgroundColor: theme.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  matchFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  matchText: {
    fontSize: 10,
    color: theme.gray,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default RecipeCard;