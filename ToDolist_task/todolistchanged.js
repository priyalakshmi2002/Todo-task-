document.addEventListener('DOMContentLoaded', function() {
    const inputBox = document.querySelector("#input-box");
    const formInput = document.querySelector("#inputform");
    const listContainer = document.querySelector("#list-container");
    const filterOption = document.querySelector(".filter-todo");
    const errorMessage = document.querySelector("#error-message");
    const clearTasksBtn = document.querySelector("#clrbtn");
    const completedCounter = document.querySelector("#completed-counter");
    const assignedCounter = document.querySelector("#assigned-counter");
    let editTaskElement = null; //editing variable declaration
    
    // Function for error and success message 
    function showMessage(message, isError = false) {
        errorMessage.textContent = message;
        errorMessage.classList.toggle("error", isError);
        errorMessage.classList.toggle("success", !isError); // Apply 'success' class for non-error messages
        errorMessage.style.visibility = "visible";
        setTimeout(() => {
            errorMessage.style.visibility = "hidden"; // Error message visibility time
        }, 3000);
    }
    
    // Function to add task
    function addTask(event) {
        event.preventDefault(); // Prevent form submission
        const task = inputBox.value.trim();
        if (!task) {
            showMessage("Please enter a task", true);
            return;
        }
        errorMessage.style.visibility = "hidden"; // Ensure it's hidden when there's no error

        if (editTaskElement) {
            // Update existing task
            const taskSpan = editTaskElement.querySelector(".taskname");
            taskSpan.textContent = task;
            editTaskElement.classList.remove("completed");
            editTaskElement.querySelector(".done-btn i").className = 'fa-regular fa-square-check';
            editTaskElement = null;
        } else {
            // Add new task
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="taskname">${task}</span>
                <span class="done-btn"><i class="fa-regular fa-square-check"></i></span>
                <span class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></span>
                <span class="delete-btn"><i class="fa-regular fa-trash-can"></i></span>
            `;
            listContainer.appendChild(li); // Append the list

            const doneBtn = li.querySelector(".done-btn");
            const editBtn = li.querySelector(".edit-btn");
            const deleteBtn = li.querySelector(".delete-btn");
            //  Event for done button
            doneBtn.addEventListener("click", function () {
                li.classList.toggle("completed");
                const isChecked = li.classList.contains("completed");
                const doneIcon = doneBtn.querySelector("i");

                if (isChecked) {
                    doneIcon.classList.remove("fa-regular");
                    doneIcon.classList.add("fa-solid");
                } else {
                    doneIcon.classList.remove("fa-solid");
                    doneIcon.classList.add("fa-regular");
                }

                updateCounters();
                filterTodo();
                checkTasksStatus();
                saveTasksToLocalStorage();
            });
            // Event for edit button
            editBtn.addEventListener("click", function () {
                inputBox.value = task;
                editTaskElement = li;
                inputBox.focus();
            });
            // Event for delete button
            deleteBtn.addEventListener("click", function () {
                if (confirm("Are you sure you want to delete this task?")) {
                    li.remove();
                    updateCounters();
                    filterTodo();
                    checkTasksStatus();
                    checkEmptyList();
                    saveTasksToLocalStorage();
                }
            });
        }

        inputBox.value = "";
        showMessage("Task added successfully!");
        updateCounters();
        filterTodo();
        checkTasksStatus();
        saveTasksToLocalStorage();
    }
    
    // Function for filtering
    function filterTodo() {
        const todos = listContainer.childNodes;
        const filter = filterOption.value;
        todos.forEach(function(todo) {
            if (todo.nodeType === Node.ELEMENT_NODE) {
                switch(filter) {
                    case "all":
                        todo.style.display = "flex";
                        break;
                    case "completed":
                        if (todo.classList.contains("completed")) {
                            todo.style.display = "flex";
                        } else {
                            todo.style.display = "none";
                        }
                        break;
                    case "assigned":
                        if (!todo.classList.contains("completed")) {
                            todo.style.display = "flex";
                        } else {
                            todo.style.display = "none";
                        }
                        break;
                }
            }
        });
    }
    
    // Function for updating counters
    function updateCounters() {
        const completedTasks = document.querySelectorAll(".completed").length;
        const assignedTasks = document.querySelectorAll("li:not(.completed)").length;

        completedCounter.textContent = completedTasks;
        assignedCounter.textContent = assignedTasks;
    }
    
    // Clear task function
    function clearAllTasks() {
        const currentFilter = filterOption.value;

        if (currentFilter === "completed" && confirm("Are you sure you want to clear all completed tasks? This action cannot be undone.")) {
            const completedTasks = document.querySelectorAll(".completed");
            completedTasks.forEach(task => task.remove());
            updateCounters();
            filterTodo();
            checkTasksStatus();
            saveTasksToLocalStorage();
        } else if (currentFilter !== "completed") {
            alert("Please switch to 'Completed' filter to clear completed tasks.");
        }
    }
    
    // Function to check empty list
    function checkEmptyList() {
        const placeMessage = document.querySelector("#message");
        if (listContainer.childNodes.length === 0) {
            placeMessage.style.display = "block";
        } else {
            placeMessage.style.display = "none";
        }
    }
    
    // Function to check the task status
    function checkTasksStatus() {
        const placeMessage = document.querySelector("#message");
        const completedTasks = document.querySelectorAll(".completed").length;
        const assignedTasks = document.querySelectorAll("li:not(.completed)").length;
        const totalTasks = listContainer.childNodes.length;

        if (totalTasks === 0 && filterOption.value === "all") {
            placeMessage.textContent = "Write it down, Get it done!";
            placeMessage.style.display = "block";
        } else {
            placeMessage.style.display = "none";
        }

        if (completedTasks === 0 && filterOption.value === "completed") {
            placeMessage.textContent = "No task completed! Hurry up!!";
            placeMessage.style.display = "block";
        } else if (completedTasks !== 0 && assignedTasks === 0 && filterOption.value === "completed") {
            placeMessage.textContent = "Hurray! No task to be completed !!!";
            placeMessage.style.display = "block";
        } else if (assignedTasks === 0 && filterOption.value === "assigned") {
            placeMessage.textContent = "No task assigned";
            placeMessage.style.display = "block";
        }
    }
    
    // Function for local storage
    function saveTasksToLocalStorage() {
        const tasks = [];
        listContainer.childNodes.forEach(function(todo) {
            if (todo.nodeType === Node.ELEMENT_NODE) {
                const task = todo.querySelector(".taskname").textContent;
                const completed = todo.classList.contains("completed");
                tasks.push({ task, completed });
            }
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
    
    // Function to retrieve from local storage
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem("tasks"));
        if (tasks) {
            tasks.forEach(function(task) {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span class="taskname">${task.task}</span>
                    <span class="done-btn"><i class="fa-regular fa-square-check"></i></span>
                    <span class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></span>
                    <span class="delete-btn"><i class="fa-regular fa-trash-can"></i></span>
                `;
                if (task.completed) {
                    li.classList.add("completed");
                    li.querySelector(".done-btn i").className = 'fa-solid fa-square-check';
                }
                listContainer.appendChild(li);

                const doneBtn = li.querySelector(".done-btn");
                const editBtn = li.querySelector(".edit-btn");
                const deleteBtn = li.querySelector(".delete-btn");

                doneBtn.addEventListener("click", function () {
                    li.classList.toggle("completed");
                    const isChecked = li.classList.contains("completed");
                    const doneIcon = doneBtn.querySelector("i");

                    if (isChecked) {
                        doneIcon.classList.remove("fa-regular");
                        doneIcon.classList.add("fa-solid");
                    } else {
                        doneIcon.classList.remove("fa-solid");
                        doneIcon.classList.add("fa-regular");
                    }

                    updateCounters();
                    filterTodo();
                    checkTasksStatus();
                    saveTasksToLocalStorage();
                });

                editBtn.addEventListener("click", function () {
                    inputBox.value = task.task;
                    editTaskElement = li;
                    inputBox.focus();
                });

                deleteBtn.addEventListener("click", function () {
                    if (confirm("Are you sure you want to delete this task?")) {
                        li.remove();
                        updateCounters();
                        filterTodo();
                        checkTasksStatus();
                        checkEmptyList();
                        saveTasksToLocalStorage();
                    }
                });
            });
        }
    }

    const backButton = document.querySelector('.back a');
    backButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default navigation behavior

        if (confirm('Are you sure you want to go back?')) {
            window.location.href = this.href; // Navigate to the specified URL
        }
    });
    
    // Event for add
    formInput.addEventListener("submit", addTask);
    filterOption.addEventListener("change", function() {
        filterTodo();
        checkTasksStatus();
    });
    // Event for clear button
    clearTasksBtn.addEventListener("click", function() {
        clearAllTasks();
        checkTasksStatus();
    });

    loadTasksFromLocalStorage();
    updateCounters();
    checkEmptyList();
});
