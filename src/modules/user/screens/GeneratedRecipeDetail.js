import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

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

// Animated Section Component
const AnimatedSection = ({ children, delay = 0, style }) => {
  const [animValue] = React.useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={[{ opacity: animValue, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Animated Ingredient Row
const AnimatedIngredientRow = ({ ingredient, index }) => {
  const [animValue] = React.useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 30,
      useNativeDriver: true,
    }).start();
  }, [index]);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [15, 0]
  });
  
  return (
    <Animated.View style={[styles.ingredientRow, { opacity: animValue, transform: [{ translateX }] }]}>
      <Text style={styles.ingredientText}>
        • {ingredient.quantity} {ingredient.unit} {ingredient.name}
      </Text>
    </Animated.View>
  );
};

// Animated Instruction Step
const AnimatedInstructionStep = ({ instruction, index }) => {
  const [animValue] = React.useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, [index]);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={[styles.instructionRow, { opacity: animValue, transform: [{ translateX }] }]}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{instruction.step || index + 1}</Text>
      </View>
      <Text style={styles.instructionText}>{instruction.text}</Text>
    </Animated.View>
  );
};

const GeneratedRecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(buttonAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, []);

  // Parse ingredients and instructions if they are strings
  const parseData = (data) => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Parse error:', e);
        return [];
      }
    }
    return data;
  };

  const ingredients = parseData(recipe.ingredients);
  const instructions = parseData(recipe.instructions);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this AI-generated Filipino recipe: ${recipe.title}\n\n${recipe.description}`,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const buttonTranslateY = buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      
      {/* Soft decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }
        ]}
      >
        <PressableScale onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.dark} />
          </View>
        </PressableScale>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.headerRight}>
          <Icon name="bookmark" size={22} color={theme.primary} />
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* AI Badge */}
        <AnimatedSection delay={100}>
          <View style={styles.aiBadgeContainer}>
            <View style={styles.aiBadge}>
              <Icon name="sparkles" size={14} color={theme.white} />
              <Text style={styles.aiBadgeText}>AI Generated Filipino Recipe</Text>
            </View>
          </View>
        </AnimatedSection>

        {/* Title */}
        <AnimatedSection delay={150}>
          <Text style={styles.title}>{recipe.title}</Text>
        </AnimatedSection>

        {/* Description */}
        <AnimatedSection delay={200}>
          <Text style={styles.description}>{recipe.description}</Text>
        </AnimatedSection>

        {/* Meta Info */}
        <AnimatedSection delay={250}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={16} color={theme.gray} />
              <Text style={styles.metaText}>{totalTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="restaurant-outline" size={16} color={theme.gray} />
              <Text style={styles.metaText}>{recipe.mealType}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="flame-outline" size={16} color={theme.gray} />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="people-outline" size={16} color={theme.gray} />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          </View>
        </AnimatedSection>

        {/* Ingredients Section */}
        {ingredients.length > 0 && (
          <AnimatedSection delay={300} style={styles.section}>
            <Text style={styles.sectionTitle}>🍳 Ingredients</Text>
            {ingredients.map((ing, index) => (
              <AnimatedIngredientRow key={index} ingredient={ing} index={index} />
            ))}
          </AnimatedSection>
        )}

        {/* Instructions Section */}
        {instructions.length > 0 && (
          <AnimatedSection delay={350} style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Instructions</Text>
            {instructions.map((inst, index) => (
              <AnimatedInstructionStep key={index} instruction={inst} index={index} />
            ))}
          </AnimatedSection>
        )}

        {/* Share Button */}
        <Animated.View 
          style={[
            styles.shareButtonWrapper,
            { opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] }
          ]}
        >
          <PressableScale onPress={handleShare}>
            <View style={styles.shareButton}>
              <Icon name="share-outline" size={20} color={theme.white} />
              <Text style={styles.shareButtonText}>Share Recipe</Text>
            </View>
          </PressableScale>
        </Animated.View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Background blobs (matching all screens)
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.dark,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  aiBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBadgeText: {
    fontSize: 12,
    color: theme.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.dark,
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  description: {
    fontSize: 14,
    color: theme.gray,
    lineHeight: 22,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: theme.gray,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.dark,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  ingredientRow: {
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 14,
    color: theme.dark,
    lineHeight: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumberText: {
    color: theme.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: theme.dark,
    lineHeight: 22,
  },
  shareButtonWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: theme.secondary,
    padding: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
};

export default GeneratedRecipeDetailScreen;