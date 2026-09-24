const { connect } = require("../server/db");
const app = require("../server/app");

module.exports = async (req, res) => {
  await connect();
  return app(req, res);
};
