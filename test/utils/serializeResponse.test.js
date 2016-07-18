import test from 'ava';
import serializeResponse from '../../src/utils/serializeResponse';
import { schemas } from '../fixtures';

test('Serialize: Serialize body', t => {
  const schema = schemas.individual;

  const expected = {
    id: '6',
    name: 'CJ',
    email: 'brewercalvinj@gmail.com',
    pets: [{
      id: '1',
      archived: false,
    }, {
      id: '2',
      archived: false,
    }],
    company: {
      id: '1',
    },
    meta: {
      archived: false,
    },
  };

  const serialized = serializeResponse(schema, {
    id: '6',
    name: 'CJ',
    email: 'brewercalvinj@gmail.com',
    pets: [{
      id: '1',
      archived: false,
    }, {
      id: '2',
      archived: false,
    }],
    company: {
      id: '1',
      archived: false,
    },
    meta: {
      archived: false,
    },
  });

  t.deepEqual(serialized, expected, 'Serialize relationships');
});
