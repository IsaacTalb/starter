import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import Button from './components/Button';

export default function Index() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f7f8fb' }}>
      <View style={{ marginTop: 48, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 8 }}>IdeaHub</Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>Capture ideas, save them locally, and get AI-powered insights and roadmaps.</Text>
        <Link href="/idea" asChild>
          <Button title="Open IdeaHub" />
        </Link>
      </View>

      <View style={{ marginTop: 36 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Features</Text>
        <Text style={{ color: '#444', marginBottom: 6 }}>• Save notes locally</Text>
        <Text style={{ color: '#444', marginBottom: 6 }}>• Securely store NVIDIA API key</Text>
        <Text style={{ color: '#444' }}>• Generate AI insights & roadmaps</Text>
      </View>
    </View>
  );
}
