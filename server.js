const express = require("express");
const app = express();
const port = 3005;
const passport = require("./passport/setup");
const mongoose = require("mongoose");
const { response } = require("express");
const bodyParser = require("body-parser");


//CONNECT TO DB
mongoose.connect("mongodb+srv://Richard:test1234@cluster0.suryg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//BODYPARSER AND PASSPORT INIT//MIDDLEWARES
app.use(bodyParser.json());
app.use(passport.initialize());


//GET MODELS
const Thread = require("./model/threads");
const Reply = require("./model/replies");
const Like = require("./model/likes");
// const User = require("./model/user"); //ONLY USED ONCE WHEN CREATED ACCOUNT



//GET IP//IPWARE https://www.npmjs.com/package/ipware
const getIP = require('ipware')().get_ip;
app.use(function(req, res, next) {
    var ipInfo = getIP(req);
    console.log(ipInfo);
  
    next();
});


//THREADS
//GET ALL THREADS
app.get("/thread",  passport.authenticate('basic', { session: false}) , async (req, res) => {
  const threads = Thread.find().then((threads) => res.json(threads));
});

//POST TO THREADS
app.post("/thread", passport.authenticate('basic', { session: false}) , async (req, res) => {
  const thread = new Thread(req.body);
  thread.save((error, createdThread) => res.status(201).json(createdThread));
});

//POST TO USER
app.post("/user", passport.authenticate('basic', { session: false}), async (req, res) => {
  const user = new User(req.body);
  user.save((error, createdUser) => res.status(201).json(createdUser));
});

//GET SPECIFIC THREAD
app.get("/thread/:id", passport.authenticate('basic', { session: false}) , async (req, res) => {
  let thread;
  try {
    thread = await Thread.findById(req.params.id);
  } catch (e) {
    res.status(400).send("Bad request");
  }

  if (thread) {
    res.json(thread);
  } else {
    res.status(404).send("Not found");
  }
});

//DELETE THREAD
app.delete("/thread/:id",passport.authenticate('basic', { session: false}) , async (req, res) => {
  try {
    await Thread.deleteOne({ _id: req.params.id });
  } catch (e) {
    res.status(400).send("Bad request");
  }
  res.status(200).end();
});

//UPDATE THREAD
app.put("/thread/:id", passport.authenticate('basic', { session: false}) , async (req, res) => {
  let thread;
  try {
    await Thread.findByIdAndUpdate(req.params.id, req.body);
    thread = await Thread.findById(req.params.id);
  } catch (e) {
    res.status(400).send("Bad request");
  }
  if (thread) {
    res.json(thread);
  }
});

//REPLIES (REPLY)
//FIND ALL REPLIES ON ALL THREADS
app.get("/thread/:id/reply/", passport.authenticate('basic', { session: false}), async (req, res) => {
  const reply = Reply.find().then((reply) => res.json(reply));
});


//GET SPECIFIC REPLY
app.get("/thread/:id/reply/:id", passport.authenticate('basic', { session: false}) , async (req, res) => {
  let reply;
  try {
    reply = await Reply.findById(req.params.id);
  } catch (e) {
    res.status(400).send("Bad request");
  }

  if (reply) {
    res.json(reply);
  } else {
    res.status(404).send("Not found");
  }
});

//POST TO REPLY
app.post("/thread:id/reply", passport.authenticate('basic', { session: false}), async (req, res) => {
  const reply = new Reply(req.body);
  reply.save((error, createdReply) => res.status(201).json(createdReply));
});

app.post("/thread/:id/reply", passport.authenticate('basic', { session: false}) , async (req, res) => {
  let thread;
  try {
    thread = await Thread.findById(req.params.id);
  } catch (e) {
    res.status(400).send("Bad request");
  }

  if (thread) {
    req.body.time = new Date();
    const reply = new Reply(req.body);
    thread.replies.push(reply);
    await reply.save();
    await thread.save();
    res.status(201).end();
  } else {
    res.status(404).send("Not found");
  }
});


//LIKES
//GET ALL LIKES
app.get("/thread/:id/reply/:id/like", passport.authenticate('basic', { session: false}) ,async (req, res) => {
  const like = Like.find().then((like) => res.json(like));
});

//GET A SPECIFIC LIKE FROM A REPLY AND THREAD
app.get("/thread/:id/reply/:id/like/:id", passport.authenticate('basic', { session: false}) , async (req, res) => {
  let like;
  try {
    like = await Like.findById(req.params.id);
  } catch (e) {
    res.status(400).send("Bad request");
  }

  if (like) {
    res.json(like);
  } else {
    res.status(404).send("Not found");
  }
});


//POST A LIKE ON A REPLY
app.post("/thread/:id/reply/:id/like/", passport.authenticate('basic', { session: false}) , async (req, res) => {
  let reply;
  try {
    reply = await Reply.findById(req.params.id);
  } catch (e) {
    res.status(400).send("Bad request");
  }

  if (reply) {
    req.body.time = new Date();
    const like = new Like(req.body);
    reply.likes.push(like);
    await like.save();
    await reply.save();
    res.status(201).end();
  } else {
    res.status(404).send("Not found");
  }
});

//DELETE A LIKE
app.delete("/thread/:id/reply/:id/like/:id", passport.authenticate('basic', { session: false}) ,async (req, res) => {
  try {
    await Like.deleteOne({ _id: req.params.id });
  } catch (e) {
    res.status(400).send("Bad request");
  }
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//END