import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSCODE,
  generateImmutableUserId,
  normalizePublicUserId,
  isValidPublicUserId,
  isAdminEmail,
} from './user-id';

test('generateImmutableUserId is deterministic and follows DS-XXXXXXXX format', () => {
  const idA1 = generateImmutableUserId('firebase-uid-12345');
  const idA2 = generateImmutableUserId('firebase-uid-12345');
  const idB = generateImmutableUserId('firebase-uid-99999');

  assert.equal(idA1, idA2, 'Same UID must always produce the exact same immutable ID');
  assert.notEqual(idA1, idB, 'Different UIDs should produce distinct IDs');
  assert.match(idA1, /^DS-[A-Z0-9]{8}$/);
  assert.match(idB, /^DS-[A-Z0-9]{8}$/);
  assert.equal(isValidPublicUserId(idA1), true);
  assert.equal(isValidPublicUserId(idB), true);

  for (let i = 0; i < 500; i++) {
    const uid = i % 2 === 0 ? `instant_${i}_${Date.now() + i}` : `uid-sample-${i * 7919}`;
    const generated = generateImmutableUserId(uid);
    assert.match(generated, /^DS-[A-Z0-9]{8}$/, `Failed on uid=${uid}: got ${generated}`);
    assert.equal(isValidPublicUserId(generated), true);
  }
});

test('normalizePublicUserId and isValidPublicUserId validate ID inputs cleanly', () => {
  assert.equal(normalizePublicUserId('  ds-ab12cd34 '), 'DS-AB12CD34');
  assert.equal(isValidPublicUserId('DS-7F9A2C1B'), true);
  assert.equal(isValidPublicUserId('ds-7f9a2c1b'), false);
  assert.equal(isValidPublicUserId('DS-123'), false);
  assert.equal(isValidPublicUserId('XX-7F9A2C1B'), false);
  assert.equal(isValidPublicUserId(''), false);
  assert.equal(isValidPublicUserId(null), false);
});

test('isAdminEmail only matches florian25500@gmail.com case-insensitively and preserves default passcode constant', () => {
  assert.equal(ADMIN_EMAIL, 'florian25500@gmail.com');
  assert.equal(DEFAULT_ADMIN_PASSCODE, 'Ff0872559580');
  assert.equal(isAdminEmail('florian25500@gmail.com'), true);
  assert.equal(isAdminEmail('  FLORIAN25500@Gmail.COM '), true);
  assert.equal(isAdminEmail('other@gmail.com'), false);
  assert.equal(isAdminEmail(null), false);
});
