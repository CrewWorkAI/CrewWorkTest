// Entry point for the CrewWorkTest project
// Exposes core entities for external modules and tests

module.exports = {
  Account: require('./entities/accounts'),
  Contact: require('./entities/contacts'),
  Contract: require('./entities/contracts'),
  HealthSignal: require('./entities/health_signals'),
  Playbook: require('./entities/playbooks'),
  RenewalRisk: require('./entities/renewal_risks')
};

