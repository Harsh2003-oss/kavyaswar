const express = require('express');
const router = express.Router();
const poemController = require('../controllers/poemController');
const auth = require('../middleware/auth');


router.get('/search', auth, poemController.searchMyPoems);


router.get('/tags', auth, poemController.getMyTags);

router.get('/analytics', auth, poemController.getMyAnalytics);

router.get('/voice-info', poemController.getVoiceInfo);

router.get('/background-music', poemController.getBackgroundMusic);

router.get('/share/:link', poemController.getPoemByLink);

router.post('/', auth, poemController.createPoem);

router.get('/', auth, poemController.getMyPoems);

router.post('/:id/like', poemController.likePoem);

router.post('/:id/view', poemController.incrementViews);

router.put('/:id/narration', auth, poemController.updateNarrationSettings);

router.get('/:id', auth, poemController.getPoemById);

router.put('/:id', auth, poemController.updatePoem);

router.delete('/:id', auth, poemController.deletePoem);

module.exports = router;