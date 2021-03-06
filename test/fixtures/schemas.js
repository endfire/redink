import schema, { hasMany, hasOne, belongsTo } from 'redink-schema';

export const address = schema('address', {
  attributes: {
    city: true,
  },
  relationships: {
    company: belongsTo('company', 'address'),
  },
  meta: {
    inflection: 'addresses',
  },
});

export const blog = schema('blog', {
  attributes: {
    title: true,
  },
  relationships: {
    author: belongsTo('user', 'blogs'),
  },
  meta: {
    inflection: 'blogs',
  },
});

export const company = schema('company', {
  attributes: {
    name: true,
  },
  relationships: {
    employees: hasMany('user', 'company'),
    address: hasOne('address', 'company'),
  },
  meta: {
    inflection: 'companies',
  },
});

export const user = schema('user', {
  attributes: {
    name: true,
  },
  relationships: {
    blogs: hasMany('blog', 'author'),
    friends: hasMany('user', 'friends'),
    company: hasOne('company', 'employees'),
  },
  meta: {
    inflection: 'users',
  },
});

export const book = schema('book', {
  attributes: {
    title: true,
  },
  relationships: {
    author: belongsTo('user', 'books'),
  },
  meta: {
    inflection: 'books',
  },
});
