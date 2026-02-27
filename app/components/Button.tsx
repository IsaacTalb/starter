import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

const variantStyle: Record<Variant, { wrap: ViewStyle; text: TextStyle }> = {
  primary: {
    wrap: { backgroundColor: theme.colors.primary },
    text: { color: '#fff' },
  },
  secondary: {
    wrap: { backgroundColor: theme.colors.surfaceMuted },
    text: { color: theme.colors.text },
  },
  danger: {
    wrap: { backgroundColor: theme.colors.danger },
    text: { color: '#fff' },
  },
  success: {
    wrap: { backgroundColor: theme.colors.success },
    text: { color: '#fff' },
  },
  ghost: {
    wrap: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
    text: { color: theme.colors.text },
  },
};

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle[variant].wrap,
        pressed && !isDisabled ? styles.pressed : undefined,
        isDisabled ? styles.disabled : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? theme.colors.text : '#fff'} />
      ) : (
        <Text style={[styles.text, variantStyle[variant].text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  text: {
    fontWeight: '700',
    fontSize: theme.typography.body,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});
