import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { getAISettings, getProviderApiKey, getProviderLabel } from '../lib/ai';
import { createNote, deleteNote, getNotes, Note } from '../lib/storage';
import { theme } from '../theme';

export default function IdeaList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [providerHint, setProviderHint] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const router = useRouter();

  async function load() {
    const data = await getNotes();
    setNotes(data);
    const settings = await getAISettings();
    setProviderHint(getProviderLabel(settings.provider));
    const key = await getProviderApiKey(settings.provider);
    setHasKey(Boolean(key));
  }

  useEffect(() => {
    const unsub = router.addListener?.('focus', load);
    load();
    return () => {
      unsub && unsub();
    };
  }, [router]);

  async function handleCreate() {
    const note = await createNote();
    router.push(`/idea/${note.id}`);
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    await load();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>IdeaHub</Text>
          <Text style={styles.subtitle}>Your local-first idea workspace</Text>
        </View>
        <View style={styles.headerActions}>
          <Button title="Settings" variant="secondary" onPress={() => router.push('/settings')} />
          <Button title="New" onPress={handleCreate} />
        </View>
      </View>

      <View style={styles.infoCard}>
        <Badge label={`AI: ${providerHint || 'NVIDIA'}`} />
        <Text style={styles.infoText}>
          {hasKey === false
            ? `No ${providerHint || 'selected provider'} API key configured. Add one in Settings to unlock AI responses.`
            : 'AI is configured. Open a note to generate insights and chat with context.'}
        </Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notes.length === 0 ? styles.emptyContainer : styles.listContainer}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/idea/${item.id}`)} style={styles.noteCard}>
            <View style={styles.noteMain}>
              <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
              <Text numberOfLines={2} style={styles.notePreview}>
                {item.content || 'No content yet. Tap to start writing.'}
              </Text>
            </View>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No ideas yet</Text>
            <Text style={styles.emptyText}>Create your first note and start shaping your MVP.</Text>
            <Button title="Create note" onPress={handleCreate} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  infoCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  infoText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  listContainer: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  noteCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  noteMain: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  noteTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: theme.typography.body,
  },
  notePreview: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 21,
  },
  deleteText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: theme.typography.h2,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: theme.typography.body,
  },
});
