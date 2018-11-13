var mysql = require("mysql");
var inquirer = require("inquirer");
var moment = require("moment");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

start_mgr();

function start_mgr(){
    inquirer.prompt([
        {
            type: "list",
            message: "Select a manager option for the system",
            choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product"],
            name: "main_opt"
        }
    ]).then(function(MainMnu){
        switch(MainMnu.main_opt)
        {
            case "View Products for Sale":
                view_prod();
                break;
            case "View Low Inventory":
                low_inv();
                break;
            case "Add to Inventory":
                add_inv();
                break;
            case "Add New Product":
                break;
        }
    });
}

function view_prod(){
    console.log("Product ID | Product Name | Department | Price | Product Status | Available Quantity");
    connection.query("select * from prod_inv",function(err,res){
        if(err) throw err;
        res.forEach(prn_all_inv);
    });
    inquirer.prompt([
        {
            type: "confirm",
            message: "Do you want to return to the main menu",
            name: "rtn_menu",
            default: true
        }
    ]).then(function(Rtn_menu){
        if(Rtn_menu.rtn_menu)
        {
            start_mgr();
        }
    });
}

function prn_all_inv(inv){
    console.log(inv.item_id + "|" + inv.product_name + "|" + inv.department_name + "|" + inv.price + "|" + inv.prod_sts + "|" + inv.avail_qty);
}

function low_inv(){
    console.log("Product ID | Product Name | Department | Price | Product Status | Available Quantity");
    connection.query("select * from prod_inv where avail_qty <= 5",function(err,res){
        if(err) throw err;
        res.forEach(prn_all_inv)
    });
    inquirer.prompt([
        {
            type: "confirm",
            message: "Do you want to return to the main menu",
            name: "rtn_menu",
            default: true
        }
    ]).then(function(Rtn_menu){
        if(Rtn_menu.rtn_menu)
        {
            start_mgr();
        }
    });
}

function add_inv(){
    
}