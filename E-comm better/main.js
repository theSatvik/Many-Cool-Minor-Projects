const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
const mailjet_client = require ('node-mailjet');
const jwt = require('jsonwebtoken');
const jwt_secret = "ElPsyCongroo";
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const serverUrl = "https://ecommerce3-3p34g85ek9kquue4j2.codequotient.in";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));

const mailjet = mailjet_client
    .connect('f63f5a0be49d8852e793a3795db19377', '7bf9bd404b7a05e49bcf968650d910a7')

const signup = (req, res) => {
	console.log(req.session)
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.errors[0].msg);
      return res.status(400).end(errors.errors[0].msg);
    }
    fs.readFile('./users.txt',"utf-8",function(err_r,f_data){
        if(err_r){
            res.status(500).end("Error Occured");
        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            for(var i in data){
                if(data[i].email==req.body.email){
                    flag = 1;
                    res.status(400).end("*This User already exists.")
                }                
            }
            if(flag == 0)
            {
                var verification_key = uuidv4();
                var newData = {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    is_verified:false,
                    verification_key: verification_key
                };
                data.push(newData);
                jwt.sign({ email: newData.email, username: newData.username }, jwt_secret, {  }, function(err, token) {

                    fs.writeFile("./users.txt", JSON.stringify(data), function(err){
                        if(err){
                            res.status(500).end("error");
                        }else{
                            console.log("User account created successfully");
                            var verifyToken = jwt.verify(token,jwt_secret);
                                if (verifyToken.email){
                                    var verification_url = serverUrl+'/verifyEmail?verification_key='+verification_key;
                                    res.cookie("auth",token);
                                    sendVerificationMail({Username:newData.username, confirmation_link:verification_url}, newData.email);                                
                                    
                                    res.status(200).end("user account created");
                                }
                        }
                    });
                });
            }

        }
    });
    
}

function readProduct(callback)
{
    fs.readFile("./products.txt","utf-8", function(err, data)
    {
        data  = data ? JSON.parse(data) : [];
        callback(data);
    })
}

const login = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).end("Invalid Email and Password");
    }
    fs.readFile("./users.txt","utf-8",function(err,f_data){
        if(err){
            res.end("Error occured in login");
        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            for (var i in data){
                if(data[i].email.toLowerCase()==req.body.email.toLowerCase() && data[i].password==req.body.password)
                {
                    console.log(12);
                    flag = 1;
                    jwt.sign({ email: data[i].email,username: data[i].username }, jwt_secret, { }, function(err, token){
                        console.log(err);
                        console.log("logging in");
                        res.cookie("auth",token);                        
                        res.status(200);
                        res.end("LoggedIn");
                    });
                }
            }
            if(flag==0)
            {
                res.end("Invalid Email or Password");
            }
            
        }
    });
    
}

function userIsLoogedIn(req, res, next)
{
    console.log(req.cookies);
    req.isLoggedIn = false;
    if(req.cookies && req.cookies.auth)
    {
        var verifyToken = jwt.verify(req.cookies.auth,jwt_secret);
        console.log(verifyToken)
        if (verifyToken.email){
            fs.readFile("./users.txt","utf-8",function(err,f_data){
                if(err){
                    req.isLoggedIn = false;
                    next();
                }else{
                    var data = f_data.length ? JSON.parse(f_data) : [];
                    var flag = 0;
                    for (var i in data){
                        if(data[i].email.toLowerCase()==verifyToken.email.toLowerCase())
                        {
                            console.log("checking");
                            req.isLoggedIn = true;
                            console.log(req.isLoggedIn);
                            req.email = verifyToken.email;
                            req.username = verifyToken.username;
                            req.isVerified = data[i].is_verified
                            
                        }
                    }
                    next();             
                }
            });
        }
    }else{
        next();
    }
    
}

function sendVerificationMail(sendDetails, recipientEmail)
{
    /**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */
    
    const request = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
        "Messages":[
            {
                "From": {
                    "Email": "albert1kent@gmail.com",
                    "Name": "Fooley Cooley"
                },
                "To": [
                    {
                        "Email": recipientEmail,
                        "Name": sendDetails.Username
                    }
                ],
                "TemplateID": 3024026,
                "TemplateLanguage": true,
                "Subject": "Welcome to FooleyCooley",
                "Variables": {
                    message: "Welcome to FooleyCooley. Please confirm your email address by clicking on the button below.",
                    ActionName: "Confirm Email",
    ...sendDetails
    }
            }
        ]
    })
    request
    .then((result) => {
        console.log("Result")
        console.log(result.body)
    })
    .catch((err) => {
        console.log("error mail")
        console.log(err.statusCode)
    })

}

app.get('/',userIsLoogedIn, (req, res) =>{
    console.log(req.isLoggedIn);
    if(req.isLoggedIn)
    {
        res.redirect('/home');
    }
    res.render('welcome', {error: ''});
});
app.get('/signup',userIsLoogedIn, (req, res) =>{
    if(req.isLoggedIn)
    {
        res.redirect('/home');
    }
    res.render('signup', {error: ''});
});
app.get('/login',userIsLoogedIn, (req, res) =>{
    if(req.isLoggedIn)
    {
        res.redirect('/home');
    }
    res.render('login', {error: ''});
});

app.get('/home',userIsLoogedIn, (req, res) => {
    
	if(req.isLoggedIn)
    {
        if(!req.isVerified)
            res.render("verifyEmail", {message: ""});
        else
            readProduct(function(products)
            {
                products = products.slice(0, 5);
                fs.readFile('./cart.txt', 'utf-8', function(err, cartList){
                    if(err)
                        res.status(500).send(err)
                    else{
                        cartList  = cartList ? JSON.parse(cartList) : [];
                        for(i in cartList)
                        {
                            if(cartList[i].email == req.email)
                            {
                                for(j in products)
                                {
                                    if(cartList[i].prolist[products[j].id])
                                    products[j].addedToCart = true;
                                    else
                                    products[j].addedToCart = false;
                                }
                                break;
                            }
                        }
                    }
                    res.render("home",{products:products,username:req.username})
                })
                
            })
    }
    else
    {
        res.redirect('/');
    }
});

app.get('/viewCart', userIsLoogedIn, (req, res) =>{
    if(!req.isLoggedIn)
        res.status(302).redirect('/login');
    else
    {
        if(!req.isVerified)
            res.render("verifyEmail", {message: ""});
        else
        {
            fs.readFile("./cart.txt", "utf-8", function(errcart, cartList){
                if(errcart){
                    res.status(500).send(err);
                }
                else{
                    cartList  = cartList ? JSON.parse(cartList) : [];
                    var flag = -1;
                    for(i in cartList)
                    {
                        if(cartList[i].email == req.email)
                        {
                            flag = i;
                            break;
                        }
                    }
                    if(flag != -1)
                    {
                        res.render('viewCart', {product:cartList[flag].prolist,username:req.username, message: ""})
                    }else{
                        res.render('viewCart', {product:{},username:req.username, message: "Your Cart is Empty"})
                    }
                }

            })
        }
    }

});

app.get('/logout',(req,res) => { 
    res.clearCookie('auth');
    res.status(302).redirect("/login");
});


app.get('/forgotPassword', (req, res) =>{
    res.render('forgotPassword', {message: ''});
});

app.get('/verifyEmail', (req, res) =>{

    var verification_key = req.query.verification_key;
    fs.readFile("./users.txt","utf-8",function(err,f_data){
        if(err){
            res.send("Some Error occoured at the server")

        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            for (var i in data){
                if(data[i].verification_key==verification_key)
                {
                    data[i].is_verified = true;
                    data[i].verification_key = "";
                    flag = 1;
                    break;
                }
            }
            if(flag == 0)
            {
                res.render("verifyEmail", {message: "This Link has Expired"});
            }
            else{
                fs.writeFile("./users.txt", JSON.stringify(data), function(err){
                    if(err){
                        res.status(500).end("error");
                    }else{
                        res.redirect("/home");
                    }
                });
            }


        }
    });

});

app.get('/resetPassword', (req, res) =>{

    var verification_key = req.query.verification_key;
    fs.readFile("./users.txt","utf-8",function(err,f_data){
        if(err){
            res.send("Some Error occoured at the server")

        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            for (var i in data){
                if(data[i].verification_key==verification_key)
                {
                    flag = 1;
                    break;
                }
            }
            if(flag == 0)
            {
                res.render("forgotPassword", {message: "This Link has Expired"});
            }
            else{
                res.render("resetPassword");
            }


        }
    });

})

app.post('/signup',body('password').isLength({min: 5}).withMessage('password must be atleast 5 char long'),body('email').isEmail().withMessage('Invalid Email'), signup);
app.post('/login',body('password').isLength({min: 5}).withMessage('Invalid Email or password'),body('email').isEmail().withMessage('Invalid Email or password'), login);

app.post('/getProductDetails',userIsLoogedIn, function(req, res) {
    if(req.isLoggedIn)
    {
        if(!req.isVerified)
            res.render("verifyEmail", {message: ""});
        else
        {
            fs.readFile("./products.txt", "utf-8", function(err, f_data) {
                if(err) {
                    res.send(err);
                }
                else {
                    id = req.body.id;
                   
                    f_data = JSON.parse(f_data);
                    f_data.forEach(function(pro) {
                    
                        if(pro.id == id) {
        
                            res.send(pro);
                        }
                    })
                }
            })
        }
    }
    
});

app.post('/addToCart',userIsLoogedIn, function(req, res) {
    if(req.isLoggedIn)
    {
        if(!req.isVerified)
            res.render("verifyEmail", {message: ""});
        else
        {
            fs.readFile("./products.txt", "utf-8", function(err, f_data) {
                if(err) {
                    res.status(500).send(err);
                }
                else {
                    id = req.body.id;                   
                    f_data  = f_data ? JSON.parse(f_data) : [];
                    var productfound = 0
                    f_data.forEach(function(pro) 
                    {
                        if(pro.id == id)
                        {
                            productfound = 1;
                            fs.readFile("./cart.txt", "utf-8", function(errcart, cartList){
                                if(errcart){
                                    res.status(500).send(err);
                                }
                                else{
                                    cartList  = cartList ? JSON.parse(cartList) : [];
                                    var flag = -1;
                                    for(i in cartList)
                                    {
                                        if(cartList[i].email == req.email)
                                        {
                                            flag = i;
                                            break;
                                        }
                                    }
                                    var newcartList = {};
                                    newcartList[pro.id] = {
                                        title: pro.title,
                                        description: pro.description,
                                        qty: 1,
                                        src: pro.src
                                    }
                                    if(flag != -1)
                                    {
                                        if(cartList[flag].prolist[pro.id])
                                        {
                                            cartList[flag].prolist[pro.id].qty++;
                                        }
                                        else{
                                            cartList[flag].prolist[pro.id] = {...newcartList[pro.id]};
                                        }
                                    }else{
                                        cartList.push({email: req.email, prolist: {...newcartList}});
                                    }
                                    fs.writeFile("./cart.txt", JSON.stringify(cartList), function(err){
                                        if(err)
                                        {
                                            res.status(500).send(err);
                                        }
                                        else{
                                            res.status(200).send("success");
                                        }
                                    })
                                }

                            })
                        }
                    })
                    if(productfound==0)
                        res.status(404).send("product not found");
                }
            })
        }
    }
    else
    {
        res.status(302).send('login');
    }
    
});

app.post('/removeFromCart',userIsLoogedIn, function(req, res) {
    if(req.isLoggedIn)
    {
        if(!req.isVerified)
            res.render("verifyEmail", {message: ""});
        else
        {
            fs.readFile("./cart.txt", "utf-8", function(errcart, cartList){
                if(errcart){
                    res.status(500).send(err);
                }
                else{
                    cartList  = cartList ? JSON.parse(cartList) : [];
                    var message = "";
                    for(i in cartList)
                    {
                        if(cartList[i].email == req.email)
                        {
                            if(cartList[i].prolist[req.body.id])
                            {
                                delete cartList[i].prolist[req.body.id]
                                if(Object.keys(cartList[i].prolist).length === 0)
                                {
                                    cartList.splice(i, 1);
                                    message = "Your Cart is Empty";
                                }
                            }
                            break;
                        }
                    }
                    fs.writeFile("./cart.txt", JSON.stringify(cartList), function(err){
                        if(err)
                        {
                            res.status(500).send(err);
                        }
                        else{
                            res.status(200).send(message);
                        }
                    })
                }

            })
        }
    }
    else
    {
        res.status(302).send('login');
    }
    
});


app.post('/loadMore',userIsLoogedIn, (req, res) => {
    if(!req.isLoggedIn)
        res.send("notfound");
	var num=parseInt(req.body.pgno) * 5;
        readProduct(function(products)
        {
            console.log(products);
            var array=[];
            for(var i=num;i<num+5&&i<products.length;i++){
                array.push(products[i]);
            }
            console.log(array);
            fs.readFile('./cart.txt', 'utf-8', function(err, cartList){
                if(err)
                    res.status(500).send(err)
                else{
                    cartList  = cartList ? JSON.parse(cartList) : [];
                    for(i in cartList)
                    {
                        if(cartList[i].email == req.email)
                        {
                            for(j in array)
                            {
                                if(cartList[i].prolist[array[j].id])
                                    array[j].addedToCart = true;
                                else
                                    array[j].addedToCart = false;
                            }
                            break;
                        }
                    }
                    res.send(array);
                }
            })
            
        });
});


app.post('/reSendEmail', (req, res) =>{

    console.log("resend");
    res.end("good");
    fs.readFile("./users.txt","utf-8",function(err,f_data){
        if(err){
            res.status(500).send('Some Error occured. Please try again')
        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            var verification_key;
            for (var i in data){
                if(data[i].email==req.body.email)
                {
                    verification_key = uuidv4();
                    data[i].verification_key = verification_key;
                    flag = 1;
                    break;
                }
            }
            if(flag == 0)
            {
                res.status(404).send("This User Does not exist");
            }
            else{

                fs.writeFile("./users.txt", JSON.stringify(data), function(err){
                    if(err){
                        res.status(500).end("error");
                    }else{
                        var verification_url = serverUrl+'/verifyEmail?verification_key='+verification_key;
                        sendVerificationMail({Username:req.body.email, confirmation_link:verification_url});
                        // res.status(200).send("Email sent");
                    }
                });
            }


        }
    });
    
})

app.post('/reSetPassEmail', (req, res) =>{

    console.log("resend");
    res.end("good");
    fs.readFile("./users.txt","utf-8",function(err,f_data){
        if(err){
            res.status(500).send('Some Error occured. Please try again')
        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            var verification_key;
            for (var i in data){
                if(data[i].email==req.body.email)
                {
                    verification_key = uuidv4();
                    data[i].verification_key = verification_key;
                    flag = 1;
                    break;
                }
            }
            if(flag == 0)
            {
                res.status(404).send("This User Does not exist");
            }
            else{

                fs.writeFile("./users.txt", JSON.stringify(data), function(err){
                    if(err){
                        res.status(500).end("error");
                    }else{
                        var verification_url = serverUrl+'/resetPassword?verification_key='+verification_key;
                        var message = "Please reset your password by clicking on the button below."
                        sendVerificationMail({Username:req.body.email, confirmation_link:verification_url, message: message, ActionName: "Reset Password"});
                        // res.status(200).send("Email sent");
                    }
                });
            }


        }
    });
    
});

app.post('/resetPassword', (req, res) =>{

    var verification_key = req.query.verification_key;
    fs.readFile("./users.txt","utf-8",function(err,f_data){
        if(err){
            res.send("Some Error occoured at the server")

        }else{
            var data = f_data.length ? JSON.parse(f_data) : [];
            var flag = 0;
            for (var i in data){
                if(data[i].verification_key==verification_key)
                {
                    data[i].password = req.body.password;
                    data[i].verification_key = "";
                    flag = 1;
                    break;
                }
            }
            if(flag == 0)
            {
                res.render("forgotPassword", {message: "This Link has Expired"});
            }
            else{
                fs.writeFile("./users.txt", JSON.stringify(data), function(err){
                    if(err){
                        res.status(500).end("error");
                    }else{
                        res.redirect("/login");
                    }
                });
            }


        }
    });

});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})