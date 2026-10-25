// src/pages/TermsOfUse.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

function TermsOfUse() {
	const { tUI } = useTranslation();

	return (
		<main className='min-h-screen bg-[var(--tactical-page-bg)] py-12 text-text-primary'>
			<div className='max-w-[960px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-10'>
					<div className="inline-flex items-center gap-2 px-3 py-1 clip-chamfer-sm bg-[var(--tactical-accent-lime)]/10 text-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold uppercase tracking-widest mb-3 border border-[var(--tactical-accent-lime)]/30">
						LEGAL COMPLIANCE // TERMS
					</div>
					<h1 className='text-4xl sm:text-5xl font-bold font-display uppercase tracking-tight text-text-primary mb-4'>
						{tUI("terms.title")}
					</h1>
					<p
						className='text-base sm:text-lg text-text-secondary'
						dangerouslySetInnerHTML={{ __html: tUI("terms.subtitle") }}
					/>
				</div>

				{/* Nội dung chính */}
				<div className='tactical-panel clip-chamfer border border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)] p-6 sm:p-10 shadow-2xl space-y-8'>
					{/* 1. Dự án do người hâm mộ phát triển */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>
								{tUI("terms.section1Title")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("terms.section1P1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section1P2") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section1P3") }}
						/>
					</section>

					{/* 2. Sử dụng Nội dung */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-cyan)]'>
								{tUI("terms.section2Title")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("terms.section2P1") }} />
						<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium text-text-secondary'>
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
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>
								{tUI("terms.section3Title")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("terms.section3P1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section3P2") }}
						/>
					</section>

					{/* 4. Quyền riêng tư & Cookies */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-cyan)]'>
								{tUI("terms.section4Title")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("terms.section4P1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section4P2") }}
						/>
					</section>

					{/* 5. Giới hạn Trách nhiệm */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>
								{tUI("terms.section5Title")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("terms.section5P1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section5P2") }}
						/>
					</section>

					{/* 6. Thay đổi Điều khoản */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-cyan)]'>
								{tUI("terms.section6Title")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("terms.section6P1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section6P2") }}
						/>
					</section>

					{/* 7. Thông tin Liên hệ */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>
								{tUI("terms.section7Title")}
							</h2>
						</div>
						<p
							className='leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("terms.section7P1") }}
						/>
					</section>

					{/* Call to action */}
					<section className='text-center pt-4'>
						<Link
							to='/'
							className='inline-block px-8 py-3 clip-chamfer-sm bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] font-mono-tech font-bold uppercase text-xs tracking-wider shadow-[0_0_12px_rgba(210,255,40,0.3)] hover:brightness-110 transition-all'
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
