let breakTime = 5;
let sessionTime = 30;
let countSessions=1;
let timer = sessionTime*60;
let currStatus = 1;
let timeInter;

let divTimer = document.getElementById("timer");
let divStatus = document.getElementById("status");

let btnStart=document.getElementById("start");
btnStart.addEventListener("click", start);

document.getElementById("reset").addEventListener("click", reset);
let timerContainer = document.getElementById("timerContainer");


ChangeTimer();
document.getElementById("breakTime").innerText = breakTime + " min"
document.getElementById("sessionTime").innerText = sessionTime + " min"
document.getElementById("sessionadd").addEventListener("click", increase);
document.getElementById("breakadd").addEventListener("click", increase);
document.getElementById("breakminus").addEventListener("click", reduce);
document.getElementById("sessionminus").addEventListener("click", reduce);

function increase(event)
{
    spanTime = event.target.parentNode.getElementsByTagName("span")[0];
    if(spanTime.id == "breakTime")
    {
        breakTime++;
        spanTime.innerText = breakTime + " min";
        if(!currStatus)
        {
            timer += 60;
            ChangeTimer();
        }
    }
    else
    {
        sessionTime++;
        spanTime.innerText = sessionTime + " min";
        if(currStatus)
        {
            timer += 60;
            ChangeTimer();
        }
    }
    
}

function reduce(event)
{
    spanTime = event.target.parentNode.getElementsByTagName("span")[0];
    if(spanTime.id == "breakTime" && breakTime>0)
    {
        breakTime--;
        spanTime.innerText = breakTime + " min";
        if(!currStatus)
        {
            timer -= 60;
            if(timer>0)
                ChangeTimer();
        }
    }
    else if(sessionTime>1)
    {
        sessionTime--;
        spanTime.innerText = sessionTime + " min";
        if(currStatus)
        {
            timer -= 60;
            if(timer>0)
                ChangeTimer();
        }
    }
    
}

function start()
{
    console.log("sdfsdf");
    timeInter = setInterval(startTimer, 1000);
    btnStart.innerText = "Pause";
    btnStart.removeEventListener("click",start);
    btnStart.addEventListener("click", pause)
}

function pause()
{
    clearInterval(timeInter);
    btnStart.innerText = "Start";
    btnStart.removeEventListener("click", pause);
    btnStart.addEventListener("click", start);
}

function startTimer()
{
    
    if(timer>0)
    {
        ChangeTimer()     
    }
    else{
        if(currStatus)
        {
            timerContainer.setAttribute('style','background-color:#eb6841')
            divStatus.innerText = "Break!!"
            currStatus = 0;
            timer = breakTime*60;
            ChangeTimer();
            divTimer.setAttribute("style", "color: #eb6841;");
            countSessions++;
        }
        else{
            timerContainer.setAttribute('style','background-color:#00a0b0')
            currStatus = 1;
            divStatus.innerText = `Session ${countSessions}`;
            timer = sessionTime*60;
            ChangeTimer();
            divTimer.setAttribute("style", "color: #00a0b0;");
        }
    }
    timer--;
}

function ChangeTimer()
{
    let min = Math.floor(timer/60);
    let sec = timer%60;
    if(min<10)
        min = '0' + min;
    if(sec<10)
        sec = '0'+sec;
    divTimer.innerText = `${min}:${sec}`;
}

function reset()
{
    timerContainer.setAttribute('style','background-color:#00a0b0')
    timer = sessionTime*60;
    ChangeTimer();
    divTimer.setAttribute("style", "color: #00a0b0;");
    countSessions = 1;
    currStatus = 1;
    divStatus.innerText = "Session 1";
    pause();

}