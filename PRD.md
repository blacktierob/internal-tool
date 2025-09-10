# **Product Requirements Document (PRD)**

**Product Name:** Black Tie Menswear Internal Web App

---

## **1\. Overview**

The Black Tie Menswear internal web app is a **responsive order management system** that replaces paper-based workflows. It centralises customer data, orders, garments, and sizes, and allows wedding groups to be managed across multiple appointments.

The app is built for **iPad Safari as the primary device**, with secondary support for iPhone Safari and desktop browsers. Orders are tied to a **function date** (e.g., a wedding day). Unlike a hire tracker, the system is designed to manage **orders and fittings**, not returns or stock.

---

## **2\. Objectives**

* Replace paper workflows with a digital, centralised order system.

* Simplify the flow from initial groom appointment through to group fittings.

* Support unlimited **outfit variations per wedding party**, with assignment of members later.

* Provide a modern, intuitive UI optimised for iPad use.

---

## **3\. Users**

* **Front-of-House Staff** – create new customers, start new orders.

* **Fitters** – measure customers, assign outfits, enter sizes.

* **Managers** – review orders, monitor group progress.  
   (All users share the same permissions in MVP.)

---

## **4\. Key Features (MVP)**

### **4.1 Dashboard**

* Show today’s function dates (all orders scheduled today).

* Show upcoming function dates (next 7–14 days).

* Show recent activity log (latest order/member updates).

* KPI snapshot: number of orders, number of party members added.

### **4.2 Customers**

* Searchable list by name, phone, or email.

* Filters: Active orders, Recently added.

* Customer detail page:

  * Contact details.

  * Linked orders (with function date, type, status).

  * CTA: “New Order.”

### **4.3 Orders**

#### **Creation Flow (Stage 1 – Groom appointment)**

* Groom’s details \+ function date.

* Groom’s outfit (garments \+ sizes).

* Create any number of additional **Outfits** (e.g., Groomsmen, Ushers).

* Enter **expected party size** (e.g., 6 members).

* No other members are added at this stage.

#### **Subsequent Flow (Stage 2 – Member fittings)**

* Staff look up order by **groom name \+ function date**.

* Add new **Wedding Party Member**:

  * Member details (name, phone optional).

  * Assign to one of the predefined outfits.

  * Capture sizes.

* Repeat until all members have been added.

#### **Order Detail Page**

* Show groom’s outfit \+ function date.

* Show defined outfits (A, B, …) with garment choices.

* Show expected party size vs members added so far.

* Member list: each with assigned outfit and sizes.

* Activity log timeline of all actions.

### **4.4 Wedding Groups**

* A Wedding Group is implicitly created at groom’s appointment.

* Members are linked later as they come for fittings.

* Group detail shows:

  * Groom, function date, expected party size.

  * Outfits defined by groom.

  * List of added members with outfit \+ sizes.

### **4.5 Garments & Sizes**

**Garment Categories (option lists):**

* Suit style

* Suit hire or purchase (default hire)

* Trousers

* Waistcoat

* Shirt style

* Shirt hire or purchase (default hire)

* Neckwear colour

* Neckwear hire or purchase (default hire)

* Handkerchief

* Shoes style

* Shoes hire or purchase

**Size Categories:**

* Jacket size

* Jacket length

* Trouser waist

* Trouser length

* Waistcoat size

* Waistcoat length (default Reg)

* Shirt collar size

* Shirt fit (multi-select)

* Shoe size

---

## **5\. Visual & UX Requirements**

* **Frontend:** React \+ Mantine UI.

* **Design:** Rounded corners, gradients, soft shadows, modern look.

* **Animations:** Mantine transitions \+ Framer Motion for subtle interactions.

* **Responsive priority:** iPad-first → iPhone Safari → desktop.

* **Accessibility:** WCAG AA contrast, touch targets ≥ 44px, screen reader labels.

---

## **6\. Security & Authentication**

* **Sign-In:** 4-digit code.

  * Each staff member has a unique PIN (user ID \+ password).

* **Permissions:** All users have the same access.

* **Session:** Auto-lock after 15 minutes idle.

* **Audit:** All actions logged with actor’s PIN.

---

## **7\. Tech Stack**

* **Frontend:** React \+ TypeScript, Mantine UI, Framer Motion, TanStack Query, Zustand/Context.

* **Backend/Database:** Supabase (Postgres, Realtime, Edge Functions).

* **Auth:** Supabase Edge Function validates PIN → JWT.

* **Hosting/DevOps:** Vercel/Netlify, Sentry (errors), PostHog/Amplitude (analytics).

* **Offline (future):** IndexedDB cache for recent customers/orders.

---

## **8\. Non-Functional Requirements**

* Load main screens \<2s.

* Search \<5s.

* Extendable schema for future features (inventory, payments).

* All changes logged for accountability.

---

## **9\. Success Metrics**

* 90% of orders created digitally.

* Member lookups \<5s.

* Paper use reduced by \>80%.

* Usability score ≥4/5 from staff.

---

## **10\. Data Model & Relations**

### **10.1 Entities**

* **Customers** – contact info.

* **Orders** – function\_date, groom (primary customer), expected party size.

* **Outfits** – garment selections defined at groom’s appointment.

* **Outfit Items** – garments per outfit (with hire/purchase).

* **Wedding Group Members** – added later, linked to order.

* **MemberOutfits** – assigns a member to one outfit.

* **SizeSets** – sizes per member, per order.

* **Activity Logs** – all actions with actor PIN.

* **Pin Users** – valid 4-digit codes.

* **Option Lists** – all selectable garment and size options.

### **10.2 Business Rules**

* Each order has a groom \+ function\_date.

* Expected party size entered at groom’s appointment.

* Members can only be added after order creation.

* Members must be assigned to one of the groom’s outfits.

* Unlimited outfits per order.

* Status workflow:

  * `new → fitting_booked | ready | cancelled`

  * `fitting_booked → ready | cancelled`

  * `ready → completed | cancelled`

  * `completed` \= terminal

### **10.3 Indexes**

* FTS index on customers (name/email/phone).

* Orders indexed by status, order\_type, function\_date.

* Members indexed by order\_id.

* Activity logs indexed by entity \+ date.

---

## **11\. Screen Inventory**

* **Authentication:** PIN Sign-In, Auto-lock re-entry.

* **Dashboard:** Today’s/Upcoming function dates, recent activity, KPIs.

* **Customers:** List, Filters, Customer Detail.

* **Orders:**

  * Create New Wedding Order (groom \+ outfits \+ party size).

  * Orders List (filters/search).

  * Order Detail (groom, outfits, expected party size, members).

* **Wedding Groups:** Group Detail (members, outfits, expected vs actual).

* **Member Fittings:** Add New Member (lookup by groom \+ function date).

* **Forms:** New Customer, New One-Off Order, Add/Edit Outfit, Add/Edit SizeSet.

* **System:** Settings/About, error & empty states.

