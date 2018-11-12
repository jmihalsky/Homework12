require("dotenv").config({path:"./keys.env"});

var keys = require("./keys");
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

var cust_info = {
    usr_id: "",
    usr_f_name: "",
    usr_l_name: "",
    usr_addr1: "",
    usr_addr2: "",
    usr_city: "",
    usr_st: "",
    usr_zip: "",
};

var ord = {
    ordnum: "",
    cust_id: "",
    ord_dte: "",
    ship_adr1: "",
    ship_adr2: "",
    ship_cty: "",
    ship_zip: ""
}

var ordnum = "";
var ord_line = [];

var str_ord_line = 1;

var usr_log = 0;

start_cust();

function start_cust(){
    inquirer.prompt([
        {
           type: "list",
           message: "Select a customer option",
           choices: ["Login into Customer Account","Create Customer Account","Browse Products"],
           name: "cust_main"
        }
    ]).then(function(CustMain){
        switch(CustMain.cust_main)
        {
            case "Login into Customer Account":
                cust_log();
                break;
            case "Create Customer Account":
                create_cust();
                break;
            case "Browse Products":
                br_prod_menu();
        }
    });
}

function create_cust(){
    inquirer.prompt([
        {
             type: "input",
             message: "Enter your email:",
             name: "email"
        },
        {
            type: "input",
            message: "Enter a password:",
            name: "pword1"
        },
        {
            type: "input",
            message: "Retype password:",
            name: "pword2"
        }
    ]).then(function(CrtCust){
        var usr_email = CrtCust.email;
        var usr_pword1 = CrtCust.pword1;
        var usr_pword2 = CrtCust.pword2;
        cust_v1(usr_email,usr_pword1,usr_pword2);
    });
}

function cust_v1(usr_email,usr_pword1,usr_pword2){
    connection.query("select * from cust where email= '" + usr_email + "'",function(err,res){
        console.log(err);
        console.log(res);
        if(err === null)
        {
            if(pword_check(usr_email,usr_pword1, usr_pword2) === true)
            {
                create_cust2(usr_email,usr_pword1);
            }
        }
        else 
        {
            console.log("The email you entered already exists, please try another email.");
            create_cust();
        }
    });
}

function pword_check(usr_email,usr_pword1,usr_pword2){
    if(usr_pword1 == usr_pword2)
    {
        return true;
    }
    else
    {
        console.log("You're passwords do not match, please retype for each prompt.");
        inquirer.prompt([
            
            {
                type: "input",
                message: "Enter a password:",
                name: "pword1"
            },
            {
                type: "input",
                message: "Retype password:",
                name: "pword2"
            }   
            
        ]).then(function(PwdRTYP){
            var usr_pword1 = PwdRTYP.pword1;
            var usr_pword2 = PwdRTYP.pword2;
            cust_v1(usr_email,usr_pword1,usr_pword2);
        });
    }
}

function create_cust2(usr_email,usr_pword1){
    inquirer.prompt([
        {
            type: "input",
            message: "First Name:",
            name: "fname"
        },
        {
            type: "input",
            message: "Last Name:",
            name: "lname"
        },
        {
            type: "input",
            message: "Street address 1:",
            name: "addr1"
        },
        {
            type: "input",
            message: "Street address 2 (Optional):",
            name: "addr2"
        },
        {
            type: "input",
            message: "City:",
            name: "city"
        },
        {
            type: "list",
            message: "Select your state code:",
            choices: ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VT","VA","VI","WA","WV","WI","WY"],
            name: "state"
        },
        {
            type: "input",
            message: "Enter Zip code:",
            name: "zip"
        }
    ]).then(function(CrtCustomer){
        var f_name = CrtCustomer.fname;
        var l_name = CrtCustomer.lname;
        var c_addr1 = CrtCustomer.addr1;
        var c_addr2 = CrtCustomer.addr2;
        var c_city = CrtCustomer.city;
        var c_state = CrtCustomer.state;
        var c_zip = CrtCustomer.zip;
        connection.query("insert into cust set ?",
        {
            email: usr_email,
            pword: usr_pword1,
            cust_first_name: f_name,
            cust_last_name: l_name,
            cust_addr1: c_addr1,
            cust_addr2: c_addr2,
            cust_city: c_city,
            cust_state: c_state,
            cust_zip: c_zip
        },
        function(err){
            if(err) throw err;
            console.log("Your user account was created");
            inquirer.prompt([
                {
                    type: "confirm",
                    message: "Do you want to browse products for sale?",
                    name: "browse",
                    default: true
                }
            ]).then(function(br_prod){
                if(br_prod.browse)
                {
                    br_prod_menu();
                }
            })
        });
    })
}

function br_prod_menu(){
    inquirer.prompt([
        {
            type: "list",
            message: "Select an option of how you would like to browse products",
            choices: ["By Department","All Products"],
            name: "browse_opt"
        }
    ]).then(function(br_menu){
        switch(br_menu.browse_opt)
        {
            case "By Department":
                br_prod_dept();
                break;
            case "All Products":
                all_products();
                break;
        }
    });
}

function br_prod_dept(){
    connection.query("select department_name from departments", function(err,res){
        if (err) throw err;
        inquirer.prompt([
            {
                type: "rawlist",
                message: "Select a department which you would like to view products from.",
                name: "dept",
                choices: function(){
                    var deptArray = [];
                    for (var i = 0; i < res.length; i++)
                    {
                        deptArray.push(res[i].department_name);
                    }
                    return deptArray;
                }
            }
        ]).then(function(dept_menu){
            console.log("Product ID   |   Product Name   |  Price   ");
            connection.query("select products.* from products inner join departments on products.department_id = departments.department_id where products.prod_sts = 'A' and departments.department_name = ?", dept_menu.dept,function(err,res){
                if(err) throw err;
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Select a product which you would like to purchase.",
                        name: "dept_prod",
                        choices: function(){
                            var deptProd = [];
                            for (var i = 0; i < res.length; i++)
                            {
                                deptProd.push(res[i].item_id + "|" + res[i].product_name + "|" + res[i].price);
                            }
                            return deptProd;
                        }
                    }
                ]).then(function(dept_prod){
                    var slt_prod = dept_prod.dept_prod;
                    prod_avail(slt_prod);
                });
                
            });
        })
    });
}

function all_products(){
    console.log("Product ID   |   Product Name   | Department |  Price   ");
    connection.query("select products.*, departments.department_name from products inner join departments on products.department_id = departments.department_id where prod_sts = 'A'",function(err,res){
        if(err) throw err;
        console.log(res.length);
        inquirer.prompt([
            {
                type: "list",
                message: "Select a product which you would like to purchase.",
                name: "prod_all",
                choices: function(){
                    var all_prod = [];
                    for(var i = 0; i < res.length; i++)
                    {
                        all_prod.push(res[i].item_id + "|" + res[i].product_name + "|" + res[i].department_name + "|" + res[i].price)
                    }
                    return all_prod;
                }
            }
        ]).then(function(ProdAll){
            var slt_prod = ProdAll.prod_all;
            prod_avail(slt_prod);
        })
    });
}

function cust_log(){
    inquirer.prompt([
        {
            type: "input",
            message: "Enter email:",
            name: "user_email"
        }
    ]).then(function(usr_log){
        var u_log = usr_log.user_email;
        connection.query("select * from cust where email = ?", u_log, function(err,res){
            if(err) throw err;
            if(res.length == 1)
            {
                var usr_pw = "";
                var usr_id = "";
                var usr_f_name = "";
                var usr_l_name = "";
                var usr_addr1 = "";
                var usr_addr2 = "";
                var usr_city = "";
                var usr_st = "";
                var usr_zip = "";

                for(var i = 0; i < res.length; i++)
                {
                    usr_pw = res[i].pword;
                    cust_info.usr_id = res[i].cust_id;
                    cust_info.usr_f_name = res[i].cust_first_name;
                    cust_info.usr_l_name = res[i].cust_last_name;
                    cust_info.usr_addr1 = res[i].cust_addr1;
                    cust_info.usr_addr2 = res[i].cust_addr2;
                    cust_info.usr_city = res[i].cust_city;
                    cust_info.usr_st = res[i].cust_state;
                    cust_info.usr_zip = res[i].cust_zip;
                }
                
                inquirer.prompt([
                    {
                        type: "input",
                        message: "Enter your password:",
                        name: "u_pword"
                    }
                ]).then(function(upwd){
                    if(upwd.u_pword === usr_pw)
                    {
                        if(ord_line.length > 0 )
                        {
                            complete_cart();
                        }
                        else
                        {
                            console.log("You can now browse products");
                            br_prod_menu();
                        }
                    }
                    else
                    {
                        console.log("The password you entered is not correct. Please try loggin in again.");
                        cust_log();
                    }
                });
            }
            else
            {
                console.log("The user email does not exist. Please try another email");
                cust_log();
            }
        });
    });
}

function prod_avail(slt_prod){
    var sp = slt_prod.split("|");
    console.log(sp[0]);
    connection.query("select * from avail_inv where item_id = ?", sp[0], function(err,res){
        if(err) throw err;
        for (var i = 0; i < res.length; i++)
        {
            if (res[i].avail_qty > 0)
            {
                var prd_id = res[i].item_id;
                inquirer.prompt([
                    {
                        type: "confirm",
                        message: "There is inventory, Do you want to add to the cart?",
                        name: "cart",
                        default: true
                    }
                ]).then(function(Cart_A){
                    if(Cart_A.cart)
                    {
                        add_cart(prd_id);
                    }
                    else
                    {
                        br_prod_menu();
                    }
                });
                
            }
            else
            {
                console.log("There is not any available inventory for this product");
                inquirer.prompt([
                    {
                        type: "confirm",
                        message: "Do you want to search for another product",
                        name: "no_cart",
                        default: true
                    }
                ]).then(function(Cart_B){
                    if(Cart_B.no_cart)
                    {
                        br_prod_menu();
                    }
                })
            }
        }
    });
}

function add_cart(prd_id){
    inquirer.prompt([
        {
            type: "input",
            message: "how many do you want?",
            name: "qty"
        }
    ]).then(function(itm_qty){
        var item_qty = parseInt(itm_qty.qty);
        if (item_qty > 0 )
        {
            ord_line.push(
                {
                    ordlin: str_ord_line,
                    item_id: prd_id,
                    ordqty: item_qty 
                }
            );
            str_ord_line++;
            inquirer.prompt([
                {
                    type: "confirm",
                    message: "Do you want to add more items?",
                    name: "more_cart",
                    default: true      
                }
            ]).then(function(Cart_C){
                if(Cart_C.more_cart)
                {
                    br_prod_menu();
                }
                else
                {
                    complete_cart();
                }
            })
        }
        else
        {
            console.log("You need to enter a number.");
            add_cart(prd_id);
        }
    })
}

function complete_cart(){
    if(cust_info.usr_id == "")
    {
        console.log("You need to login");
        cust_log();
    }
    else
    {
        console.log("contiue with order completion");
        get_ordnum();
    }
}

function get_ordnum(){
    var nxt_ordnum = "";
    connection.query("select ordnum, ordnum + 1 nxt_ordnum from ordnum",function(err,res){
        if(err) throw err;
        for(var i = 0; i < res.length; i++)
        {
            ordnum = res[i].ordnum;
            nxt_ordnum = res[i].nxt_ordnum;
            console.log(nxt_ordnum);
            connection.query("update ordnum set ordnum = ?", nxt_ordnum, function(err,res){
                if(err) throw err;
                create_order();
            });
        }
    });
}

function create_order(){
    ord = {
        ordnum: ordnum,
        cust_id: cust_info.usr_id,
        ord_dte: moment().format("YYYY-MM-DD HH:mm:ss"),
        ship_adr1: cust_info.usr_addr1,
        ship_adr2: cust_info.usr_addr2,
        ship_cty: cust_info.usr_city,
        ship_st: cust_info.usr_st,
        ship_pc: cust_info.usr_zip
    };
    connection.query("insert into ord set ?",ord,function(err,res){
        if(err) throw err;
        console.log("order created");
        create_ord_lines();
    });


}

function create_ord_lines(){
    for(var i = 0; i < ord_line.length; i++)
    {
        connection.query("insert into ord_line set ?",
        {
            ordnum: ordnum,
            ordlin: ord_line[i].ordlin,
            item_id: ord_line[i].item_id,
            ordqty: ord_line[i].ordqty,
            shpqty: 0
        }, function(err){
            if(err) throw err;
            console.log("Order Line created");
        });
    }
    crt_pck_wrk();
}

function crt_pck_wrk(){
    connection.query("select * from ord_line where ordnum = ?", ordnum, function(err,res){
        if(err) throw err;
        for(var i = 0; i < res.length; i++)
        {
            var pck_itm_id = res[i].item_id;
            var pckqty = res[i].ordqty;
            var oline = res[i].ordlin;
            connection.query("select * from pck_sel where item_id = " + pck_itm_id + " and avl_pck_qty >= " + pckqty + " limit 1", function(err,ras){
                if(err) throw err;
                for(var i = 0; i < ras.length; i++)
                {
                    connection.query("insert into invpck set ?", 
                    {
                        loc: ras[i].loc,
                        item_id: pck_itm_id,
                        ordnum: ordnum,
                        pckqty: pckqty,
                        appqty: 0,
                        pcksts: "N"
                    }, function(err){
                        if(err) throw err;
                    });
                }
            });
        }
    });
    br_prod_menu();
}