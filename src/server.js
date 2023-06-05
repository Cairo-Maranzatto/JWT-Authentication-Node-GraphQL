const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const cors = require('cors');
const PORT = process.env.PORT || 3003
const { errorType } = require('./helpers/error-contants')
const getErrorCode = errorName => {
  return errorType[errorName]
}
const app = express();
app.use(cors());
app.options('*', cors())

app.use(bodyParser.json());


app.get('/status',(req, res) => {
  res.send('running')
})

app.use(
  '/authentications',
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    customFormatErrorFn: (err) => {
      console.log(err)
      const error = getErrorCode(err.message)
      return error ? ({message: error.message, errorCode: error.errorCode, statusCode: error.statusCode}) : ({message: err, errorCode: 500, statusCode: 500})
    },
    graphiql: process.env.GRAPHIQL || false
  })
);

console.log(`Server running on PORT ${PORT}`)
app.listen(PORT);
