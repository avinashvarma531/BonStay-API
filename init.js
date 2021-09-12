const fs = require('fs');

latestIds = {
	"latestUserId": 0,
	"latestBookingId": 0
}

fs.writeFileSync("./utilities/ids.json", JSON.stringify(latestIds, null, '\t'));