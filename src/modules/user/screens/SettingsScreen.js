import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';

// Local colors
const colors = {
  primary: '#ff6b6b',
  secondary: '#4ecdc4',
  white: '#ffffff',
  black: '#000000',
  gray: '#666666',
  lightGray: '#f5f5f5',
  darkGray: '#333333',
  error: '#ff4444',
  success: '#00c851',
};

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

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

  const SettingItem = ({ icon, title, value, onValueChange, type = 'switch', onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type !== 'arrow'}
      activeOpacity={type === 'arrow' ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={colors.primary} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor={colors.white}
        />
      ) : type === 'arrow' ? (
        <Icon name="chevron-forward" size={20} color={colors.gray} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
        <SettingItem
          icon="mail-outline"
          title="Email Notifications"
          value={emailNotifications}
          onValueChange={setEmailNotifications}
        />
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person-outline"
          title="Edit Profile"
          type="arrow"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingItem
          icon="lock-closed-outline"
          title="Change Password"
          type="arrow"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <SettingItem
          icon="bookmark-outline"
          title="Saved Recipes"
          type="arrow"
          onPress={() => navigation.navigate('SavedRecipes')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon="help-circle-outline"
          title="Help Center"
          type="arrow"
          onPress={() => Alert.alert('Help Center', 'Coming soon!')}
        />
        <SettingItem
          icon="document-text-outline"
          title="Privacy Policy"
          type="arrow"
          onPress={() => Alert.alert('Privacy Policy', 'Coming soon!')}
        />
        <SettingItem
          icon="information-circle-outline"
          title="About"
          type="arrow"
          onPress={() => Alert.alert('About', 'FreshRecipe v1.0.0\n\nFind delicious Filipino recipes and scan ingredients with AI.')}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={24} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.gray,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 16,
    color: colors.black,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: colors.gray,
    marginBottom: 32,
    fontSize: 12,
  },
});

export default SettingsScreen;