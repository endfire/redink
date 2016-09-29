import r from 'rethinkdb';
import { retrieveManyRecords, retrieveSingleRecord } from './utils';
import { createResourceArray } from './ResourceArray';

export default class Resource {
  /**
   * Instantiates a Resource.
   *
   * @param {Object} conn - RethinkDB connection object.
   * @param {Schema} schema
   * @param {Object} record
   */
  constructor(conn, schema, record) {
    if (!conn) {
      throw new TypeError('A valid RethinkDB connection is required to instantiate a Resource.');
    }

    if (!schema) {
      throw new TypeError('A valid schema is required to instantiate a Resource.');
    }

    if (!record) {
      throw new TypeError('A valid record is required to instantiate a Resource.');
    }

    this.conn = conn;
    this.schema = schema;
    this.id = record.id;
    this.meta = record.meta || {};

    this.attributes = {};
    this.relationships = {};

    Object.keys(record).forEach(field => {
      if (schema.hasAttribute(field)) {
        this.attributes[field] = record[field];
        return;
      }

      if (schema.hasRelationship(field)) {
        const relationship = schema.relationship(field);
        const recordsOrRecord = relationship.relation === 'hasMany'
          ? 'records'
          : 'record';

        this.relationships[field] = {
          ...relationship,
          [recordsOrRecord]: record[field],
        };

        return;
      }
    });
  }

  /**
   * Returns an attribute of the resource.
   *
   * ```
   * app.model('user').fetchResource('1').then(user => {
   *   user.attribute('name') === 'Dylan'
   * });
   * ```
   *
   * @param {String} attribute
   * @return {Any}
   */
  attribute(attribute) {
    return this.attributes[attribute];
  }

  /**
   * Returns a relationship of the resource.
   *
   * ```
   * app.model('user').fetchResource('1').then(user => {
   *   user.relationship('pets') === {
   *     type: 'animal',
   *     schema: Schema,
   *     relation: 'hasMany',
   *     records: [{
   *       id: '1',
   *       _archived: false,
   *     }, {
   *       id: '2',
   *       _archived: false,
   *     }],
   *     inverse: {
   *       type: 'user',
   *       relation: 'belongsTo',
   *       field: 'owner',
   *     },
   *   }
   *
   *   user.relationship('company') === {
   *     type: 'company',
   *     schema: Schema,
   *     relation: 'hasOne',
   *     record: {
   *       id: '1',
   *       _archived: false,
   *     },
   *     inverse: {
   *       type: 'user',
   *       relation: 'hasMany',
   *       field: 'employees',
   *     },
   *   }
   * });
   * ```
   *
   * @param {String} relationship
   * @return {Object}
   */
  relationship(relationship) {
    return this.relationships[relationship];
  }

  /**
   * Ensures that the state of this resource propagates through its relationships that demand
   * propagation.
   *
   * @return {Promise}
   */
  syncRelationships() {

  }

  fetch(relationship, options = {}) {
    if (!this.relationship(relationship)) {
      return Promise.resolve(null);
    }

    const { conn } = this;

    const {
      type,
      schema,
      relation,
      record: relatedRecord,
      records: relatedRecords,
    } = this.relationship(relationship);

    let table = r.table(type);

    if (relation === 'hasMany') {
      table = table.getAll(r.args(relatedRecords.map(record => record.id)));

      return retrieveManyRecords(table, options)
        .run(conn)
        .then(records => createResourceArray(conn, schema, records));
    }

    return retrieveSingleRecord(table, relatedRecord.id, options)
      .run(conn)
      .then(record => new Resource(conn, schema, record));
  }

  update(record) {
  }

  archive() {
  }

  /**
   * Returns true if this is archived.
   *
   * @return {Boolean}
   */
  isArchived() {
    // eslint-disable-next-line
    return this.meta._archived;
  }

  /**
   * Returns a plain object with an `attributes` key, a `relationships` key, and a `meta` key.
   *
   * @return {Object}
   */
  toObject() {
    return {
      attributes: {
        ...this.attributes,
      },
      relationships: {
        ...this.relationships,
      },
      meta: {
        ...this.meta,
      },
    };
  }
}

export const createResource = (...args) => new Resource(...args);