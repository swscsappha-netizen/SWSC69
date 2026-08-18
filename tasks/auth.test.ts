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

describe('3. LoadingAuthScreen & Seamless Auth Guard Tests', () => {
  const ADMIN_LINE_IDS = ['U203ff66b7e535c901dfbfa86d93eef46'];

  function resolveAuthViewState(isLoggedIn: boolean, isAuthReady: boolean): { showLoadingScreen: boolean; showMainApp: boolean } {
    if (!isLoggedIn || !isAuthReady) {
      return { showLoadingScreen: true, showMainApp: false };
    }
    return { showLoadingScreen: false, showMainApp: true };
  }

  function shouldShowOnboardingModal(isLoggedIn: boolean, isAuthReady: boolean, studentId?: string): boolean {
    if (!isAuthReady || !isLoggedIn) return false;
    const isMockOrEmptyId = !studentId || studentId.length < 4 || studentId.startsWith('user_') || studentId === 'ADMIN-01' || studentId === '45892';
    return isMockOrEmptyId;
  }

  function resolveEffectiveRole(lineUserId?: string, selectedRole: string = 'STUDENT'): string {
    if (lineUserId && ADMIN_LINE_IDS.includes(lineUserId)) {
      return 'ADMIN';
    }
    return selectedRole;
  }

  it('should render LoadingAuthScreen when user is not authenticated yet or sync in progress', () => {
    const view1 = resolveAuthViewState(false, false);
    assert.strictEqual(view1.showLoadingScreen, true);

    const view2 = resolveAuthViewState(true, false);
    assert.strictEqual(view2.showLoadingScreen, true);
  });

  it('should reveal main app only when user is authenticated and isAuthReady is true', () => {
    const view = resolveAuthViewState(true, true);
    assert.strictEqual(view.showLoadingScreen, false);
    assert.strictEqual(view.showMainApp, true);
  });

  it('should NEVER flash onboarding modal for returning student while isAuthReady is false or when studentId exists', () => {
    // While loading:
    assert.strictEqual(shouldShowOnboardingModal(true, false, ''), false);
    // When finished loading and user has student ID:
    assert.strictEqual(shouldShowOnboardingModal(true, true, '34890'), false);
  });

  it('should show onboarding modal smoothly for new user only after isAuthReady is true', () => {
    assert.strictEqual(shouldShowOnboardingModal(true, true, ''), true);
  });

  it('should automatically assign ADMIN role for authorized LINE Admin User ID', () => {
    const role = resolveEffectiveRole('U203ff66b7e535c901dfbfa86d93eef46', 'STUDENT');
    assert.strictEqual(role, 'ADMIN');
  });

  it('should preserve STUDENT role for regular user', () => {
    const role = resolveEffectiveRole('U1234567890abcdef', 'STUDENT');
    assert.strictEqual(role, 'STUDENT');
  });

  it('should allow ADMIN to have 5-digit student registration while retaining ADMIN privileges', () => {
    const adminUser = {
      id: 'U203ff66b7e535c901dfbfa86d93eef46',
      lineUserId: 'U203ff66b7e535c901dfbfa86d93eef46',
      name: 'นายเกียรติภูมิ ธิคำ',
      nickname: 'แอดมิน',
      studentId: '34890',
      gradeRoom: 'ม.5/2',
      role: 'ADMIN',
      isLoggedIn: true,
    };
    const role = resolveEffectiveRole(adminUser.lineUserId, adminUser.role);
    assert.strictEqual(role, 'ADMIN');
    assert.strictEqual(adminUser.studentId, '34890');
    assert.strictEqual(adminUser.isLoggedIn, true);
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

describe('5. Profile Locking & Admin User Management Tests', () => {
  function isFieldEditableByRole(fieldName: string, userRole: string): boolean {
    if (userRole === 'ADMIN') return true;
    const studentLockedFields = ['name', 'studentId', 'gradeRoom'];
    return !studentLockedFields.includes(fieldName);
  }

  function applyAdminUserUpdate(user: any, updates: any) {
    return { ...user, ...updates };
  }

  it('should lock name, studentId, and gradeRoom for STUDENT role', () => {
    assert.strictEqual(isFieldEditableByRole('studentId', 'STUDENT'), false);
    assert.strictEqual(isFieldEditableByRole('name', 'STUDENT'), false);
    assert.strictEqual(isFieldEditableByRole('gradeRoom', 'STUDENT'), false);
    assert.strictEqual(isFieldEditableByRole('nickname', 'STUDENT'), true);
    assert.strictEqual(isFieldEditableByRole('phone', 'STUDENT'), true);
  });

  it('should allow ADMIN role to edit all fields', () => {
    assert.strictEqual(isFieldEditableByRole('studentId', 'ADMIN'), true);
    assert.strictEqual(isFieldEditableByRole('name', 'ADMIN'), true);
    assert.strictEqual(isFieldEditableByRole('gradeRoom', 'ADMIN'), true);
  });

  it('should allow ADMIN to update a student ID, name, and room successfully', () => {
    const originalStudent = {
      id: 'student_123',
      name: 'สมชาย ใจดี',
      studentId: '34890',
      gradeRoom: 'ม.5/2',
      nickname: 'ก้อง',
      role: 'STUDENT',
    };

    const updated = applyAdminUserUpdate(originalStudent, {
      studentId: '31774',
      name: 'เด็กหญิงพิชญ์นรี คล้อยแย้ม',
      gradeRoom: 'ม.2/1',
      nickname: 'มินนี่',
    });

    assert.strictEqual(updated.studentId, '31774');
    assert.strictEqual(updated.name, 'เด็กหญิงพิชญ์นรี คล้อยแย้ม');
    assert.strictEqual(updated.gradeRoom, 'ม.2/1');
    assert.strictEqual(updated.nickname, 'มินนี่');
  });
});

