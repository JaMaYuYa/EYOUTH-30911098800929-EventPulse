// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Schemas
const User = require('./models/user.model');
const Category = require('./models/category.model');
const Event = require('./models/event.model');
const Registration = require('./models/registration.model');
const Message = require('./models/message.model');

const seedDB = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // 2. Delete old data in order (child documents first to avoid orphaned references)
    await Message.deleteMany({});
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared all existing collections.');

    // 3. Hash passwords for seed accounts
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // 4. Create Users (1 Admin + 2 Attendees)
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@eventpulse.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: hashedPassword,
        role: 'attendee'
      },
      {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        password: hashedPassword,
        role: 'attendee'
      }
    ]);
    console.log(`Seeded ${users.length} Users (1 Admin, 2 Attendees).`);

    const admin = users[0];
    const attendee1 = users[1];
    const attendee2 = users[2];

    // 5. Create 3 Categories
    const categories = await Category.create([
      {
        name: 'Technology',
        description: 'Software development, AI, networking, and tech summits.'
      },
      {
        name: 'Design & Art',
        description: 'UI/UX design, graphic design workshops, and creative exhibits.'
      },
      {
        name: 'Business & Leadership',
        description: 'Keynotes, startup pitching, and executive networking.'
      }
    ]);
    console.log(`Seeded ${categories.length} Categories.`);

    // 6. Create 4 Events
    const events = await Event.create([
      {
        title: 'Backend Architecture Summit',
        description: 'Deep dive into Node.js, Express microservices, and MongoDB performance.',
        category: categories[0]._id,
        date: new Date('2026-09-20T10:00:00Z'),
        city: 'Cairo',
        venue: 'Tech Innovation Hub',
        capacity: 150,
        organizer: admin._id
      },
      {
        title: 'UI/UX Interactive Systems Workshop',
        description: 'Master component hierarchy and dynamic layout systems for modern web apps.',
        category: categories[1]._id,
        date: new Date('2026-10-05T14:00:00Z'),
        city: 'Alexandria',
        venue: 'Design Studio Center',
        capacity: 75,
        organizer: admin._id
      },
      {
        title: 'AI Engineering & LLM Integration Expo',
        description: 'Hands-on tutorials on embedding models, local vector stores, and custom agents.',
        category: categories[0]._id,
        date: new Date('2026-11-12T09:00:00Z'),
        city: 'Cairo',
        venue: 'Grand International Hall',
        capacity: 300,
        organizer: admin._id
      },
      {
        title: 'Startup Executive Forum',
        description: 'Networking event for tech leaders, founders, and product directors.',
        category: categories[2]._id,
        date: new Date('2026-12-01T17:00:00Z'),
        city: 'Giza',
        venue: 'Executive Nile Tower',
        capacity: 100,
        organizer: admin._id
      }
    ]);
    console.log(`Seeded ${events.length} Events.`);

    // 7. Create Sample Registrations
    const registrations = await Registration.create([
      { event: events[0]._id, attendee: attendee1._id },
      { event: events[0]._id, attendee: attendee2._id },
      { event: events[1]._id, attendee: attendee1._id }
    ]);
    console.log(`Seeded ${registrations.length} Registrations.`);

    // 8. Create Sample Messages
    const messages = await Message.create([
      {
        event: events[0]._id,
        sender: attendee1._id,
        text: 'Will slides and code samples be provided after the workshop?'
      },
      {
        event: events[0]._id,
        sender: admin._id,
        text: 'Yes, all attendees will receive a GitHub repository link.'
      }
    ]);
    console.log(`Seeded ${messages.length} Messages.`);

    console.log('\nDatabase Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();