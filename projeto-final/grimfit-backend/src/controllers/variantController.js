const pool = require("../config/db");

exports.getVariantsByProduct = async (req, res) => {

  try {

    const { rows: variacoes } = await pool.query(
      `
      SELECT *
      FROM variacoes_produto
      WHERE produto_id = $1
      `,
      [req.params.produtoId]
    );

    return res.json(variacoes);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.createVariant = async (req, res) => {

  try {

    const { tamanho, cor, estoque } = req.body;

    const { rows: produto } = await pool.query(
      "SELECT id FROM produtos WHERE id = $1",
      [req.params.produtoId]
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
      [req.params.produtoId, tamanho, cor, estoque || 0]
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

    const { tamanho, cor, estoque } = req.body;

    const { rowCount } = await pool.query(
      `
      UPDATE variacoes_produto
      SET
        tamanho = COALESCE($1, tamanho),
        cor = COALESCE($2, cor),
        estoque = COALESCE($3, estoque)
      WHERE id = $4
      `,
      [tamanho, cor, estoque, req.params.id]
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
