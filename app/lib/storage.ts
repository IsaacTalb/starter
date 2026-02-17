import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple RN-safe id generator to avoid Node `crypto` dependency issues.
function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  // Conversation messages (chat history of insights)
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: number;
  }>;
};

const NOTES_KEY = 'ideas_notes_v1';

export async function getNotes(): Promise<Note[]> {
  try {
    const json = await AsyncStorage.getItem(NOTES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
}

export async function saveNotes(notes: Note[]) {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function createNote(): Promise<Note> {
  const note: Note = {
    id: genId(),
    title: 'Untitled',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  const notes = await getNotes();
  notes.unshift(note);
  await saveNotes(notes);
  return note;
}

export async function getNote(id: string): Promise<Note | undefined> {
  const notes = await getNotes();
  return notes.find((n) => n.id === id);
}

export async function updateNote(updated: Partial<Note> & { id: string }) {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === updated.id);
  if (idx >= 0) {
    notes[idx] = { ...notes[idx], ...updated, updatedAt: Date.now() } as Note;
  } else {
    notes.unshift({ ...(updated as Note), updatedAt: Date.now(), createdAt: Date.now() });
  }
  await saveNotes(notes);
}

export async function appendMessage(noteId: string, message: { role: 'user' | 'assistant' | 'system'; content: string }) {
  const notes = await getNotes();
  const idx = notes.findIndex((n) => n.id === noteId);
  const msg = { id: genId(), role: message.role, content: message.content, createdAt: Date.now() };
  if (idx >= 0) {
    const note = notes[idx] as Note;
    note.messages = note.messages ? [...note.messages, msg] : [msg];
    note.updatedAt = Date.now();
    notes[idx] = note;
  } else {
    // create a new note with this message (unlikely)
    const note: Note = { id: noteId, title: 'Untitled', content: '', createdAt: Date.now(), updatedAt: Date.now(), messages: [msg] };
    notes.unshift(note);
  }
  await saveNotes(notes);
  return msg;
}

export async function getConversation(noteId: string) {
  const note = await getNote(noteId);
  return note?.messages ?? [];
}

export async function deleteNote(id: string) {
  const notes = await getNotes();
  const filtered = notes.filter((n) => n.id !== id);
  await saveNotes(filtered);
}
