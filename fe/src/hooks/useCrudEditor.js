import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { removeAccents } from "../utils/vietnameseUtils";

/**
 * Custom Hook quản lý Logic CRUD + Routing + Filter cho Admin Panel
 * @param {string} endpoint - API Endpoint (vd: "items", "runes")
 * @param {string} idField - Tên trường ID (vd: "itemCode", "runeCode")
 * @param {object} newItemTemplate - Object mẫu khi tạo mới
 * @param {string} routePath - Đường dẫn gốc của trang (vd: "/admin/items")
 * @param {number} itemsPerPage - Số item trên 1 trang (mặc định 20)
 * @param {function} customFilterLogic - Hàm lọc nâng cao (tùy chọn)
 */
export const useCrudEditor = ({
	endpoint,
	idField,
	newItemTemplate,
	routePath,
	itemsPerPage = 24,
	customFilterLogic = null,
}) => {
	const { token } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const backendUrl = import.meta.env.VITE_API_URL;

	// --- 1. STATE QUẢN LÝ DỮ LIỆU ---
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	// --- 2. STATE QUẢN LÝ FILTER & SORT ---
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [customFilterValues, setCustomFilterValues] = useState({});

	// --- 3. STATE QUẢN LÝ MODAL & NOTIFICATION ---
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [modals, setModals] = useState({ close: false, delete: false });
	const [itemToDelete, setItemToDelete] = useState(null);

	// --- 4. XỬ LÝ ROUTING (URL as State) ---
	// Phân tích URL để xác định ViewMode và SelectedID
	const currentPath = location.pathname;

	// Kiểm tra xem có đang ở trang gốc (List) hay không
	// Logic: path hiện tại khớp routePath hoặc routePath + "/"
	const isRoot = currentPath === routePath || currentPath === routePath + "/";

	const isNewMode = currentPath === `${routePath}/new`;

	// Lấy ID từ URL (phần cuối cùng của path). Nếu là root hoặc new thì id là null
	const urlId = !isRoot && !isNewMode ? currentPath.split("/").pop() : null;

	const viewMode = isRoot ? "list" : "edit";
	const selectedId = urlId;

	// --- 5. FETCH DATA (READ) ---
	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`${backendUrl}/api/${endpoint}`);
			if (!res.ok) throw new Error(`Lỗi kết nối: ${res.status}`);
			const result = await res.json();
			// Chuẩn hóa dữ liệu ảnh để tránh lỗi hiển thị
			const formattedData = result.map(item => ({
				...item,
			}));
			setData(formattedData);
		} catch (e) {
			console.error(e);
			setError("Không thể tải dữ liệu từ máy chủ.");
		} finally {
			setIsLoading(false);
		}
	}, [backendUrl, endpoint]);

	// Gọi API khi component mount
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// --- 6. LOGIC LỌC & SẮP XẾP (MEMOIZED) ---
	const filteredData = useMemo(() => {
		let res = [...data];

		// Lọc theo tên (Search)
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			res = res.filter(i => removeAccents(i.name.toLowerCase()).includes(term));
		}

		// Lọc theo độ hiếm
		if (selectedRarities.length > 0) {
			res = res.filter(i => selectedRarities.includes(i.rarity));
		}

		// Lọc nâng cao (Custom - dùng cho Type, Stack, Region...)
		if (customFilterLogic) {
			res = customFilterLogic(res, customFilterValues);
		}

		// Sắp xếp
		const [key, dir] = sortOrder.split("-");
		res.sort((a, b) => {
			const valA = a[key] || "";
			const valB = b[key] || "";
			// Xử lý null/undefined an toàn khi sort
			const safeValA = valA.toString().toLowerCase();
			const safeValB = valB.toString().toLowerCase();

			return dir === "asc"
				? safeValA.localeCompare(safeValB)
				: safeValB.localeCompare(safeValA);
		});

		return res;
	}, [
		data,
		searchTerm,
		selectedRarities,
		sortOrder,
		customFilterValues,
		customFilterLogic,
	]);

	// --- 7. PHÂN TRANG ---
	const totalPages = Math.ceil(filteredData.length / itemsPerPage);
	const paginatedData = useMemo(
		() =>
			filteredData.slice(
				(currentPage - 1) * itemsPerPage,
				currentPage * itemsPerPage
			),
		[filteredData, currentPage, itemsPerPage]
	);

	// --- 8. TÍNH TOÁN SELECTED ITEM ---
	// Logic: Nếu URL là /new -> Dùng template. Nếu URL có ID -> Tìm trong data.
	const selectedItem = useMemo(() => {
		if (isNewMode) {
			return {
				...newItemTemplate,
				[idField]: Date.now().toString(), // Tạo ID tạm
				isNew: true,
			};
		}
		if (selectedId && data.length > 0) {
			return data.find(i => String(i[idField]) === String(selectedId));
		}
		return null;
	}, [isNewMode, selectedId, data, newItemTemplate, idField]);

	// --- 9. CÁC HÀNH ĐỘNG (ACTIONS) ---

	// Điều hướng
	const handleSelect = id => navigate(`${routePath}/${id}`);
	const handleAddNew = () => navigate(`${routePath}/new`);
	const handleBackToList = () => navigate(routePath);

	// Xử lý Search / Reset
	const handleSearch = () => {
		setSearchTerm(searchInput);
		setCurrentPage(1);
		navigate(routePath); // Reset về list khi search
	};
	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};
	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedRarities([]);
		setCustomFilterValues({});
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	// Xử lý Lưu (Create / Update)
	const handleSave = async itemData => {
		setIsSaving(true);
		const { isNew, ...payload } = itemData;

		try {
			if (!token) throw new Error("Phiên đăng nhập hết hạn.");

			// Giả định backend dùng PUT cho cả tạo mới (upsert) hoặc có logic riêng.
			// Nếu backend tách biệt POST (create) và PUT (update), sửa logic tại đây:
			// const method = isNew ? "POST" : "PUT";

			const res = await fetch(`${backendUrl}/api/${endpoint}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || `Lỗi server: ${res.status}`);
			}

			// Reload dữ liệu mới
			await fetchData();

			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: isNew ? "Đã tạo mới thành công!" : "Đã lưu thay đổi!",
			});

			// Quay về trang danh sách sau khi lưu
			handleBackToList();
		} catch (e) {
			setNotification({
				isOpen: true,
				title: "Lỗi Lưu",
				message: e.message,
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Xử lý Xóa
	const handleDelete = async () => {
		if (!itemToDelete) return;
		setIsSaving(true);
		try {
			if (!token) throw new Error("Phiên đăng nhập hết hạn.");

			const res = await fetch(
				`${backendUrl}/api/${endpoint}/${itemToDelete[idField]}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (!res.ok) throw new Error(`Lỗi xóa: ${res.status}`);

			// Cập nhật state local để UI phản hồi nhanh
			setData(prev => prev.filter(i => i[idField] !== itemToDelete[idField]));

			setNotification({
				isOpen: true,
				title: "Đã Xóa",
				message: `Đã xóa thành công mục: ${itemToDelete.name}`,
			});

			// Nếu đang ở trang chi tiết của item vừa xóa, quay về list
			if (selectedId === String(itemToDelete[idField])) {
				handleBackToList();
			}
		} catch (e) {
			setNotification({
				isOpen: true,
				title: "Lỗi Xóa",
				message: e.message,
			});
		} finally {
			setIsSaving(false);
			setModals(p => ({ ...p, delete: false }));
			setItemToDelete(null);
		}
	};

	// Xử lý đóng Modal xác nhận thoát
	const handleAttemptClose = () => {
		// Mở modal xác nhận "Bạn có chắc muốn thoát?"
		setModals(p => ({ ...p, close: true }));
	};

	const handleConfirmClose = () => {
		setModals(p => ({ ...p, close: false }));
		handleBackToList();
	};

	// --- 10. TRẢ VỀ STATE & ACTIONS ---
	return {
		state: {
			data,
			paginatedData,
			selectedId,
			selectedItem, // Item hiện tại (dựa trên URL)
			viewMode, // 'list' hoặc 'edit' (dựa trên URL)
			isLoading,
			isSaving,
			error,
			totalPages,
			currentPage,
			searchInput,
			selectedRarities,
			sortOrder,
			customFilterValues,
			notification,
			modals,
			itemToDelete,
			idField, // Expose để các component con dùng nếu cần
		},
		actions: {
			// State Setters
			setSearchInput,
			setSelectedRarities,
			setSortOrder,
			setCurrentPage,
			setCustomFilterValues,
			setNotification,
			setModals,
			setItemToDelete,

			// Logic Handlers
			handleSearch,
			handleClearSearch,
			handleResetFilters,
			handleSelect,
			handleAddNew,
			handleSave,
			handleDelete,
			handleAttemptClose,
			handleConfirmClose,
			refresh: fetchData,
		},
	};
};
