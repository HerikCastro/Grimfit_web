const pool = require("../config/db");

exports.getCart = async (req, res) => {

  try {

    const { rows: cartItems } =
      await pool.query(
        `
        SELECT
          ic.id,
          ic.quantidade AS "quantity",
          ic.variacao_id AS "variantId",
          p.id AS "productId",
          p.nome AS "name",
          p.preco AS "price",
          p.imagem_url AS "imageUrl",
          vp.tamanho AS "size",
          vp.cor AS "color"
        FROM carrinhos c
        JOIN itens_carrinho ic
          ON ic.carrinho_id = c.id
        JOIN variacoes_produto vp
          ON vp.id = ic.variacao_id
        JOIN produtos p
          ON p.id = vp.produto_id
        WHERE c.usuario_id = $1
        `,
        [req.user.id]
      );

    return res.json(cartItems);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.addCartItem = async (req, res) => {

  try {

    const {
      variantId,
      quantity
    } = req.body;
    const requestedQuantity = Number(quantity);

    if (!variantId || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        message: "variantId e quantity (>=1) são obrigatórios"
      });
    }

    const { rows: variacao } = await pool.query(
      "SELECT id, estoque FROM variacoes_produto WHERE id = $1",
      [variantId]
    );

    if (variacao.length === 0) {
      return res.status(404).json({
        message: "Variação de produto não encontrada"
      });
    }

    let { rows: cart } =
      await pool.query(
        `
        SELECT id
        FROM carrinhos
        WHERE usuario_id = $1
        `,
        [req.user.id]
      );

    if (cart.length === 0) {

      const { rows: [novo] } =
        await pool.query(
          `
          INSERT INTO carrinhos(usuario_id)
          VALUES($1)
          RETURNING id
          `,
          [req.user.id]
        );

      cart = [{
        id: novo.id
      }];
    }

    // If the same variation is already in the cart, increase its quantity
    // instead of creating a duplicate row.
    const { rows: existingItem } = await pool.query(
      `
      SELECT id, quantidade
      FROM itens_carrinho
      WHERE carrinho_id = $1
      AND variacao_id = $2
      `,
      [cart[0].id, variantId]
    );

    if (existingItem.length > 0) {

      if (existingItem[0].quantidade + requestedQuantity > variacao[0].estoque) {
        return res.status(409).json({
          message: "Quantidade solicitada maior que o estoque disponível"
        });
      }

      await pool.query(
        `
        UPDATE itens_carrinho
        SET quantidade = quantidade + $1
        WHERE id = $2
        `,
        [requestedQuantity, existingItem[0].id]
      );

      return res.json({
        message: "Quantidade atualizada no carrinho"
      });
    }

    if (requestedQuantity > variacao[0].estoque) {
      return res.status(409).json({
        message: "Quantidade solicitada maior que o estoque disponível"
      });
    }

    await pool.query(
      `
      INSERT INTO itens_carrinho
      (
        carrinho_id,
        variacao_id,
        quantidade
      )
      VALUES ($1, $2, $3)
      `,
      [
        cart[0].id,
        variantId,
        requestedQuantity
      ]
    );

    return res.status(201).json({
      message: "Produto adicionado"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateCartItem = async (req, res) => {

  try {

    const { quantity } = req.body;
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        message: "quantity precisa ser no mínimo 1"
      });
    }

    // Confirm that the item belongs to the logged-in user's cart
    // before allowing it to be edited.
    const { rows: item } = await pool.query(
      `
      SELECT ic.id, vp.estoque
      FROM itens_carrinho ic
      JOIN carrinhos c ON c.id = ic.carrinho_id
      JOIN variacoes_produto vp ON vp.id = ic.variacao_id
      WHERE ic.id = $1
      AND c.usuario_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (item.length === 0) {
      return res.status(404).json({
        message: "Item não encontrado no seu carrinho"
      });
    }

    if (requestedQuantity > item[0].estoque) {
      return res.status(409).json({
        message: "Quantidade solicitada maior que o estoque disponível"
      });
    }

    await pool.query(
      `
      UPDATE itens_carrinho
      SET quantidade = $1
      WHERE id = $2
      `,
      [requestedQuantity, req.params.id]
    );

    return res.json({
      message: "Quantidade atualizada"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.removeCartItem = async (req, res) => {

  try {

    // Confirm ownership before deleting the item so a logged-in user
    // cannot remove an item from someone else's cart.
    const { rows: item } = await pool.query(
      `
      SELECT ic.id
      FROM itens_carrinho ic
      JOIN carrinhos c ON c.id = ic.carrinho_id
      WHERE ic.id = $1
      AND c.usuario_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (item.length === 0) {
      return res.status(404).json({
        message: "Item não encontrado no seu carrinho"
      });
    }

    await pool.query(
      `
      DELETE FROM itens_carrinho
      WHERE id = $1
      `,
      [req.params.id]
    );

    return res.json({
      message: "Item removido"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
