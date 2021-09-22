const express = require('express');
const controller = require('../controllers/eventController');
const {isLoggedIn, isHost} = require('../middlewares/auth');
const {validateId, validateEvent, validateResult} = require('../middlewares/validator');
const router = express.Router();
// GET/events: sends all the events to user // '/' = http://localhost:3000/events
router.get('/', controller.connections);

//GET /events/new: send html form for creating a new event
router.get('/new', isLoggedIn, controller.new);

//POST /events: create a new event
router.post('/', isLoggedIn, validateEvent, validateResult, controller.create);

//GET /events/:id: send details of events identified by id
router.get('/:id', validateId, controller.detail);

//GET /events/:id/edit: send html form for editing an exising event
router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

//PUT /events/:id: update the event identified by id
router.put('/:id', validateId, isLoggedIn, isHost,  validateEvent, validateResult,  controller.update);

//DELETE /events/:id, delete the event identified by id
router.delete('/:id', validateId, isLoggedIn, isHost, controller.delete);


router.post('/:id/rsvp', validateId, isLoggedIn, controller.rsvp_create)

router.post('/:id/rsvp_del', validateId, isLoggedIn, controller.rsvp_delete)

module.exports = router;

