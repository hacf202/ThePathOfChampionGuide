// src/pages/admin/itemEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../common/genericCard";
import Button from "../common/button";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import ItemEditorForm from "./itemEditorForm";
import { Loader2 } from "lucide-react";

const NEW_ITEM_TEMPLATE = {
	itemCode: "",
	isNew: true,
	name: "Vật Phẩm Mới",
	rarity: "",
	rarityRef: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	description: "",
	descriptionRaw: "",
};

const ITEMS_PER_PAGE = 20;

// === LIST VIEW ===
const ItemListView = memo(
	({
		paginatedItems,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedItems.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
							{paginatedItems.map(item => (
								<Link
									key={item.itemCode}
									to={`./${item.itemCode}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<GenericCard item={item} />
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<div>
								<p className='font-semibold text-lg'>
									Không tìm thấy vật phẩm nào phù hợp.
								</p>
								<p>Vui lòng thử lại với bộ lọc khác.</p>
							</div>
						</div>
					)}

					{totalPages > 1 && (
						<div className='mt-8 flex justify-center items-center gap-2 md:gap-4'>
							<Button
								onClick={() => onPageChange(currentPage - 1)}
								disabled={currentPage === 1}
								variant='outline'
							>
								Trang trước
							</Button>
							<span className='text-lg font-medium text-text-primary'>
								{currentPage} / {totalPages}
							</span>
							<Button
								onClick={() => onPageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								variant='outline'
							>
								Trang sau
							</Button>
						</div>
					)}
				</div>
				<div className='lg:w-1/5'>
					<SidePanel {...sidePanelProps} />
				</div>
			</div>
		);
	},
);

// === EDIT WRAPPER ===
const ItemEditWrapper = ({
	items,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const selectedItem = useMemo(() => {
		if (id === "new") return { ...NEW_ITEM_TEMPLATE };

		const found = items.find(i => i.itemCode === id);
		if (found) {
			// FORCE isNew: false cho mọi item đã tồn tại
			return { ...found, isNew: false };
		}
		return null;
	}, [id, items]);

	const handleBack = useCallback(() => {
		navigate("/admin/items");
	}, [navigate]);

	if (!selectedItem && items.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>Không tìm thấy vật phẩm có mã: {id}</p>
				<Button onClick={handleBack} variant='primary'>
					Quay lại danh sách
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg'>
				{selectedItem && (
					<ItemEditorForm
						item={selectedItem}
						onSave={onSave}
						onCancel={handleBack}
						onDelete={onDelete}
						isSaving={isSaving}
					/>
				)}
			</div>
			<div className='lg:w-1/5'>
				<SidePanel {...sidePanelProps} />
			</div>
		</div>
	);
};

// === MAIN COMPONENT ===
function ItemEditor() {
	const [items, setItems] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);

	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const res = await fetch(`${API_BASE_URL}/api/items`);
			if (!res.ok) throw new Error("Không thể tải dữ liệu");
			const data = await res.json();
			setItems(data);
		} catch (e) {
			setError("Không thể tải dữ liệu từ server.");
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const filterOptions = useMemo(() => {
		const rarities = [
			...new Set(items.map(i => i.rarity).filter(Boolean)),
		].sort();

		return {
			rarities: rarities.map(r => ({ value: r, label: r })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
			],
		};
	}, [items]);

	const filteredItems = useMemo(() => {
		let result = [...items];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(i =>
				removeAccents(i.name.toLowerCase()).includes(term),
			);
		}

		if (selectedRarities.length) {
			result = result.filter(i => selectedRarities.includes(i.rarity));
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = a.name;
			const B = b.name;
			return dir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
		});

		return result;
	}, [items, searchTerm, selectedRarities, sortOrder]);

	const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handleSaveItem = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/items`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (!res.ok) {
				let errorMessage = "Lưu thất bại.";
				try {
					const errorBody = await res.json();
					errorMessage = errorBody.error || errorBody.message || errorMessage;
				} catch {}
				throw new Error(errorMessage);
			}

			await fetchAllData();
			navigate("/admin/items");
			alert(
				data.isNew
					? "Tạo vật phẩm mới thành công"
					: "Cập nhật vật phẩm thành công",
			);
		} catch (e) {
			alert(e.message || "Đã có lỗi xảy ra");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteItem = async itemCode => {
		if (!itemCode) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/items/${itemCode}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Xóa thất bại");

			await fetchAllData();
			navigate("/admin/items");
			alert("Đã xóa vật phẩm thành công");
		} catch (e) {
			alert(e.message || "Xóa thất bại");
		} finally {
			setIsSaving(false);
		}
	};

	const sidePanelProps = {
		searchPlaceholder: "Nhập tên vật phẩm...",
		addLabel: "Thêm Vật Phẩm Mới",
		resetLabel: "Đặt lại bộ lọc",
		searchInput,
		onSearchInputChange: e => setSearchInput(e.target.value),
		onSearch: () => {
			setSearchTerm(searchInput.trim());
			setCurrentPage(1);
		},
		onClearSearch: () => {
			setSearchInput("");
			setSearchTerm("");
		},
		onAddNew: () => navigate("new"),
		onResetFilters: () => {
			setSearchInput("");
			setSearchTerm("");
			setSelectedRarities([]);
			setSortOrder("name-asc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: "Độ hiếm",
				options: filterOptions.rarities,
				selectedValues: selectedRarities,
				onChange: setSelectedRarities,
				placeholder: "Tất cả Độ hiếm",
			},
		],
		sortOptions: filterOptions.sort,
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<div className='text-lg mt-4'>Đang tải dữ liệu...</div>
			</div>
		);
	}

	if (error) {
		return <div className='text-center p-10 text-red-500'>{error}</div>;
	}

	return (
		<div className='font-secondary'>
			<Routes>
				<Route
					index
					element={
						<ItemListView
							paginatedItems={paginatedItems}
							totalPages={totalPages}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
				<Route
					path=':id'
					element={
						<ItemEditWrapper
							items={items}
							onSave={handleSaveItem}
							onDelete={handleDeleteItem}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(ItemEditor);
