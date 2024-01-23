// init-db.js
db = new Mongo().getDB('reports');

// create user for reports database
db.createUser({
  user: 'admin',
  pwd: 'senha',
  roles: [
    {
      role: 'dbOwner',
      db: 'reports',
    },
  ],
});

// create collection for file
db.createCollection('file');
