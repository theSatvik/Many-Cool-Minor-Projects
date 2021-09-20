var username = document.getElementById('username');
var password = document.getElementById('password');
var submit = document.getElementById('submit');
var error = document.getElementById('error');

submit.addEventListener("click", sendLoginInfo);

function sendLoginInfo(event)
{
    event.preventDefault();
    var username_value = username.value;
    var password_value = password.value;


    var xhttp = new XMLHttpRequest();
        
    xhttp.addEventListener("load", function(event)
    {
    
        var response = JSON.parse(event.target.responseText);
        if(response.error)
        {
            error.innerText="";
            error.innerText=response.error;
        }
        else if(response.user)
        {
            window.location.href = "/";
        }
    });

    xhttp.open("POST", "/login");
    xhttp.setRequestHeader("Content-Type","application/json")
    xhttp.send(JSON.stringify({
        username: username_value, 
        password: password_value
    }));
}