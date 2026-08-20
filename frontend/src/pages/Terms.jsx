import LegalPage from "../components/shared/LegalPage";

const sections = [
  {
    heading: "Use of Service",
    body: [
      "[Placeholder — describe the terms under which users may access and use SMART-MED's services, including eligibility requirements and permitted uses.]",
      "[Placeholder — note that the service is provided for lawful, personal, non-commercial use and that accounts must not be shared or misused.]",
    ],
  },
  {
    heading: "User Responsibilities",
    body: [
      "[Placeholder — list what users are responsible for: accurate registration information, maintaining confidentiality of credentials, and providing truthful health information.]",
      "[Placeholder — explain prohibited conduct such as misuse of the platform, harassment of doctors, or fraudulent bookings.]",
    ],
  },
  {
    heading: "Medical Disclaimer",
    body: "[Placeholder — clarify that SMART-MED facilitates consultations and does not itself provide medical advice, and that emergencies should be handled through emergency services.]",
  },
  {
    heading: "Appointments, Payments and Cancellations",
    body: "[Placeholder — describe booking and cancellation rules, refund policies for consultations, and the handling of payments made through the platform.]",
  },
  {
    heading: "Limitation of Liability",
    body: [
      "[Placeholder — define the limits of SMART-MED's liability for service interruptions, misdiagnosis, or any loss arising from use of the platform.]",
      "[Placeholder — state that the service is provided on an 'as is' and 'as available' basis.]",
    ],
  },
  {
    heading: "Changes to These Terms",
    body: "[Placeholder — explain that these terms may be updated from time to time and that continued use of the service constitutes acceptance of the revised terms.]",
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms and Conditions"
      updatedOn="August 2026"
      sections={sections}
    />
  );
}
