const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const catalog = require('./data/catalog.json');
const account = require('./data/account.json');
const common = require('./data/common.json');
const fs = require('fs');
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiR2FyZGVuVXNlciIsIlN1YmplY3QiOiJnYXJkZW51c3IifQ._OsSKPlwdgV-Zxd8NTliaEgHOwN6UhJeOkwvoRzfLwQ";

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.get('/catalog/categories', (req, res) => {
  res.send(catalog.categories);
});
server.get('/catalog/products/featured', (req, res) => {
  let featured = [];
  for (let i = 0; i < 3; i++) {
      let index = Math.floor(Math.random() * catalog.products.length);
      featured.push(catalog.products[index]);
  }
  res.send(featured);
});
server.get('/catalog/products/search', (req, res) => {
  let search = req.query.searchString.toLowerCase();
  res.send(catalog.products.filter(p => p.name.toLowerCase().includes(search) || (p.description && p.description.toLowerCase().includes(search))));

});
server.get('/catalog/products/:categoryId',(req, res) => {
  res.send(catalog.products.filter(p => p.categoryId === +req.params.categoryId));
});

server.get('/catalog/cart', (req, res) => {
  let products = [];
  req.query.ids.forEach(id => {
    products.push(catalog.products.find(p => p.id === +id));
  });
  res.send(products);
});
server.get('/common/countries',(req, res) => {
  res.send(common.countries);
});


server.post('/account', (req, res) => {
    res.send({name: 'Error', message: 'Cannot create account. Only one account is allowed for tests'});
});
server.get('/account/info', (req, res) => {
    checkIfAuthorized(req, res)
    res.send(account.info);
});
server.put('/account/info', (req, res) => {
    checkIfAuthorized(req, res)
    res.status(500).send({name: 'Error', message: 'Cannot update account info. Only one account is allowed for tests'});
});
server.put('/account/password', (req, res) => {
    checkIfAuthorized(req, res)
    res.status(500).send({name: 'Error', message: 'Cannot update account password. Only one account is allowed for tests'});
});
server.get('/account/orders', (req, res) => {
  checkIfAuthorized(req, res)
  res.send(account.orders);
});
server.get('/account/orders/:id', (req, res) => {
  checkIfAuthorized(req, res)
  let order = account.orders.find(o => o.id === +req.params.id);
  res.send(order);
});
server.get('/account/addresses', (req, res) => {
    checkIfAuthorized(req, res)
    res.send(account.addresses);
});
server.get('/account/addresses/:id', (req, res) => {
    checkIfAuthorized(req, res)
    let address = account.addresses.find(a => a.id === +req.params.id);
    res.send(address);
});
server.post('/account/addresses', (req, res) => {
    checkIfAuthorized(req, res)
    let newAddress = req.body;
    newAddress.id = account.addresses.length + 1;
    account.addresses.push(newAddress);
    // Turn on to limit addresses to 6
    if (account.addresses.length > 6) {
        account.addresses.splice(0, 1);
    }
    updateAccount(res);
    res.send(newAddress);
});
server.put('/account/addresses/:id', (req, res) => {
    checkIfAuthorized(req, res)
    let address = account.addresses.find(a => a.id === +req.params.id);
    address = req.body;
    account.addresses.splice(account.addresses.indexOf(address), 1, address);
    updateAccount(res);
    res.status(200).send();
});
server.delete('/account/addresses/:id', (req, res) => {
    checkIfAuthorized(req, res)
    let address = account.addresses.find(a => a.id === +req.params.id);
    account.addresses.splice(account.addresses.indexOf(address), 1);
    updateAccount(res);
    res.status(200).send();
});

server.post('/auth/login', (req, res, next) => {
  if (req.body.username === 'user@gardenworld.com' && req.body.password === 'GardenUser') {
    res.send({ token: TOKEN });
  } else {
    res.status(401).send('Incorrect username or password');
  }
});


server.listen(3000, () => {
  console.log('JSON Server is running');
});


function checkIfAuthorized(req, res, next) {
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    res.sendStatus(401).send('Unauthorized');
  }
}

function updateAccount(res) {
  update(res, './data/account.json', account);
}

function update(res, path, object) {
  fs.writeFile(path, JSON.stringify(object), (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500).send('Error updating data');
    }
  });
}
