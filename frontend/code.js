// //function to find the second largest number in an array
// function secondLargest(arr) {
//   if (arr.length < 2) return null;

//   let largest = -Infinity;
//   let second = -Infinity;

//   for (const num of arr) {
//     if (num > largest) {
//       second = largest;
//       largest = num;
//     } else if (num > second && num !== largest) {
//       second = num;
//     }
//   }

//   return second === -Infinity ? null : second;
// }

// // test
// console.log(secondLargest([5, 1, 9, 6, 2])); // 6
// console.log(secondLargest([10, 10, 9])); // 9
// console.log(secondLargest([7])); // null

// Simple task manager

const tasks = [];

function addTask(title) {
  if (!title) {
    console.log("Task title is required");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    completed: false,
  };

  tasks.push(task);
  console.log("Task added:", task);
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    console.log("Task not found");
    return;
  }

  task.completed = !task.completed;
  console.log("Task updated:", task);
}

function listTasks() {
  if (tasks.length === 0) {
    console.log("No tasks available");
    return;
  }

  tasks.forEach((task, index) => {
    console.log(
      `${index + 1}. ${task.title} - ${
        task.completed ? "Done ✅" : "Pending ⏳"
      }`
    );
  });
}

// usage
addTask("Learn JavaScript");
addTask("Build a small project");

listTasks();

toggleTask(tasks[0].id);

listTasks();
