const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/auth');
const { sanitizeMongo, hasMongoOperator } = require('../middleware/mongoSanitize');
const { getRecordById, uploadRecord } = require('../controllers/recordController');
const { login } = require('../controllers/authController');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    setHeader(name, val) {
      this.headers[name] = val;
    },
  };
  return res;
}

test('Security Audit - Automated Defensive Controls', async (t) => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Unauthenticated access returns 401
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('unauthenticated access to protected route returns 401', async () => {
    const req = {
      cookies: {},
      headers: {},
    };
    const res = createMockRes();
    let nextCalled = false;

    await protect(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'next() should not be called when unauthenticated');
    assert.equal(res.statusCode, 401, 'Should return HTTP 401');
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Not authenticated/);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Patient A cannot fetch Patient B's record (expect 403)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('patient A cannot access patient B medical record (expect 403)', async () => {
    const origFindById = MedicalRecord.findById;
    try {
      MedicalRecord.findById = async () => ({
        _id: 'record123',
        patient: 'patient-b-id',
        title: 'Confidential Blood Test',
      });

      const req = {
        params: { id: 'record123' },
        user: { _id: 'patient-a-id', role: 'patient' },
      };
      const res = createMockRes();

      await getRecordById(req, res);

      assert.equal(res.statusCode, 403, 'Should reject with HTTP 403');
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Not authorized to access this record/);
    } finally {
      MedicalRecord.findById = origFindById;
    }
  });

  await t.test('doctor cannot access patient record without shared confirmed/completed appointment (expect 403)', async () => {
    const origFindById = MedicalRecord.findById;
    const origDoctorFindOne = Doctor.findOne;
    const origApptFindOne = Appointment.findOne;

    try {
      MedicalRecord.findById = async () => ({
        _id: 'record123',
        patient: 'patient-b-id',
        title: 'Prescription Details',
      });

      Doctor.findOne = async () => ({
        _id: 'doctor-doc-id',
        user: 'doctor-user-id',
      });

      // No confirmed or completed appointment exists between doctor and patient
      Appointment.findOne = async () => null;

      const req = {
        params: { id: 'record123' },
        user: { _id: 'doctor-user-id', role: 'doctor' },
      };
      const res = createMockRes();

      await getRecordById(req, res);

      assert.equal(res.statusCode, 403, 'Should return 403 when no shared appointment exists');
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Not authorized to access this record without a shared confirmed or completed appointment/);
    } finally {
      MedicalRecord.findById = origFindById;
      Doctor.findOne = origDoctorFindOne;
      Appointment.findOne = origApptFindOne;
    }
  });

  await t.test('doctor CAN access patient record when shared confirmed/completed appointment exists (expect 200)', async () => {
    const origFindById = MedicalRecord.findById;
    const origDoctorFindOne = Doctor.findOne;
    const origApptFindOne = Appointment.findOne;

    try {
      const mockRecord = {
        _id: 'record123',
        patient: 'patient-b-id',
        title: 'Prescription Details',
      };
      MedicalRecord.findById = async () => mockRecord;

      Doctor.findOne = async () => ({
        _id: 'doctor-doc-id',
        user: 'doctor-user-id',
      });

      // A confirmed appointment exists
      Appointment.findOne = async () => ({
        _id: 'appt-123',
        status: 'confirmed',
      });

      const req = {
        params: { id: 'record123' },
        user: { _id: 'doctor-user-id', role: 'doctor' },
      };
      const res = createMockRes();

      await getRecordById(req, res);

      assert.equal(res.statusCode, 200, 'Should return 200 when doctor has confirmed appointment');
      assert.equal(res.body.success, true);
      assert.equal(res.body.data._id, 'record123');
    } finally {
      MedicalRecord.findById = origFindById;
      Doctor.findOne = origDoctorFindOne;
      Appointment.findOne = origApptFindOne;
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. File upload security (wrong file type and fake magic-byte rejection)
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('file upload with spoofed magic bytes or wrong extension is rejected (expect 400)', async () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a fake PDF that is actually plain text without %PDF- magic bytes
    const fakePdfPath = path.join(uploadsDir, 'fake-doc.pdf');
    fs.writeFileSync(fakePdfPath, '<script>alert(1)</script>');

    try {
      const req = {
        file: {
          path: fakePdfPath,
          filename: 'fake-doc.pdf',
          originalname: 'fake-doc.pdf',
          mimetype: 'application/pdf',
          size: 25,
        },
        body: {
          title: 'My Fake Lab Test',
        },
        user: { _id: 'patient-123', role: 'patient' },
      };
      const res = createMockRes();

      await uploadRecord(req, res);

      assert.equal(res.statusCode, 400, 'Fake PDF with invalid magic bytes should return 400');
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid file signature/);
      assert.equal(fs.existsSync(fakePdfPath), false, 'Temporary malicious file should be unlinked/deleted');
    } finally {
      if (fs.existsSync(fakePdfPath)) {
        fs.unlinkSync(fakePdfPath);
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Mongo operator injection prevention
  // ─────────────────────────────────────────────────────────────────────────────
  await t.test('hasMongoOperator detects nested $ and dot keys', () => {
    assert.equal(hasMongoOperator({ '$gt': '' }), true);
    assert.equal(hasMongoOperator({ email: { '$ne': null } }), true);
    assert.equal(hasMongoOperator({ 'user.role': 'admin' }), true);
    assert.equal(hasMongoOperator({ email: 'normal@user.com', password: 'plainPassword' }), false);
  });

  await t.test('sanitizeMongo middleware rejects payloads containing Mongo operators (expect 400)', () => {
    const req = {
      body: {
        email: { '$gt': '' },
        password: 'password123',
      },
      query: {},
      params: {},
    };
    const res = createMockRes();
    let nextCalled = false;

    sanitizeMongo(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'Should not allow request to proceed');
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Malicious operator/);
  });

  await t.test('login rejects non-string credentials to prevent operator injection (expect 400)', async () => {
    const req = {
      body: {
        email: { '$ne': null },
        password: 'password123',
      },
    };
    const res = createMockRes();

    await login(req, res);

    assert.equal(res.statusCode, 400, 'Should reject non-string email with 400');
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Email and password are required and must be valid text/);
  });
});
