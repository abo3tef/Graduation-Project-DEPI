import { connection } from "next/server";
import type { DoctorDashboardData } from "@/types/dashboard";
import { createDoctorDashboardMock } from "./mock";


export async function getDoctorDashboard(): Promise<DoctorDashboardData> {
 
  await connection();

  return createDoctorDashboardMock(new Date());
}