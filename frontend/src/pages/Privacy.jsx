import LegalPage from "../components/shared/LegalPage";

const sections = [
  {
    heading: "Data We Collect",
    body: [
      "[Placeholder — describe the personal information collected: name, email, phone, date of birth, health records, and payment details.]",
      "[Placeholder — note that the current demo build stores data locally in your browser and is not transmitted to any server.]",
    ],
  },
  {
    heading: "How We Use It",
    body: "[Placeholder — explain how data is used: to provide and personalize services, book appointments, process payments, and improve the platform.]",
  },
  {
    heading: "Third-Party Sharing",
    body: "[Placeholder — describe circumstances where data may be shared, such as with doctors for consultations, payment processors, or when required by law.]",
  },
  {
    heading: "Data Security & Retention",
    body: "[Placeholder — outline security measures in place and how long data is retained before deletion or anonymization.]",
  },
  {
    heading: "Your Rights",
    body: "[Placeholder — list user rights: access, correction, deletion, and the right to withdraw consent where applicable.]",
  },
  {
    heading: "Contact for Privacy Concerns",
    body: "[Placeholder — direct users to the contact channel (email or phone) for privacy-related questions or complaints.]",
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedOn="August 2026"
      sections={sections}
    />
  );
}
