var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const db = require("./db");
const knex = require("knex")(db); 
const cors = require('cors');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var actionresultsRouter = require("./routes/actionresults");
var actionsRouter = require("./routes/actions");


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  req.db = knex; // This line is new
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/actions", actionsRouter);
app.use("/actionresults", actionresultsRouter);
app.use("/version", (req, res) =>
  req.db.raw("SELECT VERSION()").then((version) => res.send(version[0][0]))
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// Start the server
app.listen(app.get('port'), function() {
  console.log('Server is listening on port', app.get('port'));
});

module.exports = app;
