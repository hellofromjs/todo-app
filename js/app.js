"use strict";

const task_statuses = { new: 'New', progress: 'In Progress', complete: 'Complete' };

const task_priorities = {
	low: { name: 'Low', class: 'bg-success' },
	normal: { name: 'Normal', class: 'bg-primary' },
	high: { name: 'High', class: 'bg-danger' },
};

let new_task_example = {
	id: null,
	checked: null,
	subject: null,
	priority: null,
	due_date: null,
	progress: 0,
	modified_date: null,
}

let tasksJSON = [];

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

	const tasks = localStorage.getItem('tasks');

	if (tasks != null) {
		tasksJSON = JSON.parse(tasks);
	}

	render_tasks();
}();

/**
 * Event Listeners
 */

// show modal for new task creation
document.querySelector('#add_new_task_button').addEventListener('click', e => {
	new_task_modal.querySelector('[name=task_due_date]').valueAsDate = new Date();
	new_task_modal_obj.show();
})

// create new task modal
new_task_modal.querySelector('[name=create_task]').addEventListener('click', e => {

	const task_subject_input = new_task_modal.querySelector('[name=task_subject]');

	if (task_subject_input.value == "") {
		task_subject_input.classList.add('border-danger');
		return;
	}

	const form_data = new FormData(document.querySelector("#create_task_form"));
	let task_subject = form_data.get('task_subject');
	let select_priority = form_data.get('select_priority');
	let task_due_date = form_data.get('task_due_date');
	let task_id = random_id();

	create_task_localstorage(task_id, task_subject, select_priority, task_due_date);

	render_task({ ...new_task_example, id: task_id, subject: task_subject, priority: select_priority, due_date: task_due_date });

	task_subject_input.classList.remove('border-danger');
	task_subject_input.value = "";

	new_task_modal_obj.hide();
});

// task priority update modal
priority_modal.querySelector('[name=update_priority]').addEventListener('click', e => {

	const form_data = new FormData(document.querySelector("#update_priority_form"));
	const priority_id = form_data.get('change_priority');
	const row = selected_priority_element.closest('tr');

	update_priority_localStorage(row.dataset.id, priority_id);
	
	render_priority_element(selected_priority_element, priority_id);

	update_modified_date(selected_priority_element);

	priority_modal_obj.hide();
});

// task progress update modal
progress_modal.querySelector('[name=update_progress]').addEventListener('click', e => {

	const form_data = new FormData(document.querySelector("#update_progress_form"));

	let new_progress = parseInt(form_data.get('new_progress'));
	new_progress = clamp(new_progress, 0, 100);

	const row = selected_progress_element.closest('tr');

	render_progress_element(row, selected_progress_element, new_progress);

	update_progress_localstorage(row.dataset.id, new_progress);

	update_modified_date(selected_progress_element);

	progress_modal.querySelector('input').value = "";

	progress_modal_obj.hide();
});

/**
 *  LocalStorage Functions
 */

function remove_task_from_localstorage(id) {
	tasksJSON = tasksJSON.filter((task) => task.id != id);

	localStorage.setItem('tasks', JSON.stringify(tasksJSON));
}

function create_task_localstorage(id, subject, priority, due_date) {
	let new_task = { ...new_task_example };
	new_task.id = id;
	new_task.subject = subject;
	new_task.priority = priority;
	new_task.due_date = due_date;

	tasksJSON.push(new_task);

	localStorage.setItem('tasks', JSON.stringify(tasksJSON));
}

function update_checkbox_localstorage(id, checkbox_status) {
	for (const task of tasksJSON) {
		if (task.id == parseInt(id)) {
			task.checked = checkbox_status;
		}
	}

	localStorage.setItem('tasks', JSON.stringify(tasksJSON));
}

function update_priority_localStorage(id, priority) {
	for (const task of tasksJSON) {
		if (task.id == parseInt(id)) {
			task.priority = priority;
		}
	}

	localStorage.setItem('tasks', JSON.stringify(tasksJSON));
}

function update_progress_localstorage(id, new_progress) {
	for (const task of tasksJSON) {
		if (task.id == parseInt(id)) {
			task.progress = new_progress;
		}
	}

	localStorage.setItem('tasks', JSON.stringify(tasksJSON));
}

function update_modified_localstorage(id, modified_text) {
	for (const task of tasksJSON) {
		if (task.id == parseInt(id)) {
			task.modified_date = modified_text;
		}
	}

	localStorage.setItem('tasks', JSON.stringify(tasksJSON));
}

/**
 * Update DOM Visuals Functions
 */

// update progress DOM visuals
function render_progress_element(row, selected_progress_element, new_progress) {
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

	const task_status = row.querySelector('[name=task_status]');
	task_status.textContent = status_text;
}

function render_checkbox_element(checkbox, is_checked, tick, subject) {
	if (is_checked == true) {
		tick.classList.add('tick-green');
		tick.classList.remove('tick-grey');
		subject.classList.add('crossed');
		checkbox.checked = true;
	} else {
		tick.classList.add('tick-grey');
		tick.classList.remove('tick-green');
		subject.classList.remove('crossed');
		checkbox.checked = false;
	}
}

// updates priority element styles and text
function render_priority_element(element, priority_id) {
	element.classList.remove(task_priorities.low.class, task_priorities.normal.class, task_priorities.high.class);
	element.classList.add(task_priorities[priority_id].class);
	element.textContent = task_priorities[priority_id].name;
}

function render_tasks() {
	for (const task of tasksJSON) {
		render_task(task);
	}
}

// create new task and add it to the list
function render_task({ id, subject, priority, due_date, checked, progress, modified_date }) {

	const new_task_item = document.querySelector('#task_item_template').content.firstElementChild.cloneNode(true);

	new_task_item.dataset.id = id;

	// checkbox column
	const checkbox = new_task_item.querySelector('[name=checkbox]');
	const row = checkbox.closest('tr');
	const subject_cell = row.querySelector('[name=subject]');
	const tick = row.querySelector('[name=tick]');
	const subject_el = subject_cell.querySelector('span');

	render_checkbox_element(checkbox, checked, tick, subject_el);

	checkbox.addEventListener('click', e => {
		render_checkbox_element(checkbox, checkbox.checked, tick, subject_el);

		update_checkbox_localstorage(row.dataset.id, checkbox.checked);

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
	render_priority_element(task_priority, priority);

	// date column
	const task_due_date = new_task_item.querySelector('[name=task_due_date]');
	task_due_date.textContent = due_date != "" ? new Date(due_date).toLocaleDateString("en-US") : "";

	// status column
	new_task_item.querySelector('[name=task_status]').textContent = task_statuses.new;

	// progress column
	const progress_cell = new_task_item.querySelector('[name=progress_cell]');
	render_progress_element(row, progress_cell, progress);
	progress_cell.addEventListener('click', e => {
		progress_modal_obj.show();
		selected_progress_element = progress_cell;
	});

	const last_modified = new_task_item.querySelector('[name=last_modified]');
	last_modified.textContent = modified_date;

	// remove task column
	const remove_task = new_task_item.querySelector('[name=remove_task]');
	remove_task.addEventListener('click', e => {
		const task_row = remove_task.closest('tr');
		remove_task_from_localstorage(task_row.dataset.id);
		task_row.remove();
	});

	// add new task to the list
	document.querySelector('#task_table tbody').appendChild(new_task_item);
}

/**
 * Functions
 */

// update time when task was last modified
function update_modified_date(element) {
	const row = element.closest('tr');
	const last_modified = row.querySelector('[name=last_modified]');
	let modified_text = new Date().toLocaleString("en-US", {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	last_modified.textContent = modified_text;

	update_modified_localstorage(row.dataset.id, modified_text);
}

// take a number and clamp it between min and max values
function clamp(number, min, max) {
	return Math.max(min, Math.min(number, max));
}

function random_id() {
	return Math.floor(Math.random() * 99999999);
}