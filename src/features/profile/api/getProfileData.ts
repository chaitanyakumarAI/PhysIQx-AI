import type { ProfileData } from "../types";
import { mockProfileData } from "../mocks/profileData";

/**
 * Profile's data service seam — same pattern as the other features'
 * getXData() functions.
 */
export async function getProfileData(): Promise<ProfileData> {
  return mockProfileData;
}
