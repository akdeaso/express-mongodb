const Product = require("./model");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

const index = async (req, res) => {
  try {
    const { search } = req.query;
    let products;
    if (search) {
      products = await Product.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`,
          },
        },
      });
    } else {
      products = await Product.findAll();
    }
    if (products.length === 0) {
      res.send({
        status: "failed",
        response: "No products found",
      });
    } else {
      res.send({
        status: "success",
        response: products,
      });
    }
  } catch (e) {
    res.send({
      status: "failed",
      response: e,
    });
  }
};

const view = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.send({
        status: "failed",
        response: "Product not found",
      });
      return;
    }
    res.send({
      status: "success",
      response: product,
    });
  } catch (e) {
    res.send({
      status: "failed",
      response: e,
    });
  }
};

const store = async (req, res) => {
  const { users_id, name, price, stock, status } = req.body;
  const image = req.file;
  if (image) {
    const target = path.join(__dirname, "../../uploads", image.originalname);
    fs.renameSync(image.path, target);
    try {
      await Product.sync();
      const result = await Product.create({
        users_id,
        name,
        price,
        stock,
        status,
        image_url: `http://localhost:3000/public/${image.originalname}`,
      });
      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }
};

const update = async (req, res) => {
  const { users_id, name, price, stock, status } = req.body;
  const image = req.file;
  const target = path.join(__dirname, "../../uploads", image.originalname);
  try {
    let imageUrl = null;
    if (image) {
      fs.renameSync(image.path, target);
      imageUrl = `http://localhost:3000/public/${image.originalname}`;
    }
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.send({
        status: "failed",
        response: "Product not found",
      });
      return;
    }
    await product.update({
      users_id: parseInt(users_id),
      name,
      price,
      stock,
      status,
      image_url: imageUrl || product.image_url,
    });
    res.send({
      status: "success",
      response: product,
    });
  } catch (e) {
    res.send({
      status: "failed",
      response: e,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).send({
        status: "failed",
        response: "Product not found",
      });
      return;
    }
    await product.destroy();
    res.send({
      status: "success",
      response: "Product deleted successfully",
    });
  } catch (e) {
    res.send({
      status: "failed",
      response: e,
    });
  }
};

module.exports = { store, index, view, update, destroy };
