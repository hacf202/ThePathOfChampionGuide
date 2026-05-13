import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://aiyzcaghoplswdfvhiim.supabase.co";
// Dùng service_role_key để backend có quyền quản trị (tạo user bỏ qua email confirm nếu cần, lấy danh sách user, v.v.)
// Nếu chưa có trong .env, sẽ dùng tạm khóa anon (publishable)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_TCX2RTY5R1ET2fOQvLG79Q_fKROSXmK";

export const supabase = createClient(supabaseUrl, supabaseKey);
