import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import Button from "../../common/button";
import { Edit, Trash2, Eye } from "lucide-react";

// IMPORT CÁC COMPONENT CHUNG
import AdminListLayout from "../common/adminListLayout";
import { LoadingState, ErrorState } from "../common/stateDisplays";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 20;

const GuideList = () => {
	const { tUI, t } = useTranslation();
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	const { token } = useAuth();
	const navigate = useNavigate();

	const fetchGuides = async () => {
		try {
			setLoading(true);
			const timestamp = Date.now();
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/guides?t=${timestamp}`, {
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					Expires: "0",
				},
			});
			if (res.data.success) {
				const sorted = res.data.data.sort(
					(a, b) =>
						new Date(b.updateDate || b.publishedDate) -
						new Date(a.updateDate || a.publishedDate),
				);
				setGuides(sorted);
			}
		} catch (err) {
			console.error("Error loading guide list:", err);
			setError(tUI("common.error"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDelete = async slug => {
		if (!slug) return;
		
		const result = await Swal.fire({
			title: "Xác nhận xóa?",
			text: `${tUI("common.deleteConfirmPrefix") || "Bạn muốn xóa bài viết: "}${slug}?`,
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

		try {
			setLoading(true);
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/guides/${slug}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setGuides(guides.filter(g => g.slug !== slug));
			
			Swal.fire({
				icon: "success",
				title: "Đã xóa!",
				text: "Bài viết đã được gỡ bỏ.",
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: tUI("common.error") || "Có lỗi xảy ra khi xóa bài viết.",
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setLoading(false);
		}
	};

	const filteredGuides = useMemo(() => {
		if (!searchTerm) return guides;
		return guides.filter(g =>
			t(g, "title").toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [guides, searchTerm, t]);

	const sidePanelProps = {
		searchPlaceholder: tUI("common.searchPlaceholder"),
		addLabel: tUI("common.addNew"),
		resetLabel: tUI("common.resetFilter"),
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
			setCurrentPage(1);
		},
	};

	if (loading && guides.length === 0)
		return <LoadingState text={tUI("common.loading")} />;
	if (error) return <ErrorState message={error} />;

	const paginatedGuides = filteredGuides.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);
	const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE);

	return (
		<div className='font-secondary'>
			<div className='mb-6 px-4'>
				<h1 className='text-2xl font-bold text-text-primary uppercase'>
					{tUI("guideList.heading")} (Admin)
				</h1>
			</div>

			<AdminListLayout
				dataLength={filteredGuides.length}
				totalPages={totalPages}
				currentPage={currentPage}
				onPageChange={setCurrentPage}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle='Không tìm thấy bài viết'
				emptyMessageSub='Vui lòng thử từ khóa khác'
			>
				<div className='bg-surface-bg rounded-xl border border-border overflow-hidden shadow-sm'>
					<table className='w-full text-left border-collapse'>
						<thead className='bg-surface-hover/50 text-text-secondary text-sm uppercase'>
							<tr>
								<th className='px-6 py-4 font-semibold'>
									{tUI("constellation.colName")}
								</th>
								<th className='px-6 py-4 font-semibold'>
									{tUI("guideDetail.authorLabel")}
								</th>
								<th className='px-6 py-4 font-semibold hidden md:table-cell'>
									{tUI("common.views")}
								</th>
								<th className='px-6 py-4 font-semibold text-right'>Thao tác</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{paginatedGuides.map((guide, index) => (
								<tr
									key={guide.slug || index}
									className='hover:bg-surface-hover/30 transition-colors'
								>
									<td className='px-6 py-4 font-medium text-text-primary'>
										{t(guide, "title")}
									</td>
									<td className='px-6 py-4 text-text-secondary'>
										{guide.author}
									</td>
									<td className='px-6 py-4 text-text-secondary hidden md:table-cell'>
										{guide.views || 0}
									</td>
									<td className='px-6 py-4 text-right space-x-2'>
										<Button
											variant='ghost'
											onClick={() => navigate(guide.slug)}
											className='text-blue-500 hover:bg-blue-500/10 p-2'
										>
											<Edit size={18} />
										</Button>
										<Button
											variant='ghost'
											onClick={() => handleDelete(guide.slug)}
											className='text-red-500 hover:bg-red-500/10 p-2'
										>
											<Trash2 size={18} />
										</Button>
										<a
											href={`/guides/${guide.slug}`}
											target='_blank'
											rel='noreferrer'
											className='inline-flex p-2 text-text-secondary hover:text-text-primary transition-colors'
										>
											<Eye size={18} />
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</AdminListLayout>
		</div>
	);
};

export default GuideList;
