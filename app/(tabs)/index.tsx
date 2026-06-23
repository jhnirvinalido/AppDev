import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
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

  // ✅ PARA SA EDIT MODAL
  const [editVisible, setEditVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // ✅ CUSTOM POP-UP STATE
  const [popup, setPopup] = useState<{ visible: boolean; message: string; type: 'success' | 'danger' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // ✅ DELETE CONFIRMATION MODAL STATE
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  // ✅ TRIGGER POP-UP MESSAGE FUNCTION
  function showPopup(message: string, type: 'success' | 'danger' = 'success') {
    setPopup({ visible: true, message, type });
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 2500); // Automatically hides after 2.5 seconds
  }

  // ✅ READ
  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return console.log(error.message);
    setTasks(data || []);
  }

  // ✅ CREATE
  async function addTask() {
    if (!task.trim()) return;
    const { error } = await supabase
      .from('tasks')
      .insert([{ title: task, completed: false }]);
    if (error) { alert(error.message); return; }
    
    showPopup('Created successfully!', 'success'); // Trigger pop-up
    setTask('');
    loadTasks();
  }

  // ✅ TOGGLE COMPLETE
  async function toggleTask(item: Task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !item.completed })
      .eq('id', item.id);
    if (error) return console.log(error.message);
    loadTasks();
  }

  // ✅ OPEN DELETE CONFIRMATION POP-UP
  function confirmDelete(id: string) {
    setTaskToDelete(id);
    setDeleteModalVisible(true);
  }

  // ✅ DELETE
  async function deleteTask() {
    if (!taskToDelete) return;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskToDelete);
    
    setDeleteModalVisible(false);
    setTaskToDelete(null);

    if (error) { alert(error.message); return; }
    
    showPopup('Deleted successfully!', 'danger'); // Trigger pop-up
    loadTasks();
  }

  // ✅ OPEN EDIT MODAL
  function handleEdit(item: Task) {
    setEditTask(item);
    setEditTitle(item.title);
    setEditVisible(true);
  }

  // ✅ UPDATE
  async function updateTask() {
    if (!editTitle.trim() || !editTask) return;
    const { error } = await supabase
      .from('tasks')
      .update({ title: editTitle })
      .eq('id', editTask.id);
    if (error) { alert(error.message); return; }
    
    showPopup('Updated successfully!', 'success'); // Trigger pop-up
    setEditVisible(false);
    setEditTask(null);
    setEditTitle('');
    loadTasks();
  }

  return (
    <View style={styles.container}>
      
      {/* ✅ NOTIFICATION TOAST POP-UP (Renders at top of the screen) */}
      {popup.visible && (
        <View style={[styles.popupToast, popup.type === 'danger' ? styles.popupDanger : styles.popupSuccess]}>
          <MaterialIcons 
            name={popup.type === 'danger' ? 'delete-forever' : 'check-circle'} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.popupText}>{popup.message}</Text>
        </View>
      )}

      <Text style={styles.title}>TaskFlow</Text>

      {/* INPUT ROW */}
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
        <View key={item.id} style={styles.taskRow}>

          {/* TOGGLE CHECKBOX */}
          <TouchableOpacity onPress={() => toggleTask(item)}>
            <MaterialIcons
              name={item.completed ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={item.completed ? '#2E5BBA' : '#5A6472'}
            />
          </TouchableOpacity>

          {/* TASK TITLE */}
          <Text style={[styles.taskText, item.completed && styles.done]}>
            {item.title}
          </Text>

          {/* EDIT BUTTON */}
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
            <MaterialIcons name="edit" size={20} color="#2E5BBA" />
          </TouchableOpacity>

          {/* DELETE BUTTON */}
          <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
            <MaterialIcons name="delete" size={20} color="#E74C3C" />
          </TouchableOpacity>

        </View>
      ))}

      {/* ✅ EDIT MODAL */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setEditVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>

            <Text style={styles.modalTitle}>Edit Task</Text>

            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Update task title"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateTask}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>

      {/* ✅ CUSTOM DELETE CONFIRMATION POP-UP MODAL */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setDeleteModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={{ color: '#5A6472', marginBottom: 20 }}>Do you really want to delete this task? This action cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#E74C3C' }]} onPress={deleteTask}>
                <Text style={styles.saveText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', position: 'relative' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 40, marginBottom: 10 },

  inputRow: { flexDirection: 'row', marginVertical: 20 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc',
    padding: 10, borderRadius: 8, marginRight: 10,
  },
  addButton: {
    backgroundColor: '#2E5BBA', paddingHorizontal: 16,
    justifyContent: 'center', borderRadius: 8,
  },

  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  taskText: { flex: 1, marginLeft: 10, fontSize: 15 },
  done: { textDecorationLine: 'line-through', color: '#999' },
  iconBtn: { paddingHorizontal: 6 },

  // MODAL STYLES
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', padding: 24,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2A44' },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelText: { color: '#5A6472', fontWeight: 'bold', paddingVertical: 10, paddingHorizontal: 4 },
  saveButton: {
    backgroundColor: '#2E5BBA', borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  saveText: { color: '#fff', fontWeight: 'bold', paddingVertical: 10 },

  // ✅ CUSTOM IN-APP TOAST POPUP STYLES
  popupToast: {
    position: 'absolute', top: 50, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10,
    zIndex: 999, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  popupSuccess: { backgroundColor: '#2ECC71' },
  popupDanger: { backgroundColor: '#E74C3C' },
  popupText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});