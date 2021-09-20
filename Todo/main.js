const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data',
    function(req,res){
        fs.readFile('./data.txt',"utf-8",function(err,data){
                if(!err){
                    data=data.length>0?JSON.parse(data):[];
                    res.send(data);
                }
                else res.end("ERROR file Opening");
            }
        );
    }
);

app.post('/upload',
    function(req,res){
        fs.writeFile('./data.txt',JSON.stringify(req.body),function(err,data){
                if(!err)res.end();
                else res.end("ERROR file Opening");
            }
        );
    }
);

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
