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
    connection.query("select * from products",function(err,res){
        if(err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Select a product which you want to add inventory for:",
                name: "prod_inv_add",
                choices: function(){
                    var all_prod = [];
                    for(var i = 0; i < res.length; i++)
                    {
                        all_prod.push(res[i].item_id + "|" + res[i].product_name);
                    }
                    return all_prod;
                }
            }
        ]).then(function(ProdInvAdd){
            var sp = ProdInvAdd.prod_inv_add.split("|");
            var slt_prod = sp[0];
            inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the load number (pallet id) of the new inventory.",
                    name: "load_num"
                }
            ]).then(function(Load){
                connection.query("select count(*) lodcnt from invtbl where load_id = ?", Load.load_num, function(err,res){
                    if(err) throw err;
                    if(res[0].lodcnt > 0)
                    {
                        console.log("Load number exists, try adding the item again");
                        add_inv();
                    }
                    else
                    {
                        var lodnum = Load.load_num;
                        inquirer.prompt([
                            {
                                type: "input",
                                message: "Enter the quantity of the product on the pallet.",
                                name: "palqty"
                            }
                        ]).then(function(PalQty){
                            var qty = PalQty.palqty;
                            connection.query("select * from locmst where curqty = 0", function(err,res){
                                if(err) throw err;

                                if(res.length > 0)
                                {
                                    inquirer.prompt([
                                        {
                                            type: "rawlist",
                                            message: "Select a location:",
                                            name: "sel_loc",
                                            choices: function(){
                                                var a_loc = [];
                                                for(var i = 0; i < res.length; i++)
                                                {
                                                    a_loc.push(res[i].loc);
                                                }
                                                return a_loc;
                                            }
                                        }
                                    ]).then(function(LocSel){
                                        var locsel = LocSel.sel_loc;

                                        var inv = {
                                            loc: LocSel.sel_loc,
                                            load_id: lodnum,
                                            item_id: slt_prod,
                                            qty: qty
                                        };

                                        connection.query("insert into invtbl set ?",inv,function(err,res){
                                            if(err) throw err;
                                            connection.query("update locmst set curqty = curqty + 1 where loc = ?",locsel,function(err,res){
                                                if(err) throw err;
                                                console.log("inventory added");
                                                start_mgr();
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });
}