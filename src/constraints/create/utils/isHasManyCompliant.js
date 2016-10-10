import { checkValidIds, checkManyInverseHasOne } from '../../checks';

export default (inverse, data, conn) => {
  const { relation, type, field } = inverse;

  if (data === []) return true;

  switch (relation) {
    case 'hasMany':
      // check relationship with inverse relation `hasMany`
      return checkValidIds(type, data, conn);

    case 'hasOne':
      // check relationship with inverse relation `hasOne`
      return checkManyInverseHasOne(type, data, field, conn);

    case 'belongsTo':
      // check relationship with inverse relation `belongsTo`
      return false;

    default:
      throw new Error(`Invalid inverse relationship of type '${relation}'`);
  }
};