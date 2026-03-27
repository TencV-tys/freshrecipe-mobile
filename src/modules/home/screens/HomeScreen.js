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
};

const features = [
  {
    id: 'find',
    title: 'Find Recipes',
    description: 'Search thousands of recipes by name, cuisine, or ingredients',
    icon: 'search',
    color: theme.primary,
    bg: theme.primaryFaint,
    screen: 'Scan',
  },
  {
    id: 'scan',
    title: 'Scan Ingredients',
    description: 'Take a photo of your ingredients and get AI recipe suggestions',
    icon: 'camera',
    color: theme.secondary,
    bg: theme.secondaryFaint,
    screen: 'Scan',
  },
  {
    id: 'saved',
    title: 'Saved Recipes',
    description: 'View and manage all your bookmarked favorite recipes',
    icon: 'bookmark',
    color: theme.teal,
    bg: theme.tealFaint,
    screen: 'SavedRecipes',
  },
  {
    id: 'chat',
    title: 'Recipe Assistant',
    description: 'Chat with AI for personalized cooking tips and ideas',
    icon: 'chatbubble-ellipses',
    color: theme.blue,
    bg: theme.blueFaint,
    screen: 'Chat',
  },
];

const quickActions = [
  { icon: 'search',              label: 'Search', color: theme.primary,   bg: theme.primaryFaint,   screen: 'Scan' },
  { icon: 'camera',              label: 'Scan',   color: theme.secondary,  bg: theme.secondaryFaint, screen: 'Scan' },
  { icon: 'bookmark',            label: 'Saved',  color: theme.teal,       bg: theme.tealFaint,      screen: 'SavedRecipes' },
  { icon: 'chatbubble-ellipses', label: 'AI Chat',color: theme.blue,       bg: theme.blueFaint,      screen: 'Chat' },
];

// Pressable with scale feedback
const PressableScale = ({ onPress, style, children, activeOpacity = 0.82 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 10 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const qaAnims    = useRef(quickActions.map(() => new Animated.Value(0))).current;
  const cardAnims  = useRef(features.map(() => new Animated.Value(0))).current;
  const tipAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero entrance
    Animated.spring(heroAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();

    // Quick actions stagger
    Animated.stagger(65,
      qaAnims.map((a) => Animated.spring(a, { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }))
    ).start();

    // Banner
    Animated.timing(bannerAnim, { toValue: 1, duration: 480, delay: 200, useNativeDriver: true }).start();

    // Feature cards stagger
    Animated.stagger(75,
      cardAnims.map((a) => Animated.spring(a, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }))
    ).start();

    // Tip strip
    Animated.timing(tipAnim, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }).start();
  }, []);

  const navigate = (screen) => {
    if (screen === 'SavedRecipes') navigation.navigate('Dashboard', { screen: 'SavedRecipes' });
    else navigation.navigate(screen);
  };

  const heroTY   = heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-22, 0] });
  const bannerTY = bannerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const tipTY    = tipAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />

      {/* Soft decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HERO ─────────────────────────────────── */}
        <Animated.View style={[styles.hero, { opacity: heroAnim, transform: [{ translateY: heroTY }] }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={styles.greeting}>Good day, Chef! 👋</Text>
              <Text style={styles.heroTitle}>FreshRecipe</Text>
              <Text style={styles.heroSub}>
                Discover Filipino recipes &{'\n'}scan ingredients with AI
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeEmoji}>🍳</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── QUICK ACTIONS ────────────────────────── */}
        <View style={styles.qaWrap}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.qaRow}>
            {quickActions.map((qa, i) => {
              const ty = qaAnims[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
              return (
                <Animated.View key={qa.label} style={{ opacity: qaAnims[i], transform: [{ translateY: ty }] }}>
                  <PressableScale onPress={() => navigate(qa.screen)}>
                    <View style={styles.qaItem}>
                      <View style={[styles.qaIconWrap, { backgroundColor: qa.bg }]}>
                        <Icon name={qa.icon} size={22} color={qa.color} />
                      </View>
                      <Text style={styles.qaText}>{qa.label}</Text>
                    </View>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ── FEATURED BANNER ──────────────────────── */}
        <Animated.View style={[styles.bannerWrap, { opacity: bannerAnim, transform: [{ translateY: bannerTY }] }]}>
          <PressableScale onPress={() => navigate('Scan')}>
            <View style={styles.banner}>
              {/* Decorative circles inside banner */}
              <View style={styles.bannerCircle1} />
              <View style={styles.bannerCircle2} />

              <View style={styles.bannerLeft}>
                <View style={styles.bannerTag}>
                  <Text style={styles.bannerTagText}>✨ Featured</Text>
                </View>
                <Text style={styles.bannerTitle}>Popular{'\n'}Filipino Dishes</Text>
                <Text style={styles.bannerSub}>Adobo · Sinigang · Lechon · Kare-kare</Text>
                <View style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>Explore</Text>
                  <Icon name="arrow-forward" size={13} color={theme.white} style={{ marginLeft: 4 }} />
                </View>
              </View>

              <View style={styles.bannerRight}>
                <Text style={styles.bannerEmoji}>🍲</Text>
              </View>
            </View>
          </PressableScale>
        </Animated.View>

        {/* ── FEATURE CARDS ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          {features.map((f, i) => {
            const ty = cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [28, 0] });
            return (
              <Animated.View key={f.id} style={{ opacity: cardAnims[i], transform: [{ translateY: ty }] }}>
                <PressableScale onPress={() => navigate(f.screen)}>
                  <View style={styles.featureCard}>
                    <View style={[styles.featureIconWrap, { backgroundColor: f.bg }]}>
                      <Icon name={f.icon} size={26} color={f.color} />
                    </View>
                    <View style={styles.featureBody}>
                      <Text style={styles.featureTitle}>{f.title}</Text>
                      <Text style={styles.featureDesc}>{f.description}</Text>
                    </View>
                    <View style={[styles.featureChevron, { backgroundColor: f.bg }]}>
                      <Icon name="chevron-forward" size={15} color={f.color} />
                    </View>
                  </View>
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>

        {/* ── TIP STRIP ────────────────────────────── */}
        <Animated.View style={[styles.tipStrip, { opacity: tipAnim, transform: [{ translateY: tipTY }] }]}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Tip: Scan your fridge and let AI suggest what to cook today!
          </Text>
        </Animated.View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { paddingBottom: 12 },

  // Background blobs
  blob1: {
    position: 'absolute', top: -70, right: -70,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: '#ffeded', opacity: 0.6,
  },
  blob2: {
    position: 'absolute', top: 200, left: -90,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#fff8f0', opacity: 0.5,
  },

  // Hero
  hero: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 24 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroText: { flex: 1, paddingRight: 12 },
  greeting: { fontSize: 13, color: theme.gray, fontWeight: '500', marginBottom: 4 },
  heroTitle: {
    fontSize: 36, fontWeight: '800', color: theme.primary,
    letterSpacing: -1, marginBottom: 8,
  },
  heroSub: { fontSize: 14, color: theme.gray, lineHeight: 21 },
  heroBadge: {
    width: 68, height: 68, borderRadius: 22,
    backgroundColor: theme.primaryFaint,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 5,
  },
  heroBadgeEmoji: { fontSize: 34 },

  // Quick actions
  qaWrap: { paddingHorizontal: 22, marginBottom: 22 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: theme.gray,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14,
  },
  qaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qaItem: { alignItems: 'center', gap: 8 },
  qaIconWrap: {
    width: 60, height: 60, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  qaText: { fontSize: 11, color: theme.gray, fontWeight: '600' },

  // Banner
  bannerWrap: { marginHorizontal: 22, marginBottom: 26 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.primary, borderRadius: 22,
    padding: 22, overflow: 'hidden',
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38, shadowRadius: 18, elevation: 12,
  },
  // Decorative inner circles
  bannerCircle1: {
    position: 'absolute', top: -30, right: 60,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerCircle2: {
    position: 'absolute', bottom: -40, right: -10,
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerLeft: { flex: 1 },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10,
  },
  bannerTagText: { fontSize: 11, color: theme.white, fontWeight: '700' },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: theme.white, lineHeight: 26, marginBottom: 6 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  bannerBtn: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22,
  },
  bannerBtnText: { fontSize: 13, color: theme.white, fontWeight: '700' },
  bannerRight: { marginLeft: 10 },
  bannerEmoji: { fontSize: 58 },

  // Feature cards section
  section: { paddingHorizontal: 22 },
  sectionTitle: {
    fontSize: 20, fontWeight: '800', color: theme.dark,
    letterSpacing: -0.4, marginBottom: 14,
  },
  featureCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.white, borderRadius: 18,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  featureIconWrap: {
    width: 54, height: 54, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: theme.dark, marginBottom: 3 },
  featureDesc: { fontSize: 12, color: theme.gray, lineHeight: 17 },
  featureChevron: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },

  // Tip strip
  tipStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 22, marginTop: 22,
    backgroundColor: '#fffbf0', borderRadius: 16,
    padding: 14, gap: 10,
    borderWidth: 1, borderColor: '#ffe8b0',
  },
  tipIcon: { fontSize: 18 },
  tipText: { flex: 1, fontSize: 12, color: theme.gray, lineHeight: 18 },
});

export default HomeScreen;