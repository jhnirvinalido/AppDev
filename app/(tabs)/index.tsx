import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  // LOAD TASKS (AsyncStorage)
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const data = await AsyncStorage.getItem('TASKS');
    if (data) {
      setTasks(JSON.parse(data));
    }
  }

  async function saveTasks(updatedTasks: Task[]) {
    setTasks(updatedTasks);
    await AsyncStorage.setItem('TASKS', JSON.stringify(updatedTasks));
  }

  function handleAddTask() {
    if (task.trim() === '') return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: task,
      completed: false,
    };

    const updated = [...tasks, newTask];
    saveTasks(updated);
    setTask('');
  }

  function toggleTask(id: string) {
    const updated = tasks.map((item) =>
      item.id === id
        ? { ...item, completed: !item.completed }
        : item
    );

    saveTasks(updated);
  }

  function deleteTask(id: string) {
    const updated = tasks.filter((item) => item.id !== id);
    saveTasks(updated);
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

        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <MaterialIcons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* TASK LIST */}
      {tasks.map((item) => (
        <View key={item.id} style={styles.taskRow}>
          {/* TOGGLE CHECKBOX */}
          <TouchableOpacity onPress={() => toggleTask(item.id)}>
            <MaterialIcons
              name={
                item.completed
                  ? 'check-box'
                  : 'check-box-outline-blank'
              }
              size={20}
              color={item.completed ? '#2E5BBA' : '#5A6472'}
            />
          </TouchableOpacity>

          {/* TEXT */}
          <Text
            style={[
              styles.taskText,
              item.completed && styles.completedText,
            ]}
          >
            {item.title}
          </Text>

          {/* DELETE BUTTON */}
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <MaterialIcons name="delete" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

/* HEADER STYLE */
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

/* MAIN STYLE */
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