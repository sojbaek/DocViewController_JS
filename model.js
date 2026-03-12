class TodoDocument {

  constructor() {
    this.tasks = [];
    this.listeners = [];
  }

  addTask(task) {

    this.tasks.push(task);

    this.notifyChange("taskAdded", task);

  }

  deleteLastTask() {
    if (this.tasks.length === 0) return;
    const deletedTask = this.tasks.pop();
    this.notifyChange("taskDeleted", deletedTask);
  }

  getTasks() {
    return this.tasks;
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  notifyChange(event, data) {

    this.listeners.forEach(function(listener) {

      listener(event, data);

    });

  }

}