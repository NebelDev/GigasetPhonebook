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
app.disable('x-powered-by');

app.get('/', function (req, res) {	
	let type = req.query.type;
	//Create the Public and Yellow phonebook
	if(type!= undefined) {
		
		let filters = getFilteredResults(req.query);

		let count = req.query.count;
		let first = req.query.first;
						
		let results = sqlite.run("SELECT id,number,name,surname FROM contacts where id>="+first+" and id<="+(Number(first)+Number(count)-1)+ " and "+ filters +" order by id");
						
		if(results!== undefined && results.length> 0){
			let totalContacts = sqlite.run("SELECT id from contacts where "+ filters +" order by id");

			let tot = (count < results.length) ? count : results.length;
			/*console.log("TOTALE:"+ tot);
			console.log("COUNT:"+ count);
			console.log("totalContacts:"+ totalContacts.length);
			*/
			let xml = getXMLPhonebook(results, type, count, first, totalContacts.length, tot);
			res.send(xml);
		}
		else{
			showError(res);
		}
	}else{
			showError(res);
	}
});

app.listen(WEB_SERVER_PORT, function () { });

console.log("Server started on port "+WEB_SERVER_PORT+" [OK]");
console.log("Press CTRL+C to exit");

process.on('SIGINT', function() {
	sqlite.close();
	console.log("Closed DB [OK]");	
	console.log("Exit");	
	process.exit();
});

function getXMLPhonebook(r, t, c, f, ctot, tot){
	let xml = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"+endOfLine;
	let last = (Number(c) + Number(f) -1);
	last = (last > ctot) ? ctot : last;
	xml += "<list response=\"get_list\" type=\""+t+"\" total=\""+ctot+"\" first=\""+f+"\" last=\""+(last)+"\">"+endOfLine;
	let xmlBody = "";
		
	for(let i=0;i<tot; i++){
		xmlBody += "<entry id=\""+(f)+"\">"+endOfLine;
		xmlBody += "<fn>"+r[i].name+"</fn>"+endOfLine;
		xmlBody += "<ln>"+r[i].surname+"</ln>"+endOfLine;
		xmlBody += "<mb>"+r[i].number+"</mb>"+endOfLine;
		xmlBody += "</entry>"+endOfLine;
		f = Number(f) +1;
	}
	xmlBody += "</list>";
	xml += xmlBody;
	return xml;
}

function getFilteredResults(query){
	let surname = query.ln;
	surname = surname.substring(0, surname.length-1);
	let bphone = query.bp;
	bphone = bphone.substring(0, bphone.length-1);
	let q = "";
	
	if(surname !== ""){
		q = "lower(surname) LIKE \'"+surname.toLowerCase() +"%\'";
	}
	else{
		q = "number LIKE \'"+ bphone +"%\'";
	}
	
	return q
}

function showError(r){
	r.status(500);
	r.send('error');
}