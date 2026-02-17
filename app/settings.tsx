import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Button from './components/Button';
import { deleteApiKey, getApiKey, getInsights, setApiKey } from './lib/nvidia';

export default function Settings() {
  const [key, setKey] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const k = await getApiKey();
      if (k) setKey(k);
    })();
  }, []);

  async function handleSave() {
    const ok = await setApiKey(key);
    setStatus(ok ? 'Saved securely.' : 'Save failed.');
  }

  async function handleRemove() {
    const ok = await deleteApiKey();
    if (ok) {
      setKey('');
      setStatus('Key removed.');
    } else setStatus('Remove failed.');
  }

  async function handleTest() {
    setStatus('Testing...');
    const result = await getInsights('Test connection from IdeaHub app', key ?? undefined);
    if (result.error) setStatus(`Test failed: ${result.error}`);
    else setStatus('Test succeeded — API responded.');
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Settings</Text>

      <Text style={{ marginBottom: 6 }}>NVIDIA API Key</Text>
      <TextInput
        value={key}
        onChangeText={setKey}
        placeholder="Enter your NVIDIA API key"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="Save" onPress={handleSave} />
        <View style={{ width: 12 }} />
        <Button title="Test Key" onPress={handleTest} style={{ backgroundColor: '#34c759' }} />
        <View style={{ width: 12 }} />
        <Button title="Remove" onPress={handleRemove} style={{ backgroundColor: '#ff3b30' }} />
      </View>

      {status && (
        <View style={{ marginTop: 12 }}>
          <Text>{status}</Text>
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <Text onPress={() => router.back()} style={{ color: '#0a84ff', padding: 12 }}>Back</Text>
      </View>
    </ScrollView>
  );
}
