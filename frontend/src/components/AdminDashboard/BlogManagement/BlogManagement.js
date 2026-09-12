import React, { useEffect, useState, useMemo } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import { toast } from "react-toastify";
import "./BlogManagement.css";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    image: "",
    date: "",
    readTime: "",
    views: "",
    likes: "",
    comments: "",
    share: "",
    content: [""],
  });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${BASE_API_URL}/blogs`);
      setBlogs(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase().trim();
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q)
    );
  }, [blogs, searchQuery]);

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEditingBlogId(null);
    setFormData({
      title: "",
      slug: "",
      category: "",
      image: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: "4 min read",
      views: "1000",
      likes: "500",
      comments: "50",
      share: "25",
      content: [""],
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (blog) => {
    setIsEditMode(true);
    setEditingBlogId(blog._id || blog.id);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      category: blog.category || "",
      image: blog.image || "",
      date: blog.date || "",
      readTime: blog.readTime || "",
      views: String(blog.views || ""),
      likes: String(blog.likes || ""),
      comments: String(blog.comments || ""),
      share: String(blog.share || ""),
      content: blog.content?.length ? blog.content : [""],
    });
    setShowModal(true);
  };

  const handleCreateBlog = async () => {
    if (!formData.title.trim()) return toast.error("Title is required");
    if (!formData.slug.trim()) return toast.error("Slug is required");
    if (!formData.category.trim()) return toast.error("Category is required");
    if (!formData.image.trim()) return toast.error("Image URL is required");
    if (!formData.date.trim()) return toast.error("Date is required");
    if (!formData.readTime.trim()) return toast.error("Read Time is required");

    const filteredContent = formData.content.filter((item) => item.trim() !== "");
    if (filteredContent.length === 0) return toast.error("Please add at least one paragraph");

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: formData.category.trim(),
        image: formData.image.trim(),
        date: formData.date.trim(),
        readTime: formData.readTime.trim(),
        views: Number(formData.views || 0),
        likes: Number(formData.likes || 0),
        comments: Number(formData.comments || 0),
        share: Number(formData.share || 0),
        content: filteredContent,
      };

      if (isEditMode) {
        await api.put(`${BASE_API_URL}/blogs/${editingBlogId}`, payload);
        toast.success("Blog article updated successfully!");
      } else {
        await api.post(`${BASE_API_URL}/blogs`, payload);
        toast.success("Blog article published successfully!");
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingBlogId(null);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlogId) return;
    try {
      await api.delete(`${BASE_API_URL}/blogs/${selectedBlogId}`);
      toast.success("Blog deleted successfully");
      setShowDeleteModal(false);
      setSelectedBlogId(null);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog");
    }
  };

  const handleAddParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, ""],
    }));
  };

  const handleRemoveParagraph = (index) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  };

  const handleParagraphChange = (text, index) => {
    const updated = [...formData.content];
    updated[index] = text;
    setFormData((prev) => ({ ...prev, content: updated }));
  };

  return (
    <div className="blog-mgmt-container">
      <div className="blog-mgmt-card">
        {/* Header with Title and Add Button */}
        <div className="blog-card-header">
          <div className="blog-header-left">
            <div className="blog-header-icon">
              <i className="fas fa-newspaper"></i>
            </div>
            <div>
              <h4 className="blog-card-title">Blog & Article Management</h4>
              <p className="blog-card-subtitle">
                Publish industry insights, product guides, and news articles
              </p>
            </div>
          </div>

          <button
            type="button"
            className="blog-btn-add"
            onClick={handleOpenAddModal}
          >
            <i className="fas fa-plus"></i>
            <span>Add New Blog</span>
          </button>
        </div>

        {/* Toolbar with Search */}
        <div className="blog-toolbar">
          <div className="blog-search-wrap">
            <i className="fas fa-search blog-search-icon"></i>
            <input
              type="text"
              className="blog-search-input"
              placeholder="Search by title, category, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="text-muted small">
            Total Articles: <strong className="text-dark">{blogs.length}</strong>
          </div>
        </div>

        {/* Blog Posts Table */}
        <div className="blog-table-wrapper">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="small text-muted mt-2">Loading blog articles...</div>
            </div>
          ) : (
            <table className="blog-main-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "10%" }}>Thumbnail</th>
                  <th style={{ width: "32%" }}>Title & Slug</th>
                  <th style={{ width: "14%" }}>Category</th>
                  <th style={{ width: "12%" }}>Read Time</th>
                  <th style={{ width: "11%" }}>Engagement</th>
                  <th style={{ width: "180px", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="fas fa-file-alt mb-2" style={{ fontSize: "24px", color: "#94a3b8" }}></i>
                      <div>No blog articles found.</div>
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog, idx) => (
                    <tr key={blog._id || blog.id || idx}>
                      <td>
                        <span className="text-muted fw-semibold">{idx + 1}</span>
                      </td>
                      <td>
                        <div className="blog-thumbnail-wrap">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="blog-thumbnail-img"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&auto=format&fit=crop&q=60";
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{blog.title}</div>
                        <div className="small text-muted font-monospace">{blog.slug}</div>
                      </td>
                      <td>
                        <span className="blog-category-badge">{blog.category || "General"}</span>
                      </td>
                      <td>
                        <span className="blog-stat-badge">
                          <i className="far fa-clock"></i>
                          <span>{blog.readTime || "5 min read"}</span>
                        </span>
                      </td>
                      <td>
                        <div className="small text-muted">
                          <i className="far fa-eye me-1"></i>
                          <span>{blog.views || 0}</span>
                        </div>
                        <div className="small text-muted">
                          <i className="far fa-heart me-1 text-danger"></i>
                          <span>{blog.likes || 0}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <div className="blog-actions-cell">
                          <button
                            type="button"
                            className="blog-btn-action blog-btn-edit"
                            onClick={() => handleOpenEditModal(blog)}
                            title="Edit Article"
                          >
                            <i className="fas fa-edit"></i>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="blog-btn-action blog-btn-delete"
                            onClick={() => {
                              setSelectedBlogId(blog._id || blog.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Article"
                          >
                            <i className="fas fa-trash-alt"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Blog Modal */}
      {showModal && (
        <div className="blog-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="blog-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="blog-modal-header">
              <h5 className="blog-modal-title">
                <i className="fas fa-pen-nib text-primary"></i>
                <span>{isEditMode ? "Edit Blog Article" : "Write & Publish New Blog"}</span>
              </h5>
              <button
                type="button"
                className="blog-modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="blog-modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">Article Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aluminium Profile Quality Guide"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-dark">URL Slug *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. aluminium-profile-quality-guide"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-dark">Category *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Material-Guide, Industry-Trends"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-dark">Header Image URL *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://example.com/cover.webp"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-dark">Publication Date *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sep 05, 2026"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small text-dark">Read Time *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small text-dark">Views</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="1000"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small text-dark">Likes</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="500"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold small text-dark">Comments</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="25"
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  />
                </div>

                {/* Content Paragraphs Section */}
                <div className="col-12 mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold text-dark mb-0">Article Paragraphs</label>
                    <span className="small text-muted">{formData.content.length} paragraphs added</span>
                  </div>

                  {formData.content.map((para, pIdx) => (
                    <div key={pIdx} className="blog-para-card">
                      <div className="blog-para-header">
                        <span>Paragraph #{pIdx + 1}</span>
                        {formData.content.length > 1 && (
                          <button
                            type="button"
                            className="blog-para-btn-remove"
                            onClick={() => handleRemoveParagraph(pIdx)}
                          >
                            <i className="fas fa-trash-alt"></i>
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Write paragraph content here..."
                        value={para}
                        onChange={(e) => handleParagraphChange(e.target.value, pIdx)}
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    className="blog-btn-add-para"
                    onClick={handleAddParagraph}
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add Another Paragraph</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="blog-modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="blog-btn-add"
                onClick={handleCreateBlog}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Saving Article...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    <span>{isEditMode ? "Update Article" : "Publish Article"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="blog-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="blog-modal-dialog" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="blog-modal-header">
              <h5 className="blog-modal-title text-danger">
                <i className="fas fa-exclamation-triangle"></i>
                <span>Delete Blog Article</span>
              </h5>
              <button
                type="button"
                className="blog-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="blog-modal-body text-center py-4">
              <p className="text-muted mb-0">
                Are you sure you want to delete this blog post? This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="blog-modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteBlog}
              >
                Yes, Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;