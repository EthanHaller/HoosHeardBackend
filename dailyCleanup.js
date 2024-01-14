const cron = require("node-cron")

cron.schedule('0 4 * * *', () => {
	console.log('Initiating daily cleanup at 04:00 at America/New_York timezone');
  }, {
	timezone: "America/New_York"
  });