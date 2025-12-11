// src/components/build/commentsSection.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import Modal from "../common/modal.jsx";
import Button from "../common/button.jsx";

// --- Form viết bình luận ---
const CommentForm = ({
	buildId,
	onCommentPosted,
	parentId = null,
	replyToUsername = null,
	onCancel,
}) => {
	const { user, token } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const apiUrl = import.meta.env.VITE_API_URL;

	const handleKeyDown = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault(); // Ngăn xuống dòng mặc định
			handleSubmit(e);
		}
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!content.trim()) return;
		if (!user) {
			setError("Bạn cần đăng nhập để bình luận.");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content, parentId, replyToUsername }),
			});

			if (res.ok) {
				const newComment = await res.json();
				onCommentPosted(newComment);
				setContent("");
				onCancel?.();
			} else {
				const errData = await res.json();
				throw new Error(errData.error || "Không thể gửi bình luận");
			}
		} catch (err) {
			console.error("Comment submit error:", err);
			setError(err.message || "Có lỗi xảy ra khi gửi bình luận");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user && !parentId) {
		return (
			<p className='text-sm text-[var(--color-warning)] mb-4'>
				Vui lòng{" "}
				<Link
					to='/auth'
					className='underline text-blue-600 hover:text-blue-800'
				>
					đăng nhập
				</Link>{" "}
				để bình luận.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-3 mb-6'>
			<textarea
				value={content}
				onChange={e => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={
					replyToUsername
						? `Trả lời @${replyToUsername}...`
						: "Viết bình luận... (Enter để gửi, Shift + Enter để xuống dòng)"
				}
				className='w-full p-3 bg-surface-bg border border-border rounded-lg text-text-primary placeholder:text-text-secondary focus:border-primary-500 focus:outline-none resize-none'
				rows={4}
				disabled={isSubmitting}
				autoFocus={!!parentId}
			/>
			{error && <p className='text-sm text-red-600'>{error}</p>}
			<div className='flex justify-end gap-3'>
				{onCancel && (
					<Button variant='ghost' onClick={onCancel} disabled={isSubmitting}>
						Hủy
					</Button>
				)}
				<Button
					type='submit'
					variant='primary'
					disabled={isSubmitting || !content.trim()}
				>
					{isSubmitting ? "Đang gửi..." : "Gửi"}
				</Button>
			</div>
		</form>
	);
};

// --- Một bình luận ---
const CommentItem = ({
	comment,
	onCommentDeleted,
	onCommentUpdated,
	onCommentPosted,
	buildId,
	userDisplayNames,
	isReply = false,
}) => {
	const { user, token } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [isReplying, setIsReplying] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL;
	const isOwner = user && comment.user_sub === user.sub;

	const displayName = userDisplayNames[comment.username] || comment.username;
	const replyToName = comment.replyToUsername
		? userDisplayNames[comment.replyToUsername] || comment.replyToUsername
		: null;

	const indentClass = isReply ? "ml-12" : "ml-0";

	const handleUpdate = async () => {
		if (!editContent.trim()) return;
		setIsUpdating(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${buildId}/comments/${comment.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editContent }),
				}
			);
			if (!res.ok) throw new Error("Không thể sửa");
			const updated = await res.json();
			onCommentUpdated(updated);
			setIsEditing(false);
		} catch (err) {
			alert("Lỗi: " + err.message);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${buildId}/comments/${comment.id}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (!res.ok) throw new Error("Không thể xóa");
			onCommentDeleted(comment.id);
		} catch (err) {
			alert("Lỗi: " + err.message);
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
		}
	};

	return (
		<div
			className={`py-5 border-t border-border first:border-t-0 ${indentClass}`}
		>
			<div className='flex items-start justify-between'>
				<div>
					<span className='font-semibold text-text-primary'>{displayName}</span>
					<span className='ml-2 text-xs text-text-secondary'>
						{new Date(comment.createdAt).toLocaleString()}
						{comment.updatedAt && " (đã sửa)"}
					</span>
				</div>
				{isOwner && (
					<div className='flex gap-2'>
						<button
							onClick={() => setIsEditing(true)}
							className='p-1.5 text-text-secondary hover:text-primary-500'
						>
							<Edit size={16} />
						</button>
						<button
							onClick={() => setShowDeleteModal(true)}
							className='p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded'
						>
							<Trash2 size={16} />
						</button>
					</div>
				)}
			</div>

			{isEditing ? (
				<form
					onSubmit={e => {
						e.preventDefault();
						handleUpdate();
					}}
					className='mt-3'
				>
					<textarea
						value={editContent}
						onChange={e => setEditContent(e.target.value)}
						className='w-full p-3 border border-border rounded-lg bg-surface-bg focus:border-primary-500 focus:outline-none'
						rows={4}
						autoFocus
						placeholder='Chỉnh sửa bình luận...'
					/>
					<div className='flex justify-end gap-2 mt-2'>
						<Button
							variant='ghost'
							onClick={() => setIsEditing(false)}
							disabled={isUpdating}
						>
							Hủy
						</Button>
						<Button
							variant='primary'
							type='submit'
							disabled={isUpdating || !editContent.trim()}
						>
							{isUpdating ? "Đang lưu..." : "Lưu"}
						</Button>
					</div>
				</form>
			) : (
				<div className='mt-2 text-text-secondary whitespace-pre-wrap break-words'>
					{replyToName && (
						<span className='inline-block mr-2 px-2.5 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium'>
							Trả lời @{replyToName}
						</span>
					)}
					{comment.content}
				</div>
			)}

			<div className='mt-3'>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => setIsReplying(!isReplying)}
				>
					<MessageSquare size={15} className='mr-1' />
					Trả lời
				</Button>
			</div>

			{isReplying && (
				<div className='mt-4'>
					<CommentForm
						buildId={buildId}
						parentId={comment.id}
						replyToUsername={comment.username}
						onCommentPosted={c => {
							onCommentPosted(c);
							setIsReplying(false);
						}}
						onCancel={() => setIsReplying(false)}
					/>
				</div>
			)}

			{/* Render tất cả reply (cấp 1, 2, 3...) với thụt 1 lần duy nhất */}
			{comment.replies && comment.replies.length > 0 && (
				<div className='mt-2'>
					{comment.replies.map(reply => (
						<CommentItem
							key={reply.id}
							comment={reply}
							buildId={buildId}
							onCommentDeleted={onCommentDeleted}
							onCommentUpdated={onCommentUpdated}
							onCommentPosted={onCommentPosted}
							userDisplayNames={userDisplayNames}
							isReply={true}
						/>
					))}
				</div>
			)}

			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title='Xóa bình luận?'
			>
				<p>Bạn có chắc chắn muốn xóa bình luận này?</p>
				<div className='flex justify-end gap-3 mt-5'>
					<Button variant='ghost' onClick={() => setShowDeleteModal(false)}>
						Hủy
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? "Đang xóa..." : "Xóa"}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

// --- Component chính ---
const CommentsSection = ({ buildId }) => {
	const [comments, setComments] = useState([]);
	const [loadingComments, setLoadingComments] = useState(true);
	const [userDisplayNames, setUserDisplayNames] = useState({});
	const apiUrl = import.meta.env.VITE_API_URL;
	const { user } = useAuth();

	const fetchComments = useCallback(async () => {
		setLoadingComments(true);
		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`);
			if (!res.ok) throw new Error();
			const data = await res.json();
			setComments(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoadingComments(false);
		}
	}, [buildId, apiUrl]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const rootComments = useMemo(() => {
		const map = new Map();
		comments.forEach(c => map.set(c.id, { ...c, replies: [] }));
		const roots = [];
		comments.forEach(c => {
			if (c.parentId && map.has(c.parentId)) {
				map.get(c.parentId).replies.push(map.get(c.id));
			} else {
				roots.push(map.get(c.id));
			}
		});
		return roots;
	}, [comments]);

	const handlePosted = c => setComments(p => [...p, c]);
	const handleDeleted = id =>
		setComments(p => p.filter(c => c.id !== id && c.parentId !== id));
	const handleUpdated = c =>
		setComments(p => p.map(x => (x.id === c.id ? c : x)));

	return (
		<div className='mt-10'>
			<h2 className='text-2xl font-bold text-center mb-6 text-text-primary'>
				Bình luận ({rootComments.length})
			</h2>

			<div className='bg-surface-bg rounded-xl border border-border p-6 shadow-lg'>
				<CommentForm buildId={buildId} onCommentPosted={handlePosted} />

				{loadingComments ? (
					<p className='text-center text-text-secondary'>
						Đang tải bình luận...
					</p>
				) : rootComments.length === 0 ? (
					<p className='text-center text-text-secondary py-8'>
						Chưa có bình luận nào.
					</p>
				) : (
					rootComments.map(c => (
						<CommentItem
							key={c.id}
							comment={c}
							buildId={buildId}
							onCommentDeleted={handleDeleted}
							onCommentUpdated={handleUpdated}
							onCommentPosted={handlePosted}
							userDisplayNames={userDisplayNames}
							isReply={false}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default CommentsSection;
