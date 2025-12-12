// src/pages/admin/GuideList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Thêm Link
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/button";
import { Edit, Trash2, Eye, Plus } from "lucide-react";

const GuideList = () => {
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const { token } = useAuth();
	const navigate = useNavigate();

	const fetchGuides = async () => {
		try {
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/guides`);
			if (res.data.success) {
				const sorted = res.data.data.sort(
					(a, b) =>
						new Date(b.updateDate || b.publishedDate) -
						new Date(a.updateDate || a.publishedDate)
				);
				setGuides(sorted);
			}
		} catch (err) {
			console.error("Lỗi tải danh sách:", err);
			alert("Không thể tải danh sách bài viết.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
	}, []);

	const handleDelete = async slug => {
		if (!window.confirm(`Bạn có chắc muốn xóa bài viết: ${slug}?`)) return;
		try {
			await axios.delete(`${import.meta.env.VITE_API_URL}/api/guides/${slug}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			alert("Đã xóa thành công!");
			fetchGuides();
		} catch (err) {
			console.error("Lỗi xóa:", err);
			alert("Có lỗi khi xóa.");
		}
	};

	if (loading) return <div className='p-8 text-center'>Đang tải...</div>;

	return (
		<div className='p-8 max-w-7xl mx-auto font-secondary'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800 font-primary'>
					Quản lý Guides
				</h1>
				<Button
					variant='primary'
					onClick={() => navigate("new")} // Đường dẫn tương đối: /admin/guides/new
					iconLeft={<Plus size={18} />}
				>
					Tạo bài viết mới
				</Button>
			</div>

			<div className='bg-white rounded-xl shadow overflow-hidden border border-gray-200'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Hình Ảnh
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Tiêu đề
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Ngày đăng
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Ngày cập nhật
							</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Views
							</th>
							<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Thao tác
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{guides.map(guide => (
							<tr key={guide.slug} className='hover:bg-gray-50 transition'>
								<td className='px-6 py-4'>
									<img
										src={guide.thumbnail}
										alt={guide.title}
										className='w-30 h-24 object-cover rounded-md'
									/>
								</td>
								<td className='px-6 py-4'>
									{/* Link chuyển trang edit */}
									<Link to={`./${guide.slug}`} className='group block'>
										<div className='font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>
											{guide.title}
										</div>
										<div className='text-sm text-gray-500'>{guide.slug}</div>
									</Link>
								</td>
								<td className='px-6 py-4 text-sm text-gray-500'>
									{new Date(guide.publishedDate).toLocaleDateString("vi-VN")}
								</td>
								<td className='px-6 py-4 text-sm text-gray-500'>
									{new Date(guide.updateDate).toLocaleDateString("vi-VN")}
								</td>
								<td className='px-6 py-4 text-sm text-gray-500'>
									{guide.views || 0}
								</td>
								<td className='px-6 py-4 text-right text-sm font-medium space-x-2'>
									<Button
										variant='ghost'
										onClick={() => navigate(guide.slug)} // Đường dẫn tương đối
										className='text-indigo-600 hover:text-indigo-900'
										iconLeft={<Edit size={16} />}
									>
										Sửa
									</Button>
									<Button
										variant='ghost'
										onClick={() => handleDelete(guide.slug)}
										className='text-red-600 hover:text-red-900 hover:bg-red-50'
										iconLeft={<Trash2 size={16} />}
									>
										Xóa
									</Button>
									<a
										href={`/guides/${guide.slug}`}
										target='_blank'
										rel='noopener noreferrer'
										className='inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 ml-2 px-3 py-2 text-sm font-semibold rounded-md hover:bg-gray-100 transition'
									>
										<Eye size={16} /> Xem
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{guides.length === 0 && (
					<div className='p-8 text-center text-gray-500'>
						Chưa có bài viết nào.
					</div>
				)}
			</div>
		</div>
	);
};

export default GuideList;
