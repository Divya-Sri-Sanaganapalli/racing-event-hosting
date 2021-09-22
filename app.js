//Importing modules
const express = require("express");      // Requires express module
const morgan = require("morgan");  // Morgan module requires. Morgan is used to store the HTTP requests and errors.
const eventRoutes = require('./routes/eventRoutes'); // requires the created eventRoutes js file into this file
const methodOverride = require("method-override"); // requires method-override. This is used for importing the PUT and DELETE which client doesnt support it.
const mongoose = require("mongoose");  /* requires mongoose module. Mongoose is used to relationships between data, provides schema validation, and is used to translate 
between objects in code and the representation of those objects in MongoDB. eg. Not require to define the id as Objectid. Mongoose can understand the id when defined as id*/
const session = require('express-session'); // requires session module. The session middleware handles all things for us, i.e., creating the session, setting the session cookie and creating the session object in req object.
const MongoStore = require('connect-mongo'); // requires mongodb module and connect to the mongodb server. This is the mongodb database 
const flash = require('connect-flash'); /* requires flash module. The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared \
after being displayed to the user. The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered.*/
const userRoutes = require('./routes/userRoutes'); //requires created userRoutes js file in this file

//Creating Application
const app = express();

//Configure Application
let port = 3000;
let host = "localhost"; // it is just the local computer address. It is used to test the website with local address.
app.set('view engine', 'ejs'); /* this is used to convert the template file ie ejs file to html  
At runtime, the template engine replaces variables in a template file with actual values, and transforms the template into an HTML file sent to the client.
 This approach makes it easier to design an HTML page. */


// connect to database
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/demos',      // connects to mongodb server 27017. demos is the collection name
    { useNewUrlParser: true , useUnifiedTopology: true })
.then(() => {
    app.listen(port, host, ()=>{ 
        console.log('Server is running on port', port);
    });

})
.catch(err=>console.log(err.message));


//Mount middleware functions
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan("tiny"));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'asfhjgjhbnhjabgnbm',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}),
    cookie: {maxAge: 60*60*1000}
}));

app.use(flash());

app.use((req, res, next)=>{
    res.locals.user = req.session.user||null; 
    res.locals.userName = req.session.userName||null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    //console.log(req.session);
    next();
});

//Set up route
app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/contact',(req,res)=>{
    res.render('contact');
});

app.get('/about',(req,res)=>{
    res.render('about');
});

app.use('/events', eventRoutes);
app.use('/users', userRoutes);

app.use((req,res,next)=>{
    let err = new Error("The server cannot locate " + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) =>{
    if(!err.status){
        err.status = 500;
        console.log(err.message);
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render("error",{error: err});
});

