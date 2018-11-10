console.log("this is loaded");

module.exports.mysqlinfo = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD
};