var username = document.getElementById('username');
var cusname = document.getElementById('cusname');
var password = document.getElementById('password');
var email = document.getElementById('email');
var submit = document.getElementById('submit');
var usernameerror = document.getElementById('usernameerror');
var emailerror = document.getElementById('emailerror');
var cusnameerror = document.getElementById('cusnameerror');
var passworderror = document.getElementById('passworderror');

submit.addEventListener("click", sendLoginInfo);

function sendLoginInfo(event)
{
    event.preventDefault();
    var username_value = username.value;
    var password_value = password.value;
    var email_value = email.value;
    var cusname_value = cusname.value;


    var xhttp = new XMLHttpRequest();
        
    xhttp.addEventListener("load", isUserAdded);
    

    xhttp.open("POST", "/signup");
    xhttp.setRequestHeader("Content-Type","application/json")
    xhttp.send(JSON.stringify({
        cusname: cusname_value,
        username: username_value, 
        password: password_value,
        email: email_value
    }));
}

function isUserAdded(response)
{
    var response = JSON.parse(response.target.responseText);
    usernameerror.innerText="";
    cusnameerror.innerText="";
    passworderror.innerText="";
    emailerror.innerText="";
    console.log(response);
    if(response.usernameerr)
    {
        usernameerror.innerText = response.usernameerr;
    }
    else if(response.cusnameerr)
    {
        cusnameerror.innerText = response.cusnameerr;
    }
    else if(response.emailerr)
    {
        emailerror.innerText = response.emailerr;
    }
    else if(response.passworderr)
    {
        passworderror.innerText = response.passworderr;
    }
    else if(response.user)
    {
        window.location.href = "/";
    }
}