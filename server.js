var express = require('express');
var p = require('path');
const fs = require('fs');
//const xml2js = require('xml2js');
var phonebook = require('./phonebook');
var endOfLine = require('os').EOL;
var sqlite = require('sqlite-sync');

const db_name = "phonebook_db.sql";

const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream(db_name)
});

//creo il db
sqlite.connect(':memory:');
sqlite.run("CREATE TABLE lorem (info TEXT)");	
console.log("DB created [OK]");
  
rl.on('line', function(line) {
	//Salvo le righe nel db in memoria
	sqlite.insert("lorem", {'info': line});
});
rl.on('close', function(close) {
	console.log("Contacts loaded [OK]");
});

var app = express();
var secureDir = p.join(__dirname, "public");

app.use('/backend', express.static(secureDir));

app.get('/', function (req, res) {
	
	let type = req.query.type;

	if(isParamsNormalized(type )) {
		var xml = "<?xml version='1.0' encoding='UTF-8' ?>"+endOfLine;
		var xmlBody = "";
		var results = sqlite.run("SELECT info FROM lorem");
		for(let i=0;i<results.length; i++){
			xmlBody += "<entry>"+endOfLine;
			xmlBody += results[i].info+endOfLine;
			xmlBody += "</entry>"+endOfLine;
		}
	    xml += xmlBody;
		console.log(xmlBody);
		res.send(xml);		
	}
	else{
		res.status(500);
		res.send('error');
	}
});


app.listen(3000, function () { });

console.log("Server started [OK]");
console.log("Press CTRL+C to exit");

var phone = phonebook.Phonebook();

process.on('SIGINT', function() {
    console.log("Esco");
	sqlite.close();
	console.log("Chiudo il DB");
    process.exit();
});

function isParamsNormalized(t){
	if(t!= undefined){
		return true;
	}
	return false;
}