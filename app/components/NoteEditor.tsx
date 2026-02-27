import React, { useState } from 'react';
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

type Selection = { start: number; end: number };

type Tool = {
  label: string;
  onPress: (content: string, selection: Selection) => { text: string; cursor: number };
};

function replaceRange(content: string, selection: Selection, inserted: string) {
  const before = content.slice(0, selection.start);
  const after = content.slice(selection.end);
  const text = `${before}${inserted}${after}`;
  return { text, cursor: before.length + inserted.length };
}

function wrapRange(content: string, selection: Selection, prefix: string, suffix: string = prefix) {
  const selected = content.slice(selection.start, selection.end) || 'text';
  const next = `${prefix}${selected}${suffix}`;
  return replaceRange(content, selection, next);
}

const tools: Tool[] = [
  { label: 'B', onPress: (c, s) => wrapRange(c, s, '**') },
  { label: 'I', onPress: (c, s) => wrapRange(c, s, '_') },
  { label: 'H1', onPress: (c, s) => replaceRange(c, s, '\n# ') },
  { label: '•', onPress: (c, s) => replaceRange(c, s, '\n- ') },
  { label: '1.', onPress: (c, s) => replaceRange(c, s, '\n1. ') },
  { label: '☑', onPress: (c, s) => replaceRange(c, s, '\n- [ ] ') },
  { label: '</>', onPress: (c, s) => replaceRange(c, s, '\n```\n\n```\n') },
];

export default function NoteEditor({ note: initial, onSave }: Props) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [content, setContent] = useState(initial.content ?? '');
  const [saving, setSaving] = useState(false);
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });

  async function handleSave() {
    setSaving(true);
    await onSave({ ...initial, title, content, updatedAt: Date.now() });
    setSaving(false);
  }

  function applyTool(tool: Tool) {
    const result = tool.onPress(content, selection);
    setContent(result.text);
    setSelection({ start: result.cursor, end: result.cursor });
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
        <View style={styles.toolbarShell}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbar}>
            {tools.map((tool) => (
              <Button
                key={tool.label}
                title={tool.label}
                variant="secondary"
                onPress={() => applyTool(tool)}
                style={styles.toolBtn}
                textStyle={styles.toolBtnText}
              />
            ))}
          </ScrollView>
        </View>

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
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
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
  toolbarShell: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    backgroundColor: '#EEF3FF',
  },
  toolbar: {
    gap: theme.spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  toolBtn: {
    minHeight: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
  },
  toolBtnText: {
    fontSize: theme.typography.caption,
    fontWeight: '800',
  },
  editorInput: {
    minHeight: 130,
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
