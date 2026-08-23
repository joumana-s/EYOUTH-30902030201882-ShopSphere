const prisma = require('../utils/prismaClient');

function buildImageUrl(req) {
  if (req.file && req.file.url) {
    return req.file.url;
  }
  if (typeof req.body.image === 'string' && req.body.image.trim() !== '') {
    return req.body.image.trim();
  }
  return null;
}

function parseProductInput(req) {
  const body = req.body || {};
  const { name, description, price, categoryId } = body;
  const data = {
    name,
    description: description === undefined ? undefined : description,
    price: price !== undefined ? Number(price) : undefined,
    categoryId: categoryId ? Number(categoryId) : null,
    image: buildImageUrl(req)
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  return data;
}

exports.getProducts = async (req, res) => {
  const { search, category, sort, page = 1, limit = 12 } = req.query;
  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    });
  }

  if (category) {
    filters.push({ category: { name: category } });
  }

  const orderBy = [];
  if (sort === 'priceAsc') orderBy.push({ price: 'asc' });
  else if (sort === 'priceDesc') orderBy.push({ price: 'desc' });
  else orderBy.push({ createdAt: 'desc' });

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Number(limit) || 12);
  const where = filters.length ? { AND: filters } : {};

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: { category: true }
    })
  ]);

  res.json({ items: products, total, page: pageNumber, limit: pageSize, totalPages: Math.ceil(total / pageSize) });
};

exports.getProductById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid product id.' });
  }
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  res.json({ product });
};

exports.createProduct = async (req, res) => {
  const data = parseProductInput(req);
  if (!data.name || data.price === undefined || Number.isNaN(data.price)) {
    return res.status(400).json({ message: 'Name and a valid price are required.' });
  }
  const product = await prisma.product.create({ data, include: { category: true } });
  res.status(201).json({ product });
};

exports.updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid product id.' });
  }
  const data = parseProductInput(req);
  try {
    const product = await prisma.product.update({ where: { id }, data, include: { category: true } });
    res.json({ product });
  } catch (error) {
    res.status(404).json({ message: 'Product not found.' });
  }
};

exports.deleteProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid product id.' });
  }
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ message: 'Product not found.' });
  }
};
