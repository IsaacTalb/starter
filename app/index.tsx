import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from './components/Badge';
import Button from './components/Button';
import { theme } from './theme';

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ title: 'IdeaHub' }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroCard}>
          <Badge label="IdeaHub Pro" />
          <Text style={styles.title}>Capture sparks, ship products</Text>
          <Text style={styles.subtitle}>Turn fast thoughts into notes, structure them beautifully, then expand with AI.</Text>
          <Link href="/idea" asChild>
            <Button title="Open IdeaHub" style={styles.heroButton} />
          </Link>
        </View>

        <View style={styles.paletteRow}>
          <View style={[styles.paletteCard, { backgroundColor: '#E9EEFF' }]}>
            <Text style={styles.paletteTitle}>Multi AI</Text>
            <Text style={styles.paletteText}>NVIDIA, OpenAI, Gemini</Text>
          </View>
          <View style={[styles.paletteCard, { backgroundColor: '#E7FAF1' }]}>
            <Text style={styles.paletteTitle}>Smart Notes</Text>
            <Text style={styles.paletteText}>Write + format quickly</Text>
          </View>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>What you get</Text>
          <Text style={styles.feature}>• Local-first note storage with chat history</Text>
          <Text style={styles.feature}>• iOS/Samsung-style quick formatting toolbar</Text>
          <Text style={styles.feature}>• Provider + model controls in settings</Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.bg,
  },
  heroCard: {
    backgroundColor: '#122241',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: '#C2D2FF',
    lineHeight: 22,
  },
  heroButton: {
    marginTop: theme.spacing.sm,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  paletteCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 4,
  },
  paletteTitle: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  paletteText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  featuresCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.h2,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  feature: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
});
