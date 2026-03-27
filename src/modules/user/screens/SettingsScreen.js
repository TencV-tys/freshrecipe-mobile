import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import UserService from '../services/user.service';

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

// Animated Setting Item Component
const SettingItem = ({ icon, title, onPress, color = theme.primary, delay = 0 }) => {
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
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateX }] }}>
      <PressableScale onPress={onPress}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
              <Icon name={icon} size={22} color={color} />
            </View>
            <Text style={styles.settingTitle}>{title}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.gray} />
        </View>
      </PressableScale>
    </Animated.View>
  );
};

// Animated Section Header Component
const SectionHeader = ({ title, delay = 0 }) => {
  const [animValue] = React.useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 50,
      friction: 9,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [10, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateX }] }}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </Animated.View>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(logoutAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, []);


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


  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const logoutTranslateY = logoutAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Account Settings */}
        <Animated.View style={{ opacity: contentAnim }}>
          <View style={styles.section}>
            <SectionHeader title="Account" delay={0} />
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              onPress={() => navigation.navigate('EditProfileMain')}
              color={theme.primary}
              delay={50}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              onPress={() => navigation.navigate('ChangePasswordMain')}
              color={theme.secondary}
              delay={100}
            />
          </View>

          {/* Support */}
          <View style={styles.section}>
            <SectionHeader title="Support" delay={150} />
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => navigation.navigate('HelpSupport')}
              color={theme.teal}
              delay={200}
            />
            <SettingItem
              icon="chatbubble-outline"
              title="Contact Us"
              onPress={() => Alert.alert(
                'Contact Us',
                'Email: support@freshrecipe.com\n\nWe\'ll get back to you within 24-48 hours.'
              )}
              color={theme.blue}
              delay={250}
            />
            <SettingItem
              icon="document-text-outline"
              title="Privacy Policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
              color={theme.gray}
              delay={300}
            />
            <SettingItem
              icon="document-outline"
              title="Terms of Service"
              onPress={() => navigation.navigate('TermsOfService')}
              color={theme.gray}
              delay={350}
            />
            <SettingItem
              icon="information-circle-outline"
              title="About"
              onPress={() => Alert.alert(
                'About FreshRecipe',
                'Version 1.0.0\n\nFreshRecipe helps you discover delicious Filipino recipes and scan ingredients with AI.\n\nFeatures:\n• Find recipes by name or ingredients\n• Scan ingredients with camera\n• Save your favorite recipes\n• Chat with recipe assistant\n\n© 2024 FreshRecipe\nAll rights reserved.'
              )}
              color={theme.teal}
              delay={400}
            />
          </View>
        </Animated.View>

        {/* Logout Button */}
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

        <Animated.View style={{ opacity: contentAnim }}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: '800',
    color: theme.dark,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
    backgroundColor: 'transparent',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 14,
    color: theme.dark,
    fontWeight: '500',
  },
  logoutWrapper: {
    marginTop: 40,
    marginBottom: 20,
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
    marginBottom: 30,
    marginTop: 16,
    fontSize: 12,
  },
});

export default SettingsScreen;