(function () {
  "use strict";

  var STORAGE_KEY = "harbor-tracker-v1";
  var state = loadItems();
  var dialog = document.getElementById("case-dialog");
  var form = document.getElementById("case-form");
  var list = document.getElementById("tracker-list");
  var empty = document.getElementById("tracker-empty");
  var toast = document.getElementById("toast");
  var toastTimer;

  function loadItems() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      var parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveItems() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      showToast("Could not save locally. Check browser storage settings.");
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 3000);
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value + "T00:00:00");
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function renderItems() {
    list.innerHTML = "";
    empty.hidden = state.length > 0;
    state.slice().sort(function (a, b) {
      return (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31");
    }).forEach(function (item) {
      var row = document.createElement("div");
      row.className = "tracker-item" + (item.done ? " done" : "");
      var check = document.createElement("button");
      check.className = "tracker-check" + (item.done ? " done" : "");
      check.type = "button";
      check.setAttribute("aria-label", item.done ? "Mark " + item.title + " incomplete" : "Mark " + item.title + " complete");
      check.textContent = item.done ? "✓" : "";
      check.addEventListener("click", function () {
        item.done = !item.done;
        saveItems();
        renderItems();
      });
      var content = document.createElement("div");
      var title = document.createElement("h4");
      title.textContent = item.title;
      var detail = document.createElement("p");
      detail.textContent = (item.kind === "deadline" ? "Deadline" : item.kind === "document" ? "Document" : "Case") + (item.notes ? " · " + item.notes : "");
      content.appendChild(title);
      content.appendChild(detail);
      var actions = document.createElement("div");
      if (item.date) {
        var date = document.createElement("span");
        date.className = "tracker-date";
        date.textContent = formatDate(item.date);
        actions.appendChild(date);
      }
      var remove = document.createElement("button");
      remove.className = "delete-item";
      remove.type = "button";
      remove.setAttribute("aria-label", "Delete " + item.title);
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        state = state.filter(function (entry) { return entry.id !== item.id; });
        saveItems();
        renderItems();
        showToast("Item removed");
      });
      actions.appendChild(remove);
      row.appendChild(check);
      row.appendChild(content);
      row.appendChild(actions);
      list.appendChild(row);
    });
  }

  function openDialog() {
    form.reset();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.getElementById("case-title").focus();
  }

  document.getElementById("add-case-button").addEventListener("click", openDialog);
  document.getElementById("empty-add-button").addEventListener("click", openDialog);
  document.getElementById("cancel-case-button").addEventListener("click", function () { dialog.close(); });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    state.push({
      id: Date.now().toString(36),
      title: data.get("title").trim(),
      kind: data.get("kind"),
      date: data.get("date"),
      notes: data.get("notes").trim(),
      done: false
    });
    saveItems();
    renderItems();
    dialog.close();
    showToast("Saved to this browser");
  });

  document.querySelectorAll(".filter-button").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".filter-button").forEach(function (item) { item.classList.remove("active"); });
      button.classList.add("active");
      var filter = button.getAttribute("data-filter");
      document.querySelectorAll(".pathway-card").forEach(function (card) {
        card.classList.toggle("hidden", filter !== "all" && card.getAttribute("data-category") !== filter);
      });
    });
  });

  document.getElementById("export-button").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ app: "harbor", version: 1, exportedAt: new Date().toISOString(), items: state }, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "harbor-tracker-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  });

  document.getElementById("import-input").addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var imported = JSON.parse(reader.result);
        var items = Array.isArray(imported) ? imported : imported.items;
        if (!Array.isArray(items) || items.some(function (item) { return !item || typeof item.title !== "string"; })) throw new Error("Invalid backup");
        state = items.map(function (item) {
          return { id: item.id || Date.now().toString(36) + Math.random(), title: item.title.slice(0, 80), kind: item.kind || "case", date: item.date || "", notes: item.notes || "", done: Boolean(item.done) };
        });
        saveItems();
        renderItems();
        showToast("Backup imported");
      } catch (error) {
        showToast("That backup file could not be read");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("privacy-button").addEventListener("click", function () {
    document.getElementById("tracker").scrollIntoView({ behavior: "smooth" });
    showToast("Your tracker is stored only in this browser");
  });

  renderItems();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
}());
