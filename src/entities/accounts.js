/**
 * Account entity skeleton
 *
 * This module defines a minimal `Account` class that represents the core
 * account domain object. It is intentionally lightweight – the focus is on
 * the API surface that other modules will use. The fields are derived from
 * the project outline:
 *   * id, name, industry, created_at
 *   * relationships: contacts, contract, healthSignals, playbooks, risks
 *
 * In a real implementation the relationships would be objects or collections
 * and richer methods would be added.  For now we expose the constructor and
 * simple getters/setters to allow tests and services to instantiate and
 * persist accounts.
 */

class Account {
  /**
   * @param {Object} attrs
   * @param {string} attrs.id
   * @param {string} attrs.name
   * @param {string} attrs.industry
   * @param {Date}   attrs.created_at
   */
  constructor({ id, name, industry, created_at }) {
    this.id = id;
    this.name = name;
    this.industry = industry;
    this.created_at = created_at ?? new Date();

    // Relationship placeholders – will be filled by other layers.
    this.contacts = [];
    this.contract = null;
    this.healthSignals = [];
    this.playbooks = [];
    this.risks = [];
  }

  /**
   * Create a new account with a generated id.
   * @param {Object} attrs
   * @returns {Account}
   */
  static create(attrs) {
    const id = attrs.id ?? `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new Account({ ...attrs, id });
  }
}

module.exports = Account;

