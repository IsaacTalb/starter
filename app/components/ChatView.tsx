import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';
import Button from './Button';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
};

type Props = {
  messages: Message[];
  onSend: (text: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
};

export default function ChatView({ messages, onSend, loading = false, error = null }: Props) {
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.wrap}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <View key={m.id} style={[styles.msgBlock, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.msgText, isUser ? styles.userText : styles.assistantText]}>{m.content}</Text>
              </View>
              <Text style={styles.timestamp}>{new Date(m.createdAt).toLocaleString()}</Text>
            </View>
          );
        })}

        {loading && (
          <View style={styles.pendingBubble}>
            <Text style={styles.pendingText}>Thinking…</Text>
          </View>
        )}
      </ScrollView>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask for details, risks, or next steps..."
          style={styles.input}
          editable={!loading}
          placeholderTextColor={theme.colors.textMuted}
        />
        <Button
          title="Send"
          loading={loading}
          disabled={loading || !text.trim()}
          onPress={async () => {
            if (!text.trim()) return;
            const payload = text.trim();
            setText('');
            await onSend(payload);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  messages: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  msgBlock: {
    maxWidth: '86%',
    gap: 3,
  },
  bubble: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  userBubble: {
    backgroundColor: theme.colors.chatUserBg,
  },
  assistantBubble: {
    backgroundColor: theme.colors.chatAssistantBg,
  },
  msgText: {
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: theme.colors.text,
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  pendingBubble: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  pendingText: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  errorWrap: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: '#FFE8E8',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
});
