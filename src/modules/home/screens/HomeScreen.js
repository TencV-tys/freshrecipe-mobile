import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../styles/home.styles';
import colors from '../../shared/constants/colors';

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>FreshRecipe</Text>
        <Text style={styles.heroSubtitle}>Discover Delicious Filipino Recipes</Text>
      </View>

      <View style={styles.features}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('Find')}
        >
          <Icon name="search" size={48} color={colors.primary} />
          <Text style={styles.featureTitle}>Find Recipes</Text>
          <Text style={styles.featureText}>
            Search thousands of recipes by ingredients or meal type
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('Find')}
        >
          <Icon name="camera" size={48} color={colors.secondary} />
          <Text style={styles.featureTitle}>Scan Ingredients</Text>
          <Text style={styles.featureText}>
            Take a photo of ingredients and get recipe suggestions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('Saved')}
        >
          <Icon name="bookmark" size={48} color={colors.primary} />
          <Text style={styles.featureTitle}>Save Favorites</Text>
          <Text style={styles.featureText}>
            Save your favorite recipes for quick access
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;