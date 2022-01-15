"use strict";

const { sanitizeEntity } = require("strapi-utils");

const stripe = require("stripe")('sk_test_51InyYbGcZbCCiJcpAwDb9CmbiBpeucAQG7rXDDrnQvdCe9aPBycIiBzlvFW2wy9qSvqIgwjxkdAohjopdaU9MOY100xcM9phr0');

module.exports = {
  createPaymentIntent: async (ctx) => {
    const { cart } = ctx.request.body;

    // simplify cart data
    // get all games
    const games = await strapi.config.functions.cart.cartItems(cart);

    if (!games.length) {
      ctx.response.status = 404;
      return {
        error: "No valid games found!",
      };
    }

    const total = await strapi.config.functions.cart.total(games);

    if (total === 0) {
      return {
        freeGames: true,
      };
    }
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100,
        currency: "usd",
        metadata: { cart: JSON.stringify(cart.map((game) => game.id)) },
      });
      console.log(paymentIntent)
      return paymentIntent;

    } catch (err) {
      console.log(err)
      return {
        error: err.raw.message,
      };
    }
  },

  create: async (ctx) => {
    // pegar as informações do frontend
    const { cart, paymentIntentId, paymentMethod } = ctx.request.body;
    // pega o token
    const token = await strapi.plugins[
      "users-permissions"
    ].services.jwt.getToken(ctx);

    // pega o id do usuario
    const userId = token.id;

    // pegar as informações do usuário
    const userInfo = await strapi
      .query("user", "users-permissions")
      .findOne({ id: userId });

    // simplify cart data
    const cartGamesIds = await strapi.config.functions.cart.cartGamesIds(cart);

    // pegar os jogos
    const games = await strapi.config.functions.cart.cartItems(cart);

    // pegar o total (saber se é free ou não)
    const total_in_cents = strapi.config.functions.cart.total(games);

    // precisa pegar do frontend os valores do paymentMethod
    // e recuperar por aqui

    // salvar no banco
    const entry = {
      total_in_cents,
      payment_intent_id: paymentIntentId,
      card_brand: null,
      card_last4: null,
      user: userInfo,
      games,
    };

    console.log(entry, 'entrada do banco')

    const entity = await strapi.services.order.create(entry);

    // enviar um email da compra para o usuário

    // retornando que foi salvo no banco
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
};
