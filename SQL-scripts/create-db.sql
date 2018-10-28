DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id integer NOT NULL auto_increment,
    product_name varchar(40) NOT NULL,
    department_name varchar(30) NOT NULL,
    price decimal(5,2) NOT NULL,
    prod_sts varchar(10) NOT NULL,
);