"use strict";

const task_statuses = { new: 'New', progress: 'In Progress', complete: 'Complete' };

const task_priorities = {
	low: { name: 'Low', class: 'bg-success' },
	normal: { name: 'Normal', class: 'bg-primary' },
	high: { name: 'High', class: 'bg-danger' },
};

// modal for creating a new task
const new_task_modal = document.querySelector('#newTaskModal');
const new_task_modal_obj = new bootstrap.Modal(new_task_modal);

// modal for updating task priority
const priority_modal = document.querySelector('#priorityModal');
const priority_modal_obj = new bootstrap.Modal(priority_modal);

// modal for updating task progress
const progress_modal = document.querySelector('#progressModal');
const progress_modal_obj = new bootstrap.Modal(progress_modal);

// elements that are currently being selected and updated via modal
let selected_priority_element = null;
let selected_progress_element = null;

// on page load do some preparations
void function setup() {
	for (const priority in task_priorities) {
		{   // populate task creation element with priority options
			const option = document.createElement('option');
			option.value = priority;
			option.textContent = task_priorities[priority].name;

			if (priority == 'normal') {
				option.selected = true;
			}

			new_task_modal.querySelector('#select_priority').appendChild(option);
		}

		{   // populate priority update element with priority options
			const option = document.createElement('option');
			option.value = priority;
			option.textContent = task_priorities[priority].name;

			priority_modal.querySelector('#change_priority').appendChild(option);
		}
	}

	preload_data();
}();

/**
 * Event Listeners
 */

// prepare and open modal for new task creation
document.querySelector('#add_new_task_button').addEventListener('click', e => {
	new_task_modal.querySelector('[name=task_due_date]').valueAsDate = new Date();
	new_task_modal_obj.show();
})

// create new task and close modal
new_task_modal.querySelector('[name=create_task]').addEventListener('click', e => {

	const task_subject_input = new_task_modal.querySelector('[name=task_subject]');

	if (task_subject_input.value == "") {
		task_subject_input.classList.add('border-danger');
		return;
	}

	const form_data = new FormData(document.querySelector("#create_task_form"));

	create_new_task_item(form_data.get('task_subject'), form_data.get('select_priority'), form_data.get('task_due_date'));

	task_subject_input.classList.remove('border-danger');
	task_subject_input.value = "";

	new_task_modal_obj.hide();
});

// update task priority and close modal
priority_modal.querySelector('[name=update_priority]').addEventListener('click', e => {

	const form_data = new FormData(document.querySelector("#update_priority_form"));

	update_priority_element(selected_priority_element, form_data.get('change_priority'));

	update_modified_date(selected_priority_element);

	priority_modal_obj.hide();
});

// update task progress and close modal
progress_modal.querySelector('[name=update_progress]').addEventListener('click', e => {

	const form_data = new FormData(document.querySelector("#update_progress_form"));

	let new_progress = parseInt(form_data.get('new_progress'));
	new_progress = clamp(new_progress, 0, 100);

	const progress_text = selected_progress_element.querySelector('[name=progress_text]');
	progress_text.textContent = `${new_progress}%`;

	const progress_bar = selected_progress_element.querySelector('[name=progress_bar]');
	progress_bar.style.width = `${new_progress}%`;

	// update status when progress changes

	let status_text = task_statuses.progress;
	if (new_progress == 0) {
		status_text = task_statuses.new;
	} else if (new_progress == 100) {
		status_text = task_statuses.complete;
	}

	const row = progress_text.closest('tr');
	const task_status = row.querySelector('[name=task_status]');
	task_status.textContent = status_text;

	update_modified_date(selected_progress_element);

	progress_modal.querySelector('input').value = "";

	progress_modal_obj.hide();
});

/**
 * Functions
 */

// create new task and add it to the list
function create_new_task_item(subject, priority, due_date) {
	const new_task_item = document.querySelector('#task_item_template').content.cloneNode(true);

	// checkbox column
	const checkbox = new_task_item.querySelector('[name=checkbox]');
	checkbox.addEventListener('click', e => {
		const row = checkbox.closest('tr');
		const subject_cell = row.querySelector('[name=subject]');
		const tick = row.querySelector('[name=tick]');
		const subject = subject_cell.querySelector('span');

		if (checkbox.checked == true) {
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

	// subject column
	new_task_item.querySelector('[name=task_subject]').textContent = subject;

	// priority column
	const task_priority = new_task_item.querySelector('[name=task_priority]');
	task_priority.classList.add(task_priorities[priority].class);
	task_priority.addEventListener('click', e => {
		priority_modal_obj.show();
		selected_priority_element = task_priority;
	});
	update_priority_element(task_priority, priority);

	// date column
	const task_due_date = new_task_item.querySelector('[name=task_due_date]');
	task_due_date.textContent = due_date != "" ? new Date(due_date).toLocaleDateString("en-US") : "";

	// status column
	new_task_item.querySelector('[name=task_status]').textContent = task_statuses.new;

	// progress column
	const progress_cell = new_task_item.querySelector('[name=progress_cell]');
	progress_cell.addEventListener('click', e => {
		progress_modal_obj.show();
		selected_progress_element = progress_cell;
	});

	// remove task column
	const remove_task = new_task_item.querySelector('[name=remove_task]');
	remove_task.addEventListener('click', e => {
		remove_task.closest('tr').remove();
	});

	// add new task to the list
	document.querySelector('#task_table tbody').appendChild(new_task_item);
}

// updates priority element styles and text
function update_priority_element(element, priority_id) {
	element.classList.remove(task_priorities.low.class, task_priorities.normal.class, task_priorities.high.class);
	element.classList.add(task_priorities[priority_id].class);
	element.textContent = task_priorities[priority_id].name;
}

// update time when task was last modified
function update_modified_date(element) {
	const row = element.closest('tr');
	const last_modified = row.querySelector('[name=last_modified]');
	last_modified.textContent = new Date().toLocaleString("en-US", {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// create some default tasks
function preload_data() {
	const data = [
		{
			subject: "Launch new website",
			priority: "high",
			due_date: "",
		},
		{
			subject: "Corporate Rebranding",
			priority: "low",
			due_date: "",
		},
		{
			subject: "Staff Training",
			priority: "high",
			due_date: "2018-04-06",
		},
		{
			subject: "Collateral for Annual Expo",
			priority: "high",
			due_date: "2018-04-23",
		},
		{
			subject: "Expand Marketing Team",
			priority: "normal",
			due_date: "2018-04-28",
		},
		{
			subject: "New Product Launch",
			priority: "low",
			due_date: "",
		},
	];

	for (const item of data) {
		create_new_task_item(item.subject, item.priority, item.due_date);
	}
}

// take a number and clamp it between min and max values
function clamp(number, min, max) {
	return Math.max(min, Math.min(number, max));
}
