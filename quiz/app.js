let myQuestions = [{
    question: "Who invented JavaScript?",
    answers: {
      a: "Douglas Crockford",
      b: "Sheryl Sandberg",
      c: "Brendan Eich"
    },
    correctAnswer: "c"
  },
  {
    question: "Which one of these is a JavaScript package manager?",
    answers: {
      a: "Node.js",
      b: "TypeScript",
      c: "npm"
    },
    correctAnswer: "c"
  },
  {
    question: "Which tool can you use to ensure code quality?",
    answers: {
      a: "Angular",
      b: "jQuery",
      c: "RequireJS",
      d: "ESLint"
    },
    correctAnswer: "d"
  }
];
let nav=document.getElementById('nav');
let head=document.createElement('h1');
head.appendChild(document.createTextNode("Quiz"));
nav.appendChild(head);
let qnoContainer,submitButton,nextButton,statusContainer,numCorrect=0,Qno=0;
let quizContainer = document.getElementById('question');
let statusBlock = document.getElementById('statBlock');
let btnBlock = document.getElementById('btnBlock');


let init=()=>{

qnoContainer = document.createElement('div');
qnoContainer.setAttribute('id','quiz');
statusContainer = document.createElement('div');
statusContainer.setAttribute('id','status');
submitButton = document.createElement('button');
submitButton.setAttribute('id','submit');
submitButton.appendChild(document.createTextNode("Submit"));
submitButton.addEventListener('click', showStatus);
nextButton=document.createElement("button");
nextButton.setAttribute('id','next');
nextButton.appendChild(document.createTextNode("Next"));
nextButton.addEventListener("click", showNextQues);

}


let showStatus = ()=>{
const userAnswer = qnoContainer.querySelector(`input[name=question${Qno}]:checked`);
// console.log(userAnswer);

if(userAnswer!=null){
  statusBlock.appendChild(statusContainer);
  let bgcolor="",borColor="";
    if(myQuestions[Qno].correctAnswer == userAnswer.value){
        statusContainer.innerHTML = "Correct";
        numCorrect++;
        bgcolor="rgb(139, 241, 173)";
        borColor="rgb(32, 173, 27)";
    }
    else{
        statusContainer.innerHTML = "Incorrect";
        bgcolor="rgb(248, 126, 126)";
        borColor="rgb(209, 28, 28)";
    }
    statusContainer.setAttribute('style',`background-color:${bgcolor};font-size: 20px;
    border-radius: 10px;
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    height:2rem;
    margin-bottom: 1rem;
    font-weight: 1000;
    padding:1.2rem 1rem 1rem 1rem;
    border:3px solid ${borColor};
   `);
}
else {
    alert("Please select an answer");
}
submitButton.parentNode.removeChild(submitButton);
btnBlock.appendChild(nextButton);   
}

var finalRes = ()=>{
Qno=0;
// nextButton.parentNode.removeChild(submitButton);
let Question = document.getElementById('quiz-container');
Question.setAttribute('style','width:50%');
let results=document.createElement('div');
results.setAttribute('id','results');
results.innerHTML += `<ul>`

head.parentNode.removeChild(head);
head=document.createElement('h1');
head.appendChild(document.createTextNode( `Score : ${numCorrect}`));
nav.appendChild(head);
myQuestions.forEach(e=>{
    results.innerHTML+=`<li><strong>${e.question}</strong> - <span class="answers">${e.answers[e.correctAnswer]}</li>`;
});
results.innerHTML += `</ul>`
Question.appendChild(results);

let restart=document.createElement('button');
restart.appendChild(document.createTextNode("Restart"));
Question.appendChild(restart);
restart.addEventListener('click', ()=>location.reload());
} 

var showNextQues = ()=>{
Qno++;  

qnoContainer.parentNode.removeChild(qnoContainer);
statusContainer.parentNode.removeChild(statusContainer);
nextButton.parentNode.removeChild(nextButton);  
if(Qno==myQuestions.length){
return finalRes();
}

init();
quizContainer.appendChild(qnoContainer);
btnBlock.appendChild(submitButton);

qnoContainer.innerHTML += `<b>${myQuestions[Qno].question}</b><br><br><hr>`;

for (letter in myQuestions[Qno].answers) {
qnoContainer.innerHTML += `<label class="options">
  <input type="radio" name="question${Qno}" value="${letter}">
  ${myQuestions[Qno].answers[letter]}
  </label><br><hr>`;
}
}
init();

quizContainer.appendChild(qnoContainer);
statusBlock.appendChild(statusContainer); 
btnBlock.appendChild(submitButton); 
 

qnoContainer.innerHTML += `<b>${myQuestions[Qno].question}</b><br><br><hr>`;

for (letter in myQuestions[Qno].answers) {
qnoContainer.innerHTML += `<label class="options">
  <input type="radio" name="question${Qno}" value="${letter}">
  ${myQuestions[Qno].answers[letter]}
  </label><br><hr>`;
}