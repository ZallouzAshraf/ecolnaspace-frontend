import { apiClient, downloadAuthenticatedBlob, resolveApiUrl } from "./client";
import type {
  AcademicYear,
  AcademicYearInput,
  Announcement,
  AnnouncementInput,
  AppNotification,
  AttendanceInput,
  AttendanceRecord,
  Campus,
  CampusInput,
  ClassRecord,
  CreateClassInput,
  CreateInvoiceInput,
  CreateMessageInput,
  CreateParentInput,
  CreatePaymentInput,
  CreatePickupPersonInput,
  CreateScheduleInput,
  CreateStaffInput,
  CreateTeacherInput,
  DaycareActivity,
  DaycareMeal,
  DaycareNap,
  DaycarePickup,
  DocumentRecord,
  Enrollment,
  EnrollmentStatus,
  Exam,
  ExamInput,
  Grade,
  GradeInput,
  GuardianLink,
  Homework,
  HomeworkInput,
  Invoice,
  InvoicePayment,
  LinkGuardianInput,
  ListDocumentsParams,
  ListMembershipsParams,
  ListParentsParams,
  ListStudentsParams,
  ListTeachersParams,
  Membership,
  Message,
  OrgFeature,
  OrganizationMe,
  PaginatedResult,
  Parent,
  PickupPerson,
  ReportCard,
  ScheduleSlot,
  StaffMember,
  Student,
  StudentInput,
  Subject,
  SubjectInput,
  Teacher,
  UpdateClassInput,
  UpdateMembershipInput,
  UpdateOrganizationInput,
  UpdateStaffInput,
  UpdateTeacherInput,
} from "./types";

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const organizationsApi = {
  me() {
    return apiClient<OrganizationMe>("/organizations/me");
  },

  updateMe(input: UpdateOrganizationInput) {
    return apiClient<OrganizationMe>("/organizations/me", {
      method: "PATCH",
      body: input,
    });
  },

  listFeatures() {
    return apiClient<OrgFeature[]>("/organizations/me/features");
  },

  updateFeature(featureCode: string, enabled: boolean) {
    return apiClient<OrgFeature>(`/organizations/me/features/${featureCode}`, {
      method: "PATCH",
      body: { enabled },
    });
  },
};

export const campusesApi = {
  list() {
    return apiClient<Campus[]>("/campuses");
  },

  get(id: string) {
    return apiClient<Campus>(`/campuses/${id}`);
  },

  create(input: CampusInput) {
    return apiClient<Campus>("/campuses", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<CampusInput>) {
    return apiClient<Campus>(`/campuses/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/campuses/${id}`, {
      method: "DELETE",
    });
  },
};

export const studentsApi = {
  list(params: ListStudentsParams = {}) {
    return apiClient<PaginatedResult<Student>>(
      `/students${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        q: params.q,
        campusId: params.campusId,
        status: params.status,
      })}`,
    );
  },

  get(id: string) {
    return apiClient<Student>(`/students/${id}`);
  },

  create(input: StudentInput) {
    return apiClient<Student>("/students", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<StudentInput>) {
    return apiClient<Student>(`/students/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/students/${id}`, {
      method: "DELETE",
    });
  },

  listPickupPersons(studentId: string) {
    return apiClient<PickupPerson[]>(`/students/${studentId}/pickup-persons`);
  },

  addPickupPerson(studentId: string, input: CreatePickupPersonInput) {
    return apiClient<PickupPerson>(`/students/${studentId}/pickup-persons`, {
      method: "POST",
      body: input,
    });
  },

  linkGuardian(studentId: string, input: LinkGuardianInput) {
    return apiClient<GuardianLink>(`/students/${studentId}/guardians`, {
      method: "POST",
      body: input,
    });
  },

  unlinkGuardian(studentId: string, guardianLinkId: string) {
    return apiClient<{ message: string }>(
      `/students/${studentId}/guardians/${guardianLinkId}`,
      { method: "DELETE" },
    );
  },
};

export const parentsApi = {
  list(params: ListParentsParams = {}) {
    return apiClient<PaginatedResult<Parent>>(
      `/parents${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        q: params.q,
      })}`,
    );
  },

  get(id: string) {
    return apiClient<Parent>(`/parents/${id}`);
  },

  create(input: CreateParentInput) {
    return apiClient<Parent>("/parents", {
      method: "POST",
      body: input,
    });
  },
};

export const enrollmentsApi = {
  list(
    params: {
      studentId?: string;
      classId?: string;
      status?: EnrollmentStatus;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    return apiClient<PaginatedResult<Enrollment>>(
      `/enrollments${toQuery({
        studentId: params.studentId,
        classId: params.classId,
        status: params.status,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
      })}`,
    );
  },

  listByStudent(studentId: string, page = 1, pageSize = 50) {
    return this.list({ studentId, page, pageSize });
  },

  listByClass(classId: string, page = 1, pageSize = 50) {
    return this.list({ classId, page, pageSize });
  },

  create(input: { studentId: string; classId: string }) {
    return apiClient<Enrollment>("/enrollments", {
      method: "POST",
      body: input,
    });
  },

  updateStatus(id: string, status: EnrollmentStatus) {
    return apiClient<Enrollment>(`/enrollments/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },
};

export const academicYearsApi = {
  list() {
    return apiClient<AcademicYear[]>("/academic-years");
  },

  get(id: string) {
    return apiClient<AcademicYear>(`/academic-years/${id}`);
  },

  create(input: AcademicYearInput) {
    return apiClient<AcademicYear>("/academic-years", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<AcademicYearInput>) {
    return apiClient<AcademicYear>(`/academic-years/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/academic-years/${id}`, {
      method: "DELETE",
    });
  },
};

export const subjectsApi = {
  list() {
    return apiClient<Subject[]>("/subjects");
  },

  create(input: SubjectInput) {
    return apiClient<Subject>("/subjects", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<SubjectInput>) {
    return apiClient<Subject>(`/subjects/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/subjects/${id}`, {
      method: "DELETE",
    });
  },
};

export const classesApi = {
  list() {
    return apiClient<ClassRecord[]>("/classes");
  },

  get(id: string) {
    return apiClient<ClassRecord>(`/classes/${id}`);
  },

  create(input: CreateClassInput) {
    return apiClient<ClassRecord>("/classes", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: UpdateClassInput) {
    return apiClient<ClassRecord>(`/classes/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/classes/${id}`, {
      method: "DELETE",
    });
  },
};

export const schedulesApi = {
  listByClass(classId: string) {
    return apiClient<ScheduleSlot[]>(`/schedules${toQuery({ classId })}`);
  },

  create(input: CreateScheduleInput) {
    return apiClient<ScheduleSlot>("/schedules", {
      method: "POST",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/schedules/${id}`, {
      method: "DELETE",
    });
  },
};

export const homeworkApi = {
  list(params: { classId?: string; page?: number; pageSize?: number } = {}) {
    return apiClient<PaginatedResult<Homework>>(
      `/homework${toQuery({
        classId: params.classId,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },

  get(id: string) {
    return apiClient<Homework>(`/homework/${id}`);
  },

  create(input: HomeworkInput) {
    return apiClient<Homework>("/homework", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<HomeworkInput>) {
    return apiClient<Homework>(`/homework/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/homework/${id}`, {
      method: "DELETE",
    });
  },
};

export const examsApi = {
  list(params: { classId?: string; page?: number; pageSize?: number } = {}) {
    return apiClient<PaginatedResult<Exam>>(
      `/exams${toQuery({
        classId: params.classId,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },

  create(input: ExamInput) {
    return apiClient<Exam>("/exams", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<ExamInput>) {
    return apiClient<Exam>(`/exams/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/exams/${id}`, {
      method: "DELETE",
    });
  },
};

export const gradesApi = {
  list(
    params: {
      studentId?: string;
      subjectId?: string;
      examId?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    return apiClient<PaginatedResult<Grade>>(
      `/grades${toQuery({
        studentId: params.studentId,
        subjectId: params.subjectId,
        examId: params.examId,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },

  create(input: GradeInput) {
    return apiClient<Grade>("/grades", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<GradeInput>) {
    return apiClient<Grade>(`/grades/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/grades/${id}`, {
      method: "DELETE",
    });
  },
};

export const reportCardsApi = {
  get(studentId: string, academicYearId?: string) {
    return apiClient<ReportCard>(
      `/report-cards/students/${studentId}${toQuery({ academicYearId })}`,
    );
  },
};

export const membershipsApi = {
  list(params: ListMembershipsParams = {}) {
    return apiClient<PaginatedResult<Membership>>(
      `/memberships${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        status: params.status,
        role: params.role,
        campusId: params.campusId,
        q: params.q,
      })}`,
    );
  },

  update(id: string, input: UpdateMembershipInput) {
    return apiClient<Membership>(`/memberships/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
};

export const documentsApi = {
  list(params: ListDocumentsParams = {}) {
    return apiClient<PaginatedResult<DocumentRecord>>(
      `/documents${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        studentId: params.studentId,
      })}`,
    );
  },

  upload(file: File, studentId?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (studentId) {
      formData.append("studentId", studentId);
    }
    return apiClient<DocumentRecord>("/documents", {
      method: "POST",
      body: formData,
    });
  },

  remove(id: string) {
    return apiClient<{ message: string }>(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  downloadUrl(id: string) {
    return resolveApiUrl(`/documents/${id}/download`);
  },

  async download(id: string, filename?: string) {
    await downloadAuthenticatedBlob(`/documents/${id}/download`, {
      filename,
    });
  },
};

export const attendanceApi = {
  list(params: { date?: string; classId?: string; studentId?: string } = {}) {
    return apiClient<AttendanceRecord[]>(
      `/attendance${toQuery({
        date: params.date,
        classId: params.classId,
        studentId: params.studentId,
      })}`,
    );
  },

  upsert(input: AttendanceInput) {
    return apiClient<AttendanceRecord>("/attendance", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<AttendanceInput>) {
    return apiClient<AttendanceRecord>(`/attendance/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
};

export const invoicesApi = {
  list(
    params: {
      status?: string;
      studentId?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    return apiClient<PaginatedResult<Invoice>>(
      `/invoices${toQuery({
        status: params.status,
        studentId: params.studentId,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      })}`,
    );
  },

  get(id: string) {
    return apiClient<Invoice>(`/invoices/${id}`);
  },

  create(input: CreateInvoiceInput) {
    return apiClient<Invoice>("/invoices", {
      method: "POST",
      body: toInvoiceWriteBody(input),
    });
  },

  update(id: string, input: Partial<CreateInvoiceInput>) {
    return apiClient<Invoice>(`/invoices/${id}`, {
      method: "PATCH",
      body: toInvoiceWriteBody(input),
    });
  },

  issue(id: string) {
    return apiClient<Invoice>(`/invoices/${id}/issue`, { method: "POST" });
  },

  addPayment(id: string, input: CreatePaymentInput, idempotencyKey: string) {
    return apiClient<{ payment: InvoicePayment; invoice: Invoice }>(
      `/invoices/${id}/payments`,
      {
        method: "POST",
        body: {
          ...input,
          amount: decimalString(input.amount),
        },
        headers: { "Idempotency-Key": idempotencyKey },
      },
    );
  },
};

function decimalString(value: string | number): string {
  return typeof value === "number" ? value.toFixed(2) : value;
}

function toInvoiceWriteBody(input: Partial<CreateInvoiceInput>) {
  if (!input.items) return input;
  return {
    ...input,
    items: input.items.map((item) => ({
      description: item.description,
      quantity: decimalString(item.quantity),
      unitPrice: decimalString(item.unitPrice),
      ...(item.taxRate === undefined
        ? {}
        : { taxRate: decimalString(item.taxRate) }),
    })),
  };
}

export const announcementsApi = {
  list() {
    return apiClient<Announcement[]>("/announcements");
  },

  create(input: AnnouncementInput) {
    return apiClient<Announcement>("/announcements", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: Partial<AnnouncementInput>) {
    return apiClient<Announcement>(`/announcements/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
};

export const messagesApi = {
  inbox() {
    return apiClient<Message[]>("/messages/inbox");
  },

  sent() {
    return apiClient<Message[]>("/messages/sent");
  },

  send(input: CreateMessageInput) {
    return apiClient<Message>("/messages", {
      method: "POST",
      body: input,
    });
  },

  markRead(id: string) {
    return apiClient<Message>(`/messages/${id}/read`, { method: "PATCH" });
  },
};

export const notificationsApi = {
  me() {
    return apiClient<AppNotification[]>("/notifications/me");
  },

  markRead(id: string) {
    return apiClient<AppNotification>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },
};

export const daycareApi = {
  listMeals(params: { studentId?: string; date?: string; page?: number } = {}) {
    return apiClient<PaginatedResult<DaycareMeal>>(
      `/daycare/meals${toQuery({
        studentId: params.studentId,
        date: params.date,
        page: params.page ?? 1,
        pageSize: 50,
      })}`,
    );
  },

  createMeal(input: {
    studentId: string;
    date: string;
    mealType: string;
    consumed?: boolean;
    notes?: string;
  }) {
    return apiClient<DaycareMeal>("/daycare/meals", {
      method: "POST",
      body: input,
    });
  },

  listNaps(params: { studentId?: string; date?: string; page?: number } = {}) {
    return apiClient<PaginatedResult<DaycareNap>>(
      `/daycare/naps${toQuery({
        studentId: params.studentId,
        date: params.date,
        page: params.page ?? 1,
        pageSize: 50,
      })}`,
    );
  },

  createNap(input: {
    studentId: string;
    date: string;
    startedAt: string;
    endedAt?: string;
    notes?: string;
  }) {
    return apiClient<DaycareNap>("/daycare/naps", {
      method: "POST",
      body: input,
    });
  },

  listActivities(
    params: { studentId?: string; date?: string; page?: number } = {},
  ) {
    return apiClient<PaginatedResult<DaycareActivity>>(
      `/daycare/activities${toQuery({
        studentId: params.studentId,
        date: params.date,
        page: params.page ?? 1,
        pageSize: 50,
      })}`,
    );
  },

  createActivity(input: {
    title: string;
    date: string;
    notes?: string;
    studentIds: string[];
  }) {
    return apiClient<DaycareActivity>("/daycare/activities", {
      method: "POST",
      body: input,
    });
  },

  listPickups(
    params: {
      studentId?: string;
      from?: string;
      to?: string;
      page?: number;
    } = {},
  ) {
    return apiClient<PaginatedResult<DaycarePickup>>(
      `/daycare/pickups${toQuery({
        studentId: params.studentId,
        from: params.from,
        to: params.to,
        page: params.page ?? 1,
        pageSize: 50,
      })}`,
    );
  },

  createPickup(input: {
    studentId: string;
    pickupPersonName: string;
    authorizedPickupId?: string;
    arrivedAt?: string;
    departedAt?: string;
    verified?: boolean;
    notes?: string;
  }) {
    return apiClient<DaycarePickup>("/daycare/pickups", {
      method: "POST",
      body: input,
    });
  },
};

export const staffApi = {
  list(params: { page?: number; pageSize?: number; q?: string } = {}) {
    return apiClient<PaginatedResult<StaffMember>>(
      `/staff${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        q: params.q,
      })}`,
    );
  },

  get(id: string) {
    return apiClient<StaffMember>(`/staff/${id}`);
  },

  create(input: CreateStaffInput) {
    return apiClient<StaffMember>("/staff", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: UpdateStaffInput) {
    return apiClient<StaffMember>(`/staff/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
};

export const teachersApi = {
  list(params: ListTeachersParams = {}) {
    return apiClient<PaginatedResult<Teacher>>(
      `/teachers${toQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        q: params.q,
      })}`,
    );
  },

  get(id: string) {
    return apiClient<Teacher>(`/teachers/${id}`);
  },

  create(input: CreateTeacherInput) {
    return apiClient<Teacher>("/teachers", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, input: UpdateTeacherInput) {
    return apiClient<Teacher>(`/teachers/${id}`, {
      method: "PATCH",
      body: input,
    });
  },
};
