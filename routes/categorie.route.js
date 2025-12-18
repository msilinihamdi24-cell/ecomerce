const express = require('express');
const router = express.Router();
const Categorie = require('../models/categorie');

// GET all
router.get('/', async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET by ID
router.get('/:categorieId', async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.categorieId);
    if (!categorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    res.status(200).json(categorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const { nomcategorie, imagecategorie } = req.body;
    const newCategorie = new Categorie({ nomcategorie, imagecategorie });
    await newCategorie.save();
    res.status(201).json(newCategorie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT
router.put('/:categorieId', async (req, res) => {
  try {
    const updated = await Categorie.findByIdAndUpdate(
      req.params.categorieId,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE
router.delete('/:categorieId', async (req, res) => {
  try {
    await Categorie.findByIdAndDelete(req.params.categorieId);
    res.status(200).json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
