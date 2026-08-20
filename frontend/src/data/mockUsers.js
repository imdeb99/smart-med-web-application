// Seed accounts for demo login. Each maps to an existing mock patient/doctor
// record (via refId) so signing in with these credentials shows the same
// data used throughout the rest of the demo (see utils/constants.js).
const mockUsers = [
  {
    id: "user-1",
    name: "Rafiul Islam",
    email: "patient@smartmed.com",
    password: "patient123",
    role: "patient",
    refId: "pat-1",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "user-2",
    name: "Dr. Ayesha Rahman",
    email: "doctor@smartmed.com",
    password: "doctor123",
    role: "doctor",
    refId: "doc-1",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "user-3",
    name: "Admin User",
    email: "admin@smartmed.com",
    password: "admin123",
    role: "admin",
    refId: null,
    avatar: "https://i.pravatar.cc/150?img=68",
  },
];

export default mockUsers;
