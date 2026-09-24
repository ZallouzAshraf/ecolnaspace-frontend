import { createLegalRoute } from "@/components/marketing/legal-route";

const route = createLegalRoute("cookies");

export const generateMetadata = route.generateMetadata;
export default route.Page;
