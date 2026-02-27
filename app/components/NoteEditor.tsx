import React, { useMemo, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
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
  const selected = content.slice(selection.start, selection.end);
  if (!selected) {
    const inserted = `${prefix}${suffix}`;
    const before = content.slice(0, selection.start);
    const after = content.slice(selection.end);
    return {
      text: `${before}${inserted}${after}`,
      cursor: before.length + prefix.length,
    };
  }
  const inserted = `${prefix}${selected}${suffix}`;
  return replaceRange(content, selection, inserted);
}

function renderMarkdownPreview(content: string) {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const key = `${index}-${line}`;

    if (line.startsWith('# ')) {
      return (
        <Text key={key} style={styles.previewH1}>
          {line.slice(2)}
        </Text>
      );
    }

    if (line.startsWith('## ')) {
      return (
        <Text key={key} style={styles.previewH2}>
          {line.slice(3)}
        </Text>
      );
    }

    if (line.startsWith('- [ ] ')) {
      return (
        <Text key={key} style={styles.previewBullet}>
          ☐ {line.slice(6)}
        </Text>
      );
    }

    if (line.startsWith('- [x] ')) {
      return (
        <Text key={key} style={styles.previewBullet}>
          ☑ {line.slice(6)}
        </Text>
      );
    }

    if (line.startsWith('- ')) {
      return (
        <Text key={key} style={styles.previewBullet}>
          • {line.slice(2)}
        </Text>
      );
    }

    if (/^\d+\.\s/.test(line)) {
      return (
        <Text key={key} style={styles.previewBullet}>
          {line}
        </Text>
      );
    }

    if (line.startsWith('```')) {
      return (
        <Text key={key} style={styles.previewCodeFence}>
          ─ code ─
        </Text>
      );
    }

    if (line.trim() === '---') {
      return <View key={key} style={styles.previewDivider} />;
    }

    return (
      <Text key={key} style={styles.previewText}>
        {line || ' '}
      </Text>
    );
  });
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
  const [history, setHistory] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const preview = useMemo(() => renderMarkdownPreview(content), [content]);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...initial, title, content, updatedAt: Date.now() });
    setSaving(false);
  }

  function updateContent(next: string, nextCursor?: number) {
    setHistory((prev) => [...prev.slice(-49), content]);
    setFuture([]);
    setContent(next);
    if (typeof nextCursor === 'number') {
      setSelection({ start: nextCursor, end: nextCursor });
    }
  }

  function applyTool(tool: Tool) {
    const result = tool.onPress(content, selection);
    updateContent(result.text, result.cursor);
  }

  function handleUndo() {
    if (!canUndo) return;
    const prev = history[history.length - 1];
    setHistory((list) => list.slice(0, -1));
    setFuture((list) => [content, ...list].slice(0, 50));
    setContent(prev);
    const cursor = prev.length;
    setSelection({ start: cursor, end: cursor });
  }

  function handleRedo() {
    if (!canRedo) return;
    const next = future[0];
    setFuture((list) => list.slice(1));
    setHistory((list) => [...list.slice(-49), content]);
    setContent(next);
    const cursor = next.length;
    setSelection({ start: cursor, end: cursor });
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
        <View style={styles.modeRow}>
          <Pressable style={[styles.modeChip, mode === 'write' && styles.modeChipActive]} onPress={() => setMode('write')}>
            <Text style={[styles.modeChipText, mode === 'write' && styles.modeChipTextActive]}>Write</Text>
          </Pressable>
          <Pressable style={[styles.modeChip, mode === 'preview' && styles.modeChipActive]} onPress={() => setMode('preview')}>
            <Text style={[styles.modeChipText, mode === 'preview' && styles.modeChipTextActive]}>Preview</Text>
          </Pressable>
        </View>

        <View style={styles.toolbarShell}>
          <View style={styles.undoRow}>
            <Pressable style={[styles.smallChip, !canUndo && styles.smallChipDisabled]} onPress={handleUndo} disabled={!canUndo}>
              <Text style={[styles.smallChipText, !canUndo && styles.smallChipTextDisabled]}>Undo</Text>
            </Pressable>
            <Pressable style={[styles.smallChip, !canRedo && styles.smallChipDisabled]} onPress={handleRedo} disabled={!canRedo}>
              <Text style={[styles.smallChipText, !canRedo && styles.smallChipTextDisabled]}>Redo</Text>
            </Pressable>
          </View>

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

        {mode === 'write' ? (
          <TextInput
            value={content}
            onChangeText={(text) => updateContent(text)}
            onSelectionChange={handleSelectionChange}
            selection={selection}
            placeholder="Write your idea, tasks, and details..."
            multiline
            style={styles.editorInput}
            textAlignVertical="top"
            placeholderTextColor={theme.colors.textMuted}
          />
        ) : (
          <View style={styles.previewWrap}>{preview}</View>
        )}
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
  modeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  modeChip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
  },
  modeChipActive: {
    backgroundColor: '#DDE8FF',
    borderColor: theme.colors.primary,
  },
  modeChipText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: theme.colors.primary,
  },
  toolbarShell: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: '#EEF3FF',
    paddingTop: 6,
  },
  undoRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  smallChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  smallChipDisabled: {
    opacity: 0.5,
  },
  smallChipText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  smallChipTextDisabled: {
    color: theme.colors.textMuted,
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
  previewWrap: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 6,
  },
  previewText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  previewH1: {
    color: theme.colors.text,
    fontSize: theme.typography.h2,
    fontWeight: '800',
    marginTop: 4,
  },
  previewH2: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '800',
    marginTop: 2,
  },
  previewBullet: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    lineHeight: 22,
    paddingLeft: 2,
  },
  previewCodeFence: {
    color: '#495E8A',
    fontSize: theme.typography.caption,
    fontStyle: 'italic',
  },
  previewDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginVertical: 6,
  },
});
