import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
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

// Animated Section Component
const AnimatedSection = ({ children, delay = 0 }) => {
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
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [20, 0]
  });
  
  return (
    <Animated.View style={{ opacity: animValue, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// Animated Text Component
const AnimatedText = ({ style, children, delay = 0 }) => {
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
    outputRange: [10, 0]
  });
  
  return (
    <Animated.Text style={[style, { opacity: animValue, transform: [{ translateX }] }]}>
      {children}
    </Animated.Text>
  );
};

const TermsOfServiceScreen = ({ navigation }) => {
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
  }, []);

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });

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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Last Updated */}
        <AnimatedSection delay={0}>
          <Text style={styles.lastUpdated}>Last updated: March 2024</Text>
        </AnimatedSection>

        {/* Section 1 */}
        <AnimatedSection delay={50}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing or using FreshRecipe, you agree to be bound by these Terms of Service.
          </Text>
        </AnimatedSection>

        {/* Section 2 */}
        <AnimatedSection delay={100}>
          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the security of your account. You agree to provide accurate and complete information when creating your account.
          </Text>
        </AnimatedSection>

        {/* Section 3 */}
        <AnimatedSection delay={150}>
          <Text style={styles.sectionTitle}>3. Content</Text>
          <Text style={styles.text}>
            You retain ownership of any content you submit. By submitting content, you grant FreshRecipe a license to use, display, and distribute it within the app.
          </Text>
        </AnimatedSection>

        {/* Section 4 */}
        <AnimatedSection delay={200}>
          <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
          <Text style={styles.text}>
            You may not:
          </Text>
          <AnimatedText style={styles.bullet} delay={220}>• Use the service for any illegal purpose</AnimatedText>
          <AnimatedText style={styles.bullet} delay={240}>• Attempt to gain unauthorized access to our systems</AnimatedText>
          <AnimatedText style={styles.bullet} delay={260}>• Harass, abuse, or harm other users</AnimatedText>
        </AnimatedSection>

        {/* Section 5 */}
        <AnimatedSection delay={300}>
          <Text style={styles.sectionTitle}>5. Termination</Text>
          <Text style={styles.text}>
            We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms.
          </Text>
        </AnimatedSection>

        {/* Section 6 */}
        <AnimatedSection delay={350}>
          <Text style={styles.sectionTitle}>6. Contact</Text>
          <Text style={styles.text}>
            Questions about the Terms should be sent to:
          </Text>
          <PressableScale onPress={() => {}}>
            <Text style={styles.contact}>legal@freshrecipe.com</Text>
          </PressableScale>
        </AnimatedSection>

        {/* Divider and Footer */}
        <AnimatedSection delay={400}>
          <View style={styles.divider} />
          <Text style={styles.footerText}>
            By using FreshRecipe, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
        </AnimatedSection>
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
  lastUpdated: {
    fontSize: 12,
    color: theme.gray,
    marginBottom: 24,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.dark,
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  text: {
    fontSize: 14,
    color: theme.gray,
    lineHeight: 22,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    color: theme.gray,
    lineHeight: 22,
    marginLeft: 20,
    marginBottom: 8,
  },
  contact: {
    fontSize: 14,
    color: theme.primary,
    marginTop: 5,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: theme.lightGray,
    marginVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: theme.gray,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default TermsOfServiceScreen;