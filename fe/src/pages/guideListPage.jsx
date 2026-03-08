// src/pages/guideListPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/button";
import { useTranslation } from "../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ
import PageTitle from "../components/common/pageTitle"; // 🟢 Import PageTitle

const GuideList = () => {
	const [guides, setGuides] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();
	const { language, t } = useTranslation(); // 🟢 Khởi tạo Hook

	const fetchGuides = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const res = await axios.get(`${backendUrl}/api/guides`);

			if (res.data.success) {
				setGuides(res.data.data);
			}
		} catch (err) {
			console.error("Lỗi tải guides:", err);
			setError(
				err.message ||
					(language === "vi"
						? "Lỗi kết nối server"
						: "Server connection error"),
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGuides();
	}, []);

	if (loading)
		return (
			<div className='text-center py-10 text-gray-600'>
				{language === "vi" ? "Đang tải dữ liệu..." : "Loading data..."}
			</div>
		);

	if (error)
		return <div className='text-center py-10 text-red-500'>{error}</div>;

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
			{/* Đổi tiêu đề Tab Trình duyệt theo ngôn ngữ */}
			<PageTitle
				title={language === "vi" ? "Hướng dẫn & Cẩm nang" : "Guides & Manuals"}
			/>

			<div className='text-center mb-12'>
				<h1 className='text-4xl font-extrabold text-gray-900 mb-4'>
					{language === "vi" ? "Hướng dẫn & Cẩm nang" : "Guides & Manuals"}
				</h1>
				<p className='text-xl text-gray-500 max-w-2xl mx-auto'>
					{language === "vi"
						? "Khám phá các bài viết hướng dẫn chi tiết giúp bạn dễ dàng vượt qua các thử thách trong Path of Champions."
						: "Discover detailed guides to help you easily overcome challenges in The Path of Champions."}
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
				{guides.map(guide => {
					// 🟢 Tự động dịch Tiêu đề nếu có hỗ trợ
					const guideTitle = t(guide, "title");

					return (
						<div
							key={guide._id}
							className='bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col'
						>
							<div className='h-48 bg-gray-200 overflow-hidden'>
								<Link to={`/guides/${guide.slug}`}>
									<img
										src={guide.thumbnail || "/fallback-image.svg"}
										alt={guideTitle}
										className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
									/>
								</Link>
							</div>

							<div className='p-6 flex-1 flex flex-col'>
								<h2 className='text-xl font-bold mb-2 text-gray-900 line-clamp-2'>
									<Link
										to={`/guides/${guide.slug}`}
										className='hover:text-blue-600'
									>
										{guideTitle}
									</Link>
								</h2>
								<div className='flex flex-grow gap-4 mb-4'>
									<p className='flex items-center gap-1 text-gray-500 text-sm'>
										<Calendar size={18} /> {guide.publishedDate}
									</p>
									<p className='flex items-center gap-1 text-gray-500 text-sm'>
										<Eye size={18} />
										{guide.views} {language === "vi" ? "lượt xem" : "views"}
									</p>
								</div>
								<div className='mt-auto'>
									<Button
										variant='outline'
										onClick={() => navigate(`/guides/${guide.slug}`)}
										className='w-full flex justify-center items-center gap-2'
									>
										{language === "vi" ? "Đọc tiếp" : "Read more"}{" "}
										<ArrowRight size={18} />
									</Button>
								</div>
							</div>
						</div>
					);
				})}

				{/* Hiển thị khi danh sách trống */}
				{guides.length === 0 && (
					<div className='col-span-full text-center py-10 text-gray-500 italic'>
						{language === "vi"
							? "Hiện tại chưa có bài hướng dẫn nào."
							: "No guides available at the moment."}
					</div>
				)}
			</div>
		</div>
	);
};

export default GuideList;
