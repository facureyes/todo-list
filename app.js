//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

// Init express
app = express();

// Config body-parser (to retrieve form values)
app.use(bodyParser.urlencoded({extended: true}));

// Config public folder (root folder for reference)
app.use(express.static("public"));

// Config EJS (to add functionality and a connection between the back end and front end)
app.set('view engine', 'ejs');

// Set port
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});

// Connect to MongoDB 
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Define Schema (columns)
const itemsSchema = {
    name: {
        type: String, 
        required: [true, "You must specify a name."]
    },
    type: String,
    date: {
        type: Date, 
        default: new Date().setHours(0,0,0,0)
    }
}

// Define model (table)
const Item = mongoose.model("Items", itemsSchema);

// Define default items for first time use
const item1 = new Item({name:"Welcome to your todolist!", type:"today"});
const item2 = new Item({name:"Hit the + button to add a new item.", type:"today"});
const item3 = new Item({name:"<-- Hit this to delete an item.", type:"today"});
const item4 = new Item({name:"You can create your own list accesing /yourCustomList.", type:"today"});
const defaultItems = [item1, item2, item3, item4];

app.get('/today', (req,res)=>{
    Item.find({type: "today", date: new Date().setHours(0,0,0,0)}, (err, items)=>{
        if (err){
            console.log("Error during reading today items.");
        } else {
            // Add default items if empty
            if (items.length === 0){
                Item.insertMany(defaultItems, (err)=>{
                    if (err){
                        console.log(err);
                        console.log("Error during creating default items.");
                    } else {
                        console.log("Default items added.")
                        res.redirect('/');
                    }
                });
            } else {
                res.render("list",{listName: "Today", items:items, page: req.url});
            }
        }
    });
});

app.get('/', (req,res)=>{
    res.redirect("/today");
});

app.get('/about', (req,res)=>{
    res.render("about", {page: req.url});
});

app.get('/:listName', (req, res)=>{
    const listName = _.kebabCase((req.params.listName));
    // Display work items
    Item.find({type: listName}, (err, items)=>{
        if (err){
            console.log("Error during reading work items.");
        } else {
            console.log(_.startCase(_.camelCase(listName)));
            res.render("list",{listName: _.startCase(_.camelCase(listName)), items:items, page: req.url});
        }
    });
})

app.post('/', (req, res)=>{
    // Add new item to db
    let itemAdded = req.body.newItem;
    const newItem = new Item({name: itemAdded, type: _.kebabCase(req.body.currentList)});
    newItem.save();
    res.redirect("/" + _.kebabCase(req.body.currentList));
})

app.post('/delete', (req, res)=>{
    // Delete selected item
    const item_id = req.body.checkbox;
    Item.deleteOne({ _id:  item_id}, (err)=>{
        if(err){
            console.log("Couldnt remove item.");
        } else {
            res.redirect("/" + _.kebabCase(req.body.currentList));
        }
    });    
});


