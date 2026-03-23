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
      <Stack.Screen name="RecipeFinderMain" component={RecipeFinderScreen} />
      <Stack.Screen name="RecipeDetailMain" component={RecipeDetailScreen} />
      <Stack.Screen name="SavedRecipesMain" component={SavedRecipesScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator - Separate from Dashboard
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfileMain" component={EditProfileScreen} />
      <Stack.Screen name="ChangePasswordMain" component={ChangePasswordScreen} />
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="SavedRecipesFromProfile" component={SavedRecipesScreen} />
    </Stack.Navigator>
  );
};

// Dashboard Stack Navigator
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="SavedRecipesFromDashboard" component={SavedRecipesScreen} />
    </Stack.Navigator>
  );
};

// Chatbot Stack Navigator
const ChatbotStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatbotMain" component={ChatbotScreen} />
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
      <Tab.Screen name="Saved" component={DashboardStack} />
      <Tab.Screen name="Chat" component={ChatbotStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;