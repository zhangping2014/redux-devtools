require('babel-register')

var webpack = require('webpack');

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var config = require('./webpack.dev.config');

var isProduction = process.env.NODE_ENV === 'production';
var isDeveloping = !isProduction;

var app = express();

var devMiddleWare, publicPath = isDeveloping ? path.join(__dirname) : path.join(__dirname, 'dist');

// Webpack developer
if (isDeveloping) {
  var compiler = webpack(config);

  devMiddleWare = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    //noInfo: true
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
  });
  app.use(devMiddleWare);
  app.use(require('webpack-hot-middleware')(compiler));

  var mfs = devMiddleWare.fileSystem;
  var file = path.join(config.output.path, 'index.html');

  app.get('*', function(req, res) {
    devMiddleWare.waitUntilValid(function(){
      var html = mfs.readFileSync(file);

      res.end(html);
    })
  });
} else {
  app.get('/', function(req, res) {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
  });
}

// static
app.use(express.static(publicPath));

//  RESTful API
app.use(bodyParser.json({ type: 'application/json' }));

var port = isProduction ? (process.env.PORT || 80) : 3000;

app.post('/api/get_user', function(req, res) {
  const user = {
    'name': '赵日天',
    'age': 18
  };
  res.json(user);
});

app.listen(port, function (err, result) {
  if(err){
    console.log(err);
  }
  console.log('Server running on http://localhost:' + port);
});
