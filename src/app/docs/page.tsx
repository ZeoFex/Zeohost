import { redirect } from "next/navigation";

/** SMS docs require a customer account — send everyone to the signed-in guide. */
export default function PublicDocsPage() {
  redirect("/sms/docs");
}
