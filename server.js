const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const mongoose = require("mongoose");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(
  session({
    secret: "keyboardkitteh",
    resave: false,
    saveUninitialized: true
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/static"));
app.use(flash());

mongoose.connect("mongodb://localhost/message_board", {
  useNewUrlParser: true
});

const CommentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Comments must have a name"] },
    comment: {
      type: String,
      required: [true, "Comments must have some content"]
    }
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, "Messages must have an author"],
      minlength: 1
    },
    message: {
      type: String,
      required: [true, "Messages must have some content"],
      minlength: 1
    },
    comments: [CommentSchema]
  },
  { timestamps: true }
);
const Comment = mongoose.model("Comment", CommentSchema);
const Message = mongoose.model("Message", MessageSchema);

app.get("/", (req, res) => {
  Message.find()
    .then(messages => {
      console.log("*****************All messages: ", messages);
      console.log(messages.length);
      res.render("index", { messages: messages })
    })
    .catch(err => res.json(err));
});

app.post("/post_msg", (req, res) => {
  const message = new Message();
  console.log("****************" + req.body.message + req.body.author)
  message.author = req.body.author;
  message.message = req.body.message;
  message
    .save()
    .then(msg => {
      console.log("*****************Message made: ", msg);
      res.redirect("/");
    })
    .catch(err => {
      for (var key in err.errors) {
        console.log("key --> ", key);
        console.log("err.errors[key] --> ", err.errors[key]);
        console.log("err.errors[key].message --> ", err.errors[key].message);
        req.flash("registration", err.errors[key].message);
      }
    });
});

app.post("/post_comment/:id", (req, res) => {
  const comment = new Comment();
  comment.name = req.body.name;
  comment.comment = req.body.comment;
  comment
    .save()
    .then(cmnt => {
      console.log("*****************Comment made: ", cmnt);
      console.log(req.params.id);
      Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: cmnt}}, function(err, cmnt){
        if(err){
          console.log("************IN IF ERR")
        }
        else{
          console.log("************IN ELSE ERR")
        }
      });
      res.redirect("/");
    })
    .catch(err => {
      for (var key in err.errors) {
        console.log("key --> ", key);
        console.log("err.errors[key] --> ", err.errors[key]);
        console.log("err.errors[key].message --> ", err.errors[key].message);
        req.flash("registration", err.errors[key].message);
      }
    });
});

app.listen(8000, () => console.log("PORT 8000 - DAHSBOARD"));
