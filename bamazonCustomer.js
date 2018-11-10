require("dotenv").config({path:"./keys.env"});

var keys = require("./keys");
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

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
                for(var i = 0; i < res.length; i++)
                {
                    console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price);
                }
            });
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
                var usr_addr1 = "";
                var usr_addr2 = "";
                var usr_city = "";
                var usr_st = "";
                var usr_zip = "";

                for(var i = 0; i < res.length; i++)
                {
                    usr_pw = res[i].pword;
                    usr_addr1 = res[i].cust_addr1;
                    usr_addr2 = res[i].cust_addr2;
                    usr_city = res[i].cust_city;
                    usr_st = res[i].cust_state;
                    usr_zip = res[i].cust_zip;
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
                        console.log("success");
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