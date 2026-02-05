// src/pages/admin/powerEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, Routes, Route, useParams } from "react-router-dom";
import GenericCard from "../common/genericCard";
import Button from "../common/button";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import PowerEditorForm from "./powerEditorForm";
import { Loader2 } from "lucide-react";

const NEW_POWER_TEMPLATE = {
	powerCode: "",
	isNew: true,
	name: "Sức Mạnh Mới",
	rarity: "",
	description: "",
	descriptionRaw: "",
	type: [],
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
};

const ITEMS_PER_PAGE = 20;

// === LIST VIEW ===
const PowerListView = memo(
	({
		paginatedPowers,
		totalPages,
		currentPage,
		onPageChange,
		sidePanelProps,
	}) => {
		return (
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5 bg-surface-bg rounded-lg p-4'>
					{paginatedPowers.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6'>
							{paginatedPowers.map(power => (
								<Link
									key={power.powerCode}
									to={`./${power.powerCode}`}
									className='block hover:scale-105 transition-transform duration-200'
								>
									<GenericCard item={power} />
								</Link>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
							<div>
								<p className='font-semibold text-lg'>
									Không tìm thấy sức mạnh nào phù hợp.
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
// === EDIT WRAPPER ===
const PowerEditWrapper = ({
	powers,
	onSave,
	onDelete,
	isSaving,
	sidePanelProps,
}) => {
	const { id } = useParams();
	const navigate = useNavigate();

	const selectedPower = useMemo(() => {
		if (id === "new") return { ...NEW_POWER_TEMPLATE };

		const found = powers.find(p => p.powerCode === id);
		if (found) {
			// FORCE isNew: false cho mọi power đã tồn tại (từ server)
			return { ...found, isNew: false };
		}
		return null;
	}, [id, powers]);

	const handleBack = useCallback(() => {
		navigate("/admin/powers");
	}, [navigate]);

	if (!selectedPower && powers.length > 0) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
				<p className='text-xl mb-4'>Không tìm thấy sức mạnh có mã: {id}</p>
				<Button onClick={handleBack} variant='primary'>
					Quay lại danh sách
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-4/5 bg-surface-bg rounded-lg'>
				{selectedPower && (
					<PowerEditorForm
						power={selectedPower}
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
function PowerEditor() {
	const [powers, setPowers] = useState([]);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
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
			const res = await fetch(`${API_BASE_URL}/api/powers`);
			if (!res.ok) throw new Error("Không thể tải dữ liệu");
			const data = await res.json();
			setPowers(data);
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
			...new Set(powers.map(p => p.rarity).filter(Boolean)),
		].sort();
		const types = [...new Set(powers.flatMap(p => p.type || []))].sort();

		return {
			rarities: rarities.map(r => ({ value: r, label: r })),
			types: types.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
			],
		};
	}, [powers]);

	const filteredPowers = useMemo(() => {
		let result = [...powers];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(p =>
				removeAccents(p.name.toLowerCase()).includes(term),
			);
		}

		if (selectedRarities.length) {
			result = result.filter(p => selectedRarities.includes(p.rarity));
		}

		if (selectedTypes.length) {
			result = result.filter(p => p.type?.some(t => selectedTypes.includes(t)));
		}

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = a.name;
			const B = b.name;
			return dir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
		});

		return result;
	}, [powers, searchTerm, selectedRarities, selectedTypes, sortOrder]);

	const totalPages = Math.ceil(filteredPowers.length / ITEMS_PER_PAGE);
	const paginatedPowers = filteredPowers.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handleSavePower = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/powers`, {
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
			navigate("/admin/powers");
			alert(
				data.isNew
					? "Tạo sức mạnh mới thành công"
					: "Cập nhật sức mạnh thành công",
			);
		} catch (e) {
			alert(e.message || "Đã có lỗi xảy ra");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeletePower = async powerCode => {
		if (!powerCode) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/powers/${powerCode}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Xóa thất bại");

			await fetchAllData();
			navigate("/admin/powers");
			alert("Đã xóa sức mạnh thành công");
		} catch (e) {
			alert(e.message || "Xóa thất bại");
		} finally {
			setIsSaving(false);
		}
	};

	const sidePanelProps = {
		searchPlaceholder: "Nhập tên sức mạnh...",
		addLabel: "Thêm Sức Mạnh Mới",
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
						<PowerListView
							paginatedPowers={paginatedPowers}
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
						<PowerEditWrapper
							powers={powers}
							onSave={handleSavePower}
							onDelete={handleDeletePower}
							isSaving={isSaving}
							sidePanelProps={sidePanelProps}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(PowerEditor);
