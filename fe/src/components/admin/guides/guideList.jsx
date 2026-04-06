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
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/guides`);
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
			setError(tUI("common.errorLoadData"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDelete = async slug => {
		if (
			!window.confirm(
				(tUI("common.deleteConfirmPrefix")) + slug + "?",
			)
		)
			return;

		try {
			setLoading(true);
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/guides/${slug}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setGuides(guides.filter(g => g.slug !== slug));
		} catch (err) {
			alert(tUI("common.errorLoadData"));
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
		resetLabel: tUI("admin.item.resetFilter"),
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
