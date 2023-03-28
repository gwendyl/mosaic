let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
const express = require("express");
const app = express();

let crochetCriteria = {
    nbrColors: 2,
    baseStitchCount: 6,
    stitchSize: 10,
    color1:'#9B4F3F',
    color2: '#FFFFFF',
    color3: '#D4AF37',
    color4: '#281E5D'
};

let nbrColors = 2

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
        criteria: crochetCriteria
    });
    
})

app.post("/sendSettings", function(req,res){

    crochetCriteria.baseStitchCount = req.body.baseStitches;
    crochetCriteria.nbrColors = req.body.nbrColors;
    crochetCriteria.stitchSize = req.body.stitchSize;
    crochetCriteria.randomize = req.body.randomize;
    crochetCriteria.color1 = req.body.color1;
    crochetCriteria.color2 = req.body.color2;
    crochetCriteria.color3 = req.body.color3;
    crochetCriteria.color4 = req.body.color4;
    res.redirect("/round");
})

/**************/
/* BASIC crochet ROUTE */
/**************/

app.get("/basic", function(req, res){

    res.render('basic');
    
})

/**************/
/* RESOURCES ROUTE */
/**************/

app.get("/resources", function(req, res){

    res.render('resources');
    
})
