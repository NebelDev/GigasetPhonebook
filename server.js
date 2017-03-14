var express = require('express');
var p = require('path');
const fs = require('fs');
var phonebook = require('./phonebook');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

const readline = require('readline');
/*
const rl = readline.createInterface({
  input: fs.createReadStream('sample.txt')
});
*/
//creo il db
db.serialize( function() {
	db.run("CREATE TABLE lorem (info TEXT)");
	var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

	/*
rl.on('line', (line) => {
	//Salvo le righe nel db in memoria
  //console.log(`Line from file: ${line}`);
});*/
});

var app = express();
var secureDir = p.join(__dirname, "public");

app.use('/backend', express.static(secureDir));

app.get('/', function (req, res) {
	
	let type = req.query.type;
	console.log(req.path+req.params);
	
	db.serialize( function() {
		  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
				console.log(row.id + ": " + row.info);
		  });
	});
	
	
	if(isParamsNormalized(type )) {
		let xml = "asd";
		for(let i=0;i<10;i++){
			xml +=xml;
		}
		res.send(xml);
	}
	else{
		res.status(500);
		res.send('error');
	}
});


app.listen(3000, function () { });

console.log("Server started [OK]");

var phone = phonebook.Phonebook();


process.on('SIGINT', function() {
    console.log("Esco");
	db.close();
	console.log("Chiudo il DB");
    process.exit();
});

function isParamsNormalized(t){
	if(t!= undefined){
		return true;
	}
	return false;
}