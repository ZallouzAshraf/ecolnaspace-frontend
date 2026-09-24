import { createLegalRoute } from "@/components/marketing/legal-route";

const route = createLegalRoute("terms");

export const generateMetadata = route.generateMetadata;
export default route.Page;
