let tasks=[];
function getTask(data){
    tasks=data;
   createTasks(tasks);  
}

getStoredTasks();
console.log(tasks,123);

var ele = document.getElementById('myUL');


function storeTasks(taskList){
    var request=new XMLHttpRequest();

    request.open("POST","/upload");
        request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(taskList));
}

function getStoredTasks(){
    var request= new XMLHttpRequest();

    request.open("GET","/data");
    request.send();

    
    request.addEventListener("load",
        function(response){
            var data=JSON.parse(this.responseText);
            getTask(data);
            console.log(data);
        }
    );
}


var close = document.getElementsByClassName("close");

for (let i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    tasks.splice(i,1);  
    this.parentElement.remove();
    storeTasks(tasks);
  }
}


var createTasks=()=>{
    
for(let i =0;i<tasks.length;i++){
   ele.innerHTML += `<li id="${i}" class="${(tasks[i].checked)?'checked':''}">${tasks[i].name}</li>`;
}
    var myNodelist = document.getElementsByTagName("LI");
    console.log(document);
    for (let i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("SPAN");
    var txt = document.createTextNode( " \u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
    }
   
 for (let i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    tasks.splice(i,1);  
   
    this.parentElement.remove();
     storeTasks(tasks);
  }
}
// storeTasks(tasks);
}

var list = document.getElementById('myUL');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    console.log(ev,ev.path[0].id);

    ev.target.classList.toggle('checked');
    tasks[ev.path[0].id].checked = tasks[ev.path[0].id].checked==true?false:true;
    storeTasks(tasks);
    console.log(ev,ev.path[0].id, tasks[ev.path[0].id].name);
  }
}, false);

function newElement() {
  var li = document.createElement("li");
  li.setAttribute('id',tasks.length);
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);

  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
    tasks.push({name:inputValue,checked:false});
    storeTasks(tasks);
    // console.log(tasks);
}
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
        tasks.splice(i,1);  
        this.parentElement.remove();
        storeTasks(tasks);
    }
  }
 
}