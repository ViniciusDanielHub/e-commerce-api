const cartGamesIds = async (cart) => {
  return await cart.map((game) => ({
    id: game.id,
  }));
};

const cartItems = async (cart) => {
  let games = [];

  await Promise.all(
    cart?.map(async (game) => {
      const validatedGame = await strapi.services.game.findOne({
        id: game.id,
      });

      if (validatedGame) {
        const price = validatedGame.price * Number(game.quantity)
        games.push({ id: game.id, price});
      }
    })
  );

  return games;
};

const total = (games) => {
  const total = games.reduce((acc, game) => {
    return acc + Number(game.price);
  }, 0);

  return total;
};

module.exports = {
  cartGamesIds,
  cartItems,
  total,
};
