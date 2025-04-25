require('dotenv').config();
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const createServer = require('./config/server');

async function startServer() {
  try {
    const app = await createServer(typeDefs, resolvers);
    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Gateway running at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
