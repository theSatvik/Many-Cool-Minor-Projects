var email = document.getElementById('email');
var emailerror = document.getElementById('emailerror');
var submit = document.getElementById('submit');


submit.addEventListener("click", sendLoginInfo);

function sendLoginInfo(event)
{
    event.preventDefault();
    var email_value = email.value;

    var xhttp = new XMLHttpRequest();
        
    xhttp.addEventListener("load", isLinkSent);
    
    xhttp.open("POST", "/sendChangePasswordLink");
    xhttp.setRequestHeader("Content-Type","application/json")
    xhttp.send(JSON.stringify({
        email: email_value
    }));
}

function isLinkSent(response)
{
    var response = JSON.parse(response.target.responseText);
    emailerror.innerText="";
    console.log(response);
    if(response.emailerr)
    {
        emailerror.innerText = response.emailerr;
    }
    else if(response.user)
    {
        alert(response.user);
        window.location.href = "/";
    }
}