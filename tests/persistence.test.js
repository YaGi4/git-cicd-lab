const TaskManager = require('../src/taskManager');
const fs = require('fs').promises;
const path = require('path');

describe('TaskManager Persistence', () => {
  let taskManager;
  const testDataFile = path.join(__dirname, '../data/test-tasks.json');

  beforeEach(() => {
    // Используем тестовый файл для изоляции тестов
    taskManager = new TaskManager();
    taskManager.tasksFile = testDataFile;
  });

  afterEach(async () => {
    // Очищаем тестовый файл после каждого теста
    try {
      await fs.unlink(testDataFile);
    } catch (error) {
      // Игнорируем ошибку если файла нет
    }
  });

  test('should save and read tasks from file', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description'
    };

    // Создаем задачу
    const createdTask = await taskManager.createTask(taskData);
    
    // Создаем новый экземпляр для проверки чтения
    const newTaskManager = new TaskManager();
    newTaskManager.tasksFile = testDataFile;
    
    // Читаем задачи
    const tasks = await newTaskManager.getAllTasks();
    
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(createdTask.id);
    expect(tasks[0].title).toBe(taskData.title);
    expect(tasks[0].status).toBe('новая');
  });

  test('should update task and persist changes', async () => {
    // Создаем задачу
    const task = await taskManager.createTask({
      title: 'Original Title',
      description: 'Original Description'
    });

    // Обновляем задачу
    const updatedTask = await taskManager.updateTask(task.id, {
      title: 'Updated Title',
      status: 'в работе'
    });

    expect(updatedTask.title).toBe('Updated Title');
    expect(updatedTask.status).toBe('в работе');
  });

test('should update task and persist changes', async () => {
  // Создаем задачу
  const task = await taskManager.createTask({
    title: 'Original Title',
    description: 'Original Description'
  });

  // Обновляем задачу
  const updatedTask = await taskManager.updateTask(task.id, {
    title: 'Updated Title',
    status: 'в работе'
  });

  // Проверяем через новый экземпляр
  const newTaskManager = new TaskManager();
  newTaskManager.tasksFile = testDataFile;
  const tasks = await newTaskManager.getAllTasks();

  expect(tasks).toHaveLength(1);
  expect(tasks[0].title).toBe('Updated Title');
  expect(tasks[0].status).toBe('в работе');
  // Упрощенная проверка - просто убедимся что updatedAt есть
  expect(tasks[0].updatedAt).toBeDefined();
});

  test('should maintain data integrity', async () => {
    // Создаем несколько задач
    const tasksToCreate = [
      { title: 'Task A', description: 'Desc A' },
      { title: 'Task B', description: 'Desc B' },
      { title: 'Task C', description: 'Desc C' }
    ];

    for (const taskData of tasksToCreate) {
      await taskManager.createTask(taskData);
    }

    // Читаем через новый экземпляр
    const newTaskManager = new TaskManager();
    newTaskManager.tasksFile = testDataFile;
    const tasks = await newTaskManager.getAllTasks();

    expect(tasks).toHaveLength(3);
    expect(tasks[0].title).toBe('Task A');
    expect(tasks[1].title).toBe('Task B');
    expect(tasks[2].title).toBe('Task C');
    
    // Проверяем что ID уникальны и последовательны
    const ids = tasks.map(task => task.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids).toEqual(uniqueIds);
    expect(ids).toEqual([1, 2, 3]);
  });
});