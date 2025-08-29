import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Platform,
} from 'react-native';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { notesStorage, Note } from '../storage/notesStorage';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export default function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const insets = useSafeAreaInsets();
  const richTextRef = useRef(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [note]);

  const extractTitleFromContent = (htmlContent: string): string => {
    // Remove tags HTML e pega a primeira linha
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    const firstLine = plainText.split('\n')[0];
    return firstLine || '';
  };

  const handleSave = async () => {
    const extractedTitle = extractTitleFromContent(content);
    const finalTitle = title.trim() || extractedTitle || 'Sem título';
    
    if (!finalTitle && !content.trim()) {
      Alert.alert('Erro', 'A nota deve ter pelo menos um título ou conteúdo.');
      return;
    }

    try {
      let savedNote: Note;

      if (note) {
        // Atualizar nota existente
        const updatedNote = notesStorage.updateNote(note.id, {
          title: finalTitle,
          content: content.trim() || '',
        });
        
        if (updatedNote) {
          savedNote = updatedNote;
        } else {
          throw new Error('Erro ao atualizar nota');
        }
      } else {
        // Criar nova nota
        savedNote = notesStorage.saveNote({
          title: finalTitle,
          content: content.trim() || '',
        });
      }

      onSave(savedNote);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a nota. Tente novamente.');
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Descartar alterações',
        'Tem certeza que deseja descartar as alterações?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel();
    }
  };

  const handleEditorFocus = () => {
    setIsEditorFocused(true);
  };

  const handleEditorBlur = () => {
    setIsEditorFocused(false);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    // Se não houver título definido, extrai da primeira linha do conteúdo
    if (!title.trim()) {
      const extractedTitle = extractTitleFromContent(text);
      if (extractedTitle) {
        setTitle(extractedTitle);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {note ? 'Editar Nota' : 'Nova Nota'}
        </Text>
        
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, styles.saveButtonText]}>
            Salvar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.editorContainer}>
        <RichEditor
          ref={richTextRef}
          style={styles.textInput}
          placeholder="Comece a escrever..."
          initialContentHTML={content}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
          onChange={handleContentChange}
        />
      </View>
      
      {/* RichToolbar aparece quando o editor está focado OU quando o teclado está aberto */}
      {(isEditorFocused || keyboardHeight > 0) && (
        <View style={[
          styles.toolbarContainer, 
          { 
            bottom: keyboardHeight > 0 ? keyboardHeight : 0,
            position: keyboardHeight > 0 ? 'absolute' : 'relative'
          }
        ]}>
          <RichToolbar editor={richTextRef} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButtonText: {
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
  toolbarContainer: {
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === "ios" ? 0 : 8,
  },
});
