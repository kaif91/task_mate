import { ApolloServer, gql } from "apollo-server-micro";
import { NextApiHandler } from "next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { schema } from "../../backend/schema";
import { db } from "../../backend/db";
// Resolvers definitions code from the lecture remains as is ...

// New way to setup the Apollo Server's resolver function:

export const config = {
  api: {
    bodyParser: false,
  },
};

const apolloServer = new ApolloServer({
  schema,
  context: { db },
  introspection: true,
  csrfPrevention: true,

  plugins: [
    ...(process.env.NODE_ENV === "development"
      ? [ApolloServerPluginLandingPageGraphQLPlayground]
      : []),
  ],
});

// Now we need to start Apollo Server before creating the handler function.
const serverStartPromise = apolloServer.start();
let graphqlHandler: NextApiHandler | undefined;

const handler: NextApiHandler = async (req, res) => {
  if (!graphqlHandler) {
    await serverStartPromise;
    graphqlHandler = apolloServer.createHandler({ path: "/api/graphql" });
  }

  return graphqlHandler(req, res);
};

export default handler;
