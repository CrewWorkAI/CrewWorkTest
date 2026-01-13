/**
 * Playbook entity skeleton
 *
 * This module defines a lightweight `Playbook` class that represents a
 * customer success playbook. It follows the same minimal‑yet‑pluggable
 * pattern that the other domain entities use so that the rest of the
 * codebase can instantiate and persist objects without caring about
 * storage details.
 *
 * Core fields from the project outline:
 *   * `id`          – unique identifier
 *   * `account_id`  – foreign key to the owning `Account`
 *   * `name`        – human‑readable title
 *   * `description` – optional longer text
 *
 * Relationship placeholders:
 *   * `tasks`      – array of task objects belonging to this playbook
 *   * `owners`     – array of `Contact` ids or objects that own/execute the playbook
 *
 * The design focuses on the public API; consumers can add richer
 * behaviour once the service layer is implemented.
 */

/** Simple deterministic ID generator – replace with UUID in production. */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

class Playbook {
  /**
   * @param {Object} attrs
   * @param {string} attrs.id
   * @param {string} attrs.account_id
   * @param {string} attrs.name
   * @param {string} [attrs.description]
   */
  constructor({ id, account_id, name, description = '' } = {}) {
    this.id = id;
    this.account_id = account_id;
    this.name = name;
    this.description = description;

    // Relationship placeholders – will be filled by higher‑level logic
    this.tasks = [];
    this.owners = [];
  }

  /**
   * Helper to create a new Playbook with a generated id.
   * @param {Object} attrs
   * @returns {Playbook}
   */
  static create(attrs = {}) {
    const id = attrs.id ?? generateId();
    return new Playbook({ ...attrs, id });
  }
}

module.exports = Playbook;

