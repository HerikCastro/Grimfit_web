const pool = require("../config/db");

exports.createReview = async (req, res) => {

  try {

    const {
      produto_id,
      nota,
      comentario
    } = req.body;

    if (!produto_id || !nota || nota < 1 || nota > 5) {
      return res.status(400).json({
        message: "produto_id e nota (1 a 5) são obrigatórios"
      });
    }

    const { rows: compras } = await pool.query(`
      SELECT 1
      FROM itens_pedido ip
      JOIN pedidos p ON p.id = ip.pedido_id
      WHERE p.usuario_id = $1
      AND ip.produto_id = $2
      AND p.status = 'entregue'
      LIMIT 1
    `, [req.user.id, produto_id]);

    if (compras.length === 0) {
      return res.status(403).json({
        message: "Você só pode avaliar produtos de pedidos entregues"
      });
    }

    await pool.query(`
      INSERT INTO avaliacoes
      (
        usuario_id,
        produto_id,
        nota,
        comentario
      )
      VALUES ($1, $2, $3, $4)
    `, [
      req.user.id,
      produto_id,
      nota,
      comentario
    ]);

    return res.status(201).json({
      message: "Avaliação criada"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.getReviews = async (req, res) => {

  try {

    const { rows: reviews } = await pool.query(`
      SELECT
        a.*,
        u.nome
      FROM avaliacoes a
      JOIN usuarios u
      ON u.id = a.usuario_id
      WHERE produto_id = $1
    `, [req.params.id]);

    return res.json(reviews);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.updateReview = async (req, res) => {

  try {

    const { nota, comentario } = req.body;

    if (nota && (nota < 1 || nota > 5)) {
      return res.status(400).json({
        message: "nota precisa ser entre 1 e 5"
      });
    }

    const { rowCount } = await pool.query(
      `
      UPDATE avaliacoes
      SET
        nota = COALESCE($1, nota),
        comentario = COALESCE($2, comentario)
      WHERE id = $3
      AND usuario_id = $4
      `,
      [
        nota,
        comentario,
        req.params.id,
        req.user.id
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Avaliação não encontrada"
      });
    }

    return res.json({
      message: "Avaliação atualizada"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};

exports.deleteReview = async (req, res) => {

  try {

    const { rowCount } = await pool.query(
      `
      DELETE FROM avaliacoes
      WHERE id = $1
      AND usuario_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Avaliação não encontrada"
      });
    }

    return res.json({
      message: "Avaliação removida"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Erro interno"
    });

  }

};
