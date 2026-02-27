import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import Badge from './components/Badge';
import Button from './components/Button';
import { theme } from './theme';

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.heroCard}>
        <Badge label="IdeaHub MVP" />
        <Text style={styles.title}>Build ideas into plans</Text>
        <Text style={styles.subtitle}>
          Capture notes, structure thought quickly, and use AI insights from NVIDIA, OpenAI, or Gemini.
        </Text>
        <Link href="/idea" asChild>
          <Button title="Open IdeaHub" style={styles.heroButton} />
        </Link>
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>What you get</Text>
        <Text style={styles.feature}>• Local-first note storage with chat history</Text>
        <Text style={styles.feature}>• Markdown-like editing shortcuts for faster writing</Text>
        <Text style={styles.feature}>• Provider + model controls in settings</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.bg,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  heroButton: {
    marginTop: theme.spacing.sm,
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
