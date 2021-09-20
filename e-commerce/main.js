const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cookie_parser = require('cookie-parser');
const mailjet_clinet = require ('node-mailjet');
const port = 3000;

var displayedProducts = 5,clientname="";

var jwt = require('jsonwebtoken');
const { json } = require('express');
var jwt_secret = "jwtSecretKey";

app.set('view engine', 'ejs');
app.set('views', (path.join(__dirname, 'views')));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookie_parser());

app.use(express.static(path.join(__dirname, 'static')));

app.use(function(req, res, next)
{

    var token  = req.cookies.jwt

    if(token)
    {
        jwt.verify(token,jwt_secret, function(err, data)
    {
        req.profile = data;
        next();
    });

    }
    else
    {
        req.profile = {};
        next();
    }

        
})

var mailjet = mailjet_clinet.connect('ab63a5544183ca53eec62be8d36b87a0', '8ce8bc1250fcb766f9f6bfd70e36237a')


app.get('/', (req, res)=>{
  let token = req.cookies.jwt;
  if(token)
  {
    jwt.verify(token, jwt_secret, (err, decodedToken)=>{
      displayedProducts = 5;
      readProduct(function(products)
      {       
           readCart(function(cart)
            {     
                clientname=decodedToken.cusname;
        res.render("index",{
          header:'loggedInHeader',
          cusname: decodedToken.cusname,
          products: products,
          view: "<button class='view'>VIEW</button>",
          loadmore:"<button id='loadMore' style='float: right;'> LOAD MORE </button>",cart_items:cart
            });
        });
       });
    });
    
  }
  else
  {
    readProduct(function(products)
    {
        readCart(function(cart)
            {   
      res.render("index", {
        header: 'logInHeader',
        products: products,
        view: "<button class='view'>VIEW</button>",
        loadmore:"<button id='loadMore' style='float: right;'> LOAD MORE </button>",
cart_items:cart
        });
        });
     });
    
  }
  
  
});

app.get("/add_to_cart", function(req, res)
{
    var product_id = req.query.id;
    readProduct(function(products)
    {
        readCart(function(cart)
        {
            console.log(product_id);
             var prod = products.filter(function(item)
              {
                  console.log(item.id);
                  if(item.id == product_id){
                    //   console.log(item);
                      return item;
                  }
              });
              if(prod.length)
              {
                  cart.push(prod[0]);
              }
             console.log(cart);
            saveToCart(cart, function()
            {
                res.render("index",{products:products,cusname:clientname, header:'loggedInHeader',  cart_items:cart,view:"<button class='view'>VIEW</button>",loadmore:"<button id='loadMore' style='float: right;'> Load More </button>"});
            })
        })

    })
})


app.get("/remove_from_cart", function(req, res)
{
    var product_id = req.query.id;
       readCart(function(cart)
        {
            var filteredCart = cart.filter(function(ele){ 
                return ele.id != product_id;
            });
             console.log(filteredCart);
            saveToCart(filteredCart, function()
            {
                res.render("cart",{products:filteredCart,cusname:clientname, header:'loggedInHeader'});
            })
        })

})

app.get("/cart", function(req, res)
{
    console.log(req.cookies);

    if(!req.cookies.jwt)
    {
        res.redirect("/login");
        return
    }
    readProduct(function(products)
    {
      
        readCart(function(cart)
        {
//            
            res.render("cart",{products:cart});
        });
    });
});

function readCart(callback)
{
    fs.readFile("./cart.txt","utf-8", function(err, data)
    {
        data  = data ? JSON.parse(data) : {};
     
        callback(data);
    })
}

function saveToCart(data, callback)
{
    fs.writeFile("./cart.txt", JSON.stringify(data),function(err)
    {
        callback(err);
    });
}

app.get('/logout', (req, res)=>{
  displayedProducts = 5;
  res.cookie('jwt', '', {maxAge:1});
  res.redirect("/");
});

app.get('/login', (req, res)=>{
  let token = req.cookies.jwt;
  if(token)
  {
    res.redirect("/");
  }
  else
  {
    res.render("login", {
      error:""
    });
  }
  
  
});

app.get('/signup', (req, res)=>{
  let token = req.cookies.jwt;
  if(token)
  {
    res.redirect("/");
  }
  else
  {
    res.render("signup",{
      nameError:"",
      usernameError:"",
      passwordError:"",
      emailError:""
    });
  }
  
  
});

app.post('/signup', (req, res) => 
{
    var cusname = req.body.cusname;
    var username =  req.body.username;
    var email = req.body.email;
    var password =  req.body.password;


    if(cusname=="")
    {
      var cusnameerr={cusnameerr:"PLEASE FILL IN YOUR NAME"};
      res.end(JSON.stringify(cusnameerr));
    }
    else if(email=="")
    {
      var emailerr={emailerr:"PLEASE FILL IN YOUR EMAIL"};
      res.end(JSON.stringify(emailerr));
    }
    else if(username=="")
    {
      var usernameerr={usernameerr:"PLEASE FILL IN YOUR USERNAME"};
      res.end(JSON.stringify(usernameerr));
    }
    else if(password=="")
    {
      var passworderr={passworderr:"PLEASE FILL IN YOUR PASSWORD"};
      res.end(JSON.stringify(passworderr));
    }
    else
    {
      readUsersFromFile(function(users)
      {
        var err = 0;
          var exixting_user = users.filter(function(user)
          {
              if(user.username === username)
              {
                err=1;
                return true;
              }
              if(user.email === email)
              {
                err=2;
                return true;
              }
          })

          if(exixting_user.length)
          {
            if(err == 1)
            {
              var usernameerr={usernameerr:"USER ALREADY EXISTS"};
              res.end(JSON.stringify(usernameerr));
            }
            else if(err == 2)
            {
              var emailerr={emailerr:"EMAIL ALREADY EXISTS"};
              res.end(JSON.stringify(emailerr));
            }
          }
          else
          {
              users.push({
                  cusname:cusname,
                  email:email,
                  username:username,
                  password: password,
                  is_verified:false,
                  verification_key:"verificationKeyForSignup",
                  is_admin: true
              });

              saveUser(JSON.stringify(users),function(err)
              {
                  if(err)
                  {
                    var usernameerr="UNABLE TO CREATE USER. PLEASE TRY AGAIN";
                    console.log(err);
                    res.end(JSON.stringify(usernameerr));
                  }
                  else
                  {
                      console.log("user inserted");

                      const token = createToken(cusname, username);
                      res.cookie('jwt',token);
                      sendVerificationMail("verificationKeyForSignup", email, cusname);
                      var user={"user":"USER FOUND"};
                      res.end(JSON.stringify(user));

                  }
              })
          }
      });
    }

    

})


app.post('/login', (req, res) => 
{
    var username =  req.body.username;
    var password =  req.body.password;
    var err;

    if(username == "")
    {
      err={"error":"ENTER USERNAME"};
      res.end(JSON.stringify(err));
    }
    else if(password == "")
    {
      err={"error":"ENTER PASSWORD"};
      res.end(JSON.stringify(err));
    }
    else
    {
      readUsersFromFile(function(users)
      {
          var cusname;
          var exixting_user = users.filter(function(user)
              {
                  if(user.username === username && user.password === password)
                  {
                    cusname = user.cusname;
                      return true;
                  }
              })

              if(!exixting_user.length)
              {
                  err={"error":"USER NOT FOUND"};
                  res.end(JSON.stringify(err));
              }
              else
              {
                  
                  const token = createToken(cusname, username);
                  res.cookie('jwt',token);
                  var user={"user":"USER FOUND"};
                  res.end(JSON.stringify(user));
                  
              }
      });

    }

    

})




app.get("/verify_account", function(req, res)
{
  
  console.log("token, email");
    var token = req.query.verification_key;
    var email = req.query.email;
    readUsersFromFile(function(users){
      users.filter(function(user)
      {
      if(user.email == email)
      {
        if(user.verification_key == token)
        {
          user.is_verified = true;
          saveUser(JSON.stringify(users), (err)=>{
            console.log(err);
          });
          res.write('<a href="/">Home</a>');
          res.end("VERIFICATION COMPLETED. PLEASE HEAD BACK TO HOME");
          return true;
          
        }
        else
        {
          res.end("VERIFICATION UNSUCCESSFUL. PLEASE CHECK LINK");
          return true;
        }
        
      }


      });
    });
})



function sendVerificationMail(token, email, cusname)
{
  const request = mailjet.post("send", {'version': 'v3.1'}).request({
  "Messages":[
    {
      "From": {
        "Email": "ashu.shrivas3881219@gmail.com",
        "Name": "Admin"
      },
      "To": [
        {
          "Email": email,
          "Name": cusname
        }
      ],
      "Subject": "Verification email",
      "TextPart": "Verification email",
      "HTMLPart": "<h3>Dear "+cusname+", please click on this link to verify <a href='http://e-commerce-app-3p34g83mnzkqpeuqoy.codequotient.in/verify_account?verification_key="+token+"&email="+email+"'>Verify your account</a>!</h3><br />",
      "CustomID": "AppGettingStartedTest"
    }
  ]
})

request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err)
  })

}





function readUsersFromFile(callback)
{
    fs.readFile("./users.txt","utf-8", function(err, data)
    {
        data  = data ? JSON.parse(data) : [];

        callback(data);
    })
}

function saveUser(data,callback)
{
    fs.writeFile("./users.txt", data,function(err)
    {
        callback(err);
    });
}

function readProduct(callback)
{
    fs.readFile("./products.txt","utf-8", function(err, data)
    {
        data  = data ? JSON.parse(data) : [];
        var i = 0;
        var data_send = [];
        data.every(function(product, index)
        {
          data_send.push(product);
          i++
          if(i==displayedProducts)
            return false;
          else
            return true;
        }); 

        callback(data_send);
    });
}


app.get('/getProducts', (req, res)=>{
  
  
    fs.readFile("./products.txt","utf-8", function(err, data)
    {
          data  = data ? JSON.parse(data) : [];
          var i = 0;
          var data_send = [];
          data.every(function(product, index)
          {
            if(i>=displayedProducts)
            {
              data_send.push(product);
              
              i++;
              if(i%5==0)
                return false;
              else
                return true;
            }
            else
            {
              i++;
              return true;
            }
              
          });
          displayedProducts=i;

          var removeLoadMore = true;
          if(displayedProducts%5==0)
            removeLoadMore = false;
          var obj={
            data:data_send,
            removeLoadMore:removeLoadMore
            
          };
          res.send(JSON.stringify(obj));

    }); 
  
});

app.post('/getDescription', (req, res)=>{
  const token = req.cookies.jwt;
  if(token)
  {
    jwt.verify(token, jwt_secret, (err, decodedToken)=>{
      readUsersFromFile((users)=>{
        users.filter((user)=>{
          if(user.username == decodedToken.username)
          {
            if(user.is_verified == true)
            {
              var id = parseInt(req.body.id);
  
              fs.readFile("./products.txt","utf-8", function(err, data)
                {
                    data  = data ? JSON.parse(data) : [];
                    data.every(function(product, index)
                    {
                      if(product.id == id)
                      {
                        if(product.description == "")
                          product.description = "No description found";
                        res.end(JSON.stringify(product));
                        return false;
                      }
                      
                      else
                        return true;
                    });
                });
            }
            else
            {
              res.end(JSON.stringify({"error":"PLEASE VERIFY ACCOUNT TO CONTINUE"}));
            }
            return true;
          }
        });
      });
    });
    
  }
  else
  {
    res.end(JSON.stringify({"error":"PLEASE LOG IN TO CONTINUE"}));
  }
  
  
});

app.get('/changepassword', (req, res)=>{
  res.render('changepassword');
  
});

app.post('/sendChangePasswordLink', (req, res)=>{
  var email = req.body.email;
  if(email)
  {
    readUsersFromFile((users)=>{
      var totalUsers = users.filter((user)=>{
        if(user.email == email)
        {

          const request = mailjet.post("send", {'version': 'v3.1'}).request({
            "Messages":[
              {
                "From": {
                  "Email": "ashu.shrivas3881219@gmail.com",
                  "Name": "Admin"
                },
                "To": [
                  {
                    "Email": user.email,
                    "Name": user.cusname
                  }
                ],
                "Subject": "Verification email",
                "TextPart": "Verification email",
                "HTMLPart": "<h3>Dear "+user.cusname+", please click on this link to reset password <a href=http://e-commerce-app-3p34g83mnzkqpeuqoy.codequotient.in/resetPassword?email="+email+"'>Reset Password</a>!</h3><br />",
                "CustomID": "AppGettingStartedTest"
              }
            ]
          })
          
          request
            .then((result) => {
              console.log(result.body)
            })
            .catch((err) => {
              console.log(err)
            })
          

          res.end(JSON.stringify({user:"PASSWORD REST LINK SENT"}));
          return true;
        }
      });
      if(!totalUsers.length)
      {
        res.end(JSON.stringify({emailerr:"THIS IS NOT A REGISTERED EMAIL"}));
      }
    });
  }
  else
  {
    res.end(JSON.stringify({emailerr:"ENTER AN EMAIL"}));
  }
});

app.get('/resetPassword', (req, res)=>{
  var email = req.query.email;
  res.render('resetPassword', {email:email});

});

app.post('/resetingPassword', (req, res)=>{
  var password = req.body.password;
  var email = req.body.email;
  if(password)
  {
    readUsersFromFile((users)=>{
      users.every((user)=>{
        if(user.email == email)
        {
          user.password = password;
          return false;
        }
        else
          return true;
      });
      saveUser(JSON.stringify(users), (err)=>{
        if(err)
          res.end(JSON.stringify({emailerr:"ERROR RESETING PASSWORD"}));
        else
          res.end(JSON.stringify({user:"PASSWORD IS RESET"}));
      });
    });
  }
  else
  {
    res.end(JSON.stringify({emailerr:"ENTER A PASSWORD"}));
  }

});

const createToken = (cusname, username)=>{
  return jwt.sign({ username: username, cusname: cusname }, jwt_secret, { expiresIn : 60*60*24});
}

//admin routes

app.use("/admin",function(req, res, next)
{

    if( !req.profile.is_admin && req.path !== "/login" )
    {
        res.redirect("/admin/login");
        return
    }

    next();
})


app.get("/admin/login", function(req, res)
{
    res.render("admin/login",{error:""});
})

app.post("/admin/login", function(req, res)
{
    var body = req.body;

    console.log(body);

    var username =  body.username;
    var password =  body.password;

    readUsersFromFile(function(users)
    {
        var exixting_user = users.filter(function(user)
        {
            if(user.username === username && user.is_admin && password === user.password)
            {
                return true;
            }
        })

        if(!exixting_user.length)
        {
            res.render("admin/login",{ error:"user not found"})
        }
        else
        {
            
            jwt.sign(exixting_user[0],jwt_secret, {  }, function(err, token) 
            {
                res.cookie("jwt",token);

                res.redirect("/admin");
            });     
        }
    });
})


app.get("/admin", function(req, res)
{
    res.render("admin/index", {});
})


app.post("/add_product", function(req, res)
{   
    var product = req.body;
    readProduct(function(products)
    {
        products.push({
            title:product.title,
            price:product.price,
            description:product.description
        });

        saveProduct(products, function(err)
        {
            if(err)
            {
             res.json({
                    status:false,
                    error:err.message
                })   
            }
            else
            {
                res.json({
                    status:true,
                    data:""
                })
            }
        })
        
    })
})

app.post("/admin/get_product", function(req, res)
{   
    readProduct(function(products)
    {
        res.json({
            status:true,
            data:products
        })
    })
})



function saveProduct(data, callback)
{
    fs.writeFile("./products.txt",JSON.stringify(data), function(err)
    {
        callback(err);
    });
}



app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});