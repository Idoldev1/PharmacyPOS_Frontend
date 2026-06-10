import { PageTemplate } from "../PageTemplate";

export default function InsurancePage() {
  return (
    <PageTemplate
      title="Insurance"
      description="Handle claims, policy verification, and payer remittances."
      cards={[
        { label: "Claims Submitted", value: "52" },
        { label: "Approved", value: "44" },
        { label: "Pending", value: "8" },
      ]}
    />
  );
}
