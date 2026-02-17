import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import Button from './Button';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
};

export default function ChatView({ messages, onSend }: { messages: Message[]; onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 12 }}>
        {messages.map((m) => (
          <View key={m.id} style={{ marginBottom: 10, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <View style={{ backgroundColor: m.role === 'user' ? '#0a84ff' : '#f1f1f3', padding: 10, borderRadius: 8 }}>
              <Text style={{ color: m.role === 'user' ? 'white' : '#111' }}>{m.content}</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write a follow-up or ask for more..."
          style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginRight: 8 }}
        />
        <Button
          title="Send"
          onPress={async () => {
            if (!text.trim()) return;
            const t = text.trim();
            setText('');
            await onSend(t);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
