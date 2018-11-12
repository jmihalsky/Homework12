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

    });
}