import { Conflict } from 'http-errors';
import getRelationships from '../utils/getRelationships';
import { postRecordMany, postRecordOne } from '../utils/cascadeQueries';
import _ from 'lodash';

/**
 * Create an array of RethinkDB queries to push to the parent postArray.
 * Depending on the relationship and its inverse, use different logic to return RethinkDB query.
 *
 * @param {String} entity - The entity that is being patched with the new ID.
 * @param {String} field - The field in the entity to append/insert.
 * @param {String} id - ID of the new record to cascade post.
 * @return {Array} Array of RethinkDB queries
 */
const createPostArray = (entity, field, id) => {
  const { table, inverseField, original, inverse } = entity;
  const postArray = [];

  if (original === 'belongsTo' && inverse === 'hasMany') {
    postArray.push(postRecordMany(table, field.id, inverseField, id));
  } else if (original === 'hasMany' && inverse === 'hasMany') {
    _.forEach(field, obj => {
      postArray.push(postRecordMany(table, obj.id, inverseField, id));
    });
  } else if (original === 'belongsTo' && inverse === 'hasOne') {
    postArray.push(postRecordOne(table, field.id, inverseField, id));
  }

  return postArray;
};

/**
 * Post relationships of a record that was just created.
 * Called in services create method {@link Database.create}.
 *
 * ```
 * // example call with params
 * cascadePost(record, 'listing', conn, schemas);
 * ```
 *
 * @param {Object} record - Record that was just created.
 * @param {String} table - Table name of record.
 * @param {Object} connection - Connection to rethink database.
 * @param {Object} schemas - Schemas to determine relationships.
 * @return {Array} Array of RethinkDB queries.
 */
export default (record, table, connection, schemas) => {
  const postArray = [];

  const relationships = getRelationships(table, schemas);

  Object.keys(relationships).forEach(relationship => {
    if (record.hasOwnProperty(relationship)) {
      const entity = relationships[relationship];

      if (record[relationship] === null) {
        throw new Conflict('Cannot cascade post, entity does not exist but record was created.');
      }

      postArray.push(...createPostArray(entity, record[relationship], record.id));
    }
  });

  return postArray;
};
