var loadMore = document.getElementById('loadMore');
var view = document.getElementsByClassName('view');
var container =document.getElementById('container');

if(loadMore)
    loadMore.addEventListener("click", getMoreProducts);

if(view)
{
    for(i=0; i<view.length; i++)
        view[i].addEventListener("click", showDesc);
}

function getMoreProducts(event)
{
    var xhttp = new XMLHttpRequest();
    xhttp.open('GET','/getProducts');
    xhttp.addEventListener('load', displayCards);
    xhttp.send();
}

function displayCards(response)
{
    var data = JSON.parse(response.target.responseText);
    console.log(data.data);
    data.data.forEach(function(product, index){
        var card = document.createElement('div');
        card.className+="cards";
        card.setAttribute("id", product.id);

        var image = document.createElement('img');
        image.src = "/images/"+product.image;
        image.setAttribute("class", product.class);

        var title = document.createElement('h1');
        title.innerHTML = "<br>"+product.title+"<br><br>";

        var addCard=document.createElement('button');
        addCard.innerHTML="<a href='/add_to_cart?id="+product.id+"'>Add to Card</a>";

        var view = document.createElement('button');
        view.innerText="VIEW";
        view.setAttribute("class", "view");
        view.addEventListener("click", showDesc);

       
        

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(addCard);
        card.appendChild(view);
        

        container.appendChild(card);
        
    });
    if(data.removeLoadMore)
    {
        loadMore.parentNode.removeChild(loadMore);
    }

}

function showDesc(event)
{
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST','/getDescription');
    xhttp.addEventListener('load', displayModal);
    xhttp.setRequestHeader('Content-type', 'application/json');
    var obj = {
        id : event.target.parentNode.id
    };
    xhttp.send(JSON.stringify(obj));
}

function displayModal(response)
{
    var product = JSON.parse(response.target.responseText);
    
    console.log(product);

    var modal = document.createElement('div');
    modal.setAttribute('class', 'modal');

    var content = document.createElement('div');
    content.setAttribute('class', 'content');
    
    var title = document.createElement('h1');

    var close = document.createElement('button');
    close.addEventListener("click", closeModal);
    close.setAttribute('class', 'closeButton');
    close.innerText="X";
    // close.innerHTML+="<a href='/verify_account'>verify</a>";

    if(product.error)
    {
        title.innerText = product.error;

        content.appendChild(close);
        content.appendChild(title);
        modal.appendChild(content);
        container.appendChild(modal);
        
    }
    else
    {
        
        title.innerHTML = product.title+"<br>";    

        var image = document.createElement('img');
        image.src = "/images/"+product.image;
        image.setAttribute('class', 'modalImage');

        var desc = document.createElement('div');
        desc.innerHTML = "DESCRIPTION : <br>"+product.description;
        desc.setAttribute('class', 'desc');

        var price = document.createElement('div');
        price.innerHTML = "<br>PRICE : &#8377;"+product.price;
        price.setAttribute('class', 'desc');

        var stock = document.createElement('div');
        stock.innerHTML = "<br>STOCK : "+product.stock;
        stock.setAttribute('class', 'desc');


        content.appendChild(close);
        content.appendChild(title);
        content.appendChild(image);
        content.appendChild(desc);
        content.appendChild(stock);
        content.appendChild(price);
        modal.appendChild(content);
        container.appendChild(modal);
    }

}

function closeModal(event)
{
    var parent = event.target.parentNode.parentNode.parentNode;
    var child = event.target.parentNode.parentNode;
    parent.removeChild(child);
}