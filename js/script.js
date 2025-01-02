const allTasksList = document.getElementById('allTasks');
const todayTasksList = document.getElementById('todayTasks');
const overdueTasksList = document.getElementById('overdueTasks');
const completedTasksList = document.getElementById('completedTasks');

const todaySection = document.getElementById('todaySection');
const overdueSection = document.getElementById('overdueSection');
const completedSection = document.getElementById('completedSection');
const allSection = document.getElementById('allSection');

    document.addEventListener('DOMContentLoaded', () => {
      loadTasksFromStorage();
      setDefaultDate();
    });

    function setDefaultDate() {
      const dueDateInput = document.getElementById('dueDateInput');
      const today = new Date().toISOString().split('T')[0];
      dueDateInput.value = today;
    }

    function toggleSectionVisibility() {
      todaySection.classList.toggle('hidden', todayTasksList.children.length === 0);
      overdueSection.classList.toggle('hidden', overdueTasksList.children.length === 0);
      completedSection.classList.toggle('hidden', completedTasksList.children.length === 0);
      allSection.classList.toggle('hidden', allTasksList.children.length === 0);
    }

    function addTask() {
      const taskInput = document.getElementById('taskInput');
      const dueDateInput = document.getElementById('dueDateInput');
      const priorityInput = document.getElementById('priorityInput');

      const taskText = taskInput.value;
      const dueDate = new Date(dueDateInput.value);
      const today = new Date();
      const priority = priorityInput.value;

      if (!taskText || !dueDateInput.value) {
        showNotification('Error', 'Please enter task text.', 'error');
        return;
      }

      const taskData = {
        text: taskText,
        dueDate: dueDateInput.value,
        priority,
        completed: false
      };

      saveTaskToStorage(taskData);
      renderTask(taskData);

      showNotification('Success', 'Task added successfully!', 'success');

      taskInput.value = '';
      setDefaultDate();
      priorityInput.value = 'Low';
    }


    // list of tasks
    function renderTask(taskData) {
        const today = new Date();
        const isOverdue = new Date(taskData.dueDate) < today.setHours(0, 0, 0, 0);
        const isToday = new Date(taskData.dueDate).toDateString() === today.toDateString();
  
        const backgroundColor = taskData.completed
          ? 'bg-green-100'
          : isOverdue
          ? 'bg-red-100'
          : isToday
          ? 'bg-yellow-100'
          : 'bg-white';
  
        const listItem = document.createElement('li');
        listItem.className = `p-4 border rounded flex justify-between items-center ${backgroundColor} ${taskData.completed ? 'line-through text-gray-500' : ''}`;
        listItem.innerHTML = `
          <div class="flex items-center space-x-4">
            <input type="checkbox" ${taskData.completed ? 'checked' : ''} onclick="toggleComplete(this, '${taskData.text}')" class="h-5 w-5">
            <div class="task-content">
              <p class="text-lg font-medium task-text">${taskData.text}</p>
              <p class="text-sm text-gray-600">Due: ${new Date(taskData.dueDate).toLocaleDateString()} | Priority: ${taskData.priority}</p>
            </div>
          </div>
          <button onclick="deleteTask(this)" class="p-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 hover:text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        `;
  
        listItem.dataset.dueDate = taskData.dueDate;
  
        allTasksList.appendChild(listItem);
  
        if (taskData.completed) {
          completedTasksList.appendChild(listItem.cloneNode(true));
        } else if (isOverdue) {
          overdueTasksList.appendChild(listItem.cloneNode(true));
        } else if (isToday) {
          todayTasksList.appendChild(listItem.cloneNode(true));
        }
  
        toggleSectionVisibility();
      }
  
      function toggleComplete(checkbox, taskText) {
        const taskData = getTaskFromStorage(taskText);
        taskData.completed = checkbox.checked;
        updateTaskInStorage(taskText, taskData);
  
        [allTasksList, todayTasksList, overdueTasksList, completedTasksList].forEach(list => {
          Array.from(list.children).forEach(task => {
            if (task.querySelector('.task-text').textContent === taskText) {
              list.removeChild(task);
            }
          });
        });
  
        if (!taskData.completed) {
          completedTasksList.querySelectorAll('.task-text').forEach(task => {
            if (task.textContent === taskText) {
              task.parentElement.parentElement.remove();
            }
          });
        }
  
        renderTask(taskData);
      }

    function deleteTask(button) {
      const listItem = button.closest('li');
      const taskText = listItem.querySelector('.task-text').textContent;

      removeTaskFromStorage(taskText);

      [allTasksList, todayTasksList, overdueTasksList, completedTasksList].forEach(list => {
        Array.from(list.children).forEach(task => {
          if (task.querySelector('.task-text').textContent === taskText) {
            list.removeChild(task);
          }
        });
      });

      showNotification('Deleted!', 'Your task has been deleted.', 'info');

      toggleSectionVisibility();
    }

    // Setting and getting tasks from Storage
    function saveTaskToStorage(task) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function getTaskFromStorage(taskText) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      return tasks.find(task => task.text === taskText);
    }

    function updateTaskInStorage(taskText, updatedTask) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const taskIndex = tasks.findIndex(task => task.text === taskText);
      if (taskIndex !== -1) {
        tasks[taskIndex] = updatedTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    }

    function removeTaskFromStorage(taskText) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      const updatedTasks = tasks.filter(task => task.text !== taskText);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }

    function loadTasksFromStorage() {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.forEach(renderTask);
    }

    function clearAllTasks() {
      localStorage.removeItem('tasks');
      [allTasksList, todayTasksList, overdueTasksList, completedTasksList].forEach(list => {
        list.innerHTML = '';
      });
      showNotification('Cleared!', 'All tasks have been cleared.', 'info');
      toggleSectionVisibility();
    }

    // custom notification
    function showNotification(title, message, type) {
      const notification = document.createElement('div');
      notification.className = `fixed top-5 right-5 px-12 py-4 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`;
      notification.innerHTML = `<strong>${title}</strong><p>${message}</p>`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }