/**
 * HealthSignal entity skeleton
 *
 * A HealthSignal represents a metric collected for an Account.
 * The core fields mirror the table columns defined in the README
 * under “Core Entities”.
 *   * id          – unique identifier
 *   * account_id  – foreign key to the owning `Account`
 *   * metric      – name of the metric (e.g., "usage", "ticket_volume")
 *   * value       – numeric value of the metric
 *   * timestamp   – date/time the signal was recorded
 *
 * In a real system the relationships would be populated by repository
 * services or domain logic.  For now we expose a lightweight constructor
 * and a static `create` helper that generates an id if one is not
 * supplied.
 */

// Simple deterministic id generator – replace with UUID in production.
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

class HealthSignal {
  /**
   * @param {Object} attrs
   * @param {string} attrs.id
   * @param {string} attrs.account_id
   * @param {string} attrs.metric
   * @param {number} attrs.value
   * @param {Date}   attrs.timestamp
   */
  constructor({
    id,
    account_id,
    metric,
    value,
    timestamp,
  } = {}) {
    this.id = id;
    this.account_id = account_id;
    this.metric = metric;
    this.value = value;
    this.timestamp = timestamp ?? new Date();

    // Placeholder for the owning account; populated by repository layers.
    this.account = null;
  }

  /**
   * Helper to create a new HealthSignal with a generated id.
   * @param {Object} attrs
   * @returns {HealthSignal}
   */
  static create(attrs = {}) {
    const id = attrs.id ?? generateId();
    return new HealthSignal({ ...attrs, id });
  }
}

module.exports = HealthSignal;

