import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const HomeScreen = ({ navigation }) => {
  const features = [
    {
      id: 'find',
      title: 'Find Recipes',
      description: 'Search thousands of recipes by name, cuisine, or ingredients',
      icon: 'search-outline',
      color: colors.primary,
      screen: 'Scan', // Changed from 'Find' to 'Scan'
    },
    {
      id: 'scan',
      title: 'Scan Ingredients',
      description: 'Take a photo of ingredients and get recipe suggestions',
      icon: 'camera-outline',
      color: colors.secondary,
      screen: 'Scan', // Changed from 'Find' to 'Scan'
    },
    {
      id: 'saved',
      title: 'Saved Recipes',
      description: 'View and manage your favorite recipes',
      icon: 'bookmark-outline',
      color: '#4ecdc4',
      screen: 'SavedRecipes',
    },
    {
      id: 'chat',
      title: 'Recipe Assistant',
      description: 'Chat with AI for cooking tips and recipe ideas',
      icon: 'chatbubble-outline',
      color: '#33b5e5',
      screen: 'Chat',
    },
  ];

  const FeatureCard = ({ feature }) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => {
        if (feature.screen === 'SavedRecipes') {
          // Navigate to Dashboard tab and then to SavedRecipes
          navigation.navigate('Dashboard', { screen: 'SavedRecipes' });
        } else if (feature.screen === 'Scan') {
          // Navigate to the Scan tab (which contains RecipeFinderScreen)
          navigation.navigate('Scan');
        } else if (feature.screen === 'Chat') {
          navigation.navigate('Chat');
        }
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: feature.color + '15' }]}>
        <Icon name={feature.icon} size={32} color={feature.color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.gray} />
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>FreshRecipe</Text>
          <Text style={styles.heroSubtitle}>
            Discover delicious Filipino recipes and scan ingredients with AI
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <QuickAction
            icon="search-outline"
            title="Search"
            onPress={() => navigation.navigate('Scan')} // Changed to Scan
            color={colors.primary}
          />
          <QuickAction
            icon="camera-outline"
            title="Scan"
            onPress={() => navigation.navigate('Scan')} // Changed to Scan
            color={colors.secondary}
          />
          <QuickAction
            icon="bookmark-outline"
            title="Saved"
            onPress={() => navigation.navigate('Dashboard', { screen: 'SavedRecipes' })}
            color="#4ecdc4"
          />
          <QuickAction
            icon="chatbubble-outline"
            title="Chat"
            onPress={() => navigation.navigate('Chat')}
            color="#33b5e5"
          />
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Explore</Text>
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </View>

        {/* Inspiration Section */}
        <View style={styles.inspirationSection}>
          <Text style={styles.sectionTitle}>Get Inspired</Text>
          <TouchableOpacity
            style={styles.inspirationCard}
            onPress={() => navigation.navigate('Scan')} // Changed to Scan
          >
            <View style={styles.inspirationContent}>
              <Text style={styles.inspirationTitle}>Popular Filipino Dishes</Text>
              <Text style={styles.inspirationText}>
                Discover adobo, sinigang, lechon and more
              </Text>
              <View style={styles.inspirationButton}>
                <Text style={styles.inspirationButtonText}>Explore →</Text>
              </View>
            </View>
            <Icon name="restaurant-outline" size={48} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: colors.white,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTitle: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },
  inspirationSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  inspirationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray,
    padding: 20,
    borderRadius: 16,
  },
  inspirationContent: {
    flex: 1,
    marginRight: 16,
  },
  inspirationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  inspirationText: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
  },
  inspirationButton: {
    alignSelf: 'flex-start',
  },
  inspirationButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 30,
  },
});

export default HomeScreen;