const Product = require("./model");
const path = require("path");
const fs = require("@cyclic.sh/s3fs");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
require("dotenv").config();

const s3fsConfig = new fs({
  bucket: process.env.CYCLIC_BUCKET_NAME,
  region: "us-west-1",
});

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
    const imageUrl = `https://${process.env.CYCLIC_BUCKET_NAME}.cyclic.app/${image.originalname}`;

    s3fsConfig.writeFile(image.originalname, image.buffer, (err) => {
      if (err) {
        res.send(err);
      } else {
        Product.create({
          name,
          price,
          stock,
          status,
          image_url: imageUrl,
        })
          .then((result) => res.send(result))
          .catch((error) => res.send(error));
      }
    });
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
    const imageUrl = `https://${process.env.CYCLIC_BUCKET_NAME}.cyclic.app/${image.originalname}`;

    s3fsConfig.writeFile(image.originalname, image.buffer, (err) => {
      if (err) {
        res.send(err);
      } else {
        updateData.image_url = imageUrl;

        Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
          .then((updatedProduct) => {
            if (updatedProduct) {
              res.send(updatedProduct);
            } else {
              res.status(404).send({ message: "Product not found." });
            }
          })
          .catch((error) => res.send(error));
      }
    });
  } else {
    Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .then((updatedProduct) => {
        if (updatedProduct) {
          res.send(updatedProduct);
        } else {
          res.status(404).send({ message: "Product not found." });
        }
      })
      .catch((error) => res.send(error));
  }
};

const destroy = (req, res) => {
  const { id } = req.params;
  Product.findByIdAndRemove(id)
    .then((result) => res.send(result))
    .catch((error) => res.send(error));
};

module.exports = { index, store, view, update, destroy };
