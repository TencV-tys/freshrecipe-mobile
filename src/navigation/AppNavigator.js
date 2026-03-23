import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../modules/shared/constants/colors';

// Import screens
import HomeScreen from '../modules/home/screens/HomeScreen';
import RecipeFinderScreen from '../modules/recipe/screens/RecipeFinderScreen';
import RecipeDetailScreen from '../modules/recipe/screens/RecipeDetailScreen';
import SavedRecipesScreen from '../modules/recipe/screens/SavedRecipesScreen';
import DashboardScreen from '../modules/user/screens/DashboardScreen';
import ProfileScreen from '../modules/user/screens/ProfileScreen';
import SettingsScreen from '../modules/user/screens/SettingsScreen';
import EditProfileScreen from '../modules/user/screens/EditProfileScreen';
import ChangePasswordScreen from '../modules/user/screens/ChangePasswordScreen';
import ChatbotScreen from '../modules/chatbot/screens/ChatbotScreen';
import HelpSupportScreen from '../modules/user/screens/HelpSupportScreen';
import PrivacyPolicyScreen from '../modules/user/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../modules/user/screens/TermsOfServiceScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Recipe Stack Navigator
const RecipeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipeFinderMain" component={RecipeFinderScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
};

// Dashboard Stack Navigator - Dashboard is the main screen
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="ChatbotMain" component={ChatbotScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfileMain" component={EditProfileScreen} />
      <Stack.Screen name="ChangePasswordMain" component={ChangePasswordScreen} />
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="ChatbotMain" component={ChatbotScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
};

// Chatbot Stack Navigator
const ChatbotStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatbotMain" component={ChatbotScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Find') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Find" component={RecipeStack} />
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Chat" component={ChatbotStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;