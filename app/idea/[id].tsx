import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import ChatView from '../components/ChatView';
import NoteEditor from '../components/NoteEditor';
import { getInsights } from '../lib/ai';
import { appendMessage, getConversation, getNote, Note, updateNote } from '../lib/storage';
import { theme } from '../theme';

const CONTEXT_LIMIT = 8;

export default function IdeaEditor() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [messages, setMessages] = useState<Note['messages']>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getNote(String(id));
      setNote(data ?? null);
      const conv = await getConversation(String(id));
      setMessages(conv);
      setLoading(false);
    })();
  }, [id]);

  async function handleSave(updated: Note) {
    await updateNote(updated);
    setNote(updated);
  }

  async function handleInsights() {
    if (!note || !id) return;
    setAiLoading(true);
    setAiError(null);

    const seed = note.content?.trim() || note.title?.trim() || 'Summarize this note.';
    const prompt = `Create concise insights for this note.\nTitle: ${note.title || 'Untitled'}\n\nNote:\n${seed}`;
    const result = await getInsights({ text: prompt });

    if (result.error) {
      setAiError(result.error);
    }

    if (result.summary) {
      const assistantMsg = await appendMessage(String(id), { role: 'assistant', content: result.summary });
      setMessages((prev) => [...(prev ?? []), assistantMsg]);
    }

    setAiLoading(false);
  }

  async function handleSendFollowup(text: string) {
    if (!note || !id) return;
    setAiLoading(true);
    setAiError(null);

    const userMsg = await appendMessage(String(id), { role: 'user', content: text });
    setMessages((prev) => [...(prev ?? []), userMsg]);

    const convo = await getConversation(String(id));
    const recent = convo.slice(-CONTEXT_LIMIT);
    const context = recent.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

    const prompt = [
      'You are helping improve a product idea note. Be concrete and concise.',
      `Note title: ${note.title || 'Untitled'}`,
      `Note content:\n${note.content || 'No content yet.'}`,
      `Recent conversation:\n${context}`,
      `User follow-up: ${text}`,
    ].join('\n\n');

    const result = await getInsights({ text: prompt });

    if (result.error) {
      setAiError(result.error);
      setAiLoading(false);
      return;
    }

    if (result.summary) {
      const assistantMsg = await appendMessage(String(id), { role: 'assistant', content: result.summary });
      setMessages((prev) => [...(prev ?? []), assistantMsg]);
    }

    setAiLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Note not found.</Text>
        <Pressable onPress={() => router.push('/idea')} style={styles.backLink}>
          <Text style={styles.backText}>Back to ideas</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <NoteEditor note={note} onSave={handleSave} />
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Insight Chat</Text>
        <Button title="Generate insights" onPress={handleInsights} loading={aiLoading} disabled={aiLoading} />
      </View>
      <View style={styles.chatWrap}>
        <ChatView messages={messages ?? []} onSend={handleSendFollowup} loading={aiLoading} error={aiError} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  notFoundText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  backLink: {
    padding: theme.spacing.sm,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  chatHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  chatTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: theme.typography.h2,
  },
  chatWrap: {
    flex: 1,
  },
});
