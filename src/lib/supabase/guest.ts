import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function ensureGuestSession() {
  const supabase = getSupabaseBrowserClient();
  const { data: current, error: currentError } = await supabase.auth.getUser();

  if (!currentError && current.user) {
    return current.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(
      error?.message.includes("Anonymous sign-ins are disabled")
        ? "ระบบผู้เล่นชั่วคราวยังไม่เปิดใช้งานใน Supabase"
        : "เริ่มเซสชันผู้เล่นไม่สำเร็จ กรุณาลองอีกครั้ง",
    );
  }

  return data.user;
}
