import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from './components/Button';
import {
  AIProvider,
  defaultModels,
  deleteProviderApiKey,
  getAISettings,
  getDefaultModel,
  getProviderApiKey,
  getProviderLabel,
  setAISettings,
  setProviderApiKey,
  testConnection,
} from './lib/ai';
import { theme } from './theme';

const providers: AIProvider[] = ['nvidia', 'openai', 'gemini'];

type StatusState = {
  text: string;
  kind: 'neutral' | 'error' | 'success';
};

export default function Settings() {
  const router = useRouter();
  const [provider, setProvider] = useState<AIProvider>('nvidia');
  const [model, setModel] = useState(defaultModels.nvidia);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<StatusState | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await getAISettings();
      setProvider(settings.provider);
      setModel(settings.model);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const key = await getProviderApiKey(provider);
      setApiKey(key ?? '');
    })();
  }, [provider]);

  const modelHints = useMemo(() => {
    if (provider === 'nvidia') return ['meta/llama-3.1-70b-instruct', 'mistralai/mixtral-8x22b-instruct-v0.1'];
    if (provider === 'openai') return ['gpt-4o-mini', 'gpt-4.1-mini'];
    return ['gemini-1.5-flash', 'gemini-1.5-pro'];
  }, [provider]);

  async function handleSave() {
    setSaving(true);
    const savedSettings = await setAISettings({ provider, model });

    if (apiKey.trim()) {
      const ok = await setProviderApiKey(provider, apiKey);
      setStatus({
        text: ok
          ? `${getProviderLabel(savedSettings.provider)} settings saved securely.`
          : `Settings saved, but API key could not be stored for ${getProviderLabel(provider)}.`,
        kind: ok ? 'success' : 'error',
      });
    } else {
      setStatus({ text: `${getProviderLabel(savedSettings.provider)} settings saved.`, kind: 'success' });
    }

    setSaving(false);
  }

  async function handleRemove() {
    const ok = await deleteProviderApiKey(provider);
    if (ok) {
      setApiKey('');
      setStatus({ text: `${getProviderLabel(provider)} key removed.`, kind: 'neutral' });
    } else {
      setStatus({ text: `Could not remove ${getProviderLabel(provider)} key.`, kind: 'error' });
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus({ text: 'Testing connection...', kind: 'neutral' });
    const result = await testConnection({
      provider,
      model,
      apiKey: apiKey.trim() || undefined,
    });

    if (result.error) {
      setStatus({ text: `Test failed: ${result.error}`, kind: 'error' });
    } else {
      setStatus({ text: `Connection succeeded for ${getProviderLabel(provider)}.`, kind: 'success' });
    }
    setTesting(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Settings</Text>
      <Text style={styles.subtitle}>Choose provider + model, manage provider-specific API keys, and validate connectivity.</Text>

      <View style={styles.card}>
        <Text style={styles.section}>Provider</Text>
        <View style={styles.rowWrap}>
          {providers.map((item) => {
            const selected = item === provider;
            return (
              <Pressable
                key={item}
                onPress={async () => {
                  setProvider(item);
                  const fallbackModel = getDefaultModel(item);
                  setModel(fallbackModel);
                  await setAISettings({ provider: item, model: fallbackModel });
                  setStatus(null);
                }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{getProviderLabel(item)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>Model</Text>
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Enter model name"
          autoCapitalize="none"
          style={styles.input}
        />

        <View style={styles.rowWrap}>
          {modelHints.map((hint) => (
            <Pressable key={hint} onPress={() => setModel(hint)} style={styles.hintChip}>
              <Text style={styles.hintText}>{hint}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>{getProviderLabel(provider)} API Key</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          placeholder={`Enter ${getProviderLabel(provider)} API key`}
          autoCapitalize="none"
          secureTextEntry
          style={styles.input}
        />

        <View style={styles.actionRow}>
          <Button title="Save" onPress={handleSave} loading={saving} style={styles.flexBtn} />
          <Button title="Test" onPress={handleTest} loading={testing} variant="success" style={styles.flexBtn} />
          <Button title="Remove" onPress={handleRemove} variant="danger" style={styles.flexBtn} />
        </View>
      </View>

      {status && (
        <View style={[styles.status, status.kind === 'error' ? styles.statusError : status.kind === 'success' ? styles.statusSuccess : undefined]}>
          <Text style={styles.statusText}>{status.text}</Text>
        </View>
      )}

      <Button title="Back" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  section: {
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.xs,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E2EBFF',
  },
  chipText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: theme.colors.primary,
  },
  hintChip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    backgroundColor: theme.colors.surfaceMuted,
  },
  hintText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  status: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  statusError: {
    backgroundColor: '#FFE8E8',
  },
  statusSuccess: {
    backgroundColor: '#E4F9EF',
  },
  statusText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
});
