/**
 * Renewal Risk entity skeleton
 *
 * The Renewal Risk model represents a flag that may affect an account's
 * renewal in the Customer Success platform.  The definition mirrors the
 * other entity skeletons in the repository – keeping the public API
 * lightweight while allowing tests and services to construct and persist
 * instances.
 *
 * Core fields from the project outline:
 *   * `id`          – unique identifier
 *   * `account_id`  – foreign key to the owning `Account`
 *   * `type`        – string describing the kind of risk (e.g. "late payment", "dropped engagement")
 *   * `level`       – severity level (e.g. 1 = low, 3 = high)
 *   * `detected_at` – timestamp when the risk was first identified
 *   * `resolved_at` – optional timestamp when the risk was resolved
 *   * `status`      – enum like "open", "in_progress", "resolved"
 *
 * Relationship placeholders:
 *   * `account` – the Account object once it is populated by a service
 *   * `contacts` – owners or stakeholders linked to the risk
 *
 * The design is intentionally minimal; once a service layer is added it
 * can enrich the object with behaviour, persistence, and validation.
 */

/** Simple deterministic ID generator – replace with UUID in production */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

class RenewalRisk {
  /**
   * @param {Object} attrs
   * @param {string} attrs.id
   * @param {string} attrs.account_id
   * @param {string} attrs.type
   * @param {number} attrs.level
   * @param {Date}   attrs.detected_at
   * @param {Date}   [attrs.resolved_at]
   * @param {string} [attrs.status]
   */
  constructor({
    id,
    account_id,
    type,
    level,
    detected_at,
    resolved_at = null,
    status = 'open',
  } = {}) {
    this.id = id;
    this.account_id = account_id;
    this.type = type;
    this.level = level;
    this.detected_at = detected_at ?? new Date();
    this.resolved_at = resolved_at;
    this.status = status;

    // Relationship placeholders – will be populated by higher‑level logic
    this.account = null;
    this.contacts = [];
  }

  /**
   * Helper to create a new RenewalRisk with a generated id.
   * @param {Object} attrs
   * @returns {RenewalRisk}
   */
  static create(attrs = {}) {
    const id = attrs.id ?? generateId();
    return new RenewalRisk({ ...attrs, id });
  }
}

module.exports = RenewalRisk;

