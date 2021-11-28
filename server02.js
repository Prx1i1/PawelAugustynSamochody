var express = require("express")
var app = express()
var hbs = require('express-handlebars');
const PORT = process.env.PORT || 3000;
var path = require("path")
app.use(express.static('static'))
const Datastore = require('nedb')
let context = {}

const coll1 = new Datastore({
    filename: 'kolekcja.db',
    autoload: true
});
const coll2 = new Datastore({
        filename: 'backup.db',
        autoload: true
    });

app.get("/add", function(req,res){

const doc = {
    ubezpieczenie: req.query["ubezpieczenie"]==true ? "True": "False",
    benzyna: req.query["benzyna"]==true ? "True": "False",
    uszkodzony: req.query["uszkodzony"]==true ? "True": "False",
    naped4x4: req.query["napęd4x4"]==true ? "True": "False",
    action1: "delete",
    action2: "edit"
    };
    coll1.insert(doc, function (err, newDoc) {
        let doc2 = doc
        doc2["_id"] = newDoc["_id"]
        coll2.insert(doc2, function(err, newDoc){
            coll1.find({ }, function (err, docs) {
                context = {docsy: docs}
                res.render("index.hbs",context)
            });
        })
    });
})

app.get("/",function(req,res){

    coll1.find({ }, function (err, docs) {
            context = {docsy: docs}
            res.render("index.hbs",context)
        });
    

})

app.get("/delete",function(req,res){


    coll1.remove({ _id: req.query["data"] }, {}, function (err, numRemoved) {

        coll1.find({ }, function (err, docs) {
        context = {docsy: docs}
        res.render("index.hbs",context)

        });
    });


    
})

app.get("/edit",function(req,res){

    coll1.update({ _id: req.query["data"] }, { $set: {ubezpieczenie: `<select name='ubezpieczenie'><option>True</option><option>False</option><option>NoData</option></select>`,
                                                    benzyna: `<select name='benzyna'><option>True</option><option>False</option><option>NoData</option></select>`,
                                                    uszkodzony: `<select name='uszkodzony'><option>True</option><option>False</option><option>NoData</option></select>`,
                                                    naped4x4: `<select name='naped4x4'><option>True</option><option>False</option><option>NoData</option></select>`,
                                                    action1: "update", action2: "cancel"
} }, {}, function (err, numUpdated) {

    

            coll1.find({ }, function (err, docs) {
            context = {docsy: docs}
            res.render("index.hbs",context)
    
        });
    });
})


app.get("/update",function(req,res){
coll2.update({_id: req.query["data"]}, {$set: {ubezpieczenie: req.query["ubezpieczenie"], benzyna: req.query["benzyna"], uszkodzony: req.query["uszkodzony"],naped4x4: req.query["naped4x4"], action1: "delete", action2:"edit"} },{},function(err,numUpdated){
    coll1.update({_id: req.query["data"]}, {$set: {ubezpieczenie: req.query["ubezpieczenie"], benzyna: req.query["benzyna"], uszkodzony: req.query["uszkodzony"],naped4x4: req.query["naped4x4"], action1: "delete", action2:"edit"} },{},function(err,numUpdated){

        coll1.find({ }, function (err, docs) {
        context = {docsy: docs}
        res.render("index.hbs",context)
    
        });

    })

})
})

app.get("/cancel", function(req,res){


    coll1.remove({}, { multi: true }, function (err, numRemoved) {

        coll2.find({},function(err, docs){
            let keyscount = Object.keys(docs)
        

        for(let i = 0; i < keyscount.length; i++ ){
            coll1.insert(docs[i], function(err, newDoc){
                console.log(docs[i])
            })
        }

        coll2.find({ }, function (err, docs) {
        context = {docsy: docs}
        res.render("index.hbs",context)
            });
        })
    }); 
})

app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({
        defaultLayout: 'main.hbs' ,
        helpers: {         

            noData: function (data) {
                if (data != "NoData"){
                    return data
                }else{
                    return ""
                }
            },
    
        }
    }));
app.set('view engine', 'hbs');    
app.listen(PORT, function () {
        console.log("start serwera na porcie " + PORT )
    })