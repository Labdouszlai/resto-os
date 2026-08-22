import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

const GET = handler.GET;
const POST = handler.POST;

export { GET, POST };
