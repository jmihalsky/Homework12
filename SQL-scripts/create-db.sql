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
    ordlin integer,
    pckqty integer NOT NULL,
    appqty integer,
    pcksts varchar(5)
);

CREATE TABLE locmst(
    loc varchar(20) NOT NULL PRIMARY KEY,
    palqty integer NOT NULL,
    curqty integer
)

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
    pword varchar(20) NOT NULL,
    cust_first_name varchar(30) NOT NULL,
    cust_last_name varchar(30) NOT NULL,
    cust_addr1 varchar(40) NOT NULL,
    cust_addr2 varchar(40),
    cust_city varchar(30) NOT NULL,
    cust_state varchar(2) NOT NULL,
    cust_zip varchar(5) NOT NULL
);

CREATE TABLE ordnum(
    ordnum varchar(10) PRIMARY KEY
);

insert into ordnum(ordnum)
values('100000');

CREATE VIEW avail_inv
AS
select item_id,
	product_name,
    department_id,
    price,
    invqty,
    pckqty,
    invqty - pckqty avail_qty
from
	(select products.item_id,
		products.product_name,
		products.department_id,
		products.price,
		sum(invtbl.qty) invqty,
		IFNULL(a.pckqty, 0) pckqty
	from products
		inner join invtbl
		on products.item_id = invtbl.item_id
		left join 
		(select loc,
			item_id,
			sum(pckqty) pckqty
		from invpck
		where pcksts != 'C'
		group by loc,
			item_id) as a
		on invtbl.loc = a.loc
			and invtbl.item_id = a.item_id
	group by products.item_id,
		products.product_name,
		products.department_id,
		products.price,
		IFNULL(a.pckqty, 0)) as b;

CREATE VIEW pck_sel
AS
select  invtbl.loc,
    invtbl.load_id,
    invtbl.item_id,
    invtbl.qty,
    IFNULL(a.tot_pckqty,0) tot_pckqty,
    invtbl.qty - (IFNULL(a.tot_pckqty,0)) avl_pck_qty
from invtbl
left join 
	(select loc,
		item_id,
		sum(pckqty) tot_pckqty
	from invpck
	where pcksts != 'C'
	group by loc,
		item_id) a
on invtbl.loc = a.loc
	and invtbl.item_id = a.item_id
where  invtbl.qty - (IFNULL(a.tot_pckqty,0)) > 0;

CREATE VIEW prod_inv
AS
select products.item_id,
	products.product_name,
    departments.department_name,
    products.price,
    products.prod_sts,
    IFNULL(b.loc_qty,0) loc_qty,
    IFNULL(b.tot_pckqty,0) tot_pckqty,
    IFNULL(b.loc_qty,0) - IFNULL(b.tot_pckqty,0) avail_qty
from products
	inner join departments
    on products.department_id = departments.department_id
    left join 
	(select invtbl.item_id,
		sum(qty) loc_qty,
		sum(IFNULL(a.tot_pckqty,0)) tot_pckqty
	from invtbl
		left join
		(select loc,
			item_id,
			sum(pckqty) tot_pckqty
		from invpck
		where pcksts != 'C'
		group by loc,
			item_id) as a
		on invtbl.loc = a.loc
			and invtbl.item_id = a.item_id
	group by invtbl.item_id) as b
    on products.item_id = b.item_id;