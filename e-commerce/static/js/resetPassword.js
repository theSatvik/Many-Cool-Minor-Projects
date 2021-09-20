var password = document.getElementById('password');
var email =document.getElementById('email');
var passworderror = document.getElementById('passworderror');
var submit = document.getElementById('submit');


submit.addEventListener("click", sendLoginInfo);

function sendLoginInfo(event)
{
    event.preventDefault();
    var password_value = password.value;
    var email_value = email.innerHTML;
    console.log(email_value);

    var xhttp = new XMLHttpRequest();
        
    xhttp.addEventListener("load", isPasswordReset);
    
    xhttp.open("POST", "/resetingPassword");
    xhttp.setRequestHeader("Content-Type","application/json")
    xhttp.send(JSON.stringify({
        email: email_value,
        password: password_value
    }));
}

function isPasswordReset(response)
{
    var response = JSON.parse(response.target.responseText);
    passworderror.innerText="";
    console.log(response);
    if(response.passworderr)
    {
        passworderror.innerText = response.passworderr;
    }
    else if(response.user)
    {
        alert(response.user);
        window.location.href = "/";
    }
}