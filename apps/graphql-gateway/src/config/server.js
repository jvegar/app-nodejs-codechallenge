const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const { json } = require('express');

const createServer = async (typeDefs, resolvers) => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        path: error.path,
        extensions: error.extensions,
      };
    },
  });

  await server.start();

  app.use(cors());
  app.use(json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({
        authorization: req.headers.authorization,
      }),
    })
  );

  app.get('/health', (req, res) => {
    res.status(200).send('Gateway is healthy');
  });

  return app;
};

module.exports = createServer;