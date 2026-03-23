import { StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { spacing, typography, borderRadius } from '../constants/theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    margin: spacing.sm,
    ...globalStyles.shadow,
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    ...typography.h1,
    color: colors.black,
  },
  subtitle: {
    ...typography.h3,
    color: colors.gray,
  },
  text: {
    ...typography.body,
    color: colors.black,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  successText: {
    ...typography.caption,
    color: colors.success,
  },
});