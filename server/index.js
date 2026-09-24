require("dotenv").config();
const { connect } = require("./db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Stall Ledger API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
