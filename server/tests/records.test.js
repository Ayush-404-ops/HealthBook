const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

test('Medical Records & Upload Directory', async (t) => {
  await t.test('uploads directory exists and is writable', () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    assert.equal(fs.existsSync(uploadsDir), true);

    const testFile = path.join(uploadsDir, 'test-write.tmp');
    fs.writeFileSync(testFile, 'test-content');
    assert.equal(fs.existsSync(testFile), true);
    fs.unlinkSync(testFile);
    assert.equal(fs.existsSync(testFile), false);
  });
});
