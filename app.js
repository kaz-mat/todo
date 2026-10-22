const STORAGE_KEY = "todos";

const form = document.getElementById("add-form");
const input = document.getElementById("new-todo");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const filtersEl = document.getElementById("filters");
const clearBtn = document.getElementById("clear-done");

let todos = load();
let filter = "all";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 保存できない環境ではメモリ上のみで動作する
  }
}

function update() {
  save();
  render();
}

function render() {
  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  listEl.replaceChildren(...visible.map(renderItem));
  emptyEl.hidden = visible.length > 0;

  const remaining = todos.filter((t) => !t.done).length;
  countEl.textContent = `残り ${remaining} 件`;
  clearBtn.hidden = !todos.some((t) => t.done);

  for (const btn of filtersEl.children) {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  }
}

function renderItem(todo) {
  const li = document.createElement("li");
  li.className = "item" + (todo.done ? " done" : "");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = todo.done;
  check.setAttribute("aria-label", "完了にする");
  check.addEventListener("change", () => {
    todo.done = check.checked;
    update();
  });

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = todo.text;
  label.title = "ダブルクリックで編集";
  label.addEventListener("dblclick", () => startEdit(li, label, todo));

  const del = document.createElement("button");
  del.className = "delete";
  del.type = "button";
  del.textContent = "×";
  del.setAttribute("aria-label", "削除");
  del.addEventListener("click", () => {
    todos = todos.filter((t) => t.id !== todo.id);
    update();
  });

  li.append(check, label, del);
  return li;
}

function startEdit(li, label, todo) {
  const edit = document.createElement("input");
  edit.className = "edit";
  edit.value = todo.text;
  label.replaceWith(edit);
  edit.focus();
  edit.select();

  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    const text = edit.value.trim();
    if (commit && text) todo.text = text;
    update();
  };
  edit.addEventListener("keydown", (e) => {
    if (e.isComposing) return; // IME変換中のEnterは無視
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  edit.addEventListener("blur", () => finish(true));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: crypto.randomUUID(), text, done: false });
  input.value = "";
  update();
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  render();
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  update();
});

render();
