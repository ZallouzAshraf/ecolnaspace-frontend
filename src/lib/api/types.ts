export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  requestId?: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly error: string;
  readonly requestId?: string;
  readonly messages: string[];

  constructor(body: ApiErrorBody) {
    const messages = Array.isArray(body.message)
      ? body.message
      : [body.message];
    super(messages.join(", "));
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.error = body.error;
    this.requestId = body.requestId;
    this.messages = messages;
  }
}

export type AuthUserSummary = {
  id: string;
  email: string;
  organizationId: string | null;
  campusId: string | null;
  membershipId: string | null;
  isSuperAdmin: boolean;
  permissions: string[];
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUserSummary;
};

export type RegisterResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

export type RefreshResponse = {
  accessToken: string;
};

export type MeMembership = {
  id: string;
  organizationId: string;
  role: string;
  campusId: string | null;
  status: string;
  permissions: string[];
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
  };
  campus: { id: string; name: string; code: string | null } | null;
};

export type MeResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emailVerifiedAt: string | null;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  memberships: MeMembership[];
};

export type OrganizationMe = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  timezone: string;
  locale: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginatedMeta;
};

export type Campus = {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampusInput = {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive?: boolean;
};

export type Teacher = {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  employeeCode: string | null;
  bio: string | null;
  campusIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTeacherInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeCode?: string;
  bio?: string;
  campusIds?: string[];
};

export type UpdateTeacherInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeCode?: string;
  bio?: string;
  campusIds?: string[];
};

export type ListTeachersParams = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export const STUDENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "GRADUATED",
  "WITHDRAWN",
  "ARCHIVED",
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export type Student = {
  id: string;
  organizationId: string;
  campusId: string | null;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string;
  gender: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  photoConsent: boolean;
  status: StudentStatus;
  externalRef: string | null;
  createdAt: string;
  updatedAt: string;
  medicalFlags?: Record<string, unknown>;
  allergiesNote?: string | null;
};

export type StudentInput = {
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender?: string;
  email?: string;
  phone?: string;
  campusId?: string | null;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  medicalFlags?: Record<string, unknown>;
  allergiesNote?: string;
  photoConsent?: boolean;
  status?: StudentStatus;
  externalRef?: string;
};

export type ListStudentsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  campusId?: string;
  status?: StudentStatus;
};

export type PickupPerson = {
  id: string;
  studentId: string;
  fullName: string;
  relationship: string | null;
  phone: string | null;
  idDocument: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePickupPersonInput = {
  fullName: string;
  relationship?: string;
  phone?: string;
  idDocument?: string;
  isActive?: boolean;
};

export type EnrollmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "WITHDRAWN"
  | "TRANSFERRED";

export type Enrollment = {
  id: string;
  organizationId: string;
  studentId: string;
  classId: string;
  academicYearId: string;
  status: EnrollmentStatus;
  enrolledOn: string;
  leftOn: string | null;
  createdAt: string;
  updatedAt: string;
  student: { id: string; firstName: string; lastName: string };
  class: { id: string; name: string };
  academicYear: { id: string; name: string };
};

export type Parent = {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateParentInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type ListParentsParams = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export type GuardianLink = {
  id: string;
  studentId: string;
  parentProfileId: string;
  relationship: string;
  isPrimary: boolean;
  isEmergency: boolean;
  canPickup: boolean;
  createdAt: string;
};

export type LinkGuardianInput = {
  parentProfileId: string;
  relationship: string;
  isPrimary?: boolean;
  isEmergency?: boolean;
  canPickup?: boolean;
};

export type AcademicYear = {
  id: string;
  organizationId: string;
  name: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClassRecord = {
  id: string;
  organizationId: string;
  campusId: string;
  academicYearId: string;
  name: string;
  gradeLevel: string | null;
  capacity: number | null;
  createdAt: string;
  updatedAt: string;
  campus: { id: string; name: string };
  academicYear: { id: string; name: string };
};

export type CreateClassInput = {
  campusId: string;
  academicYearId: string;
  name: string;
  gradeLevel?: string;
  capacity?: number;
};

export type UpdateClassInput = {
  name?: string;
  gradeLevel?: string;
  capacity?: number;
};

export type AcademicYearInput = {
  name: string;
  startsOn: string;
  endsOn: string;
  isCurrent?: boolean;
};

export type Subject = {
  id: string;
  organizationId: string;
  name: string;
  code: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubjectInput = {
  name: string;
  code?: string;
};

export type ScheduleSlot = {
  id: string;
  organizationId: string;
  classId: string;
  subjectId: string | null;
  teacherProfileId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string } | null;
  teacher?: { id: string; firstName: string; lastName: string } | null;
};

export type CreateScheduleInput = {
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId?: string;
  teacherProfileId?: string;
};

export type Homework = {
  id: string;
  organizationId: string;
  classId: string;
  subjectId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  class?: { id: string; name: string };
  subject?: { id: string; name: string } | null;
};

export type HomeworkInput = {
  classId: string;
  subjectId?: string;
  title: string;
  description?: string;
  dueDate?: string;
};

export type Exam = {
  id: string;
  organizationId: string;
  classId: string;
  subjectId: string;
  title: string;
  examDate: string;
  durationMin: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  class?: { id: string; name: string };
  subject?: { id: string; name: string };
};

export type ExamInput = {
  classId: string;
  subjectId: string;
  title: string;
  examDate: string;
  durationMin?: number;
  status?: string;
};

export type Grade = {
  id: string;
  organizationId: string;
  studentId: string;
  subjectId: string;
  examId: string | null;
  assessment: string;
  score: string;
  maxScore: string;
  gradedOn: string;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string };
  subject?: { id: string; name: string };
};

export type GradeInput = {
  studentId: string;
  subjectId: string;
  examId?: string;
  assessment: string;
  score: string;
  maxScore: string;
  gradedOn: string;
};

export type ReportCard = {
  student: { id: string; firstName: string; lastName: string };
  academicYear: { id: string; name: string };
  enrollments: Array<{ id: string; class: { id: string; name: string } }>;
  subjects: Array<{
    subject: { id: string; name: string };
    grades: Grade[];
  }>;
  generatedAt: string;
};

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export type AttendanceRecord = {
  id: string;
  organizationId: string;
  studentId: string;
  classId: string | null;
  date: string;
  session: string;
  status: AttendanceStatus;
  checkInAt: string | null;
  checkOutAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string };
  class?: { id: string; name: string } | null;
};

export type AttendanceInput = {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  classId?: string;
  session?: string;
  checkInAt?: string;
  checkOutAt?: string;
  notes?: string;
};

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: string | number;
  unitPrice: string | number;
  taxRate?: string | number | null;
  lineTotal?: string | number;
};

export type InvoicePayment = {
  id: string;
  amount: string | number;
  method: string;
  reference: string | null;
  currency: string;
  status: string;
  paidAt: string;
};

export type Invoice = {
  id: string;
  organizationId: string;
  studentId: string | null;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  currency: string;
  subtotal: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  /** Server-computed remaining balance. Do not recompute from line items. */
  balanceDue: string | number;
  amountPaid: string | number;
  dueDate: string | null;
  issuedAt?: string | null;
  notes: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string } | null;
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
};

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
};

export type CreateInvoiceInput = {
  studentId?: string;
  currency?: string;
  dueDate?: string;
  notes?: string;
  items: InvoiceItemInput[];
};

export type CreatePaymentInput = {
  amount: number;
  method: string;
  reference?: string;
  currency?: string;
};

export type Announcement = {
  id: string;
  organizationId: string;
  title: string;
  body: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementInput = {
  title: string;
  body: string;
  publishedAt?: string | null;
};

export type Message = {
  id: string;
  organizationId: string;
  senderId: string;
  recipientId: string;
  subject: string | null;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender?: { id: string; firstName: string; lastName: string; email: string };
  recipient?: { id: string; firstName: string; lastName: string; email: string };
};

export type CreateMessageInput = {
  recipientId: string;
  subject?: string;
  body: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  channel: string;
  status: string;
  title: string;
  body: string;
  payload: unknown;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export type DaycareMeal = {
  id: string;
  organizationId: string;
  studentId: string;
  date: string;
  mealType: string;
  consumed: boolean;
  notes: string | null;
  createdAt: string;
  student?: { id: string; firstName: string; lastName: string };
};

export type DaycareNap = {
  id: string;
  organizationId: string;
  studentId: string;
  date: string;
  startedAt: string;
  endedAt: string | null;
  notes: string | null;
  createdAt: string;
  student?: { id: string; firstName: string; lastName: string };
};

export type DaycareActivity = {
  id: string;
  organizationId: string;
  title: string;
  date: string;
  notes: string | null;
  createdAt: string;
  students?: Array<{ id: string; firstName: string; lastName: string }>;
};

export type DaycarePickup = {
  id: string;
  organizationId: string;
  studentId: string;
  pickupPersonName: string;
  authorizedPickupId: string | null;
  arrivedAt: string | null;
  departedAt: string | null;
  verified: boolean;
  notes: string | null;
  createdAt: string;
  student?: { id: string; firstName: string; lastName: string };
};

export type StaffMember = {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateStaffInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
};

export type UpdateStaffInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
};

export type OrgFeature = {
  featureCode: string;
  enabled: boolean;
};

export type UpdateOrganizationInput = {
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  locale?: string;
};

export const MEMBERSHIP_STATUSES = [
  "ACTIVE",
  "INVITED",
  "SUSPENDED",
  "REMOVED",
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const MEMBERSHIP_ROLES = [
  "ORGANIZATION_ADMIN",
  "CAMPUS_ADMIN",
  "TEACHER",
  "STAFF",
  "PARENT",
  "ACCOUNTANT",
] as const;

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export type MembershipUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type Membership = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: MembershipStatus | string;
  campusId: string | null;
  createdAt: string;
  updatedAt: string;
  user: MembershipUser;
  campus: { id: string; name: string } | null;
};

export type UpdateMembershipInput = {
  role?: MembershipRole | string;
  status?: MembershipStatus | string;
  campusId?: string | null;
};

export type ListMembershipsParams = {
  page?: number;
  pageSize?: number;
  status?: string;
  role?: string;
  campusId?: string;
  q?: string;
};

export type DocumentRecord = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  studentId: string | null;
  uploadedById: string;
  createdAt: string;
};

export type ListDocumentsParams = {
  page?: number;
  pageSize?: number;
  studentId?: string;
};
