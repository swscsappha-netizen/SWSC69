# Todo Checklist: Sappha PreOrder Feature Enhancements

## Phase 1: Customer Experience Boost (Ratings, Reorder & Favorites)
- [ ] **Task 1.1:** ระบบสั่งซ้ำด่วน (1-Click Reorder) และบันทึกร้านโปรด (Favorites)
  - [ ] เพิ่ม `favorites: string[]` ใน UserProfile / AppContext
  - [ ] เพิ่มปุ่ม "สั่งซ้ำ" ในการ์ดประวัติคำสั่งซื้อ (`/orders`)
  - [ ] เพิ่มปุ่มหัวใจ ❤️ ในการ์ดร้านค้า (`ShopCard.tsx`)
- [x] **Task 1.2:** ระบบรีวิวและให้คะแนนร้านค้า (Rating & Review System)
  - [x] กำหนด Type `ShopReview` ใน `types/index.ts`
  - [x] สร้างคอมโพเนนต์ `ReviewModal.tsx` ให้ดาว 1-5 และคอมเมนต์
  - [x] แสดงคะแนนเฉลี่ยและรายการรีวิวในหน้าหน้าร้าน (`/shop/[id]`)
  - [x] เพิ่มปุ่มให้คะแนนในตั๋วรับของสถานะ COMPLETED (`/orders`)
  - [x] เพิ่มแท็บจัดการและลบรีวิวใน Admin Portal (`/admin`)

### Checkpoint 1: Customer Experience
- [ ] ทดสอบ Reorder เพิ่มสินค้าลงตะกร้าพร้อม Option เดิม
- [ ] ทดสอบส่งรีวิว และคะแนนร้านค้าอัปเดตถูกต้อง

---

## Phase 2: Engagement & Real-time Alerts
- [ ] **Task 2.1:** ศูนย์แจ้งเตือนในระบบ (In-App Notification Center)
  - [ ] กำหนด Type `AppNotification` ใน `types/index.ts`
  - [ ] เพิ่ม Notification state ใน `AppContext.tsx` (Trigger เมื่อสถานะออเดอร์เปลี่ยน)
  - [ ] สร้างไอคอนกระดิ่ง 🔔 พร้อม Badge และ Dropdown แสดงรายการแจ้งเตือนใน `Navbar.tsx`

### Checkpoint 2: Notification Center
- [ ] เมื่อแม่ค้าอนุมัติสลิป กระดิ่งแสดงแจ้งเตือนใหม่ทันที
- [ ] กดอ่านแจ้งเตือนแล้ว Badge ตัวเลขลดลง

---

## Phase 3: Discovery & Accessibility
- [ ] **Task 3.1:** ตัวกรองอาหารขั้นสูง & แท็กพิเศษ (Halal, Vegetarian, Price Range)
  - [ ] เพิ่ม tags: `isHalal`, `isVegetarian` ใน Product data
  - [ ] เพิ่มปุ่มฟิลเตอร์ "ฮาลาล ☪️" และ "ราคาไม่เกิน 40฿" ใน `CategoryPills.tsx`
  - [ ] แสดง Badge บนการ์ดอาหารในหน้าเมนู

---

## Phase 4: Merchant Analytics
- [ ] **Task 4.1:** แดชบอร์ดสถิติยอดขายสำหรับแม่ค้า (`/merchant/analytics`)
  - [ ] กราฟแท่งรายได้ย้อนหลัง 7 วัน
  - [ ] อันดับ 3 เมนูขายดีที่สุด
  - [ ] ปุ่มดาวน์โหลด CSV สรุปยอดขายเฉพาะร้าน

### Checkpoint 3: Production Readiness
- [ ] `npx tsc --noEmit` ผ่าน 100%
- [ ] `npm run build` คอมไพล์สำเร็จทุกหน้า
- [ ] ทดสอบทุกบทบาท (นักเรียน, แม่ค้า, แอดมิน) ทำงานร่วมกันได้สมบูรณ์
