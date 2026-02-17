import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Button from '../components/Button';
import { getApiKey } from '../lib/nvidia';
import { createNote, deleteNote, getNotes } from '../lib/storage';

export default function IdeaList() {
  const [notes, setNotes] = useState<any[]>([]);
  const router = useRouter();
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  async function load() {
    const data = await getNotes();
    setNotes(data);
  }

  useEffect(() => {
    const unsub = router.addListener?.('focus', load);
    load();
    (async () => {
      const k = await getApiKey();
      setHasKey(!!k);
    })();
    const t = setTimeout(() => setShowSplash(false), 700);
    return () => {
      unsub && unsub();
      clearTimeout(t);
    };
  }, []);

  async function handleCreate() {
    const note = await createNote();
    router.push(`/idea/${note.id}`);
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    load();
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {showSplash && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'white', zIndex: 30, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '800' }}>IdeaHub</Text>
          <Text style={{ color: '#666', marginTop: 8 }}>Loading your creative space…</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>IdeaHub</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="New" onPress={handleCreate} />
        </View>
      </View>

      {hasKey === false && (
        <View style={{ padding: 10, backgroundColor: '#fff4e5', borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: '#8a6d02' }}>No NVIDIA API key configured. Add it in Settings to enable AI insights.</Text>
        </View>
      )}

      <FlatList
        data={notes}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/idea/${item.id}`)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontWeight: '600' }}>{item.title || 'Untitled'}</Text>
              <Text numberOfLines={1} style={{ color: '#666' }}>{item.content || ''}</Text>
            </View>
            <Text onPress={() => handleDelete(item.id)} style={{ color: '#ff3b30', padding: 8 }}>Delete</Text>
          </Pressable>
        )}
        ListEmptyComponent={() => <Text style={{ color: '#666' }}>No notes yet. Tap New to create one.</Text>}
      />
    </View>
  );
}
