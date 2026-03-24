import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';
import NotificationService from '../../notification/services/notification.service';

const colors = {
  primary: '#ff6b6b',
  secondary: '#4ecdc4',
  white: '#ffffff',
  black: '#000000',
  gray: '#666666',
  lightGray: '#f5f5f5',
  darkGray: '#333333',
  error: '#ff4444',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ savedRecipes: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUserStats();
    fetchUnreadCount();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/saved');
      setStats({ savedRecipes: response.data?.length || 0 });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    const result = await NotificationService.getUnreadNotifications();
    if (result.success) {
      setUnreadCount(result.data?.length || 0);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  // Function to navigate to Chat tab
  const goToChatbot = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Chat');
    } else {
      navigation.navigate('Chat');
    }
  };

  const StatCard = ({ icon, value, label, onPress, color }) => (
    <TouchableOpacity style={styles.statItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const MenuItem = ({ icon, title, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.gray} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header with Notification Bell */}
        <View style={styles.profileHeader}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft} />
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="notifications-outline" size={24} color={colors.black} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image 
                source={{ uri: user.avatar.startsWith('http') ? user.avatar : `http://10.205.101.2:5000${user.avatar}` }} 
                style={styles.profileAvatar} 
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => navigation.navigate('EditProfileMain')}
            >
              <Icon name="pencil" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.username || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.profileRoleBadge}>
            <Text style={styles.profileRole}>
              {user?.role === 'admin' ? 'Administrator' : 'Food Lover'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="bookmark-outline"
            value={stats.savedRecipes}
            label="Saved"
            onPress={() => navigation.navigate('SavedRecipes')}
            color={colors.primary}
          />
          <View style={styles.statDivider} />
          <StatCard
            icon="heart-outline"
            value={stats.savedRecipes}
            label="Favorites"
            onPress={() => navigation.navigate('SavedRecipes')}
            color={colors.secondary}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem
            icon="bookmark-outline"
            title="Saved Recipes"
            onPress={() => navigation.navigate('SavedRecipes')}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            onPress={() => navigation.navigate('SettingsMain')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          <MenuItem
            icon="chatbubble-outline"
            title="Chatbot Assistant"
            onPress={goToChatbot}
          />
          <MenuItem
            icon="information-circle-outline"
            title="About"
            onPress={() => Alert.alert('About', 'FreshRecipe v1.0.0\n\nFind delicious Filipino recipes and scan ingredients with AI.\n\n© 2024 FreshRecipe')}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FreshRecipe v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: colors.lightGray,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    position: 'absolute',
    top: 20,
    right: 20,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerLeft: {
    width: 40,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
    marginTop: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  profileRoleBadge: {
    marginTop: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileRole: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    marginLeft: 14,
    color: colors.black,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.gray,
    marginBottom: 30,
    fontSize: 12,
  },
});

export default ProfileScreen;