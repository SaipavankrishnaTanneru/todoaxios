import React, { useEffect, useState } from "react";
import './App.css';
import axios from "axios";

type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

const apiurl = "http://localhost:8015/api/tasks";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createTodo = async (newTodo: Omit<Todo, 'id'>): Promise<Todo> => {
    try {
      const response = await axios.post<Todo>(apiurl, newTodo);
      console.log('Task Created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const getTodos = async (): Promise<Todo[]> => {
    try {
      const response = await axios.get<Todo[]>(apiurl);
      console.log('Todo Fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const todosData = await getTodos();
        setTodos(todosData);
      } catch (error) {
        setError('Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const updateTodo = async (todoId: number, updatedTodo: Partial<Todo>): Promise<Todo> => {
    try {
      const response = await axios.put<Todo>(`${apiurl}/${todoId}`, updatedTodo);
      console.log('Todo updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating Todo:', error);
      throw error;
    }
  };

  const deleteTodo = async (todoId: number): Promise<void> => {
    try {
      await axios.delete(`${apiurl}/${todoId}`);
      console.log('Todo deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (isEditing && editId !== null) {
        const updatedTodo = { 
          title, 
          description,
          completed: todos.find(todo => todo.id === editId)?.completed || false
        };
        const response = await updateTodo(editId, updatedTodo);
        setTodos(todos.map(todo => todo.id === editId ? response : todo));
        setIsEditing(false);
        setEditId(null);
      } else {
        const newTodo = {
          title,
          description,
          completed: false,
        };
        const createdTodo = await createTodo(newTodo);
        setTodos([...todos, createdTodo]);
      }

      setTitle("");
      setDescription("");
    } catch (error) {
      setError('Failed to save changes');
    }
  };

  const handleEdit = (todo: Todo) => {
    setIsEditing(true);
    setEditId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      setError('Failed to delete todo');
    }
  };

  const toggleComplete = async (id: number) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    try {
      const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };
      const response = await updateTodo(id, { completed: updatedTodo.completed });
      setTodos(todos.map(todo => todo.id === id ? response : todo));
    } catch (error) {
      setError('Failed to update todo status');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="App">
      <h1>Todo App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">
          {isEditing ? "Update Todo" : "Add Todo"}
        </button>
      </form>

      <div className="todos">
        {todos.map(todo => (
          <div key={todo.id} className={`todo ${todo.completed ? "completed" : ""}`}>
            <div>
              <h3>{todo.title}</h3>
              <p>{todo.description}</p>
            </div>
            <div>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id)}
              />
              <button onClick={() => handleEdit(todo)}>Edit</button>
              <button onClick={() => handleDelete(todo.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;