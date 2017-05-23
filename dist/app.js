'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _expressGraphql = require('express-graphql');

var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _expressHistoryApiFallback = require('express-history-api-fallback');

var _expressHistoryApiFallback2 = _interopRequireDefault(_expressHistoryApiFallback);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _routes = require('./routes');

var _graphql = require('./graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var root = (0, _path.join)(__dirname, '../public');

app.set('port', process.env.PORT || 8000);
app.set('mongodb-uri', process.env.MONGODB_URI || 'mongodb://web-go:web-go@ds133961.mlab.com:33961/web-go-demo');
app.set('secret', process.env.SECRET || 'webgo');

_mongoose2.default.connect(app.get('mongodb-uri'));
_mongoose2.default.connection.on('error', console.error.bind(console, 'connection error:'));
_mongoose2.default.connection.once('open', function () {
  return console.log('DB: Connection Succeeded.');
});

app.use((0, _compression2.default)());
app.use((0, _cors2.default)());
app.use((0, _morgan2.default)('tiny'));
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: false }));

app.use((0, _expressJwt2.default)({ secret: Buffer.from(app.get('secret'), 'base64'), credentialsRequired: false }));

app.use('/graphql', (0, _expressGraphql2.default)(function () {
  return {
    schema: _graphql.schema,
    rootValue: _graphql.rootValue,
    graphiql: true
  };
}));

app.use('/list', _routes.listRoutes);

app.use(_express2.default.static(root));
app.use((0, _expressHistoryApiFallback2.default)('index.html', { root: root }));

var server = app.listen(app.get('port'), function () {
  console.log('App: Bootstrap Succeeded.');
  console.log('Port: ' + app.get('port') + '.');
});

var io = _socket2.default.listen(server);

io.on('connection', function (socket) {
  console.log('WS: Establish a connection.');
  socket.on('disconnect', function () {
    return console.log('WS: Disconnected');
  });

  socket.emit('A', { foo: 'bar' });
  socket.on('B', function (data) {
    return console.log(data);
  });
});

exports.default = app;

// <script>
//   const xhr = new XMLHttpRequest();
//   xhr.responseType = 'json';
//   xhr.open('POST', '/graphql');
//   xhr.setRequestHeader('Content-Type', 'application/json');
//   xhr.setRequestHeader('Accept', 'application/json');
//   xhr.onload = () => console.log('GraphQL:', xhr.response);
//   xhr.send(JSON.stringify({ query: '{ helloWorld }' }));
// </script>
//
// <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.1/socket.io.js"></script>
// <script>
//   const socket = io();
//
//   socket.on('connect', () => console.log('WS: Accept a connection.'));
//
//   socket.on('A', data => {
//     console.log(data);
//     socket.emit('B', { foo: 'baz' });
//   });
// </script>