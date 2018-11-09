DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id integer NOT NULL auto_increment PRIMARY KEY,
    product_name varchar(40) NOT NULL,
    department_id integer NOT NULL,
    price decimal(5,2),
    prod_sts varchar(10) NOT NULL DEFAULT 'A'
);

CREATE TABLE invtbl(
    loc varchar(20) NOT NULL,
    load_id varchar(30) NOT NULL,
    item_id integer NOT NULL,
    qty integer NOT NULL,
    primary key(loc,load_id,item_id)
);

CREATE TABLE invpck(
    picref integer NOT NULL auto_increment PRIMARY KEY,
    loc varchar(30) NOT NULL,
    item_id integer NOT NULL,
    ordnum varchar(10) NOT NULL,
    pckqty integer NOT NULL,
    appqty integer,
    pcksts varchar(5)
);

CREATE TABLE departments(
    department_id integer NOT NULL auto_increment PRIMARY KEY,
    department_name varchar(40) NOT NULL
);

CREATE TABLE ord(
    ordnum varchar(10) NOT NULL unique,
    cust_id varchar(10) NOT NULL,
    ord_dte date NOT NULL,
    ship_adr1 varchar(40) NOT NULL,
    ship_adr2 varchar(40),
    ship_cty varchar(40) NOT NULL,
    ship_st varchar(2) NOT NULL,
    ship_pc varchar(10),
    ordsts varchar(5) NOT NULL DEFAULT 'O',
    primary key(ordnum,cust_id)
);

CREATE TABLE ord_line(
    ordnum varchar(10) NOT NULL,
    ordlin integer NOT NULL,
    item_id integer NOT NULL,
    ordqty integer NOT NULL,
    shpqty integer,
    primary key(ordnum, ordlin)
);

CREATE TABLE cust(
    cust_id integer NOT NULL auto_increment PRIMARY KEY,
    email varchar(30) NOT NULL,
    cust_first_name varchar(30) NOT NULL,
    cust_last_name varchar(30) NOT NULL,
    cust_addr1 varchar(40) NOT NULL,
    cust_addr2 varchar(40),
    cust_city varchar(30) NOT NULL,
    cust_state varchar(2) NOT NULL,
    cust_zip varchar(5) NOT NULL
);