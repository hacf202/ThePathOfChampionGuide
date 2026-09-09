export const generateSlug = (text) => {
    if (!text) return "";
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .toLowerCase()
        .replace(/['"’]/g, '')           // Xóa dấu nháy (vd: Kai'Sa -> kaisa)
        .replace(/[^a-z0-9]+/g, '-')     // Thay ký tự đặc biệt bằng gạch ngang
        .replace(/^-+|-+$/g, '');        // Xóa gạch ngang ở đầu và cuối
};
