import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('LOAD ERROR:', error.message);
      Alert.alert('Load Error', error.message);
      return;
    }

    setTasks(data ?? []);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // =========================
  // ADD TASK
  // =========================
  const addTask = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Task cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .insert([{ title: task, completed: false }]);

    if (error) {
      console.log('ADD ERROR:', error.message);
      Alert.alert('Add failed', error.message);
      return;
    }

    setTask('');
    loadTasks();
  };

  // =========================
  // TOGGLE TASK
  // =========================
  const toggleTask = async (item: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !item.completed })
      .eq('id', item.id);

    if (error) {
      console.log('UPDATE ERROR:', error.message);
      Alert.alert('Update failed', error.message);
      return;
    }

    loadTasks();
  };

  // =========================
  // DELETE TASK (IMPORTANT FIX)
  // =========================
  const deleteTask = async (id: string) => {
    console.log('🗑 DELETE REQUEST:', id);

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select(); // IMPORTANT: verifies delete

    if (error) {
      console.log('❌ DELETE ERROR:', error.message);
      Alert.alert('Delete failed', error.message);
      return;
    }

    console.log('✅ DELETE SUCCESS DATA:', data);

    if (!data || data.length === 0) {
      Alert.alert(
        'Delete blocked',
        'No row deleted. Check Supabase RLS policy.'
      );
      return;
    }

    Alert.alert('Success', 'Task deleted successfully');
    loadTasks();
  };

  // =========================
  // CONFIRM POPUP
  // =========================
  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(id),
        },
      ]
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <View style={styles.container}>
      <Text style={styles.header}>TaskFlow</Text>

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Enter Task"
        />

        <Pressable style={styles.addBtn} onPress={addTask}>
          <MaterialIcons name="add" size={30} color="white" />
        </Pressable>
      </View>

      {/* LIST */}
      {tasks.map((item) => (
        <View key={item.id} style={styles.taskRow}>
          
          {/* TOGGLE */}
          <Pressable onPress={() => toggleTask(item)}>
            <MaterialIcons
              name={item.completed ? 'check-box' : 'check-box-outline-blank'}
              size={26}
              color="#2E5BBA"
            />
          </Pressable>

          {/* TITLE */}
          <Text style={[styles.taskText, item.completed && styles.done]}>
            {item.title}
          </Text>

          {/* DELETE BUTTON (BIG + CLICK EFFECT) */}
          <Pressable
            onPress={() => confirmDelete(item.id)}
            style={({ pressed, hovered }) => [
              styles.deleteBtn,
              hovered && styles.deleteHover,
              pressed && styles.deletePressed,
            ]}
          >
            <MaterialIcons name="delete" size={26} color="white" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
  },

  addBtn: {
    backgroundColor: '#2E5BBA',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  taskText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 10,
  },

  done: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  // DELETE BUTTON
  deleteBtn: {
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 12,
  },

  deleteHover: {
    backgroundColor: '#ff6b6b',
    transform: [{ scale: 1.1 }],
  },

  deletePressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.6,
  },
});