// init-db.js
db = new Mongo().getDB('reports');
db.createCollection('myCollection');
