# Implementation Plan: Sappha PreOrder Feature Roadmap & Enhancement Plan

## Overview
แผนงานการพัฒนายกระดับระบบ **Sappha PreOrder (โรงเรียนสรรพวิทยาคม)** สู่ระบบสั่งอาหารล่วงหน้าระดับ Production เต็มรูปแบบ ครอบคลุมการเพิ่มประสบการณ์ผู้ซื้อ (Ratings, Reorder, Favorites), ระบบแจ้งเตือน In-App Notification Center, ตัวกรองเมนูขั้นสูง (ฮาลาล/ราคาประหยัด), และระบบสถิติการเงินของแม่ค้า

---

## Architecture Decisions
1. **Vertical Slicing:** พัฒนาทีละฟีเจอร์แบบ End-to-End (Data Model -> AppContext -> UI Component -> Page -> Verification) เพื่อให้ระบบอยู่ในสถานะที่รันได้และทดสอบได้ตลอดเวลา
2. **State & Local Persistence:** บันทึกข้อมูล Reviews, Favorites, และ Notifications ลงใน `localStorage` ควบคู่กับ Global `AppContext`
3. **Responsive & Mobile-First:** ทุกฟังก์ชันต้องรองรับการแสดงผลทั้งบนสมาร์ตโฟน (Mobile App-like) และหน้าจอคอมพิวเตอร์ (Desktop Web)

---

## Task Breakdown & Phases

### 📌 Phase 1: Customer Experience Boost (Ratings, Reorder & Favorites)

#### Task 1.1: ระบบสั่งซ้ำด่วน (1-Click Reorder) & ร้านโปรด (Favorites)
* **Description:** เพิ่มปุ่ม "สั่งซ้ำ" ในหน้าประวัติออเดอร์ (`/orders`) เพื่อดึงรายการเมนูพร้อมตัวเลือกเดิมใส่ตะกร้าทันที และเพิ่มปุ่มหัวใจ ❤️ บันทึกร้านโปรด
* **Acceptance Criteria:**
  - มีปุ่ม "สั่งซ้ำ (Reorder)" บนการ์ดออเดอร์ที่เสร็จสิ้นแล้ว
  - เมื่อกดสั่งซ้ำ รายการสินค้าพร้อมตัวเลือก (Size, Toppings, Note) จะถูกเพิ่มลงตะกร้าทันที พร้อมเปิดหน้าตะกร้า
  - นักเรียนสามารถกดหัวใจ ❤️ เพื่อบันทึกร้านโปรด และฟิลเตอร์ดูเฉพาะร้านโปรดได้ในหน้าแรก
* **Files:** `types/index.ts`, `context/AppContext.tsx`, `app/orders/page.tsx`, `components/ShopCard.tsx`
* **Scope:** Medium (3-4 files)

#### Task 1.2: ระบบรีวิว & ให้คะแนนร้านค้า (Rating & Review System)
* **Description:** ให้นักเรียนสามารถให้ดาว (1-5 ดาว ⭐) และเขียนข้อความรีวิวอาหารหลังรับของเสร็จสิ้น พร้อมแสดงรีวิวบนหน้าร้านค้า
* **Acceptance Criteria:**
  - มีปุ่ม "ให้คะแนน / รีวิว" บนตั๋วรับของที่สถานะ `COMPLETED`
  - Modal แบบฟอร์มให้คะแนน 1-5 ดาว และช่องพิมพ์คอมเมนต์ความอร่อย
  - หน้าร้านค้า (`/shop/[id]`) มีแท็บแสดงคะแนนเฉลี่ยและรายการรีวิวจากเพื่อนๆ ในโรงเรียน
* **Files:** `types/index.ts`, `context/AppContext.tsx`, `components/ReviewModal.tsx`, `app/shop/[id]/page.tsx`
* **Scope:** Medium (3-4 files)

---

### 📌 Phase 2: Engagement & Real-time Alerts (Notification Center)

#### Task 2.1: ศูนย์แจ้งเตือนในระบบ (In-App Notification Center)
* **Description:** เพิ่มไอคอนกระดิ่ง 🔔 บน Navbar แสดงรายการแจ้งเตือน เช่น สลิปได้รับการอนุมัติ, อาหารปรุงเสร็จแล้ว, หรือแจ้งเตือนด่วนจากแอดมิน
* **Acceptance Criteria:**
  - ไอคอนกระดิ่ง 🔔 บนแถบเมนูบนสุด พร้อม Badge ตัวเลขอ่านยังไม่ได้อ่าน
  - Dropdown / Modal แสดงประวัติการแจ้งเตือน เรียงตามเวลาล่าสุด
  - แจ้งเตือนอัตโนมัติเมื่อแม่ค้ากดอนุมัติสลิป หรือเมื่อเปลี่ยนสถานะเป็น "พร้อมรับของ"
* **Files:** `types/index.ts`, `context/AppContext.tsx`, `components/Navbar.tsx`, `components/NotificationDropdown.tsx`
* **Scope:** Medium (3-4 files)

---

### 📌 Phase 3: Discovery & Accessibility (Dietary Tags & Advanced Filter)

#### Task 3.1: ตัวกรองอาหารขั้นสูง & แท็กพิเศษ (Halal, Vegetarian, Price Range)
* **Description:** เพิ่มแท็กกำกับอาหาร เช่น ☪️ ฮาลาล (อิสลามทานได้), 🥬 มังสวิรัติ/เจ, 🌶️ ไม่เผ็ด พร้อมตัวกรองช่วงราคา (เช่น ไม่เกิน 35 บาท)
* **Acceptance Criteria:**
  - การ์ดเมนูแสดง Badge แท็กอาหาร (Halal, Veggie) ชัดเจน
  - หน้าแรกตลาดโรงอาหารมีปุ่มฟิลเตอร์ "ฮาลาล ☪️" และ "เมนูประหยัด (≤ 40฿)"
* **Files:** `types/index.ts`, `lib/mockData.ts`, `components/CategoryPills.tsx`, `components/MenuCard.tsx`, `app/page.tsx`
* **Scope:** Small (2-3 files)

---

### 📌 Phase 4: Merchant Sales Analytics

#### Task 4.1: แดชบอร์ดสถิติยอดขายรายสัปดาห์สำหรับแม่ค้า (`/merchant/analytics`)
* **Description:** หน้าวิเคราะห์ยอดขาย กราฟรายได้ และเมนูขายดีประจำร้านสำหรับแม่ค้า
* **Acceptance Criteria:**
  - สรุปยอดขายย้อนหลัง 7 วันในรูปแบบกราฟแท่ง
  - แสดง 3 อันดับเมนูขายดีที่สุดของร้าน
  - ปุ่ม Export ยอดขายรายวันของร้านเป็น CSV
* **Files:** `app/merchant/analytics/page.tsx`, `app/merchant/page.tsx`
* **Scope:** Small-Medium (2 files)

---

## Verification Plan
1. **Automated Verification:**
   - รัน `npx tsc --noEmit` เพื่อตรวจสอบ Type Safety
   - รัน `npm run build` เพื่อให้แน่ใจว่าทั้ง 15+ หน้าคอมไพล์ผ่าน 100%
2. **End-to-End User Flow Checks:**
   - ทดสอบกด Reorder -> สินค้าเข้าตะกร้า -> สั่งซื้อสำเร็จ
   - ทดสอบให้ดาวและเขียนรีวิว -> คะแนนเฉลี่ยของร้านอัปเดตเรียลไทม์
   - ทดสอบการแจ้งเตือนกระดิ่งเมื่อแม่ค้ากดรับออเดอร์
