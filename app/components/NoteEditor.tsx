import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import type { Note } from '../lib/storage';
import Button from './Button';

type Props = {
  note: Note;
  onSave: (note: Note) => Promise<void> | void;
  onInsights?: () => void;
};

export default function NoteEditor({ note: initial, onSave }: Props) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [content, setContent] = useState(initial.content ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({ ...initial, title, content, updatedAt: Date.now() });
    setSaving(false);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ marginBottom: 6, fontWeight: '600' }}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Note title"
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <Text style={{ marginBottom: 6, fontWeight: '600' }}>Content</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Write your idea, notes, or paste content here..."
        multiline
        style={{
          minHeight: 200,
          textAlignVertical: 'top',
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={saving ? 'Saving...' : 'Save'} onPress={handleSave} />
      </View>
    </ScrollView>
  );
}
