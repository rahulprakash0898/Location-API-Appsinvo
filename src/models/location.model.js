import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: { 
      type: String, 
      unique: true,
    },
    password: { 
      type: String, 
    },
    address: {
      type: String,
    },
    status: { 
      type: Boolean, 
      default: true 
    },
    register_at: { 
      type: Date, 
      default: Date.now 
    },
    location: {
      type: { 
        type: String, 
        enum: ['Point'], 
        default: 'Point' 
      },
      coordinates: { 
        type: [Number], 
        default: [0, 0] 
      }
    },
    week_day: {
      type: [String],
      enum: [
        'sunday', 
        'monday', 
        'tuesday',
        'wednesday', 
        'thursday', 
        'friday', 
        'saturday'
      ],
      required: true
    }
  }
);


locationSchema.index({ location: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

export default Location;
