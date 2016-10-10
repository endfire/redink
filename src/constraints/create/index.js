import {
  isHasManyCompliant,
  isHasOneCompliant,
  isBelongsToCompliant,
} from './utils';

export default (record, schema, conn) => {
  const isTrue = check => (check === true);
  const checkPass = response => response.every(isTrue);

  const checkManyToMany = (data, field) => {
    if (!Array.isArray(data)) {
      throw new Error(
        `Expected record to include '${field}' with either an empty array or array of ids.`
      );
    }
  };

  const checkBelongsTo = (data, field) => {
    if (!data) {
      throw new Error(
        `Expected record to include '${field}' set with an id.`
      );
    }
  };

  return Promise
    .all(schema.relationships.map(relationship => {
      const { relation, inverse, field } = relationship;
      const data = record[field];

      if (relation === 'hasMany' && inverse.relation === 'hasMany') checkManyToMany(data, field);
      if (relation === 'belongsTo') checkBelongsTo(data, field);

      if (!record.includes(field)) return true;

      switch (relation) {
        case 'hasMany':
          // check relationship with original relation `hasMany`
          return isHasManyCompliant(inverse, data, conn);

        case 'hasOne':
          // check relationship with original relation `hasOne`
          return isHasOneCompliant(inverse, data, conn);

        case 'belongsTo':
          // check relationship with original relation `belongsTo`
          return isBelongsToCompliant(inverse, data, conn);

        default:
          throw new Error(`Invalid relationship of type '${relation}'`);
      }
    }))
    .then(checkPass);
};