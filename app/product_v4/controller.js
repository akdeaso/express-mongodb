const Product = require("./model");
const cloudinary = require("../../config/cloudinaryConfig");

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

const store = async (req, res) => {
  const { name, price, stock, status } = req.body;
  const image = req.file;
  if (image) {
    const uploadedImage = await cloudinary.uploader.upload(image.path);
    const imageUrl = uploadedImage.secure_url;
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
};

const update = async (req, res) => {
  const { name, price, stock, status } = req.body;
  const image = req.file;
  let updateData = {
    name: name,
    price: price,
    stock: stock,
    status: status,
  };
  if (image) {
    const uploadedImage = await cloudinary.uploader.upload(image.path);
    const imageUrl = uploadedImage.secure_url;
    updateData.image_url = imageUrl;
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
