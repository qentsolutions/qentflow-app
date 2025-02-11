import { checkDueDates } from "@/app/lib/check-due-dates";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await checkDueDates();
    
    if (result.error) {
      return new NextResponse(result.error, { status: 500 });
    }
    
    return new NextResponse("Due dates checked successfully", { status: 200 });
  } catch (error) {
    console.error("[CHECK_DUE_DATES_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}