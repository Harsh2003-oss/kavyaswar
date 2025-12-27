const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/:poemId', commentController.addComment);

router.get('/:poemId', commentController.getComments);

router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router;