import express from "express";
import mysql from "promise-mysql";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname + "/public")));

const PORT = 9000;

let db;
app.set("views", "./views");
app.set("view engine", "ejs");

mysql
	.createConnection({
		host: "localhost",
		database: "deselle_classicmodels",
		user: "root",
		password: "",
	})
	.then((database) => {
		console.log(`connected to : ${database.config.database}`);
		db = database;
	});

app.get("/", async (req, res) => {
	let q = await db.query(
		"SELECT orderNumber , orderDate ,shippedDate, `status`  FROM `orders`"
	);
	res.render("index", { template: "home", results: q });
});

app.get("/product/:id", async (req, res) => {
	// * a verif
	let orderNumber = req.params.id;

	let sql = await db.query(
		"SELECT products.productName ,orderdetails.priceEach ,orderdetails.quantityOrdered ,(orderdetails.priceEach * orderdetails.quantityOrdered) FROM `orderdetails` JOIN products ON products.productCode = orderdetails.productCode WHERE orderdetails.orderNumber =" +
			orderNumber
	);

	let CustomerNumber = await db.query(
		"SELECT `customerNumber` FROM `orders` WHERE `orderNumber`=" +
			orderNumber
	);

	let MontantHC = await db.query(
		"SELECT SUM(orderdetails.priceEach  * orderdetails.quantityOrdered) as MontantHC  FROM `orderdetails` WHERE orderdetails.orderNumber =" +
			orderNumber
	);

	let Customer = await db.query(
		"SELECT customerName ,contactLastName ,contactFirstName ,addressLine1 ,city FROM customers WHERE customerNumber=" +
			CustomerNumber[0].customerNumber
	);

	

	res.render("index", {
		template: "details",
		customer: Customer,
		orderNumber: orderNumber,
		sql: sql,
		montantHC: MontantHC,
	});
});

app.listen(PORT, () => {
	console.log(`listening at : http://localhost:${PORT}`);
});
