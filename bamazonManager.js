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

var pck_info = {};
var pckid = 0;

start_mgr();

function start_mgr(){
    inquirer.prompt([
        {
            type: "list",
            message: "Select a manager option for the system",
            choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product","Pick Orders"],
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
                new_prod();
                break;
            case "Pick Orders":
                pck_ord();
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

function new_prod(){
    connection.query("select * from departments",function(err,res){
        if(err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Select a department which the new product will be part of:",
                name: "prod_dept",
                choices: function(){
                    var dept = [];
                    for(var i = 0; i < res.length; i++)
                    {
                        dept.push(res[i].department_id + "|" + res[i].department_name);
                    }
                    return dept;
                }
            }
        ]).then(function(DeptProd){
            var temp_dept = DeptProd.prod_dept.split("|");
            var dept = temp_dept[0];
            inquirer.prompt([
                {
                    type: "input",
                    message: "Product Name:",
                    name: "prodnam"
                },
                {
                    type: "input",
                    message: "Product Price:",
                    name: "prodprc"
                }
            ]).then(function(NewProd){
                var prod = {
                    product_name: NewProd.prodnam,
                    department_id: dept,
                    price: NewProd.prodprc
                };

                connection.query("insert into products set ?",prod,function(err,res){
                    if(err) throw err;
                    console.log("item created");
                    inquirer.prompt([
                        {
                            type: "confirm",
                            message: "Do you want to add inventory for this product",
                            name: "prodinv",
                            default: true
                        }
                    ]).then(function(NewProdInv){
                        if(NewProdInv.prodinv)
                        {
                            add_inv();
                        }
                        else
                        {
                            start_mgr();
                        }
                    });
                });
            });
        });
    });
}

function pck_ord(){
    connection.query("select * from invpck where pcksts = 'N'",function(err,res){
        if(err) throw err;
        inquirer.prompt([
            {
                type: "rawlist",
                message: "Select the pick work to complete",
                name: "pcklst",
                choices: function(){
                    var pcks = [];
                    for(var i = 0; i < res.length; i++)
                    {
                        pcks.push(res[i].picref + "|" + res[i].loc + "|" + res[i].pckqty);
                    }
                    return pcks;
                }
            }
        ]).then(function(PckSel){
            var temp_pck = PckSel.pcklst.split("|");
            pckid = temp_pck[0];
            pck_itm(pckid);
        });
    });
}

function pck_itm(pckid){
    pck_info = {};
    connection.query("select * from invpck where picref = ?",pckid,function(err,res){
        if(err) throw err;
        pck_info = {
            p_loc: res[0].loc,
            p_item_id: res[0].item_id,
            p_ordnum: res[0].ordnum,
            p_ordlin: res[0].ordlin,
            p_pckqty: res[0].pckqty,
            p_pcksts: res[0].pcksts
        };
        pck_loc_val(pck_info);
    });
}

function pck_loc_val(pck_info){
    console.log("Location: " + pck_info.p_loc);
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the location you are picking from:",
            name: "usrloc"
        }
    ]).then(function(UsrLoc){
        if(UsrLoc.usrloc === pck_info.p_loc)
        {
            pck_qty(pck_info);
        }
        else
        {
            console.log("You are not at the correct location:");
            pck_loc_val(pck_info);
        }
    })
}

function pck_qty(pck_info){
    connection.query("select * from invtbl where loc = '" + pck_info.p_loc + "' and item_id = ?", pck_info.p_item_id, function(err,res){
        if(err) throw err;
        inquirer.prompt([
            {
                type: "rawlist",
                message: "Select a pallet to pick from: ",
                name: "sel_pallet",
                choices: function(){
                    var pall_sel = [];
                    for(var i = 0; i < res.length; i++)
                    {
                        pall_sel.push(res[i].load_id + "|" + res[i].qty);
                    }
                    return pall_sel;
                }
            }
        ]).then(function(PalSel){
            var temp_pal = PalSel.sel_pallet.split("|");
            var pal = temp_pal[0];
            console.log("Qty needed: " + pck_info.p_pckqty);
            inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the pick quantity:",
                    name: "usrpckqty"
                }
            ]).then(function(UsrPck){
                if(UsrPck.usrpckqty == pck_info.p_pckqty)
                {
                    update_pck_info(pck_info,pal,pckid);
                }
                else
                {
                    console.log("You did not enter the correct pick quantity amount, try again");
                    pck_qty(pck_info);
                }
            });
        });
    });
}

function update_pck_info(pck_info, pal,pckid){
    connection.query("update invpck set pcksts = 'C', appqty = " + pck_info.p_pckqty + " where picref = ?",pckid, function(err,res){
        if(err) throw err;
        connection.query("select * from invtbl where loc = '" + pck_info.p_loc + "' and load_id = ?",pal, function(err,res){
            if(err) throw err;
            if(pck_info.p_pckqty == res[0].qty)
            {

            }
            else
            {
                connection.query("update invtbl set qty = qty-" + pck_info.p_pckqty + " where loc = '" + pck_info.p_loc + "' and load_id = ?",pal, function(err,res){
                    if(err) throw err;
                    update_pcks_ord(pck_info,pal,pckid);
                });
            }
        });
    });
}

function update_pcks_ord(pck_info,pal,pckid){
    connection.query("update ord_line set shpqty = " + pck_info.p_pckqty + " where ordnum = '" + pck_info.p_ordnum + "' and ordlin = ?",pck_info.p_ordlin, function(err,res){
        if(err) throw err;
        connection.query("update ord set ordsts = 'C' where ordnum = ?",pck_info.p_ordnum, function(err,res){
            if(err) throw err;
            console.log("pick complete");
            start_mgr();
        });
    });
}