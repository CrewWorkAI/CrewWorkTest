/**
 * Contact entity skeleton
 *
 * This module defines a lightweight `Contact` class that represents a
 * person associated with an `Account`. The structure follows the same
 * minimal‑yet‑pluggable style used for the existing `Account` entity.
 *
 * Core fields derived from the project outline:
 *   * id, firstName, lastName, email, phone, role
 *   * created_at
 *
 * Relationship placeholders are included so consumers can attach the
 * related `Account` object or further domain objects later.
 */

class Contact {
  /**
   * @param {Object} attrs
   * @param {string} attrs.id
   * @param {string} attrs.firstName
   * @param {string} attrs.lastName
   * @param {string} attrs.email
   * @param {string} [attrs.phone]
   * @param {string} [attrs.role]
   * @param {Date}   attrs.created_at
   */
  constructor({
    id,
    firstName,
    lastName,
    email,
    phone = null,
    role = null,
    created_at,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.created_at = created_at ?? new Date();

    // Relationship placeholders – to be assigned by higher‑level services.
    this.account = null;
    this.contracts = [];
    this.healthSignals = [];
    this.playbookInvitations = [];
  }

  /**
   * Create a new contact with a generated id.
   * @param {Object} attrs
   * @returns {Contact}
   */
  static create(attrs) {
    const id = attrs.id ?? `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return new Contact({ ...attrs, id });
  }
}

module.exports = Contact;

