import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function Badge({ label }: { label: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
});
