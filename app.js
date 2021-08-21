const express = require('express');
const app = express();
const session = require('express-session');
const static = express.static('public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const authHelpers = require('./middleware/authentication')
const handlebarHelpers = require('./middleware/handlebarsData');

app.use(static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(
  session({
    name: 'AuthCookie',
    secret: "Some witty secret string!",
    saveUninitialized: true,
    resave: false,
  })
);

app.use('/admin', authHelpers.requireAdministratorOrEndRequest);
app.use(handlebarHelpers.injectHandlebarsMetadata);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});