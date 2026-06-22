import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

  // LOAD TASKS (READ)
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Load error:', error.message);
      return;
    }

    setTasks(data || []);
  }

  // CREATE TASK
  async function addTask() {
    if (task.trim() === '') return;

    const { error } = await supabase
      .from('tasks')
      .insert([{ title: task, completed: false }]);

    if (error) {
      console.log('Add error:', error.message);
      return;
    }

    setTask('');
    loadTasks();
  }

  // TOGGLE COMPLETE (UPDATE)
  async function toggleTask(item: Task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !item.completed })
      .eq('id', item.id);

    if (error) {
      console.log('Update error:', error.message);
      return;
    }

    loadTasks();
  }

  // DELETE TASK
  async function deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Delete error:', error.message);
      return;
    }

    loadTasks();
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={headerStyles.header}>
        <Text style={headerStyles.title}>TaskFlow</Text>
      </View>

      {/* INPUT */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter Task"
          value={task}
          onChangeText={setTask}
        />

        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <MaterialIcons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* TASK LIST */}
      {tasks.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => toggleTask(item)}
          onLongPress={() => deleteTask(item.id)}
          style={styles.taskRow}
        >
          {/* CHECKBOX */}
          <MaterialIcons
            name={
              item.completed
                ? 'check-box'
                : 'check-box-outline-blank'
            }
            size={20}
            color={item.completed ? '#2E5BBA' : '#5A6472'}
          />

          {/* TEXT */}
          <Text
            style={[
              styles.taskText,
              item.completed && styles.completedText,
            ]}
          >
            {item.title}
          </Text>

          {/* DELETE ICON (optional visual hint) */}
          <MaterialIcons name="delete" size={18} color="#E74C3C" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* HEADER */
const headerStyles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2A44',
  },
});

/* MAIN */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },

  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },

  addButton: {
    backgroundColor: '#2E5BBA',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  taskText: {
    fontSize: 15,
    flex: 1,
  },

  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});