let grid = document.querySelector(".task-grid");
let all_btn = document.querySelector("#all_btn");
let pending_btn = document.querySelector("#pending_btn");
let completed_btn = document.querySelector("#completed_btn");
let add = document.querySelector("#add");
let add_btn = document.querySelector("#add_btn");
let close = document.querySelector(".close");
let h4 = document.querySelectorAll("h4");
let form = document.querySelector("form")
let overlay = document.querySelector(".overlay")
let mode_btn = document.querySelector(".mode")
let moon = document.querySelector("#moon")
let main = document.querySelector("main")
let categoryDropDown = document.querySelector("#categoryDropDown")

let currentPage = "allTasks";

let categories = [
  {
    name: "grocery",
    color: "#d9ff00",
    bg: "#4b512dd4",
  },
  {
    name: "work",
    color: "#00aaff",
    bg: "#153d4ec7",
  },
  {
    name: "routine",
    color: "#ff8800",
    bg: "#4a3d25e1",
  },
  {
    name: "bank",
    color: "#ff3604",
    bg: "#452d26f0",
  },
]

if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "dark");
}

setTheme()

function setTheme(){
  let currentTheme = localStorage.getItem("theme")
  if(currentTheme == "light"){
    main.classList.add("light")
  }else{
    main.classList.remove("light")
  }
}

mode_btn.addEventListener("click", ()=>{

  const currentTheme = localStorage.getItem("theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  setTheme()
})



let tasks = JSON.parse(localStorage.getItem("tasks"));

function saveTasks(){
    let tasksString = JSON.stringify(tasks)
    localStorage.setItem("tasks", tasksString)
}

saveTasks()

if (!tasks) {
    tasks = [];
    saveTasks();
}

function createCards(filteredCards) {

    let h1 = document.createElement("h1")
      h1.innerText = "No Tasks"
      h1.classList.add("emptygridtext")
    if(filteredCards.length < 1){
      grid.append(h1)
    }

    filteredCards.forEach((task) => {
        let card = document.createElement("div");
        card.classList.add("task");
        card.innerHTML = 
            `
                <div class="title"><h2>${task.title}</h2><div><span id="edit">edit</span><span id="delete">delete</span></div></div>
                <div class="content"><p>${task.content}</p></div>
                <button id="status" class="${task.isCompleted ? "completed" : "pending"}"><span>Mark as ${task.isCompleted ? "Pending" : "Completed"}</span></button>
            `;

        let categoryObj = categories.find(t=>t.name == task.category)
        if (!categoryObj) {
          categoryObj = {
              color: "#ffffff",
              bg: "#454545c8" 
          };
        }
        card.setAttribute("data-id", task.id)
        card.setAttribute("data-category", task.category || "default")
        card.style.setProperty("--category-color", categoryObj.color);
        card.style.setProperty("--category-bg", categoryObj.bg);
        grid.append(card)
    });
}

function active(tag){
    h4.forEach((elem) => {
        elem.classList.remove("active");
    });
    tag.classList.add("active");
}

function initializeCategories(){
  categoryDropDown.innerHTML = `<option value="">-- select category --</option>`
  categories.forEach(category=>{
    categoryDropDown.innerHTML += `
      <option value="${category.name}">${category.name}</option>
    `
  })
}

initializeCategories()

function render() {

  grid.innerHTML = "";
  let filteredCards = tasks.sort((a,b)=>b.id-a.id).filter((card)=>{
      if (currentPage == "completedTasks") {
        return card.isCompleted
      }else if(currentPage == "pendingTasks"){
        return !card.isCompleted
      }else{
        return card
      }
    })  
  createCards(filteredCards)
}

render();

all_btn.addEventListener("click", () => {
  currentPage = "allTasks";
  active(all_btn)
  render();
});

pending_btn.addEventListener("click", () => {
  currentPage = "pendingTasks";
  active(pending_btn)
  render();
});

completed_btn.addEventListener("click", () => {
  currentPage = "completedTasks";
  active(completed_btn)
  render();
});

close.addEventListener('click', ()=>{
  overlay.style.display = "none"
  form.reset()
})

add.addEventListener('click', ()=>{
  overlay.style.display = "flex"
  add_btn.textContent = "Add"
  form.onsubmit = handleNewSubmit
})

function handleNewSubmit(e){
  e.preventDefault()
  let title = e.target.title.value
  let content = e.target.content.value
  let category = e.target.category.value

  if(title.trim() === "" || content.trim() === "" || category.trim() === ""){
    alert("All fields are required !")
    return
  }

  tasks.push({
    id: Date.now(),
    title,
    content,
    category,
    isCompleted: false
  })
  overlay.style.display = "none"
  saveTasks()
  render()
}

function handleEditSubmit(e, id, task){
  e.preventDefault()
  let title = e.target.title.value
  let content = e.target.content.value
  let category = e.target.category.value

  if(title.trim() === "" || content.trim() === "" || category.trim() === ""){
    alert("All fields are required !")
    return
  }

  const validCategory = categories.find(c => c.name === category);

  if (!validCategory) {
    alert("Please select a valid category");
    return;
  }

  task.title = title
  task.content = content
  task.category = category

  overlay.style.display = "none"
  saveTasks()
  form.reset()
  render()
}

function changeStatus(id) {
  let target_card = tasks.find((task) => {
    return task.id == id;
  });
  if (target_card.isCompleted) {
    target_card.isCompleted = false;
  } else {
    target_card.isCompleted = true;
  }
  saveTasks()
  render()
}

function deleteCard(id){
  let confirm_delete = confirm("confirm deleting task ?")
  if(!confirm_delete) return
  let index = tasks.findIndex((task)=>{
    return task.id == id
  })
  tasks.splice(index,1)
  saveTasks()
  render()
}

function editCard(id){  
    let task = tasks.find(task=>{
      return task.id == id
    })
    overlay.style.display = "flex"
    form.title.value = task.title
    form.content.value = task.content
    if (categories.some(c => c.name === task.category)) {
      form.category.value = task.category;
    } else {
      form.category.value = "";
    }
    add_btn.textContent = "Edit"
    form.onsubmit = (e)=>{
      handleEditSubmit(e, id, task)
    }
}

grid.addEventListener('click', (e)=>{
  const card = e.target.closest(".task");
  let id = card.getAttribute("data-id");
  if(e.target.closest("#status")) changeStatus(id)
  else if(e.target.closest("#delete")) deleteCard(id)
  else if(e.target.closest("#edit")) editCard(id)
})



