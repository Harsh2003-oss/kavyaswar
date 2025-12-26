const express = require('express');
const router = express.Router();
const poemController = require('../controllers/poemController');
const auth = require('../middleware/auth');


router.post('/', auth, poemController.createPoem);


router.get('/', auth, poemController.getMyPoems);

router.get('/search', auth, poemController.searchMyPoems);

router.get('/tags', auth, poemController.getMyTags);

router.get('/share/:link', poemController.getPoemByLink);

router.get('/:id', auth, poemController.getPoemById);


router.put('/:id', auth, poemController.updatePoem);


router.delete('/:id', auth, poemController.deletePoem);

module.exports = router;