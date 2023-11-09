

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
const task_priorities = { 
	low: { name: 'Low', class: 'bg-success' },
	normal: { name: 'Normal', class: 'bg-primary' }, 
	high: { name: 'High', class: 'bg-danger' }, 
};

const create_task_form = document.querySelector("#create_task_form");
const update_priority_form = document.querySelector("#update_priority_form");
const update_progress_form = document.querySelector("#update_progress_form");

const task_item_template = document.querySelector('#task_item_template');
const task_table = document.querySelector('#task_table');

const exampleModal = document.querySelector('#exampleModal');
const myModal = new bootstrap.Modal(exampleModal);



const create_task_button = exampleModal.querySelector('button[name=create_task]');
const task_subject_input = exampleModal.querySelector('#task_subject');
const task_due_date_input = exampleModal.querySelector('#task_due_date');
const select_priority = exampleModal.querySelector('#select_priority');

const priorityModal = document.querySelector('#priorityModal');
const priorityModalObj = new bootstrap.Modal(priorityModal);
const change_priority = priorityModal.querySelector('#change_priority');
const update_priority_button = priorityModal.querySelector('button[name=update_priority]');

const progressModal = document.querySelector('#progressModal');
const progressModalObj = new bootstrap.Modal(progressModal);
const update_progress_button = progressModal.querySelector('button[name=update_progress]');

const tasks_list = task_table.querySelector('tbody');

let selected_priority_element = null;
let selected_progress_element = null;


(function setup()
{
	for (const priority in task_priorities) {
		{   // populate task creation selection with priority options
			const option = document.createElement('option');
			option.value = priority;
			option.textContent = task_priorities[priority].name;
		
			if (priority == 'normal')
			{
				option.selected = true;
			}

			select_priority.appendChild(option);
		}

		{   // populate priority update selection with priority options
			const option = document.createElement('option');
			option.value = priority;
			option.textContent = task_priorities[priority].name;

			change_priority.appendChild(option);
		}
		
	}

	task_due_date_input.valueAsDate = new Date();


})();

create_task_button.addEventListener('click', e => {

	if (task_subject_input.value == "")
	{
		task_subject_input.classList.add('border-danger');
		return;
	}

	const form_data = new FormData(create_task_form);

    create_new_task_item(form_data.get('task_subject'), form_data.get('select_priority'), form_data.get('task_due_date'));

	task_subject_input.classList.remove('border-danger');
	task_subject_input.value = "";

	myModal.hide();
});

update_priority_button.addEventListener('click', e => {

	const form_data = new FormData(update_priority_form);

	update_priority_element(selected_priority_element, form_data.get('change_priority'));

	update_modified_date(selected_priority_element);

	priorityModalObj.hide();
});

update_progress_button.addEventListener('click', e => {

	const form_data = new FormData(update_progress_form);

	let new_progress = parseInt(form_data.get('new_progress'));
	new_progress = clamp(new_progress, 0, 100);
	
	const progress_text = selected_progress_element.querySelector('[name=progress_text]');
	progress_text.textContent = `${new_progress}%`;
	const progress_bar = selected_progress_element.querySelector('[name=progress_bar]');
	progress_bar.style.width = `${new_progress}%`;

	progressModal.querySelector('input').value = "";

	let status_text = task_statuses.progress;
	if (new_progress == 0)
	{
		status_text = task_statuses.new;
	} else if (new_progress == 100)
	{
		status_text = task_statuses.complete;
	}

	const row = progress_text.closest('tr');
	const task_status = row.querySelector('[name=task_status]');
	task_status.textContent = status_text;

	update_modified_date(selected_progress_element);

	progressModalObj.hide();
});


function update_priority_element(element, priority_id)
{
	element.classList.remove(task_priorities.low.class, task_priorities.normal.class, task_priorities.high.class);
	element.classList.add(task_priorities[priority_id].class);
	element.textContent = task_priorities[priority_id].name;
}

function create_new_task_item(subject, priority, due_date)
{
    const new_task_item = task_item_template.content.cloneNode(true);

	const checkbox = new_task_item.querySelector('[name=checkbox]');
	checkbox.addEventListener('click', e => {
		const row = checkbox.closest('tr');
		const cubject_cell = row.querySelector('[name=subject]');
		const tick = cubject_cell.querySelector('i');
		const subject = cubject_cell.querySelector('span');
	
		if (checkbox.checked == true)
		{
			tick.classList.add('tick-green');
			tick.classList.remove('tick-grey');
			subject.classList.add('crossed');
		} else {
			tick.classList.add('tick-grey');
			tick.classList.remove('tick-green');
			subject.classList.remove('crossed');
		}
		
		update_modified_date(checkbox);
	});

    const task_subject = new_task_item.querySelector('#task_subject');
    const task_priority = new_task_item.querySelector('#task_priority');
    task_priority.classList.add('bg-primary');
	task_priority.addEventListener('click', e => {
		priorityModalObj.show();
		selected_priority_element = task_priority;
	});
	update_priority_element(task_priority, priority);

	const progress_cell = new_task_item.querySelector('#progress_cell');
	progress_cell.addEventListener('click', e => {
		progressModalObj.show();
		selected_progress_element = progress_cell;
	});

    const task_due_date = new_task_item.querySelector('#task_due_date');
    const task_status = new_task_item.querySelector('[name=task_status]');

	const remove_task = new_task_item.querySelector('[name=remove_task]');
	remove_task.addEventListener('click', e => {
		remove_task.parentElement.parentElement.remove();
	});

	console.log(due_date);
    task_subject.textContent = subject;
    task_due_date.textContent = new Date(due_date).toLocaleDateString("en-US");
    task_status.textContent = task_statuses.new;

    tasks_list.appendChild(new_task_item);
}

function update_modified_date(element)
{
	const row = element.closest('tr');
	const last_modified = row.querySelector('[name=last_modified]');
	last_modified.textContent = new Date().toLocaleString("en-US", {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute:'2-digit'
	  });
}

function clamp(number, min, max) {
	return Math.max(min, Math.min(number, max));
}