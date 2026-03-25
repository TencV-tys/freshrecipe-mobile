import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const GeneratedRecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.savedBadge}>
          <Icon name="bookmark" size={22} color={colors.primary} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.aiBadgeContainer}>
          <View style={styles.aiBadge}>
            <Icon name="sparkles" size={16} color={colors.white} />
            <Text style={styles.aiBadgeText}>AI Generated Filipino Recipe</Text>
          </View>
        </View>

        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="time-outline" size={18} color={colors.gray} />
            <Text style={styles.metaText}>{totalTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="restaurant-outline" size={18} color={colors.gray} />
            <Text style={styles.metaText}>{recipe.mealType}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="flame-outline" size={18} color={colors.gray} />
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="people-outline" size={18} color={colors.gray} />
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>

        {ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍳 Ingredients</Text>
            {ingredients.map((ing, index) => (
              <View key={index} style={styles.ingredientRow}>
                <Text style={styles.ingredientText}>
                  • {ing.quantity} {ing.unit} {ing.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Instructions</Text>
            {instructions.map((inst, index) => (
              <View key={index} style={styles.instructionRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{inst.step || index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{inst.text}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-outline" size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>Share Recipe</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  savedBadge: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  aiBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.gray,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  ingredientRow: {
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default GeneratedRecipeDetailScreen;