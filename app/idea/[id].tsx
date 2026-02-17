import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Button from '../components/Button';
import ChatView from '../components/ChatView';
import NoteEditor from '../components/NoteEditor';
import { getApiKey, getInsights } from '../lib/nvidia';
import { appendMessage, getConversation, getNote, updateNote } from '../lib/storage';

export default function IdeaEditor() {
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const router = useRouter();

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

  async function handleSave(updated: any) {
    await updateNote(updated);
    setNote(updated);
  }

  async function handleInsights() {
    if (!note) return;
    const key = await getApiKey();
    const result = await getInsights(note.content || note.title || '', key ?? undefined);
    setInsights(result);
    if (result.summary) {
      const m = await appendMessage(String(id), { role: 'assistant', content: result.summary });
      setMessages((s) => [...s, m]);
    }
  }

  async function handleSendFollowup(text: string) {
    if (!note) return;
    // store user message
    const userMsg = await appendMessage(String(id), { role: 'user', content: text });
    setMessages((s) => [...s, userMsg]);

    // send to API including context (we'll concatenate recent messages)
    const convo = await getConversation(String(id));
    const last = convo.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `${last}\nUser: ${text}\nAssistant:`;
    const key = await getApiKey();
    const res = await getInsights(prompt, key ?? undefined);
    if (res.summary) {
      const assistantMsg = await appendMessage(String(id), { role: 'assistant', content: res.summary });
      setMessages((s) => [...s, assistantMsg]);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!note)
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Note not found.</Text>
        <Pressable onPress={() => router.push('/idea')} style={{ marginTop: 12 }}>
          <Text style={{ color: '#0a84ff' }}>Back</Text>
        </Pressable>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <NoteEditor note={note} onSave={handleSave} />
      <View style={{ flex: 1 }}>
        <ChatView messages={messages} onSend={handleSendFollowup} />
      </View>
      <View style={{ padding: 12 }}>
        <Button title="Generate Insights" onPress={handleInsights} />
      </View>
    </View>
  );
}
