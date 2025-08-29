import { MMKV } from 'react-native-mmkv';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

class NotesStorage {
  private storage: MMKV;

  constructor() {
    this.storage = new MMKV({
      id: 'notes-storage',
    });
  }

  // Salvar uma nova nota
  saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const id = Date.now().toString();
    const now = Date.now();
    
    const newNote: Note = {
      ...note,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const notes = this.getAllNotes();
    notes.push(newNote);
    this.storage.set('notes', JSON.stringify(notes));

    return newNote;
  }

  // Atualizar uma nota existente
  updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null {
    const notes = this.getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) return null;

    const updatedNote: Note = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    notes[noteIndex] = updatedNote;
    this.storage.set('notes', JSON.stringify(notes));

    return updatedNote;
  }

  // Buscar uma nota por ID
  getNote(id: string): Note | null {
    const notes = this.getAllNotes();
    return notes.find(note => note.id === id) || null;
  }

  // Buscar todas as notas
  getAllNotes(): Note[] {
    try {
      const notesJson = this.storage.getString('notes');
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      return [];
    }
  }

  // Deletar uma nota
  deleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    
    if (filteredNotes.length === notes.length) return false;
    
    this.storage.set('notes', JSON.stringify(filteredNotes));
    return true;
  }

  // Buscar notas por título (busca)
  searchNotes(query: string): Note[] {
    const notes = this.getAllNotes();
    const lowerQuery = query.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Limpar todas as notas
  clearAllNotes(): void {
    this.storage.delete('notes');
  }
}

export const notesStorage = new NotesStorage();
