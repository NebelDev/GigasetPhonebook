const express = require('express');
const path = require('path');
const fs = require('fs');
const endOfLine = require('os').EOL;
const sqlite = require('sqlite-sync');
const readline = require('readline');

const db_name = "phonebook_db.sql";

const WEB_SERVER_PORT = 3000;

const rl = readline.createInterface({
  input: fs.createReadStream(db_name)
});

//creo il db
sqlite.connect(':memory:');
sqlite.run("CREATE TABLE contacts (id INT, name TEXT, surname TEXT, number TEXT, office TEXT, mobile TEXT)");	
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

app.disable('x-powered-by');
app.use('/backend', express.static( path.join(__dirname, "public")));

app.get('/', function (req, res) {
	
	let type = req.query.type;
	//Create the Public phonebook
	if(type!= undefined && type=="pb") {		
		
		let count = req.query.count;
		let first = req.query.first;
				
		let results = sqlite.run("SELECT id,number,name,surname FROM contacts where id>="+first+" and id<="+(Number(first)+Number(count)-1));
		let totalContacts = sqlite.run("SELECT id from contacts");
				
		let tot = (count < results.length) ? count : results.length;

		let xml = getXMLPhonebook(results, type, count, first, totalContacts.length, tot);
		//DEBUG - da rimuovere
		//console.log(xml);
		res.send(xml);
	}else{
			res.status(500);
			res.send('error');		
	}
});

app.listen(WEB_SERVER_PORT, function () { });

console.log("Server started on port "+WEB_SERVER_PORT+" [OK]");
console.log("Press CTRL+C to exit");

process.on('SIGINT', function() {
	console.log("Closed DB [OK]");
	sqlite.close();
	console.log("Exting");	
	process.exit();
});

function getXMLPhonebook(r, t, c, f, ctot, tot){
	let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"+endOfLine;
	xml += "<list response=\"get_list\" type=\""+t+"\" total=\""+ctot+"\" first=\""+f+"\" last=\""+(Number(c)+Number(f)-1)+"\">"+endOfLine;
	let xmlBody = "";
		
	for(let i=0;i<tot; i++){
		xmlBody += "<entry id=\""+(i+1)+"\">"+endOfLine;
		xmlBody += "<fn>"+r[i].name+"</fn>"+endOfLine;
		xmlBody += "<ln>"+r[i].surname+"</ln>"+endOfLine;
		xmlBody += "<hm>"+r[i].number+"</hm>"+endOfLine;
		xmlBody += "</entry>"+endOfLine;
	}
	xmlBody += "</list>";	
	xml += xmlBody;
	return xml;
}