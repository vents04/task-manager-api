const express = require('express');
const app = express();
const mongoose = require('./db/mongoose');
const {User} = require('./db/schemas/user.schema');
const {Task} = require('./db/schemas/task.schema');
const sha1 = require('sha1');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const jwtSecret = "bobikoznaeangliiski";

app.use(bodyParser.json());

// Middleware //
let authentication = async (req, res, next) => {
    let token = req.header("x-auth-token");
    try {
        const verified = jwt.verify(token, jwtSecret);
        if (verified) {
            const user = await User.findOne({ _id: verified._id });
            if(user){
                req.user = verified;
            }else{
                res.sendStatus(401);
            }
        }
    } catch (error) {
        res.sendStatus(401);
    }
    next();
}

app.post("/signup", async (req, res) => {
    const emailExists = await User.findOne({ email: req.body.email });
    if(emailExists) res.sendStatus(409);

    const hashedPassword = sha1(req.body.password);

    const user = new User({ 
        email: req.body.email,
        password: hashedPassword
    })

    user.save().then(() => {
        const token = jwt.sign({ _id: user._id }, jwtSecret);
        res.header('x-auth-token', token).sendStatus(200);
    }).catch((err) => {
        console.log(err);
        res.sendStatus(500);
    })
})

app.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if(user){
        const givenPassword = req.body.password;
        const setPassword = user.password;
        const hashedGivenPassword = sha1(givenPassword);
        if(hashedGivenPassword == setPassword){
            const token = jwt.sign({ _id: user._id }, jwtSecret);
            res.header('x-auth-token', token).sendStatus(200);
        }else{
            res.sendStatus(401);
        }
    }else{
        res.sendStatus(404);
    }
})

app.post("/add/task", authentication, async (req, res) => {
    try{
        const userId = req.user._id;
        const user = await User.findOne({_id: userId});
        const task = new Task({
            email: user.email,
            title: req.body.title,
            description: req.body.description
        })
        task.save().then(() => {
            res.sendStatus(200);
        }).catch((err) => {
            console.log(err);
            res.sendStatus(500);
        })
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

app.put("/task/:taskId", authentication, async (req, res) => {
    var taskId = req.params.taskId;
    try{
        const task = await Task.findOneAndUpdate({_id: taskId}, {"$set": {"title": req.body.title, "description": req.body.description}});
        if(task) res.sendStatus(200);
        else res.sendStatus(500)
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

app.delete("/task/:taskId", authentication, async (req, res) => {
    try{
        await Task.findOneAndDelete({_id: req.params.taskId}).then(() => {
            res.sendStatus(200);
        }).catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

app.get("/tasks", authentication, async (req, res) => {
    try{
        const user = await User.findOne({_id: req.user._id});
        if(user){
            const tasks = await Task.find({email: user.email}).then((tasks) => {
                res.status(200).send(tasks);
            }).catch((err) => {
                console.log(err);
                res.sendStatus(500);
            });
        }else{
            res.sendStatus(500);
        }
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

app.listen(8080, () => {
    console.log("Server listening on port 8080");
})