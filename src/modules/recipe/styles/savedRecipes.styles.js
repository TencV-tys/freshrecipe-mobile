import { StyleSheet, Platform, StatusBar } from 'react-native';
import colors from '../../shared/constants/colors';

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 44;

export default StyleSheet.create({
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  savedCount: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
    marginLeft: 4,
  },
});