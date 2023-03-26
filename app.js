const express = require("express");
const app = express();

let crochetCriteria = {
    nbrColors: 3,
    baseStitchCount: 8,
    stitchSize: 10
};

let nbrColors = 2

// prepare to read forms
app.use(express.urlencoded({extended: true}));
app.use(express.static("public")); // this tells express where to find all static files

// set up ejs for use
app.set('view engine', 'ejs');

app.listen(3000, function (){
    console.log("server started on port 3000");
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

    res.render('round', {
        criteria: crochetCriteria
    });
    
})

app.post("/sendSettings", function(req,res){

    crochetCriteria.baseStitchCount = req.body.baseStitches;
    crochetCriteria.nbrColors = req.body.nbrColors;
    crochetCriteria.stitchSize = req.body.stitchSize;
    crochetCriteria.randomize = req.body.randomize;

    res.redirect("/round");
})