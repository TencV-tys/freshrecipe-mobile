import { StyleSheet } from 'react-native';
import colors from '../../shared/constants/colors';
import { spacing, typography } from '../../shared/constants/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  hero: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  features: {
    padding: spacing.lg,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...styles.shadow,
  },
  featureTitle: {
    ...typography.h3,
    marginTop: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});