// const express = require('express');
// const router = express.Router();
// const itemController = require('../controllers/itemController');
// const upload = require('../middleware/upload');
// const authMiddleware = require('../middleware/authMiddleware');


// // GET /api/items?parentId=...
// router.get('/', authMiddleware, itemController.getItems);

// // POST /api/items/folder
// router.post('/folder', authMiddleware, itemController.createFolder);

// // POST /api/items/upload
// router.post('/upload', authMiddleware, upload, itemController.uploadFiles);

// // THIS IS THE CORRECT ROUTE FOR SHARING MULTIPLE ITEMS
// router.post('/share', authMiddleware, itemController.createShareLink);

// // GET /api/items/share/:code
// router.get('/share/:code', itemController.getSharedItems);

// // DELETE /api/items/:id
// router.delete('/:id', authMiddleware, itemController.deleteItem);

// module.exports = router;


const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../middleware/upload');

// No authMiddleware is needed anymore
router.get('/', itemController.getItems);
router.post('/folder', itemController.createFolder);
router.post('/upload', upload, itemController.uploadFiles);
router.post('/share', itemController.createShareLink);
router.get('/share/:code', itemController.getSharedItems);
router.delete('/:id', itemController.deleteItem);

module.exports = router;