const mongoose = require('mongoose');
const validator = require('validator');

const clothingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30
  },
  weather: {
    type: String,
    required: true,
    enum: ['hot', 'warm', 'cold']
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator(value){
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    //Why no ref prop? Is this supposed to be of ObjectId type, or is the link supposed to be connected to an item that's of the ObjectId type?
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    //possible that no action is needed, but if there is, review how to add default value (empty by default here), and add to ref prop
  }],
  createdAt: {
    type: Date,
    default: Date.now
    //review how to add default value (default value of Date.now)
  }
});

module.exports = mongoose.model('clothingItem', clothingItemSchema);