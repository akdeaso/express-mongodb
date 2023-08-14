const Product = require("./model");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

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
  if (!image) {
    return res.status(400).send({ message: "Image is required." });
  }
  const params = {
    Bucket: process.env.CYCLIC_BUCKET_NAME,
    Key: `uploads/${image.originalname}`,
    Body: fs.createReadStream(image.path),
  };
  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).send({ message: "Error uploading image to S3." });
    }
    const imageUrl = data.Location;
    Product.create({
      name,
      price,
      stock,
      status,
      image_url: imageUrl,
    })
      .then((result) => res.send(result))
      .catch((error) => res.send(error));
  });
};

const update = (req, res) => {
  const { name, price, stock, status } = req.body;
  const image = req.file;
  const updateData = {
    name: name,
    price: price,
    stock: stock,
    status: status,
  };
  if (image) {
    const params = {
      Bucket: "your-s3-bucket-name",
      Key: `product-images/${image.originalname}`,
      Body: fs.createReadStream(image.path),
    };
    s3.upload(params, (err, data) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error uploading image to S3." });
      }
      const imageUrl = data.Location;
      updateData.image_url = imageUrl;
      updateProduct(updateData, req.params.id, res);
    });
  } else {
    updateProduct(updateData, req.params.id, res);
  }
};

const updateProduct = (updateData, productId, res) => {
  Product.findByIdAndUpdate(productId, updateData, { new: true })
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
