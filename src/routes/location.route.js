import express from 'express';


import { createUser,getRoadDistance,listUsersByDay } from '../controllers/location.controller.js';

const router = express.Router();

router.post('/create-user', createUser);
router.get('/road-distance', getRoadDistance);
router.get('/list-users', listUsersByDay);

export default router;