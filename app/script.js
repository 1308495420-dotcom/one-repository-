// ========== 数据管理 ==========
var STORAGE_KEY = 'todo_assistant_data';

function loadTodos() {
  var raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

var todos = loadTodos();
var currentFilter = 'all';

// ========== 核心逻辑 ==========
function addTodo() {
  var input = document.getElementById('todoInput');
  var text = input.value.trim();
  if (!text) return;

  todos.push({
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toLocaleString('zh-CN')
  });

  saveTodos(todos);
  input.value = '';
  input.focus();
  render();
}

function toggleTodo(id) {
  var todo = findTodo(id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos(todos);
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter(function(t) { return t.id !== id; });
  saveTodos(todos);
  render();
}

function clearCompleted() {
  var hasCompleted = todos.some(function(t) { return t.completed; });
  if (!hasCompleted) return;

  todos = todos.filter(function(t) { return !t.completed; });
  saveTodos(todos);
  render();
}

function setFilter(filter, btn) {
  currentFilter = filter;
  var buttons = document.querySelectorAll('.filters button');
  buttons.forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  render();
}

// ========== 工具函数 ==========
function findTodo(id) {
  return todos.find(function(t) { return t.id === id; });
}

function getFilteredTodos() {
  if (currentFilter === 'active') return todos.filter(function(t) { return !t.completed; });
  if (currentFilter === 'completed') return todos.filter(function(t) { return t.completed; });
  return todos;
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== 渲染 ==========
function render() {
  var list = document.getElementById('todoList');
  var filtered = getFilteredTodos();
  var activeCount = todos.filter(function(t) { return !t.completed; }).length;

  // 更新计数
  document.getElementById('count').textContent = activeCount + ' 项任务';

  // 空状态
  if (filtered.length === 0) {
    var msg = currentFilter === 'completed' ? '还没有已完成的任务' :
              currentFilter === 'active' ? '所有任务都完成了 🎉' :
              '还没有任务，快来添加吧 ✨';
    list.innerHTML = '<li class="empty"><div class="icon">📋</div><div>' + msg + '</div></li>';
    return;
  }

  // 渲染列表
  list.innerHTML = filtered.map(function(t) {
    return '<li class="' + (t.completed ? 'completed' : '') + '">' +
      '<div class="checkbox" data-id="' + t.id + '"></div>' +
      '<span class="text">' + escapeHtml(t.text) + '</span>' +
      '<span class="time">' + t.createdAt + '</span>' +
      '<button class="delete" data-id="' + t.id + '" title="删除">×</button>' +
    '</li>';
  }).join('');
}

// ========== 事件委托 ==========
document.getElementById('todoList').addEventListener('click', function(e) {
  var target = e.target;
  var id = Number(target.getAttribute('data-id'));

  if (target.classList.contains('checkbox')) {
    toggleTodo(id);
  }

  if (target.classList.contains('delete')) {
    deleteTodo(id);
  }
});

// ========== 初始化 ==========
function showDate() {
  var now = new Date();
  var week = ['日', '一', '二', '三', '四', '五', '六'];
  document.getElementById('dateText').textContent =
    now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 星期' + week[now.getDay()];
}

document.getElementById('todoInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTodo();
});

document.getElementById('addBtn').addEventListener('click', addTodo);

document.getElementById('clearBtn').addEventListener('click', clearCompleted);

document.querySelectorAll('.filters button').forEach(function(btn) {
  btn.addEventListener('click', function() {
    setFilter(this.getAttribute('data-filter'), this);
  });
});

showDate();
render();
