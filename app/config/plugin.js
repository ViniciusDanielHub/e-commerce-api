module.exports = {
  graphql: {
    endpoint: '/graphql',
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 10000000,
    disabledPlugins: [],
    disabledExtensions: [],
    apolloServer: {
      tracing: true,
    },
  },
};
