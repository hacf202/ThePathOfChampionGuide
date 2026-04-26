// src/components/common/pageTitle.jsx
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";

export default function PageTitle({
	title = "",
	description = "",
	keywords = "",
	image = "",
	noIndex = false,
	locale,
	type = "website",
}) {
	const { language, tUI } = useTranslation();
	const location = useLocation();
	const siteName = "POC GUIDE";
	const baseUrl = window.location.origin;
	const canonicalUrl = `${baseUrl}${location.pathname}`;

	const fullTitle = title ? `${title} | ${siteName}` : siteName;

	// 🟢 Lấy mô tả & từ khóa mặc định từ từ điển
	const defaultDescription = tUI("metadata.defaultDescription");
	const defaultKeywords = tUI("metadata.defaultKeywords");

	const metaDescription = description || defaultDescription;
	const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
	const ogImage = image || `${baseUrl}/default-og-image.png`;

	// 🟢 Xác định locale chuẩn SEO
	const currentLocale = locale || (language === "vi" ? "vi_VN" : "en_US");

	// 🟢 Tạo Schema Breadcrumbs cho Google
	const pathnames = location.pathname.split("/").filter((x) => x);
	const breadcrumbList = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: baseUrl,
			},
			...pathnames.map((name, index) => {
				const routeTo = `${baseUrl}/${pathnames.slice(0, index + 1).join("/")}`;
				const isLast = index === pathnames.length - 1;
				return {
					"@type": "ListItem",
					position: index + 2,
					name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "),
					item: routeTo,
				};
			}),
		],
	};

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: siteName,
		url: baseUrl,
		description: metaDescription,
	};

	return (
		<Helmet htmlAttributes={{ lang: language }}>
			<title>{fullTitle}</title>
			<meta name='description' content={metaDescription} />
			<meta name='keywords' content={metaKeywords} />
			{noIndex && <meta name='robots' content='noindex, nofollow' />}

			<link rel='canonical' href={canonicalUrl} />
			<link rel='alternate' hrefLang='vi' href={canonicalUrl} />
			<link rel='alternate' hrefLang='en' href={canonicalUrl} />
			<link rel='alternate' hrefLang='x-default' href={canonicalUrl} />

			<meta property='og:title' content={fullTitle} />
			<meta property='og:description' content={metaDescription} />
			<meta property='og:type' content={type} />
			<meta property='og:url' content={canonicalUrl} />
			<meta property='og:image' content={ogImage} />
			<meta property='og:image:alt' content={fullTitle} />
			<meta property='og:image:width' content='1200' />
			<meta property='og:image:height' content='630' />
			<meta property='og:locale' content={currentLocale} />
			<meta property='og:site_name' content={siteName} />

			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={fullTitle} />
			<meta name='twitter:description' content={metaDescription} />
			<meta name='twitter:image' content={ogImage} />

			<script type='application/ld+json'>{JSON.stringify(jsonLd)}</script>
			<script type='application/ld+json'>{JSON.stringify(breadcrumbList)}</script>
		</Helmet>
	);
}
