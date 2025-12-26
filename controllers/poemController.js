const Poem = require('../models/Poem');
// Create a new poem
exports.createPoem = async (req, res) => {
  try {
    const { title, content, isPublic, slideInterval, narrationSettings, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const lines = content.split('\n').filter(line => line.trim() !== '');

    const poem = new Poem({
      userId: req.user.id,
      title,
      content,
      lines,
      tags: tags || [],  // ✅ ADD THIS
      isPublic: isPublic || false,
      slideInterval: slideInterval || 3000,
      narrationSettings: narrationSettings || {},
    });

    await poem.save();

    res.status(201).json({
      message: 'Poem created successfully',
      poem,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all poems for logged-in user
exports.getMyPoems = async (req, res) => {
  try {
    const poems = await Poem.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      count: poems.length,
      poems,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single poem by ID (for owner)
exports.getPoemById = async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Check if user owns this poem
    if (poem.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(poem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Poem not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get poem by shareable link (public access - no auth needed)
exports.getPoemByLink = async (req, res) => {
  try {
    const poem = await Poem.findOne({ shareableLink: req.params.link })
      .populate('userId', 'name'); // Get author name

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    if (!poem.isPublic) {
      return res.status(403).json({ message: 'This poem is not public' });
    }

    res.json(poem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a poem
exports.updatePoem = async (req, res) => {
  try {
    const { title, content, isPublic, slideInterval, narrationSettings, tags } = req.body;

    let poem = await Poem.findById(req.params.id);

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    if (poem.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title) poem.title = title;
    if (content) {
      poem.content = content;
      poem.lines = content.split('\n').filter(line => line.trim() !== '');
    }
    if (isPublic !== undefined) poem.isPublic = isPublic;
    if (slideInterval) poem.slideInterval = slideInterval;
    if (narrationSettings) poem.narrationSettings = narrationSettings;
    if (tags) poem.tags = tags;  // ✅ ADD THIS

    poem.updatedAt = Date.now();

    await poem.save();

    res.json({
      message: 'Poem updated successfully',
      poem,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
// Delete a poem
exports.deletePoem = async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.id);

    if (!poem) {
      return res.status(404).json({ message: 'Poem not found' });
    }

    // Check if user owns this poem
    if (poem.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await poem.deleteOne();

    res.json({ message: 'Poem deleted successfully' });
  } catch (err) {
    console.error(err.message);
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search poems (for logged-in user)
exports.searchMyPoems = async (req, res) => {
  try {
    const { query, tag } = req.query;

    // Build search criteria
    let searchCriteria = { userId: req.user.id };

    if (query) {
      // Search in title and content
      searchCriteria.$or = [
        { title: { $regex: query, $options: 'i' } },  // Case-insensitive
        { content: { $regex: query, $options: 'i' } },
      ];
    }

    if (tag) {
      // Search by tag
      searchCriteria.tags = { $in: [tag.toLowerCase()] };
    }

    const poems = await Poem.find(searchCriteria)
      .sort({ createdAt: -1 });

    res.json({
      count: poems.length,
      poems,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all unique tags for user's poems
exports.getMyTags = async (req, res) => {
  try {
    const poems = await Poem.find({ userId: req.user.id });
    
    // Extract all tags and remove duplicates
    const allTags = poems.flatMap(poem => poem.tags);
    const uniqueTags = [...new Set(allTags)];

    res.json({
      count: uniqueTags.length,
      tags: uniqueTags,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};