function AddTask() {
    const InputTask = document.getElementById('InformationTask');
    const Text = InputTask.value.trim();
    if (Text !== '') {
      const List = document.getElementById('List');
      const ListItem = document.createElement('li');
      ListItem.textContent = Text;
      ListItem.innerHTML = `
        <span>${Text}</span>
        <button onclick="EditTask()">
          <img src="img/pen.png" alt="" />
        </button>
        <button onclick="DeleteTask()">
          <img src="img/x (1).png" alt="" />
        </button>
      `;
      List.appendChild(ListItem);
      InputTask.value = '';
    } else {
      alert('Informe uma Nota !!!');
    }
  }
  function EditTask() {
    const InputTask = document.getElementById('InformationTask');
    const Text = InputTask.value.trim();
    if (Text !== '') {
      const List = document.getElementById('List');
      const ListItems = List.getElementsByTagName('li');
      const ClickedButton = event.target.closest('button');
      const ListItem = ClickedButton.closest('li');
      const Index = Array.from(ListItems).indexOf(ListItem);
      if (Index !== -1) {
        ListItems[Index].querySelector('span').textContent = Text;
        InputTask.value = '';
      }
    } else {
      alert('Informe um novo texto para editar !!!');
    }
  }
  function DeleteTask() {
    const List = document.getElementById('List');
    const ListItems = List.getElementsByTagName('li');
    const ClickedButton = event.target.closest('button');
    const ListItem = ClickedButton.closest('li');
    const Index = Array.from(ListItems).indexOf(ListItem);
    if (Index !== -1) {
      ListItems[Index].remove();
    }
  }
  const AddTaskButton = document
    .getElementById('AddTask')
    .addEventListener('click', AddTask);
  