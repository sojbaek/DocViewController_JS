class TodoViewController {

  constructor(documentModel) {

    this.doc = documentModel;

    this.input = document.getElementById("taskInput");
    this.button = document.getElementById("addButton");

    this.delButton = document.getElementById("delButton");

    this.list = document.getElementById("taskList");
    this.notification = document.getElementById("notification");

    this.button.addEventListener(
      "click",
      () => this.handleAddTask()
    );

    this.delButton.addEventListener(
      "click",
      () => this.handleDeleteTask()
    );

    this.doc.addListener(
      (event, data) => this.documentChanged(event, data)
    );

  }

  handleAddTask() {
    const task = this.input.value;
    if(task === "") return;
    this.doc.addTask(task);
    this.input.value = "";
  }

  handleDeleteTask() {
    this.doc.handleDeleteLast();
  }

  documentChanged(event, data) {
    if(event === "taskAdded") {
      this.render();
      this.notification.textContent =
        "Document changed: new task added -> " + data;
    }

    if(event === "taskDeleted") {
      this.render();
      this.notification.textContent =
        "Document changed: task deleted -> " + data;
    }
  }

  render() {
    this.list.innerHTML = "";
    const tasks = this.doc.getTasks();
    tasks.forEach(function(task){
      const li = document.createElement("li");
      li.textContent = task;
      document.getElementById("taskList").appendChild(li);
    });
  }

}


const documentModel = new TodoDocument();
const controller = new TodoViewController(documentModel);