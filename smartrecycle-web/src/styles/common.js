import {StyleSheet} from 'react-native';

export const colors = {
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  secondary: '#81C784',
  accent: '#FFC107',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  border: '#E0E0E0',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenPadding: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  marginTop: {
    marginTop: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },
}); 