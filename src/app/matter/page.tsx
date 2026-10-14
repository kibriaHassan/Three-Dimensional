import { redirect } from "next/navigation";

export default function MatterPage() {
  redirect("/?board=paper-1&chapter=matter");
}
