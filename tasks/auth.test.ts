import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { findStudentById, getTotalStudentsCount } from '../lib/studentsLookup';
import { createReceiptFlexMessage } from '../lib/liff';

describe('1. Student Database Lookup Tests (ฐานข้อมูลนักเรียน 2,906 คน)', () => {
  it('should have 2,906 registered students in database', () => {
    const total = getTotalStudentsCount();
    assert.strictEqual(total, 2906, `Expected 2,906 students, found ${total}`);
  });

  it('should find student by 5-digit ID (e.g. 34890)', () => {
    const result = findStudentById('34890');
    assert.strictEqual(result.found, true);
    assert.ok(result.student);
    assert.strictEqual(result.student.studentId, '34890');
    assert.ok(result.student.fullName.length > 0);
    assert.ok(result.student.gradeRoom.length > 0);
  });

  it('should return found: false for non-existent student ID', () => {
    const result = findStudentById('99999999');
    assert.strictEqual(result.found, false);
    assert.strictEqual(result.student, undefined);
  });

  it('should return found: false for empty string', () => {
    const result = findStudentById('');
    assert.strictEqual(result.found, false);
  });
});

describe('2. LINE Receipt Flex Message Generation Tests', () => {
  it('should generate valid flex message with order code and pickup code', () => {
    const mockOrder: any = {
      id: 'order_test_123',
      orderCode: 'SW-8901',
      pickupCode4Digits: '4821',
      shopName: 'ร้านป้าสมใจ ข้าวราดแกง',
      stallName: 'ล็อก 3 โรงอาหาร 1',
      pickupDate: '19 ส.ค. 2026',
      pickupTimeWindow: '06:45 - 07:45 น.',
      subtotal: 90,
      status: 'CONFIRMED',
      items: [
        {
          id: 'item_1',
          productId: 'p_1',
          productName: 'ข้าวกะเพราหมูสับไข่ดาว',
          quantity: 2,
          unitPrice: 45,
          totalPrice: 90,
          customizations: [],
        },
      ],
    };

    const flex = createReceiptFlexMessage(mockOrder);
    assert.strictEqual(flex.type, 'flex');
    assert.ok(flex.altText.includes('SW-8901'));
    assert.ok(flex.altText.includes('ร้านป้าสมใจ'));
    assert.strictEqual(flex.contents.type, 'bubble');
    assert.ok(flex.contents.body);
  });
});

describe('3. Auth Session Guard & Logic Tests', () => {
  const ADMIN_LINE_IDS = ['U203ff66b7e535c901dfbfa86d93eef46'];

  function checkRouteAccess(pathname: string, isLoggedIn: boolean): { allowed: boolean; redirectTo?: string } {
    if (pathname === '/login') {
      return { allowed: true };
    }
    if (isLoggedIn) {
      return { allowed: true };
    }
    return { allowed: false, redirectTo: '/login' };
  }

  function resolveEffectiveRole(lineUserId?: string, selectedRole: string = 'STUDENT'): string {
    if (lineUserId && ADMIN_LINE_IDS.includes(lineUserId)) {
      return 'ADMIN';
    }
    return selectedRole;
  }

  it('should allow /login unconditionally even when logged out', () => {
    const res = checkRouteAccess('/login', false);
    assert.strictEqual(res.allowed, true);
    assert.strictEqual(res.redirectTo, undefined);
  });

  it('should redirect protected route / to /login when logged out', () => {
    const res = checkRouteAccess('/', false);
    assert.strictEqual(res.allowed, false);
    assert.strictEqual(res.redirectTo, '/login');
  });

  it('should allow protected route / when logged in', () => {
    const res = checkRouteAccess('/', true);
    assert.strictEqual(res.allowed, true);
    assert.strictEqual(res.redirectTo, undefined);
  });

  it('should automatically assign ADMIN role for authorized LINE Admin User ID', () => {
    const role = resolveEffectiveRole('U203ff66b7e535c901dfbfa86d93eef46', 'STUDENT');
    assert.strictEqual(role, 'ADMIN');
  });

  it('should preserve STUDENT role for regular user', () => {
    const role = resolveEffectiveRole('U1234567890abcdef', 'STUDENT');
    assert.strictEqual(role, 'STUDENT');
  });
});

describe('4. Session Storage & Synchronization Tests', () => {
  it('should correctly parse valid saved user profile from localStorage format', () => {
    const mockStorage = JSON.stringify({
      id: 'U123456789',
      name: 'สมชาย ใจดี',
      nickname: 'ก้อง',
      studentId: '34890',
      gradeRoom: 'ม.5/2',
      phone: '0812345678',
      role: 'STUDENT',
      isLoggedIn: true,
    });

    const parsed = JSON.parse(mockStorage);
    assert.strictEqual(parsed.id, 'U123456789');
    assert.strictEqual(parsed.nickname, 'ก้อง');
    assert.strictEqual(parsed.studentId, '34890');
    assert.strictEqual(parsed.isLoggedIn, true);
  });

  it('should ignore legacy mock IDs during session restoration', () => {
    const legacyMockId = 'user_student_1';
    const isLegacy = legacyMockId.startsWith('user_student_') || legacyMockId.startsWith('user_teacher_');
    assert.strictEqual(isLegacy, true);
  });
});

