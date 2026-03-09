// src/pages/TermsOfUse.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

function TermsOfUse() {
	const { tUI } = useTranslation(); // 🟢 Khởi tạo Hook

	return (
		<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
			<div className='max-w-[900px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4'>
						{tUI("terms.title")}
					</h1>
					<p
						className='text-lg text-[var(--color-text-secondary)]'
						dangerouslySetInnerHTML={{ __html: tUI("terms.subtitle") }}
					/>
				</div>

				{/* Nội dung chính */}
				<div className='prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-10 leading-relaxed'>
					{/* 1. Dự án do người hâm mộ phát triển */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("terms.section1Title")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("terms.section1P1") }} />
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section1P2") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section1P3") }}
						/>
					</section>

					{/* 2. Sử dụng Nội dung */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("terms.section2Title")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("terms.section2P1") }} />
						<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("terms.section2Li1") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("terms.section2Li2") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("terms.section2Li3") }}
							/>
						</ul>
					</section>

					{/* 3. Tính chính xác của Thông tin */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("terms.section3Title")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("terms.section3P1") }} />
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section3P2") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section3P3") }}
						/>
					</section>

					{/* 4. Trách nhiệm của người dùng */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("terms.section4Title")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("terms.section4P1") }} />
						<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("terms.section4Li1") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("terms.section4Li2") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("terms.section4Li3") }}
							/>
						</ul>
					</section>

					{/* 5. Liên kết ngoài */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("terms.section5Title")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("terms.section5P1") }} />
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section5P2") }}
						/>
					</section>

					{/* 6. Thay đổi Điều khoản */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("terms.section6Title")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("terms.section6P1") }} />
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section6P2") }}
						/>
					</section>

					{/* Cập nhật lần cuối */}
					<section className='text-center pt-8 border-t border-[var(--color-border)]'>
						<p className='text-sm text-[var(--color-text-secondary)]'>
							<strong>{tUI("terms.lastUpdated")}</strong> 04/11/2025
						</p>
						<Link
							to='/'
							className='inline-block mt-6 px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)]  '
						>
							{tUI("common.backToHome")}
						</Link>
					</section>
				</div>
			</div>
		</main>
	);
}

export default memo(TermsOfUse);
