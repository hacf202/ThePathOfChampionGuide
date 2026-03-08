// src/pages/AboutUs.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

function AboutUs() {
	const { tUI } = useTranslation(); // 🟢 Sử dụng tUI

	return (
		<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
			<div className='max-w-[900px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4'>
						{tUI("about.titlePrefix")}
						<span className='text-[var(--color-primary-500)]'>Guide POC</span>
					</h1>
					<p
						className='text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto'
						dangerouslySetInnerHTML={{ __html: tUI("about.subtitle") }}
					/>
				</div>

				{/* Nội dung chính */}
				<div className='prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-10 leading-relaxed'>
					{/* Giới thiệu tổng quan */}
					<section>
						<p
							className='text-base'
							dangerouslySetInnerHTML={{ __html: tUI("about.intro1") }}
						/>
						<p
							className='mt-4'
							dangerouslySetInnerHTML={{ __html: tUI("about.intro2") }}
						/>
					</section>

					{/* Chúng tôi là ai */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("about.whoWeAreTitle")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre1") }} />
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre2") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre3") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre4") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre5") }}
						/>
					</section>

					{/* Chúng tôi làm gì */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("about.whatWeDoTitle")}
						</h2>
						<p
							dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoIntro") }}
						/>
						<ol className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi1") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi2") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi3") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi4") }}
							/>
						</ol>
						<p
							className='mt-4'
							dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoOutro") }}
						/>
					</section>

					{/* Tại sao chúng tôi làm điều đó */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("about.whyWeDoItTitle")}
						</h2>
						<p dangerouslySetInnerHTML={{ __html: tUI("about.whyWeDoIt1") }} />
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyWeDoIt2") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyWeDoIt3") }}
						/>
					</section>

					{/* Tại sao là “Guide POC”? */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							{tUI("about.whyGuidePocTitle")}
						</h2>
						<p
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc1") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc2") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc3") }}
						/>
						<p
							className='mt-3'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc4") }}
						/>
					</section>

					{/* Call to action */}
					<section className='text-center pt-8'>
						<Link
							to='/'
							className='inline-block px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)] transition-colors'
						>
							{tUI("common.backToHome")}
						</Link>
					</section>
				</div>
			</div>
		</main>
	);
}

export default memo(AboutUs);
