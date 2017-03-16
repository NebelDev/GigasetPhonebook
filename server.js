var express = require('express');
var p = require('path');
const fs = require('fs');
const endOfLine = require('os').EOL;
var sqlite = require('sqlite-sync');
const readline = require('readline');

const db_name = "phonebook_db.sql";

const rl = readline.createInterface({
  input: fs.createReadStream(db_name)
});

//creo il db
sqlite.connect(':memory:');
sqlite.run("CREATE TABLE contacts (id INT, name TEXT, surname TEXT, number TEXT)");	
console.log("DB created [OK]");
  
idRow = 1;
rl.on('line', function(line) {
	//Salvo le righe nel db in memoria
	let rawRow = line.split(';');
	sqlite.insert("contacts", {'id': idRow, 'number': rawRow[2], 'name':rawRow[0], 'surname':rawRow[1] });
	idRow++;
});
rl.on('close', function(close) {
	console.log("Contacts loaded [OK]");
	delete idRow;
});

var app = express();
var secureDir = p.join(__dirname, "public");

app.disable('x-powered-by');
app.use('/backend', express.static(secureDir));

app.get('/', function (req, res) {
	
	let type = req.query.type;
	//Create the Public phonebook
	if(type!= undefined && type=="pb") {		
		
		let count = req.query.count;
		let first = req.query.first;
				
		let results = sqlite.run("SELECT id,number,name,surname FROM contacts where id>="+first+" and id<="+(Number(first)+Number(count)-1));
		let totalContacts = sqlite.run("SELECT id from contacts");
				
		let tot = (count < results.length) ? count : results.length;
		
		let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"+endOfLine;
		xml += "<list response=\"get_list\" type=\"pb\" total=\""+totalContacts.length+"\" first=\""+first+"\" last=\""+(Number(count)+Number(first)-1)+"\">"+endOfLine;
		let xmlBody = "";
		
		for(let i=0;i<tot; i++){
			xmlBody += "<entry id=\""+(i+1)+"\">"+endOfLine;
			xmlBody += "<fn>"+results[i].name+"</fn>"+endOfLine;
			xmlBody += "<ln>"+results[i].surname+"</ln>"+endOfLine;
			xmlBody += "<hm>"+results[i].number+"</hm>"+endOfLine;
			xmlBody += "</entry>"+endOfLine;
		}
		xmlBody += "</list>";
		
	    xml += xmlBody;
		//DEBUG - da rimuovere
		//console.log(xml);
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

process.on('SIGINT', function() {
    console.log("Closed DB [OK]");
	sqlite.close();
	console.log("Exting");	
    process.exit();
});
