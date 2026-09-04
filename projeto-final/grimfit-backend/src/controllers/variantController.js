const pool = require("../config/db");

exports.getVariantsByProduct = async (req, res) => {

  try {

    const { rows: variants } = await pool.query(
      `
      SELECT id, produto_id AS "productId", tamanho AS "size", cor AS "color", estoque AS "stock"
      FROM variacoes_produto
      WHERE produto_id = $1
      `,
      [req.params.productId]
    );

    return res.json(variants);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createVariant = async (req, res) => {

  try {

    const { size, color, stock } = req.body;

    const { rows: produto } = await pool.query(
      "SELECT id FROM produtos WHERE id = $1",
      [req.params.productId]
    );

    if (produto.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    const { rows: [variacao] } = await pool.query(
      `
      INSERT INTO variacoes_produto
      (produto_id, tamanho, cor, estoque)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [req.params.productId, size, color, stock || 0]
    );

    return res.status(201).json({
      message: "Variação criada",
      id: variacao.id
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateVariant = async (req, res) => {

  try {

    const { size, color, stock } = req.body;
    let updatedStock = stock;

    if (stock !== undefined && stock !== null) {
      updatedStock = Number(stock);

      if (!Number.isInteger(updatedStock) || updatedStock < 0) {
        return res.status(400).json({
          message: "estoque precisa ser um número inteiro maior ou igual a zero"
        });
      }
    }

    const { rowCount } = await pool.query(
      `
      UPDATE variacoes_produto
      SET
        tamanho = COALESCE($1, tamanho),
        cor = COALESCE($2, cor),
        estoque = COALESCE($3, estoque)
      WHERE id = $4
      `,
      [size, color, updatedStock, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Variação não encontrada"
      });
    }

    return res.json({
      message: "Variação atualizada"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteVariant = async (req, res) => {

  try {

    const { rowCount } = await pool.query(
      "DELETE FROM variacoes_produto WHERE id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Variação não encontrada"
      });
    }

    return res.json({
      message: "Variação removida"
    });

  } catch (error) {

    // se já tem item de carrinho/pedido referenciando essa variação,
    // o delete é barrado (sem ON DELETE CASCADE em itens_carrinho/itens_pedido)
    if (error.code === "23503") {
      return res.status(409).json({
        message: "Não é possível remover: essa variação está em carrinhos ou pedidos"
      });
    }

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
