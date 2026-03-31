import React, { useState, useEffect, useRef,useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';
import { BASE_IP } from '../../../api/apiConfig';
import NotificationService from '../../notification/services/notification.service';
import UserService from '../services/user.service';
import RecipeService from '../../recipe/services/recipe.service';

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

// Pressable with scale feedback (same as HomeScreen)
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

// Stat Card Component with animation
const StatCard = ({ icon, value, label, onPress, color, animationDelay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }], flex: 1 }}>
      <PressableScale onPress={onPress}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
          </View>
          <Text style={[styles.statNumber, { color: color }]}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

// Menu Item Component with animation
const MenuItem = ({ icon, title, onPress, color = theme.primary, animationDelay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateX }] }}>
      <PressableScale onPress={onPress}>
        <View style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Icon name={icon} size={24} color={color} />
            <Text style={styles.menuTitle}>{title}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.gray} />
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ savedRecipes: 0, generatedRecipes: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

 useFocusEffect(
  useCallback(() => {
    fetchUserStats();
    fetchGeneratedCount();
    fetchUnreadCount();
  }, [])
);

// Keep the animation useEffect separate (runs once on mount only):
useEffect(() => {
  Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
  Animated.spring(avatarAnim, { toValue: 1, tension: 55, friction: 8, delay: 100, useNativeDriver: true }).start();
  Animated.spring(statsAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  Animated.spring(menuAnim, { toValue: 1, tension: 55, friction: 9, delay: 300, useNativeDriver: true }).start();
  Animated.spring(logoutAnim, { toValue: 1, tension: 50, friction: 9, delay: 500, useNativeDriver: true }).start();
}, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/saved');
      setStats(prev => ({ ...prev, savedRecipes: response.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedCount = async () => {
    try {
      const result = await RecipeService.getUserGeneratedRecipes();
      if (result.success) {
        setStats(prev => ({ ...prev, generatedRecipes: result.recipes?.length || 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch generated count:', error);
    }
  };
 
  const fetchUnreadCount = async () => {
    const result = await NotificationService.getUnreadNotifications();
    if (result.success) {
      setUnreadCount(result.data?.length || 0);
    }
  };

 const handleLogout = async () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            // Call the logout function from AuthContext
            await logout();
            // No navigation needed! The Navigation component will automatically switch to AuthNavigator
            // because user state becomes null
          } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API fails
            await logout();
          }
        },
        style: 'destructive'
      },
    ]
  );
};


  const goToChatbot = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Chat');
    } else {
      navigation.navigate('Chat');
    }
  };

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const avatarScale = avatarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const logoutTranslateY = logoutAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      
      {/* Soft decorative blobs (matching HomeScreen) */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Header */}
        <Animated.View 
          style={[
            styles.profileHeader,
            { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerLeft} />
            <PressableScale 
              onPress={() => navigation.navigate('Notifications')}
              style={styles.notificationWrapper}
            >
              <View style={styles.notificationButton}>
                <Icon name="notifications-outline" size={24} color={theme.dark} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                  </View>
                )}
              </View>
            </PressableScale>
          </View>
          
          <Animated.View 
            style={[
              styles.avatarWrapper,
              { transform: [{ scale: avatarScale }] }
            ]}
          >
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `${BASE_IP}${user.avatar}` }} 
                style={styles.profileAvatar}  
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <PressableScale 
              onPress={() => navigation.navigate('EditProfileMain')}
              style={styles.editAvatarButton}
            >
              <View style={styles.editAvatarInner}>
                <Icon name="pencil" size={14} color={theme.white} />
              </View>
            </PressableScale>
          </Animated.View>
          
          <Text style={styles.profileName}>{user?.username || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.profileRoleBadge}>
            <Text style={styles.profileRole}>
              {user?.role === 'admin' ? 'Administrator' : 'Food Lover'}
            </Text>
          </View>
        </Animated.View>

        {/* Stats Cards - Two cards side by side */}
        <Animated.View style={[styles.statsContainer, { opacity: statsAnim }]}>
          <StatCard
            icon="bookmark-outline"
            value={stats.savedRecipes}
            label="Saved Recipes"
            onPress={() => navigation.navigate('SavedRecipes')}
            color={theme.primary}
            animationDelay={0}
          />
          <View style={styles.statDivider} />
          <StatCard
            icon="sparkles-outline"
            value={stats.generatedRecipes}
            label="AI Recipes"
            onPress={() => navigation.navigate('MyGeneratedRecipes')}
            color={theme.secondary}
            animationDelay={50}
          />
        </Animated.View>

        {/* Menu Items */}
        <Animated.View style={[styles.menuSection, { opacity: menuAnim }]}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem
            icon="bookmark-outline"
            title="Saved Recipes"
            onPress={() => navigation.navigate('SavedRecipes')}
            color={theme.primary}
            animationDelay={0}
          />
          <MenuItem
            icon="sparkles-outline"
            title="My AI Recipes"
            onPress={() => navigation.navigate('MyGeneratedRecipes')}
            color={theme.secondary}
            animationDelay={50}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            onPress={() => navigation.navigate('SettingsMain')}
            color={theme.gray}
            animationDelay={100}
          />
        </Animated.View>

        <Animated.View style={[styles.menuSection, { opacity: menuAnim }]}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
            color={theme.teal}
            animationDelay={150}
          />
          <MenuItem
            icon="chatbubble-outline"
            title="Chatbot Assistant"
            onPress={goToChatbot}
            color={theme.blue}
            animationDelay={200}
          />
          <MenuItem
            icon="information-circle-outline"
            title="About"
            onPress={() => Alert.alert('About', 'FreshRecipe v1.0.0\n\nFind delicious Filipino recipes and scan ingredients with AI.\n\n© 2024 FreshRecipe')}
            color={theme.gray}
            animationDelay={250}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.logoutWrapper,
            { opacity: logoutAnim, transform: [{ translateY: logoutTranslateY }] }
          ]}
        >
          <PressableScale onPress={handleLogout}>
            <View style={styles.logoutButton}>
              <Icon name="log-out-outline" size={24} color={theme.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </PressableScale>
        </Animated.View>

        <Text style={styles.version}>FreshRecipe v1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 12,
  },
  
  // Background blobs (matching HomeScreen)
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
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.gray,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  headerRow: {
    position: 'absolute',
    top: 10,
    right: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerLeft: {
    width: 40,
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: theme.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.white,
  },
  badgeText: {
    color: theme.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
    marginTop: 20,
  },
  profileAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: theme.primary,
    backgroundColor: theme.white,
  },
  profileAvatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.white,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  profileAvatarText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: theme.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.white,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editAvatarInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.dark,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.gray,
    marginTop: 4,
  },
  profileRoleBadge: {
    marginTop: 12,
    backgroundColor: theme.primaryFaint,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileRole: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: theme.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.gray,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.lightGray,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.gray,
    marginBottom: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
    backgroundColor: 'transparent',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 14,
    color: theme.dark,
    fontWeight: '500',
  },
  logoutWrapper: {
    marginTop: 32,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: theme.lightGray,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    color: theme.error,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: theme.gray,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
  },
});

export default ProfileScreen; 