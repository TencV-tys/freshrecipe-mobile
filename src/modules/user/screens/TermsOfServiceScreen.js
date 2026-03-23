import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const TermsOfServiceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: March 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing or using FreshRecipe, you agree to be bound by these Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.text}>
          You are responsible for maintaining the security of your account. You agree to provide accurate and complete information when creating your account.
        </Text>

        <Text style={styles.sectionTitle}>3. Content</Text>
        <Text style={styles.text}>
          You retain ownership of any content you submit. By submitting content, you grant FreshRecipe a license to use, display, and distribute it within the app.
        </Text>

        <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
        <Text style={styles.text}>
          You may not:
        </Text>
        <Text style={styles.bullet}>• Use the service for any illegal purpose</Text>
        <Text style={styles.bullet}>• Attempt to gain unauthorized access to our systems</Text>
        <Text style={styles.bullet}>• Harass, abuse, or harm other users</Text>

        <Text style={styles.sectionTitle}>5. Termination</Text>
        <Text style={styles.text}>
          We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms.
        </Text>

        <Text style={styles.sectionTitle}>6. Contact</Text>
        <Text style={styles.text}>
          Questions about the Terms should be sent to:
        </Text>
        <Text style={styles.contact}>legal@freshrecipe.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 22,
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 22,
    marginLeft: 20,
    marginBottom: 5,
  },
  contact: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 5,
  },
});

export default TermsOfServiceScreen;