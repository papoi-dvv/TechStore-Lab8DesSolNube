const app = require('./app');
const { initializeDatabase } = require('./utils/initDatabase');

const PORT = process.env.PORT || 4000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TechStore backend listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
