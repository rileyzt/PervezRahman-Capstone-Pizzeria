// MENU CONTROLLER — CRUD + Search + Browse

const MenuItem = require('../models/MenuItem');

// GET /api/menu — get all items (optional category filter)
const getAllMenuItems = async (req, res) => {
  try {
    let filter = { isAvailable: true };

    // if category is provided in query like /api/menu?category=pizza
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/menu/search?q=margh — search by name
const searchMenuItems = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ message: 'Please provide a search query' });
    }

    // $regex does a partial match, $options 'i' makes it case-insensitive
    const items = await MenuItem.find({
      name: { $regex: query, $options: 'i' },
      isAvailable: true
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/menu/:id — get single item
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// POST /api/menu — admin creates new item
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    // simple validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      image: image || '',
      createdBy: req.user._id
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// PUT /api/menu/:id — admin updates item
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // update only the fields that were sent
    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;
    item.image = req.body.image || item.image;

    if (req.body.isAvailable !== undefined) {
      item.isAvailable = req.body.isAvailable;
    }

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// DELETE /api/menu/:id — admin deletes item
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems
};
