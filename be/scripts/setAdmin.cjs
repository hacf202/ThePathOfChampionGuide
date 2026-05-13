const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load biến môi trường từ .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Lỗi: Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env");
  process.exit(1);
}

// Khởi tạo Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setAdminRole(email) {
  try {
    console.log(`Đang tìm user với email: ${email}...`);
    
    // Tìm user bằng email qua Admin API
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ Không tìm thấy user nào có email ${email}`);
      return;
    }
    
    console.log(`Đã tìm thấy user (ID: ${user.id}). Đang cấp quyền...`);
    
    // Lấy app_metadata hiện tại
    const currentAppMetadata = user.app_metadata || {};
    
    // Thêm hoặc cập nhật mảng groups
    const newAppMetadata = {
      ...currentAppMetadata,
      groups: ['admin'] // Set quyền admin
    };
    
    // Cập nhật lại user, chỉ Admin API mới được phép sửa app_metadata
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { app_metadata: newAppMetadata }
    );
    
    if (updateError) {
      throw updateError;
    }
    
    console.log("✅ Cấp quyền admin thành công!");
    console.log("Dữ liệu mới:", data.user.app_metadata);
    console.log("\nLƯU Ý: User cần đăng xuất và đăng nhập lại để nhận quyền (cập nhật JWT token).");
    
  } catch (error) {
    console.error("❌ Đã xảy ra lỗi:", error.message);
  }
}

// Lấy email từ tham số dòng lệnh
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log("Hướng dẫn sử dụng:");
  console.log("node setAdmin.cjs <email_cua_user>");
} else {
  setAdminRole(targetEmail);
}
