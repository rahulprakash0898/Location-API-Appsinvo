import Location from '../models/location.model.js';
import bcryptjs from 'bcryptjs';
import { generateToken } from '../utils/token.js';
import { userValidationSchema } from '../middlewares/location.validation.js';
import axios from 'axios';

export const createUser = async (req, res) => {
  try {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
      return res.json({ status_code: 400, message: error.details[0].message });
    }

    const { name, email, password, address, latitude, longitude, week_day } = req.body;

    const existingUser = await Location.findOne({ email });
    if (existingUser) {
      return res.json({
        status_code: 409,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await Location.create({
      name,
      email,
      password: hashedPassword,
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      week_day, 
      register_at: new Date() 
    });

    const token = generateToken(user._id);

    res.json({
      status_code: 200,
      message: "User created successfully",
      data: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        token 
      },
    });
  } catch (err) {
    res.json({ status_code: 500, message: err.message });
  }
};


export const getRoadDistance = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        status_code: 400,
        message: "Latitude and longitude are required"
      });
    }

    const users = await Location.find({}, 'name location.coordinates');

    const destinations = users.map(user => user.location.coordinates.reverse().join(',')).join('|'); 

    const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
      params: {
        origins: `${lat},${lng}`,
        destinations,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const distances = response.data.rows[0].elements;

    const result = users.map((user, index) => ({
      name: user.name,
      distance: distances[index].distance?.text || "N/A",
      duration: distances[index].duration?.text || "N/A"
    }));

    res.status(200).json({
      status_code: 200,
      message: "Distances from road (Google Maps)",
      data: result
    });

  } catch (err) {
    res.status(500).json({ status_code: 500, message: err.message });
  }
};


export const listUsersByDay = async (req, res) => {
  try {
    const { lat, lng, date } = req.query;

    if (!lat || !lng || !date) {
      return res.status(400).json({ status_code: 400, message: "lat, lng, and date are required" });
    }

    const dayNames = [
      "sunday", "monday", "tuesday", "wednesday",
      "thursday", "friday", "saturday"
    ];
    const selectedDay = dayNames[new Date(date).getDay()];

    // Find users matching the given day
    const users = await Location.find({ week_day: selectedDay }, 'name location.coordinates');

    if (users.length === 0) {
      return res.status(200).json({
        status_code: 200,
        message: `No users available on ${selectedDay}`,
        data: []
      });
    }

    // Google API requires lat,lng format
    const destinations = users
      .map(user => user.location.coordinates.slice().reverse().join(','))
      .join('|'); // converts [lng, lat] to [lat, lng]

    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${lat},${lng}`,
        destinations,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const distances = response.data.rows[0].elements;

    const result = users.map((user, index) => ({
      name: user.name,
      distance: distances[index]?.distance?.text || 'N/A',
      duration: distances[index]?.duration?.text || 'N/A'
    }));

    res.status(200).json({
      status_code: 200,
      message: `Users available on ${selectedDay} with road distances`,
      data: result
    });

  } catch (err) {
    res.status(500).json({ status_code: 500, message: err.message });
  }
};


