const pool = require("../config/db");

exports.getCart = async (req, res) => {

  try {

    const { rows: carrinho } =
      await pool.query(
        `
        SELECT
          ic.id,
          ic.quantidade,
          ic.variacao_id,
          p.id AS produto_id,
          p.nome,
          p.preco,
          vp.tamanho,
          vp.cor
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

    return res.json(carrinho);

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
      variacao_id,
      quantidade
    } = req.body;
    const quantidadeSolicitada = Number(quantidade);

    if (!variacao_id || !Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada < 1) {
      return res.status(400).json({
        message: "variacao_id e quantidade (>=1) são obrigatórios"
      });
    }

    const { rows: variacao } = await pool.query(
      "SELECT id, estoque FROM variacoes_produto WHERE id = $1",
      [variacao_id]
    );

    if (variacao.length === 0) {
      return res.status(404).json({
        message: "Variação de produto não encontrada"
      });
    }

    let { rows: cart } =
      await pool.query(
        `
        SELECT *
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

    // Se o item (mesma variação) já está no carrinho, soma a quantidade
    // em vez de criar uma linha duplicada.
    const { rows: existente } = await pool.query(
      `
      SELECT id, quantidade
      FROM itens_carrinho
      WHERE carrinho_id = $1
      AND variacao_id = $2
      `,
      [cart[0].id, variacao_id]
    );

    if (existente.length > 0) {

      if (existente[0].quantidade + quantidadeSolicitada > variacao[0].estoque) {
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
        [quantidadeSolicitada, existente[0].id]
      );

      return res.json({
        message: "Quantidade atualizada no carrinho"
      });
    }

    if (quantidadeSolicitada > variacao[0].estoque) {
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
        quantidadeSolicitada
      )
      VALUES ($1, $2, $3)
      `,
      [
        cart[0].id,
        variacao_id,
        quantidade
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

    const { quantidade } = req.body;
    const quantidadeSolicitada = Number(quantidade);

    if (!Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada < 1) {
      return res.status(400).json({
        message: "quantidade precisa ser no mínimo 1"
      });
    }

    // Confirma que o item pertence a um carrinho do usuário logado
    // antes de deixar editar (evita alterar item de outra pessoa).
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

    if (quantidadeSolicitada > item[0].estoque) {
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
      [quantidadeSolicitada, req.params.id]
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

    // Antes só deletava pelo id, sem checar dono — permitia
    // qualquer usuário logado apagar item de carrinho alheio
    // se soubesse (ou chutasse) o id certo.
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
