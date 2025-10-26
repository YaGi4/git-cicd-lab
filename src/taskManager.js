const fs = require('fs').promises;
const path = require('path');

class TaskManager {
  constructor() {
    this.tasksFile = path.join(__dirname, '../data/tasks.json');
    this.validStatuses = ['новая', 'в работе', 'выполнена'];
  }

  async readTasks() {
    try {
      const data = await fs.readFile(this.tasksFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Если файла нет, возвращаем пустой массив
      return [];
    }
  }

  async writeTasks(tasks) {
    await fs.mkdir(path.dirname(this.tasksFile), { recursive: true });
    await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2));
  }

  async getAllTasks() {
    return await this.readTasks();
  }

  async getTaskById(id) {
    const tasks = await this.readTasks();
    return tasks.find(task => task.id === parseInt(id));
  }

  async createTask(taskData) {
    const { title, description } = taskData;
    
    if (!title) {
      throw new Error('Title is required');
    }

    const tasks = await this.readTasks();
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
    const nextId = maxId + 1;

    const newTask = {
      id: nextId,
      title,
      description: description || '',
      status: 'новая',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await this.writeTasks(tasks);
    return newTask;
  }

  async updateTask(id, updateData) {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id));

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const { title, description, status } = updateData;

    if (status && !this.validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: title || tasks[taskIndex].title,
      description: description !== undefined ? description : tasks[taskIndex].description,
      status: status || tasks[taskIndex].status,
      updatedAt: new Date().toISOString()
    };

    await this.writeTasks(tasks);
    return tasks[taskIndex];
  }

  async deleteTask(id) {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id));

    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    await this.writeTasks(tasks);
    return deletedTask;
  }

  getValidStatuses() {
    return this.validStatuses;
  }

  async getTasksByStatus(status) {
    const tasks = await this.readTasks();
    return tasks.filter(task => task.status === status);
  }
}

module.exports = TaskManager;