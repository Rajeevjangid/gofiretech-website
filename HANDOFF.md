# GoFire Tech Website — Development Handoff

## 1. Project Overview

Project: GoFire Tech Website  
Repository: `gofiretech-website`  
GitHub: `https://github.com/Rajeevjangid/gofiretech-website`

This is the current working GoFire Tech production website codebase.

IMPORTANT:
- Do NOT reset, rebuild, replace, or delete the existing project.
- Preserve all currently working functionality.
- Existing Admin Portal and Student Portal flows have already been implemented and tested.
- Make additive/minimal changes wherever possible.
- Do not unnecessarily modify the existing Prisma schema or authentication architecture.
- Do not expose or commit environment secrets.
- Before changing existing functionality, inspect the current implementation first.

---

# 2. Current Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL database
- NextAuth for Admin authentication
- Custom student portal authentication/session
- Nodemailer for credential/email functionality
- Framer Motion / existing UI components where already used

The project uses the Next.js App Router structure.

Important existing directories:

- `src/app/`
- `src/components/`
- `src/lib/`
- `src/hooks/`
- `src/types/`
- `prisma/`
- `public/`

---

# 3. Current Git / Repository State

The current working project has been pushed successfully to GitHub.

Branch:

`main`

Remote:

`origin -> https://github.com/Rajeevjangid/gofiretech-website.git`

Current Git state at handoff:

- Local branch is tracking `origin/main`
- Working tree is clean
- Current implementation has been committed
- Current code has been pushed to GitHub

Do not force-push or rewrite history unless explicitly required.

---

# 4. Existing Public Website

The public GoFire Tech website is already implemented.

Existing marketing/public areas include:

- Homepage
- About
- Courses
- Individual course pages
- Contact
- Blog
- Notes
- Branding-related content
- SEO-related functionality
- Public media/assets
- Responsive UI

The current public website should be treated as the existing production frontend.

Do not redesign the entire website unless explicitly requested.

Existing marketing route group:

`src/app/(marketing)/`

Important public areas include:

- `src/app/(marketing)/page.tsx`
- `src/app/(marketing)/about/`
- `src/app/(marketing)/courses/`
- `src/app/(marketing)/contact/`
- `src/app/(marketing)/blog/`
- `src/app/(marketing)/notes/`

---

# 5. Existing Admin Portal

The Admin Portal is already implemented and working.

Admin authentication uses the existing NextAuth setup.

Admin protected routes are under:

`src/app/admin/(protected)/`

Existing Admin functionality includes:

## Dashboard

`/admin/dashboard`

## Students

`/admin/students`

Features include:

- Student list
- Student search
- Student management
- Student creation
- Student details
- Student editing
- Password reset functionality

New student route:

`/admin/students/new`

Student detail route:

`/admin/students/[id]`

Creating a student can automatically email the student's credentials.

---

# 6. Existing Batch Management

Batch management is already implemented.

Routes:

`/admin/batches`

`/admin/batches/[id]`

Existing functionality:

- Create batches
- List batches
- Assign batches to courses
- Edit batch information
- Manage modules
- Manage learning resources inline

Batch-related data is stored through Prisma.

---

# 7. Existing Enrollment Management

Enrollment functionality is already implemented and has been tested.

Admin route:

`/admin/enrollments`

Existing functionality includes:

- Enrollment list
- Create enrollment
- Update enrollment status
- Filter enrollments
- Student-to-batch enrollment flow

Existing enrollment APIs are under:

`src/app/api/admin/enrollments/`

Important:

The existing enrollment flow is working and must not be broken while implementing future Student Portal/Fees functionality.

---

# 8. Existing Student Portal

The Student Portal has already been implemented.

Student portal base route:

`/portal`

Student authentication is separate from the Admin authentication flow.

Existing student routes include:

## Login

`/portal/login`

Files include:

- `src/app/portal/login/page.tsx`
- `src/app/portal/login/PortalLoginForm.tsx`

## Forgot Password

`/portal/forgot-password`

## Dashboard

`/portal/dashboard`

Protected route:

`src/app/portal/(protected)/dashboard/page.tsx`

## Profile

`/portal/profile`

Protected route:

`src/app/portal/(protected)/profile/page.tsx`

## Batch

`/portal/batch/[batchId]`

## Resource

`/portal/resource/[resourceId]`

The student portal also has its own layout/navigation implementation.

Important portal component:

`src/components/portal/PortalNavbar.tsx`

---

# 9. Student Authentication Architecture

Student authentication is separate from Admin authentication.

Important file:

`src/lib/student-auth.ts`

Existing student authentication handles:

- Student database session
- Student login
- Student access checks
- Enrollment/access validation
- Enrollment ID generation
- Session CRUD
- Student portal authorization

The implementation uses a portal session cookie:

`portal_session`

The current architecture described by the existing implementation is:

- `/admin/*` -> NextAuth authentication
- `/portal/*` -> `portal_session` based student authentication

Middleware:

`src/middleware.ts`

The middleware supports the dual authentication architecture.

DO NOT replace this with a completely new authentication system.

---

# 10. Existing Email Infrastructure

Important file:

`src/lib/email.ts`

Nodemailer is used for credential/email functionality.

Existing branded HTML email functionality exists.

Student creation can trigger credential email functionality.

Environment variables are required for SMTP.

Expected variables include:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Do not hardcode SMTP credentials.

---

# 11. Existing Database / Prisma Architecture

Database ORM:

Prisma

Important directory:

`prisma/`

Current database implementation includes student/enrollment/learning portal related models.

The Student Enrollment + Learning Portal implementation added the following major tables/models:

- `students`
- `batches`
- `enrollments`
- `modules`
- `learning_resources`
- `student_sessions`

There are also additive changes to:

`NoteAccess`

including an optional `studentId` used for the Notes portal integration.

The database changes have already been applied using:

- `prisma db push`
- `prisma generate`

IMPORTANT:

Do not drop/reset the database.

Do not run destructive Prisma commands against the existing database.

Before modifying the schema, inspect the existing `prisma/schema.prisma`.

---

# 12. Existing Portal API Routes

Existing Student Portal APIs include:

- Portal login
- Portal logout
- Current student (`me`)
- Dashboard
- Batch
- Resource
- Change password

Relevant API area:

`src/app/api/portal/`

Examples include:

`src/app/api/portal/auth/login/`

`src/app/api/portal/auth/logout/`

`src/app/api/portal/auth/change-password/`

`src/app/api/portal/me/`

`src/app/api/portal/dashboard/`

`src/app/api/portal/batch/[batchId]/`

`src/app/api/portal/resource/[resourceId]/`

All portal APIs must perform server-side student authorization.

Never trust student IDs supplied directly by the browser.

---

# 13. Existing Admin API Routes

Admin APIs already exist for:

- Students CRUD
- Student password reset
- Batches CRUD
- Enrollments CRUD
- Modules
- Resources
- Branding
- Homepage
- Media
- SEO
- Settings
- Statistics
- Blog
- Courses
- Contacts
- Testimonials
- Notes

Relevant area:

`src/app/api/admin/`

All Admin APIs should continue using server-side Admin authorization.

---

# 14. Student Enrollment + Learning Portal Status

The Student Enrollment + Learning Portal implementation has been completed successfully.

The implementation was verified with a successful production build.

The implementation summary stated:

- Production build passes cleanly
- Portal pages are included in the build
- Admin portal pages are included in the build
- Student authentication infrastructure exists
- Admin student management exists
- Batch management exists
- Enrollment management exists
- Learning modules/resources management exists
- Student portal dashboard/profile/batch/resource pages exist

The existing enrollment flow has also been manually tested.

---

# 15. Current Product Requirement — Student Portal Expansion

The next major product requirement is to expand the Student Portal into a more complete student management system.

The desired experience is:

Public website
    ↓
Student Portal entry point
    ↓
Student Login
    ↓
Student Dashboard
    ↓
Student's own Batch
    ↓
Learning / Resources
    ↓
Fees
    ↓
Payments / Installments
    ↓
Fee Receipts
    ↓
Profile
    ↓
Documents
    ↓
Other student information

The Student should only see their own information.

---

# 16. Public Website Student Portal Entry Point

A proper Student Portal entry point should be available on the public website.

Likely locations to evaluate:

- Navbar
- Mobile navigation
- Footer
- CTA / account area

Expected behavior:

Student clicks "Student Portal"
    ↓
`/portal/login`

Do not break existing public navigation.

Use the existing website design system and branding.

---

# 17. Student Dashboard Expansion

The Student Dashboard should eventually provide a useful overview of the student's account.

Potential dashboard information:

- Student name
- Profile information
- Enrolled course
- Current batch
- Batch timing
- Batch status
- Course progress where supported
- Fee summary
- Total fees
- Paid amount
- Pending amount
- Next installment / due information
- Recent payment
- Latest fee receipt
- Learning resources
- Announcements / notices if later added

Only implement fields supported by the database.

Do not invent database relationships without inspecting the current schema.

---

# 18. Fee Management — Planned Feature

Fee management is an important pending feature.

The planned implementation has discussed models/features such as:

- `FeeRecord`
- `Payment`
- `Receipt`

These should be implemented only after reviewing the existing Prisma schema and current enrollment/batch/student relationships.

The goal is to support:

## Fee Record

A student's fee structure should be associated with the student's enrollment/batch.

Possible information:

- Total course fee
- Discount if applicable
- Final payable amount
- Paid amount
- Pending amount
- Fee status
- Due date
- Notes

## Payments

Individual payments/installments should be recorded.

Each payment may contain:

- Amount
- Payment date
- Payment method
- Transaction/reference number
- Notes
- Recorded by admin

The system should support multiple installments/payments against one fee record.

The paid/pending amounts should be calculated consistently.

---

# 19. Fee Status

Student dashboard should eventually display a clear fee status.

Examples:

- Paid
- Partially Paid
- Pending
- Overdue

The exact status rules should be defined in the implementation based on the database and business requirements.

Do not duplicate fee calculations in multiple places.

Prefer server-side calculation / centralized logic.

---

# 20. Fee Receipt Generation

Fee receipt generation is a pending feature.

The goal is for each payment/installment to have a receipt.

Receipt should eventually contain appropriate information such as:

- GoFire Tech branding
- Receipt number
- Student name
- Student ID / enrollment ID
- Course
- Batch
- Payment date
- Amount paid
- Payment method
- Transaction/reference ID
- Remaining balance
- Authorized/admin information where appropriate

The student should be able to view/download their own receipts.

Admin should be able to view/manage receipts.

Receipt generation must not expose another student's data.

---

# 21. Student Profile

Student profile functionality already exists at:

`/portal/profile`

Future expansion can include:

- Full name
- Email
- Phone
- Date of birth if required
- Address if required
- Profile photo if required
- Education details if required
- Emergency contact if required

Only add fields after confirming product requirements.

Avoid unnecessary schema expansion.

---

# 22. Student Documents — Planned Feature

Student documents are part of the planned Student Portal expansion.

The planned concept is:

`StudentDocument`

Possible documents may include:

- Identity document
- Photograph
- Educational document
- Certificate
- Other required student documents

Requirements:

- Student should see only their own documents.
- Admin should be able to manage documents.
- File access must be authorization-protected.
- Sensitive/private files should not be exposed as unrestricted public URLs.

Storage architecture should be evaluated before implementation.

---

# 23. Admin Student Management Expansion

Admin should eventually be able to manage:

- Student profile
- Enrollment
- Batch
- Fees
- Payments
- Receipts
- Documents
- Password reset
- Student status

The Admin UI should keep these related features organized rather than creating an unnecessarily complicated interface.

A student detail page is already available:

`/admin/students/[id]`

This page can become the central student management area if appropriate.

---

# 24. Authorization Requirements

This is critical.

Admin authorization:

- Admin-only routes remain protected by the existing Admin authentication.

Student authorization:

- Student portal routes remain protected.
- Student can only access their own account.
- Student can only access batches/resources associated with their enrollment.
- Student can only access their own fees.
- Student can only access their own payments.
- Student can only access their own receipts.
- Student can only access their own documents.

Never rely only on frontend hiding.

Authorization must be enforced server-side in API routes and server-side data access.

---

# 25. Security Requirements

Never commit:

- `.env`
- `.env.local`
- API keys
- SMTP passwords
- Database passwords
- Auth secrets
- Production credentials
- Private certificates
- Other secrets

Current `.gitignore` must continue protecting environment files and generated folders.

Do not expose sensitive database information to client components.

Do not trust IDs supplied from the client without verifying ownership/authorization.

---

# 26. Important Existing Files

### Authentication

`src/lib/auth.ts`

`src/lib/student-auth.ts`

`src/middleware.ts`

### Database

`src/lib/db.ts`

`prisma/schema.prisma`

`prisma/seed.ts`

### Email

`src/lib/email.ts`

### Student Portal

`src/app/portal/`

`src/components/portal/PortalNavbar.tsx`

### Admin Portal

`src/app/admin/`

`src/components/admin/`

### APIs

`src/app/api/admin/`

`src/app/api/portal/`

### Shared UI

`src/components/ui/`

---

# 27. Existing Admin Portal Sections

The Admin sidebar currently contains a Learning Portal area with pages such as:

- Students
- Batches
- Enrollments

Existing routes include:

`/admin/students`

`/admin/students/new`

`/admin/students/[id]`

`/admin/batches`

`/admin/batches/[id]`

`/admin/enrollments`

Future fee/document management should integrate naturally into this existing structure.

---

# 28. Development Rules for Future Claude Sessions

Before implementing anything:

1. Inspect the existing repository.
2. Inspect `prisma/schema.prisma`.
3. Inspect existing student/auth/enrollment code.
4. Inspect existing Admin APIs.
5. Inspect existing Student Portal APIs.
6. Reuse existing components and patterns.
7. Avoid duplicate authentication/session systems.
8. Avoid destructive database changes.
9. Keep existing routes working.
10. Run lint/typecheck/build where appropriate.
11. Test affected flows before declaring completion.

Do not assume that a feature is missing simply because it is not visible in one file.

Search the repository first.

---

# 29. Current Next Development Task

The immediate next feature should be:

## Student Portal + Fees Management

The implementation should be planned and executed in small phases.

Recommended order:

### Phase A — Public Student Portal Entry

Add a visible Student Portal entry point to the public website.

Target:

`/portal/login`

### Phase B — Student Dashboard Enhancement

Show:

- Student
- Course
- Batch
- Enrollment
- Fee summary
- Learning resources

### Phase C — Fee Data Model

Review existing Prisma schema and implement the minimum required fee models.

Expected concepts:

- FeeRecord
- Payment
- Receipt

Do not blindly add duplicate fields/models if equivalent structures already exist.

### Phase D — Admin Fee Management

Admin should be able to:

- Set student fee
- Record payment
- Record installment
- See paid amount
- See pending amount
- Manage payment details

### Phase E — Student Fee View

Student should be able to see:

- Total fee
- Paid
- Pending
- Payment history
- Installments
- Due information

### Phase F — Receipt Generation

Generate/view/download receipts for payments.

### Phase G — Student Documents

Add authorized student document management.

### Phase H — Final Security + Testing

Test:

- Admin access
- Student access
- Wrong student IDs
- Unauthorized API access
- Fee calculations
- Receipt ownership
- Document ownership
- Login/logout
- Password change
- Existing enrollment flow
- Existing batch/resource flow
- Production build

---

# 30. Important Product Direction

GoFire Tech is a practical technology education startup.

The website should feel like a modern technology company/product, NOT like a traditional coaching institute.

Existing brand direction:

- Modern
- Professional
- Technology-focused
- Career-oriented
- Practical
- Clean
- Premium

Use the existing GoFire Tech branding and components.

Do not redesign the brand/logo unnecessarily.

---

# 31. Handoff Objective

The purpose of this document is to allow another Claude/AI development environment to continue development from the current repository without rebuilding the project from scratch.

The next developer should:

- Clone/use the GitHub repository.
- Read this `HANDOFF.md`.
- Inspect the current code.
- Confirm the current database schema.
- Run the project locally.
- Verify existing Admin Portal.
- Verify existing Student Portal.
- Then continue the Student Portal + Fees Management work.

The current project is considered a working baseline.

DO NOT RESET THE PROJECT.

DO NOT DELETE EXISTING FUNCTIONALITY.

DO NOT REBUILD THE WEBSITE FROM SCRATCH.

Continue incrementally from the existing implementation.

---

# 32. Handoff Status

Status: Working baseline pushed to GitHub.

Git branch:

`main`

Repository:

`https://github.com/Rajeevjangid/gofiretech-website.git`

Current working tree before creating this handoff file was clean and synchronized with `origin/main`.

This `HANDOFF.md` is documentation for future development and should be committed separately after review.
