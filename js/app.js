

/*
// bootstrap
const exampleModal = document.getElementById('exampleModal')
exampleModal.addEventListener('show.bs.modal', event => {
  // Button that triggered the modal
  const button = event.relatedTarget
  // Extract info from data-bs-* attributes
  const recipient = button.getAttribute('data-bs-whatever')
  // If necessary, you could initiate an AJAX request here
  // and then do the updating in a callback.
  //
  // Update the modal's content.
  const modalTitle = exampleModal.querySelector('.modal-title')
  const modalBodyInput = exampleModal.querySelector('.modal-body input')

  modalTitle.textContent = `New message to ${recipient}`
  modalBodyInput.value = recipient
})
*/

const task_statuses = { new: 'New', progress: 'In Progress', complete: 'Complete' };
const task_priorities = { low: 'Low', normal: 'Normal', high: 'High' };

const exampleModal = document.getElementById('exampleModal');
const task_item_template = document.querySelector('#task_item_template');
const task_table = document.querySelector('#task_table');

const create_task_button = exampleModal.querySelector('[name="create_task"]');
const task_subject_input = exampleModal.querySelector('#task-subject');
const task_priority_input = exampleModal.querySelector('#task-priority');
const task_due_date_input = exampleModal.querySelector('#task-due-date');
const tasks_list = task_table.querySelector('tbody');

create_task_button.addEventListener('click', e => {

    const new_task_subject = task_subject_input.value;
    const new_task_priority = task_priority_input.value;
    const new_task_due_date = task_due_date_input.value;

    create_new_task_item(new_task_subject, new_task_priority, new_task_due_date);
});

function create_new_task_item(subject, priority, due_date)
{
    const new_task_item = task_item_template.content.cloneNode(true);

    const task_subject = new_task_item.querySelector('#task_subject');
    const task_priority = new_task_item.querySelector('#task_priority');
    task_priority.classList.add('bg-primary');
    const task_due_date = new_task_item.querySelector('#task_due_date');
    const task_status = new_task_item.querySelector('#task_status');


    task_subject.textContent = subject;
    task_priority.textContent = priority;
    task_due_date.textContent = due_date;
    task_status.textContent = task_priorities.normal;

    tasks_list.appendChild(new_task_item);
}

