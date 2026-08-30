const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Setup environment and connection
dotenv.config({ path: 'e:/code/Projects/ForexTrading 2.0/backend/.env' });
mongoose.connect(process.env.MONGODB_URI);

const User = require('e:/code/Projects/ForexTrading 2.0/backend/src/models/User');
const Trade = require('e:/code/Projects/ForexTrading 2.0/backend/src/models/Trade');

async function inspectData() {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    
    for (const user of users) {
      const closedTrades = await Trade.find({ userId: user._id, status: 'CLOSED' });
      const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      
      console.log(`\nUser: ${user.name} (${user.email}) [ID: ${user._id}]`);
      console.log(`Closed Trades Count: ${closedTrades.length}`);
      console.log(`Total PnL from Closed Trades: $${totalPnL.toFixed(2)}`);
    }
  } catch (error) {
    console.error('Error inspecting data:', error);
  } finally {
    mongoose.disconnect();
  }
}

inspectData();
