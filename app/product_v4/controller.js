const Product = require("./model");
const path = require("path");
const fs = require("fs");

const index = (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query = { name: { $regex: new RegExp(search, "i") } };
  }
  Product.find(query)
    .then((result) => {
      if (search && result.length === 0) {
        res.status(404).send({ message: "No results found." });
      } else {
        res.send(result);
      }
    })
    .catch((error) => res.send(error));
};

const view = (req, res) => {
  const { id } = req.params;
  Product.findOne({ _id: id })
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

const store = (req, res) => {
  const { name, price, stock, status } = req.body;
  const image = req.file;
  if (image) {
    const target = path.join(__dirname, "../../uploads", image.originalname);
    fs.renameSync(image.path, target);
    Product.create({
      name,
      price,
      stock,
      status,
      image_url: `http://localhost:3000/public/${image.originalname}`,
    })
      .then((result) => res.send(result))
      .catch((error) => res.send(error));
  }
};

const update = (req, res) => {
  const { name, price, stock, status } = req.body;
  const image = req.file;
  let updateData = {
    name: name,
    price: price,
    stock: stock,
    status: status,
  };
  if (image) {
    const imagePath = `http://localhost:3000/public/${image.originalname}`;
    updateData.image_url = imagePath;
  }
  Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then((updatedProduct) => {
      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        res.status(404).send({ message: "Product not found." });
      }
    })
    .catch((error) => res.send(error));
};

const destroy = (req, res) => {
  const { id } = req.params;
  Product.findByIdAndRemove(id)
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

module.exports = { index, store, view, update, destroy };
