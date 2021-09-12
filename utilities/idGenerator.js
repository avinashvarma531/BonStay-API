const { writeFileSync } = require("fs");
const ids = require("./ids.json");

const generateUserId = () => {
    const newId = ++ids.latestUserId;
    writeFileSync("./utilities/ids.json", JSON.stringify(ids, null, '\t'));
    return String(newId).padStart(3, "0");
};

const generateBookingId = () => {
    const newId = ++ids.latestBookingId;
    writeFileSync("./utilities/ids.json", JSON.stringify(ids, null, '\t'));
    return String(newId).padStart(3, "0");
};

module.exports = { generateUserId, generateBookingId };