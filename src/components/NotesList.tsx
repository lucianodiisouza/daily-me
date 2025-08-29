import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { notesStorage, Note } from '../storage/notesStorage';

interface NotesListProps {
  onNotePress: (note: Note) => void;
  onNewNote: () => void;
}

export default function NotesList({ onNotePress, onNewNote }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadNotes = useCallback(() => {
    const allNotes = notesStorage.getAllNotes();
    setNotes(allNotes);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Recarregar notas quando o componente receber foco
  useEffect(() => {
    const unsubscribe = () => {
      // Este efeito será executado quando o componente voltar a ter foco
      loadNotes();
    };

    return unsubscribe;
  }, [loadNotes]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const searchResults = notesStorage.searchNotes(query);
      setNotes(searchResults);
    } else {
      loadNotes();
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Deletar Nota',
      'Tem certeza que deseja deletar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => {
            notesStorage.deleteNote(noteId);
            loadNotes();
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoje';
    } else if (diffDays === 2) {
      return 'Ontem';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getNotePreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => onNotePress(item)}
      onLongPress={() => handleDeleteNote(item.id)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || 'Sem título'}
        </Text>
        <Text style={styles.noteDate}>
          {formatDate(item.updatedAt)}
        </Text>
      </View>
      <Text style={styles.notePreview} numberOfLines={2}>
        {getNotePreview(item.content)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Notas</Text>
        <TouchableOpacity style={styles.newNoteButton} onPress={onNewNote}>
          <Text style={styles.newNoteButtonText}>+ Nova Nota</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar notas..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity style={styles.createFirstNoteButton} onPress={onNewNote}>
              <Text style={styles.createFirstNoteButtonText}>Criar primeira nota</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          style={styles.notesList}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={loadNotes}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newNoteButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  newNoteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notesList: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  notePreview: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  createFirstNoteButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  createFirstNoteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
