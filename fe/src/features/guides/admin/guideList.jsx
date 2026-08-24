import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import Button from "@/components/common/button";
import { Edit, Trash2, Eye } from "lucide-react";

import AdminListLayout from "@/components/admin/common/adminListLayout";
import { LoadingState, ErrorState } from "@/components/admin/common/stateDisplays";
import Swal from "sweetalert2";
import { useGenericData } from "@/hooks/useGenericData";
import { useGenericFilters } from "@/hooks/useGenericFilters";

const GuideList = () => {
	const { tUI, t } = useTranslation();
	const navigate = useNavigate();
	const { token } = useAuth();

	const {
		state,
		actions,
		queryParams,
	} = useGenericFilters({
		prefix: "adminGuides",
		defaultSort: "updateDate-desc"
	});

	const {
		dataList: guides,
		loading,
		error,
		pagination,
		refetch
	} = useGenericData("guides", queryParams, tUI, "slug");

	const handleDelete = async slug => {
		if (!slug) return;
		
			const result = await Swal.fire({
				title: tUI("admin.common.deleteConfirm"),
				text: `${tUI("admin.common.deleteConfirm")} (${slug})`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#ef4444",
				cancelButtonColor: "#6b7280",
				confirmButtonText: tUI("admin.common.delete"),
				cancelButtonText: tUI("admin.common.cancel"),
				background: "#1f2937",
				color: "#f3f4f6",
			});

			if (!result.isConfirmed) return;

			try {
				await axios.delete(`${import.meta.env.VITE_API_URL}/api/guides/${slug}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				refetch();
				
				Swal.fire({
					icon: "success",
					title: tUI("admin.common.deleteSuccess"),
					text: tUI("guideList.admin.deleteSuccess"),
					timer: 2000,
					showConfirmButton: false,
					toast: true,
					position: "top-end",
				});
			} catch (error) {
				console.error("Lỗi khi xóa bài viết:", error);
				Swal.fire({
					icon: "error",
					title: tUI("admin.common.errorOccurred"),
					text: tUI("common.error") || "Error deleting guide.",
					confirmButtonColor: "#3b82f6",
				});
			}
	};

	const sidePanelProps = {
		searchPlaceholder: tUI("common.searchPlaceholder"),
		addLabel: tUI("common.addNew"),
		resetLabel: tUI("common.resetFilter"),
		searchInput: state.searchInput,
		onSearchInputChange: actions.setSearchInput,
		onSearch: actions.handleSearch,
		onClearSearch: () => {
			actions.setSearchInput("");
			actions.handleResetFilters();
		},
		onAddNew: () => navigate("new"),
		onResetFilters: actions.handleResetFilters,
	};

	if (loading && guides.length === 0)
		return <LoadingState text={tUI("common.loading")} />;
	if (error) return <ErrorState message={error} />;

	return (
		<div className='font-secondary'>
			<div className='mb-6 px-4'>
				<h1 className='text-2xl font-bold text-text-primary uppercase'>
					{tUI("guideList.heading")} (Admin)
				</h1>
			</div>

			<AdminListLayout
				dataLength={guides.length}
				totalPages={pagination.totalPages}
				currentPage={pagination.currentPage}
				onPageChange={actions.setCurrentPage}
				sidePanelProps={sidePanelProps}
				emptyMessageTitle={tUI("guideList.admin.emptyTitle")}
				emptyMessageSub={tUI("guideList.admin.emptyHint")}
			>
				<div className='bg-surface-bg rounded-xl border border-border overflow-hidden shadow-sm'>
					<table className='w-full text-left border-collapse'>
						<thead className='bg-surface-hover/30 border-b border-border text-[10px] uppercase tracking-widest text-text-tertiary'>
							<tr>
								<th className='px-6 py-4 font-semibold'>
									{tUI("admin.common.info")}
								</th>
								<th className='px-6 py-4 font-semibold hidden md:table-cell'>
									{tUI("common.views")}
								</th>
								<th className='px-6 py-4 font-semibold text-right'>{tUI("admin.common.actions")}</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{guides.map((guide, index) => (
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
