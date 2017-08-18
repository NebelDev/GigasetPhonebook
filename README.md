# GigasetPhonebook :orange_book:
Gigaset phonebook integration that allow you to use public and yellow page phonebooks.
Gigaset XML phonebook is built with Node.js. 

## Prerequisites
To run this app you need to have installed on your system Node.js In case you miss it you can download here: https://nodejs.org.

## Installation

Download the files and move into the project folder. 

```
cd GigasetPhonebook
npm install
```
When finished you are ready to start the server.
Note: the web server default port is **3000**. You can change it on the code.

## Run

After the installation process, move into the project directory and start the phonebook server dialing in the console.
```
node server.js
```

## Stop
In the console press **CTRL+C**.

## Populate phonebook

To populate contacts into phonebook file you can add name, surname and phone at the file separeted by ";".

E.g.:
```
Username;Surname;123456
Username2;Surname2;654321
```
