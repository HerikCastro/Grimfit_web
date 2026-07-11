const pool = require("../config/db");

exports.getCart = async (req, res) => {

  try {

    const { rows: carrinho } =
      await pool.query(
        `
        SELECT
          ic.id,
          ic.quantidade,
          p.nome,
          p.preco
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

exports.removeCartItem = async (req, res) => {

  try {

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
