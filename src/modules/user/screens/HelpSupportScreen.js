import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

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

// Animated Menu Item Component
const AnimatedMenuItem = ({ item, index, onPress }) => {
  const [animValue] = React.useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, [index]);
  
  const translateX = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View 
      style={[
        styles.menuItemWrapper,
        { opacity: animValue, transform: [{ translateX }] }
      ]}
    >
      <PressableScale onPress={onPress}>
        <View style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: item.bgColor || theme.primaryFaint }]}>
            <Icon name={item.icon} size={24} color={item.iconColor || theme.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.gray} />
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const HelpSupportScreen = ({ navigation }) => {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(heroAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 150, useNativeDriver: true }).start();
  }, []);

  const menuItems = [
    {
      icon: 'document-text-outline',
      title: 'Privacy Policy',
      description: 'How we handle your data and privacy',
      onPress: () => navigation.navigate('PrivacyPolicy'),
      bgColor: theme.primaryFaint,
      iconColor: theme.primary,
    },
    {
      icon: 'document-outline',
      title: 'Terms of Service',
      description: 'Terms and conditions for using FreshRecipe',
      onPress: () => navigation.navigate('TermsOfService'),
      bgColor: theme.secondaryFaint,
      iconColor: theme.secondary,
    },
    {
      icon: 'mail-outline',
      title: 'Contact Us',
      description: 'support@freshrecipe.com',
      onPress: () => Linking.openURL('mailto:support@freshrecipe.com'),
      bgColor: theme.tealFaint,
      iconColor: theme.teal,
    },
    {
      icon: 'chatbubble-outline',
      title: 'Chat with Support',
      description: 'Get help from our chatbot assistant',
      onPress: () => navigation.navigate('ChatbotMain'),
      bgColor: theme.blueFaint,
      iconColor: theme.blue,
    },
  ];

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const heroTranslateY = heroAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            { opacity: heroAnim, transform: [{ translateY: heroTranslateY }] }
          ]}
        >
          <View style={styles.heroIcon}>
            <Icon name="help-circle" size={48} color={theme.primary} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to your questions or contact our support team
          </Text>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View style={{ opacity: contentAnim }}>
          {menuItems.map((item, index) => (
            <AnimatedMenuItem
              key={index}
              item={item}
              index={index}
              onPress={item.onPress}
            />
          ))}
        </Animated.View>

        {/* Version Info */}
        <Animated.View 
          style={[
            styles.versionContainer,
            { opacity: contentAnim }
          ]}
        >
          <Text style={styles.versionText}>FreshRecipe v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 FreshRecipe. All rights reserved.</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primaryFaint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.dark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  menuItemWrapper: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.white,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.lightGray,
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.dark,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: theme.gray,
    lineHeight: 16,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.lightGray,
  },
  versionText: {
    fontSize: 12,
    color: theme.gray,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: theme.gray,
  },
});

export default HelpSupportScreen;