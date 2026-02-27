import React, { useMemo, useState } from 'react';
import {
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';
import type { Note } from '../lib/storage';
import { theme } from '../theme';
import Button from './Button';

type Props = {
  note: Note;
  onSave: (note: Note) => Promise<void> | void;
};

type Formatter = {
  label: string;
  snippet: string;
};

const formatters: Formatter[] = [
  { label: 'H1', snippet: '\n# ' },
  { label: 'Bullet', snippet: '\n- ' },
  { label: 'Checklist', snippet: '\n- [ ] ' },
  { label: 'Bold', snippet: '**bold**' },
  { label: 'Code', snippet: '\n```\n\n```\n' },
  { label: 'Divider', snippet: '\n---\n' },
];

export default function NoteEditor({ note: initial, onSave }: Props) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [content, setContent] = useState(initial.content ?? '');
  const [saving, setSaving] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const helperText = useMemo(() => 'Use quick actions to insert markdown-like structure.', []);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...initial, title, content, updatedAt: Date.now() });
    setSaving(false);
  }

  function insertSnippet(snippet: string) {
    const before = content.slice(0, selection.start);
    const after = content.slice(selection.end);
    const next = `${before}${snippet}${after}`;
    const nextCursor = before.length + snippet.length;
    setContent(next);
    setSelection({ start: nextCursor, end: nextCursor });
  }

  function handleSelectionChange(event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) {
    setSelection(event.nativeEvent.selection);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Note title"
          style={styles.input}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <View style={styles.fieldWrap}>
        <View style={styles.editorHeader}>
          <Text style={styles.label}>Content</Text>
          <Text style={styles.helper}>{helperText}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbar}>
          {formatters.map((item) => (
            <Button
              key={item.label}
              title={item.label}
              variant="secondary"
              onPress={() => insertSnippet(item.snippet)}
              style={styles.toolBtn}
              textStyle={styles.toolBtnText}
            />
          ))}
        </ScrollView>

        <TextInput
          value={content}
          onChangeText={setContent}
          onSelectionChange={handleSelectionChange}
          selection={selection}
          placeholder="Write your idea, tasks, and details..."
          multiline
          style={styles.editorInput}
          textAlignVertical="top"
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <Button title={saving ? 'Saving...' : 'Save note'} onPress={handleSave} disabled={saving} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.bg,
  },
  fieldWrap: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: theme.typography.body,
  },
  helper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  editorHeader: {
    gap: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.body,
  },
  toolbar: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  toolBtn: {
    minHeight: 34,
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
  },
  toolBtnText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  editorInput: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
});
