import client from "./client";

async function apiRequest<T = any>(path: string, options: any = {}): Promise<T> {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : undefined;

  const res = await client.request({
    url: path,
    method,
    data: body,
  });

  return res.data?.data ?? res.data;
}

export type HomeClassItem = {
  id: string;
  name: string;
  startTime: string;
};

export type HomeNotice = {
  id: string;
  title: string;
  content: string;
};

export type MemberProgress = {
  currentStep: number;
  totalSteps: number;
  lastLessonNote?: string;
};

export type TuitionInfo = {
  dueDate: string;
  daysLeft: number;
  status: string;
};

export type MemberHomeData = {
  academyName: string;
  memberName: string;
  todayClasses: HomeClassItem[];
  recentNotice: HomeNotice | null;
  progress: MemberProgress | null;
  tuition: TuitionInfo | null;
};

export type AttendanceItem = {
  id: string;
  status: string;
  checkedAt: string;
  sessionTitle?: string;
  sessionDate?: string;
};

export type AttendanceSummary = {
  presentCount: number;
  lateCount: number;
  absentCount: number;
};

export type InquiryRoomSummary = {
  id: string;
  title: string;
  status: string;
  lastMessageAt?: string;
};

export type InquiryMessage = {
  id: string;
  message: string;
  senderType: string;
  createdAt: string;
};

export async function getMemberHome(): Promise<MemberHomeData> {
  return apiRequest<MemberHomeData>('/api/me/home');
}

export async function getMyAttendances(): Promise<AttendanceItem[]> {
  return apiRequest<AttendanceItem[]>('/api/me/attendances');
}

export async function getMyAttendanceSummary(): Promise<AttendanceSummary> {
  return apiRequest<AttendanceSummary>('/api/me/attendance-summary');
}

export async function getInquiryRooms(): Promise<InquiryRoomSummary[]> {
  return apiRequest<InquiryRoomSummary[]>('/api/inquiries');
}

export async function createInquiry(payload: {
  inquiryType: string;
  title: string;
  message: string;
}) {
  return apiRequest('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getInquiryMessages(roomId: string): Promise<InquiryMessage[]> {
  return apiRequest<InquiryMessage[]>(`/api/inquiries/${roomId}/messages`);
}

export async function createInquiryMessage(roomId: string, message: string) {
  return apiRequest(`/api/inquiries/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function markInquiryAsRead(roomId: string) {
  return apiRequest(`/api/inquiries/${roomId}/read`, {
    method: 'POST',
  });
}

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const res = await client.patch("/api/member/me/password", payload);
  return res.data;
}

export async function changeMyPhone(phone: string) {
  const res = await client.patch("/api/member/me/phone", { phone });
  return res.data;
}

export async function verifyMyPassword(password: string) {
  const res = await client.post("/api/member/me/verify-password", {
    password,
  });

  return res.data;
}

export async function getMyProfile() {
  const res = await client.get("/api/member/me/profile");
  return res.data;
}

export async function updateMyProfileAvatar(profileAvatar: string) {
  const res = await client.patch("/api/member/me/profile-avatar", {
    profileAvatar,
  });

  return res.data;
}