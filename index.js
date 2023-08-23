const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser'); // eslint-disable-line import/no-extraneous-dependencies
const tools = require('./tools');

const app = express();

const port = 8080;

app.use(express.static(path.join(__dirname, 'public/'), {
  extensions: ['html'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post('/api/user', (req, res) => {
  tools.register(res, req.body.username, req.body.password);
});

app.post('/api/login', (req, res) => {
  tools.login(res, req.body.username, req.body.password);
});

tools.initStations();

app.get('/api/stations', (req, res) => {
  tools.getStations(res, req.query.state.trim(), req.query.id.trim(), req.query.name.trim());
});

app.post('/api/stations', (req, res) => {
  tools.addStation(res, req.body.state.trim(), req.body.id.trim(), req.body.name.trim());
});

app.put('/api/stations', (req, res) => {
  tools.updateStation(res, req.body.state.trim(), req.body.id.trim(), req.body.name.trim());
});

app.delete('/api/stations', (req, res) => {
  tools.deleteStation(res, req.body.id.trim());
});

async function checkCookie(req, res, next) {
  if (await tools.checkCookie(req.cookies.userid)) {
    next();
  } else {
    res.redirect('login');
  }
}
app.use('', checkCookie, express.static(path.join(__dirname, 'private'), {
  extensions: ['html'],
}));

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`); // eslint-disable-line no-console
});
