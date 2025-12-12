// src/pages/admin/GuideEditor.jsx
import React from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import GuideList from "./guideList";
import GuideForm from "./guideEditorForm";

// Component Wrapper để lấy params và truyền vào Form
const GuideFormWrapper = () => {
	const { slug } = useParams(); // slug có thể là "new" hoặc chuỗi slug thật
	return <GuideForm slug={slug} />;
};

const GuideEditor = () => {
	return (
		<Routes>
			{/* Route danh sách: /admin/guides */}
			<Route index element={<GuideList />} />

			{/* Route tạo mới: /admin/guides/new */}
			<Route path='new' element={<GuideFormWrapper />} />

			{/* Route chỉnh sửa: /admin/guides/:slug */}
			<Route path=':slug' element={<GuideFormWrapper />} />
		</Routes>
	);
};

export default GuideEditor;
