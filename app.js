let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
const express = require("express");
const app = express();

let roundCriteria = {
    nbrColors: 2,
    baseStitchCount: 6,
    stitchSize: 10,
    color1:'#9B4F3F',
    color2: '#FFFFFF',
    color3: '#D4AF37',
    color4: '#281E5D'
};

let rectCriteria = {
    nbrColors: 2,
    baseStitchCount: 30,
    rowCount: 30,
    color1: '#9B4F3F',
    color2: '#FFFFFF',
    color3: '#D4AF37',
    color4: '#281E5D'
};

// prepare to read forms
app.use(express.urlencoded({extended: true}));
app.use(express.static("public")); // this tells express where to find all static files

// set up ejs for use
app.set('view engine', 'ejs');

app.listen(port, function (){
    console.log("server started");
});

/**************/
/* HOME ROUTE */
/**************/
app.get("/", function(req, res){

    res.redirect("/round");    
})


/**************/
/* ABOUT ROUTE */
/**************/

app.get("/about", function(req, res){

    res.render('about');
    
})

/**************/
/* ROUND ROUTE */
/**************/

app.get("/round", function(req, res){

    res.render('roundbs', {
        criteria: roundCriteria
    });
    
})

app.post("/sendSettings", function(req,res){

    roundCriteria.baseStitchCount = req.body.baseStitches;
    roundCriteria.nbrColors = req.body.nbrColors;
    roundCriteria.stitchSize = req.body.stitchSize;
    roundCriteria.randomize = req.body.randomize;
    roundCriteria.color1 = req.body.color1;
    roundCriteria.color2 = req.body.color2;
    roundCriteria.color3 = req.body.color3;
    roundCriteria.color4 = req.body.color4;
    res.redirect("/round");
})

/**************/
/* Rect crochet ROUTE */
/**************/

app.get("/rect", function(req, res){
    res.render('rect', {
        criteria: rectCriteria
    });
    
})


app.post("/sendRectSettings", function (req, res) {

    rectCriteria.baseStitchCount = req.body.baseStitches;
    rectCriteria.nbrColors = req.body.nbrColors;
    rectCriteria.rowCount = req.body.rowCount;
    rectCriteria.randomize = req.body.randomize;
    rectCriteria.color1 = req.body.color1;
    rectCriteria.color2 = req.body.color2;
    rectCriteria.color3 = req.body.color3;
    rectCriteria.color4 = req.body.color4;
    res.redirect("/rect");
})

/**************/
/* RESOURCES ROUTE */
/**************/

app.get("/resources", function(req, res){

    res.render('resources');
    
})
