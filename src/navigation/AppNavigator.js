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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Recipe Stack Navigator
const RecipeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipeFinder" component={RecipeFinderScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />
    </Stack.Navigator>
  );
};

// User Stack Navigator
const UserStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SavedRecipes" component={SavedRecipesScreen} />
    </Stack.Navigator>
  );
};

// Chatbot Stack Navigator
const ChatbotStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
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
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
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
      <Tab.Screen name="Saved" component={UserStack} />
      <Tab.Screen name="Chat" component={ChatbotStack} />
      <Tab.Screen name="Profile" component={UserStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;