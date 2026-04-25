// src/components/admin/builds/buildEditor.jsx
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { useNavigate, Routes, Route, useParams, Link } from "react-router-dom";
import Button from "../../common/button";
import BuildCard from "./buildCard";
import BuildEditorForm from "./buildEditorForm";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG
import AdminListLayout from "../common/adminListLayout";
import { LoadingState, ErrorState } from "../common/stateDisplays";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 12;

// === COMPONENT CON QUẢN LÝ VIỆC SỬA ===
const BuildEditWrapper = ({ items, onSave, onDelete, isSaving }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const [localBuild, setLocalBuild] = useState(null);
	const [isLoadingSingle, setIsLoadingSingle] = useState(false);

	// Tải lẻ dữ liệu nếu load trực tiếp URL
	useEffect(() => {
		const found = items.find(i => i.id === id);
		if (found) {
			setLocalBuild(found);
		} else {
			const fetchSingle = async () => {
				setIsLoadingSingle(true);
				try {
					const token = localStorage.getItem("token");
					const res = await fetch(
						`${import.meta.env.VITE_API_URL}/api/admin/builds?searchTerm=${id}`,
						{ headers: { Authorization: `Bearer ${token}` } },
					);
					const data = await res.json();
					const fetchedItems = Array.isArray(data) ? data : data.items || [];
					const itemFound = fetchedItems.find(i => i.id === id);
					if (itemFound) setLocalBuild(itemFound);
				} catch (e) {
					console.error("Lỗi khi tải lẻ build:", e);
				} finally {
					setIsLoadingSingle(false);
				}
			};
			fetchSingle();
		}
	}, [id, items]);

	if (isLoadingSingle)
		return <LoadingState text={tUI("admin.common.loading")} />;

	if (!localBuild) {
		return (
			<div className='flex flex-col items-center justify-center py-20 text-[var(--color-text-secondary)]'>
				<p className='text-xl mb-4'>
					{tUI("admin.build.notFoundId")} {id}
				</p>
				<Button onClick={() => navigate("/admin/builds")} variant='primary'>
					{tUI("admin.common.backToList")}
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col w-full'>
			<BuildEditorForm
				item={localBuild}
				onSave={onSave}
				onDelete={onDelete}
				onCancel={() => navigate("/admin/builds")}
				isSaving={isSaving}
			/>
		</div>
	);
};

// === COMPONENT MAIN ===
function BuildEditor() {
	const [items, setItems] = useState([]);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStars, setSelectedStars] = useState([]);
	const [sortOrder, setSortOrder] = useState("createdAt-desc");
	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { tUI } = useTranslation();

	const SORT_OPTIONS = useMemo(
		() => [
			{
				value: "createdAt-desc",
				label: tUI("admin.build.sort.newest"),
			},
			{
				value: "createdAt-asc",
				label: tUI("admin.build.sort.oldest"),
			},
			{
				value: "likes-desc",
				label: tUI("admin.build.sort.likesDesc"),
			},
			{
				value: "likes-asc",
				label: tUI("admin.build.sort.likesAsc"),
			},
			{
				value: "views-desc",
				label: tUI("admin.build.sort.viewsDesc"),
			},
			{
				value: "views-asc",
				label: tUI("admin.build.sort.viewsAsc"),
			},
		],
		[tUI],
	);

	const STAR_LEVEL_OPTIONS = useMemo(
		() => [
			{ value: "1", label: `1 ${tUI("admin.build.star")}` },
			{ value: "2", label: `2 ${tUI("admin.build.star")}` },
			{ value: "3", label: `3 ${tUI("admin.build.star")}` },
			{ value: "4", label: `4 ${tUI("admin.build.star")}` },
			{ value: "5", label: `5 ${tUI("admin.build.star")}` },
			{ value: "6", label: `6 ${tUI("admin.build.star")}` },
		],
		[tUI],
	);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", ITEMS_PER_PAGE);
		params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedStars.length > 0)
			params.append("stars", selectedStars.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedStars, sortOrder]);

	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem("token");
			const res = await fetch(
				`${API_BASE_URL}/api/admin/builds?${queryParams}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (!res.ok) throw new Error(tUI("admin.common.errorLoad"));
			const data = await res.json();
			setItems(data.items || []);
			if (data.pagination) setPagination(data.pagination);
		} catch (e) {
			setError(e.message || tUI("admin.common.errorLoad"));
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL, queryParams, tUI]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	const handleSaveItem = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/admin/builds/${data.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});
			const result = await res.json();
			if (!res.ok)
				throw new Error(result.error || tUI("admin.common.errorOccurred"));

			await fetchAllData();
			navigate("/admin/builds");
			
			Swal.fire({
				icon: "success",
				title: "Đã lưu!",
				text: tUI("admin.common.saveSuccess"),
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (e) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: e.message || tUI("admin.common.errorOccurred"),
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteItem = async id => {
		const result = await Swal.fire({
			title: "Xác nhận xóa?",
			text: "Bản dựng này sẽ bị xóa vĩnh viễn!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Vâng, xóa nó!",
			cancelButtonText: "Hủy bỏ",
			background: "#1f2937",
			color: "#f3f4f6",
		});

		if (!result.isConfirmed) return;

		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_BASE_URL}/api/admin/builds/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(tUI("admin.common.deleteFailed"));
			await fetchAllData();
			navigate("/admin/builds");
			
			Swal.fire({
				icon: "success",
				title: "Đã xóa!",
				text: tUI("admin.common.deleteSuccess"),
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (e) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: e.message || tUI("admin.common.deleteFailed"),
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const sidePanelProps = {
		searchPlaceholder: tUI("admin.build.searchPlaceholder"),
		resetLabel: tUI("admin.build.resetFilter"),
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
		onResetFilters: () => {
			setSearchInput("");
			setSearchTerm("");
			setSelectedStars([]);
			setSortOrder("createdAt-desc");
			setCurrentPage(1);
		},
		multiFilterConfigs: [
			{
				label: tUI("admin.build.starLevel"),
				options: STAR_LEVEL_OPTIONS,
				selectedValues: selectedStars,
				onChange: setSelectedStars,
				placeholder: tUI("admin.common.all"),
			},
		],
		sortOptions: SORT_OPTIONS,
		sortSelectedValue: sortOrder,
		onSortChange: setSortOrder,
	};

	if (isLoading && items.length === 0)
		return <LoadingState text={tUI("admin.common.loading")} />;
	if (error && items.length === 0) return <ErrorState message={error} />;

	return (
		<div className='font-secondary text-[var(--color-text-primary)]'>
			<Routes>
				<Route
					index
					element={
						<AdminListLayout
							dataLength={items.length}
							totalPages={pagination.totalPages}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							sidePanelProps={sidePanelProps}
							emptyMessageTitle={tUI("admin.build.notFound")}
							emptyMessageSub={tUI("admin.build.tryOtherFilter")}
						>
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 relative'>
								{isLoading && items.length > 0 && (
									<div className='absolute inset-0 bg-black/10 z-10 rounded-lg backdrop-blur-[2px]' />
								)}
								{items.map(item => (
									<Link
										key={item.id}
										to={`./${item.id}`}
										className='block transform transition duration-200 hover:-translate-y-1'
									>
										<BuildCard build={item} />
									</Link>
								))}
							</div>
						</AdminListLayout>
					}
				/>
				<Route
					path=':id'
					element={
						<BuildEditWrapper
							items={items}
							onSave={handleSaveItem}
							onDelete={handleDeleteItem}
							isSaving={isSaving}
						/>
					}
				/>
			</Routes>
		</div>
	);
}

export default memo(BuildEditor);
