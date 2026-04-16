/**
 * markupUtils - Bộ công cụ tiện ích xử lý định dạng markup của Wiki PoC
 */

// --- LOGIC AUTO LINK RESOURCES ---
// Chuyển thành biến let để có thể cập nhật động từ entityLookup
let resourceKeywords = [];

/**
 * Hàm khởi tạo danh sách từ khóa tài nguyên (được gọi từ entityLookup sau khi fetch API)
 */
export const initMarkupResources = (resourcesData) => {
    if (!resourcesData || !Array.isArray(resourcesData)) return;

    resourceKeywords = resourcesData.reduce((acc, res) => {
        // Ưu tiên các từ khóa dài hơn để tránh trùng lặp cụm từ
        if (res.name) acc.push({ id: res.id, name: res.name.trim() });
        if (res.name_en && res.name_en !== res.name) acc.push({ id: res.id, name: res.name_en.trim() });
        
        // Yêu cầu đặc biệt: Mảnh Ngọc -> Thùng Ngọc
        if (res.id === "runic_vessel") {
            acc.push({ id: res.id, name: "Mảnh Ngọc" });
            acc.push({ id: res.id, name: "Mảnh ngọc" });
            acc.push({ id: res.id, name: "Rune Shards" });
        }
        
        return acc;
    }, []).sort((a, b) => b.name.length - a.name.length);
    
    // console.log(`[MarkupUtils] Initialized ${resourceKeywords.length} resource keywords.`);
};

/**
 * Hàm tự động gắn link tài nguyên vào văn bản.
 * Chuyển đổi "Bụi Tinh Tú" thành "[res:stardust|Bụi Tinh Tú]"
 */
export const autoLinkResources = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (resourceKeywords.length === 0) return text; // Tránh chạy regex nếu chưa có dữ liệu

    let result = text;

    // 1. Tạm thời bảo vệ các thẻ đã có sẵn (VD: [k:Keyword], [c:Champ], <br/>)
    const placeholders = [];
    const existingTagsRegex = /\[[a-z]+:[^\]]+\]|<[^>]+>/gi;
    
    result = result.replace(existingTagsRegex, (match) => {
        const placeholder = `__PH_${placeholders.length}__`;
        placeholders.push({ placeholder, original: match });
        return placeholder;
    });

    // 2. Thực hiện thay thế các từ khóa tài nguyên
    // Sử dụng bộ lọc để không thay thế nếu từ khóa nằm trong dấu ngoặc [] hoặc __PH__
    resourceKeywords.forEach(({ id, name }) => {
        try {
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Regex cải tiến: 
            // - Khớp ranh giới từ (không phải chữ/số/accent)
            // - KHÔNG nằm ngay sau dấu : (nhằm tránh match ID trong [res:id|...])
            // - KHÔNG nằm ngay sau dấu | (nhằm tránh match Label trong [res:id|label])
            const regex = new RegExp(`(?<![a-zA-Z0-9À-ỹ:|])${escapedName}(?![a-zA-Z0-9À-ỹ|])`, 'gi');
            
            result = result.replace(regex, (match) => {
                return `[res:${id}|${match}]`;
            });
        } catch (e) {
            console.error("Linker Regex Error for:", name, e);
        }
    });

    // 3. Khôi phục lại các thẻ ban đầu
    placeholders.forEach(({ placeholder, original }) => {
        result = result.replace(placeholder, original);
    });

    return result;
};

// --- LOGIC STRIP MARKUP ---
/**
 * stripMarkup - Loại bỏ các thẻ markup [type:id|label|options]
 * Trả về nội dung thuần văn bản (chỉ giữ lại label).
 */
export const stripMarkup = (text) => {
	if (!text) return "";
    
    // Xóa thẻ [type:id|label|options] -> label
	let result = text.replace(/\[([a-z]+):([^\]|]+)\|([^\]|]+)(?:\|[^\]]*)?\]/gi, (match, type, id, label) => {
        return label || id;
    });
	
	// Xóa thẻ [type:id] -> id
	result = result.replace(/\[([a-z]+):([^\]|]+)\]/gi, "$2");
	
	return result;
};
