// src/pages/admin/relicEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../common/genericCard";
import Button from "../common/button";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import RelicEditorForm from "./relicEditorForm";
import { Loader2 } from "lucide-react";

const NEW_RELIC_TEMPLATE = {
	relicCode: "",
	isNew: true,
	name: "Cổ Vật Mới",
	rarity: "",
	rarityRef: "",
	stack: 1,
	type: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	description: "",
	descriptionRaw: "",
};

const ITEMS_PER_PAGE = 20;

// === LIST VIEW ===
const RelicListView = memo(
	({
		paginatedRelics,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedRelics.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
							{paginatedRelics.map(relic => (
								<Link
									key={relic.relicCode}
									to={`./${relic.relicCode}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<GenericCard item={relic} />
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<div>
								<p className='font-semibold text-lg'>
									Không tìm thấy cổ vật nào phù hợp.
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
const RelicEditWrapper = ({
	relics,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const selectedRelic = useMemo(() => {
		if (id === "new") return { ...NEW_RELIC_TEMPLATE };

		const found = relics.find(r => r.relicCode === id);
		if (found) {
			// FORCE isNew: false cho mọi relic đã tồn tại
			return { ...found, isNew: false };
		}
		return null;
	}, [id, relics]);

	const handleBack = useCallback(() => {
		navigate("/admin/relics");
	}, [navigate]);

	if (!selectedRelic && relics.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>Không tìm thấy cổ vật có mã: {id}</p>
				<Button onClick={handleBack} variant='primary'>
					Quay lại danh sách
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg'>
				{selectedRelic && (
					<RelicEditorForm
						relic={selectedRelic}
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
function RelicEditor() {
	const [relics, setRelics] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [selectedStacks, setSelectedStacks] = useState([]);
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
			const res = await fetch(`${API_BASE_URL}/api/relics`);
			if (!res.ok) throw new Error("Không thể tải dữ liệu");
			const data = await res.json();
			setRelics(data);
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
			...new Set(relics.map(r => r.rarity).filter(Boolean)),
		].sort();
		const types = [...new Set(relics.map(r => r.type || "Other"))].sort();
		const stacks = [...new Set(relics.map(r => r.stack))].sort((a, b) => a - b);

		return {
			rarities: rarities.map(r => ({ value: r, label: r })),
			types: types.map(t => ({ value: t, label: t })),
			stacks: stacks.map(s => ({ value: s, label: `Stack ${s}` })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
			],
		};
	}, [relics]);

	const filteredRelics = useMemo(() => {
		let result = [...relics];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(r =>
				removeAccents(r.name.toLowerCase()).includes(term),
			);
		}

		if (selectedRarities.length) {
			result = result.filter(r => selectedRarities.includes(r.rarity));
		}

		if (selectedTypes.length) {
			result = result.filter(r => selectedTypes.includes(r.type));
		}

		if (selectedStacks.length) {
			result = result.filter(r => selectedStacks.includes(r.stack));
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = a.name;
			const B = b.name;
			return dir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
		});

		return result;
	}, [
		relics,
		searchTerm,
		selectedRarities,
		selectedTypes,
		selectedStacks,
		sortOrder,
	]);

	const totalPages = Math.ceil(filteredRelics.length / ITEMS_PER_PAGE);
	const paginatedRelics = filteredRelics.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handleSaveRelic = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/relics`, {
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
			navigate("/admin/relics");
			alert(
				data.isNew ? "Tạo cổ vật mới thành công" : "Cập nhật cổ vật thành công",
			);
		} catch (e) {
			alert(e.message || "Đã có lỗi xảy ra");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteRelic = async relicCode => {
		if (!relicCode) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/relics/${relicCode}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Xóa thất bại");

			await fetchAllData();
			navigate("/admin/relics");
			alert("Đã xóa cổ vật thành công");
		} catch (e) {
			alert(e.message || "Xóa thất bại");
		} finally {
			setIsSaving(false);
		}
	};

	const sidePanelProps = {
		searchPlaceholder: "Nhập tên cổ vật...",
		addLabel: "Thêm Cổ Vật Mới",
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
			setSelectedTypes([]);
			setSelectedStacks([]);
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
			{
				label: "Loại",
				options: filterOptions.types,
				selectedValues: selectedTypes,
				onChange: setSelectedTypes,
				placeholder: "Tất cả Loại",
			},
			{
				label: "Stack",
				options: filterOptions.stacks,
				selectedValues: selectedStacks,
				onChange: setSelectedStacks,
				placeholder: "Tất cả Stack",
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
						<RelicListView
							paginatedRelics={paginatedRelics}
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
						<RelicEditWrapper
							relics={relics}
							onSave={handleSaveRelic}
							onDelete={handleDeleteRelic}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(RelicEditor);
