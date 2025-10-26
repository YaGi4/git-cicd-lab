const express = require('express');
const TaskManager = require('./src/taskManager');

const app = express();
const port = process.env.PORT || 3000;
const taskManager = new TaskManager();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API',
    version: '1.0.0',
    endpoints: [
      'GET /tasks - все задачи',
      'GET /tasks/:id - задача по ID',
      'POST /tasks - создать задачу',
      'PUT /tasks/:id - обновить задачу', 
      'DELETE /tasks/:id - удалить задачу',
      'GET /statuses - все статусы',
      'GET /tasks/status/:status - задачи по статусу'
    ]
  });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await taskManager.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await taskManager.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const task = await taskManager.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await taskManager.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (error) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Invalid status') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await taskManager.deleteTask(req.params.id);
    res.json({ message: 'Task deleted', task });
  } catch (error) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/statuses', (req, res) => {
  res.json(taskManager.getValidStatuses());
});

app.get('/tasks/status/:status', async (req, res) => {
  try {
    const tasks = await taskManager.getTasksByStatus(req.params.status);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Task Manager API running on port ${port}`);
  console.log(`📁 Data file: ./data/tasks.json`);
  console.log(`📝 API docs: http://localhost:${port}`);
});