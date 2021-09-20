var res;
var lang=document.getElementById("lang");
var code=document.getElementById("code");
var output=document.getElementById("output");
var submit=document.getElementById("submit");
var clear=document.getElementById("clear");

submit.addEventListener("click", postreq);
clear.addEventListener("click", CLEAR);

function postreq(event)
{
    var postreq=new XMLHttpRequest();
    
    postreq.open("POST", "https://codequotient.com/api/executeCode");
    postreq.setRequestHeader("Content-Type", "application/JSON");
    postreq.addEventListener("load", startCheckCompiler);
    postreq.send(JSON.stringify({code:code.value, langId:lang.value }));
}

function startCheckCompiler(response)
{
    res=JSON.parse(response.target.responseText);
    if(res.error=="LangId is null")
    {
        output.value="Output: \nFatal Error - contact admin";
    }
    else if(res.error)
    {
       alert("Editor is empty");
    }
    else
    {
        output.value="OUTPUT: \nCompiling..."
        setTimeout(EvalCompiler, 2000);
    }
        
}

function EvalCompiler()
{
    var sendCompilerId=new XMLHttpRequest();
    sendCompilerId.open("GET", "https://codequotient.com/api/codeResult/"+res.codeId);
    console.log(res.codeId);
    sendCompilerId.setRequestHeader("Content-Type", "application/JSON");
    sendCompilerId.addEventListener("load", OUTPUT);
    sendCompilerId.send();
}

function OUTPUT(response)
{
    res=JSON.parse(response.target.responseText);
    res=JSON.parse(res.data);
    
    if(res.errors)
        output.value="OUTPUT: \n"+res.errors;
    else
        output.value=res.output;
    
}

function CLEAR(event)
{
    code.value="";
    output.value="OUTPUT: ";
}