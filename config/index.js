const app = 'thnakyou';

module.exports = {
  development: {
    DB: `mongodb://localhost:27017/${app}`,
    secret: 'SeCrEtKeYfOrHaShInG'
  },
  production: {
    DB: `mongodb://localhost:27017/${app}`,
    secret: 'SeCrEtKeYfOrHaShInG'
  }
};
