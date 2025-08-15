import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});

export function renderMarkdown(content: string): string {
	return md.render(content);
}

export function sanitizeHtml(html: string): string {
	// Basic HTML sanitization - in production, use a proper sanitizer like DOMPurify
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
		.replace(/javascript:/gi, '')
		.replace(/on\w+\s*=/gi, '');
}

export function processMarkdown(content: string): string {
	const rendered = renderMarkdown(content);
	return sanitizeHtml(rendered);
} 