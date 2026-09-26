import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  // ==========================================
  // AUTH
  // ==========================================

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  // ==========================================
  // DATA
  // ==========================================

  const [stages, setStages] = useState([]);

  const [selectedStage, setSelectedStage] =
    useState("baraem");

  const [fields, setFields] = useState([]);

  // ==========================================
  // LOADING / ERROR
  // ==========================================

  const [loadingStages, setLoadingStages] =
    useState(true);

  const [loadingFields, setLoadingFields] =
    useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // ADD FIELD
  // ==========================================

  const [showAddField, setShowAddField] =
    useState(false);

  const [newFieldName, setNewFieldName] =
    useState("");

  const [
    newFieldDescription,
    setNewFieldDescription,
  ] = useState("");

  const [savingField, setSavingField] =
    useState(false);

  // ==========================================
  // EDIT FIELD
  // ==========================================

  const [editingField, setEditingField] =
    useState(null);

  const [editFieldName, setEditFieldName] =
    useState("");

  const [
    editFieldDescription,
    setEditFieldDescription,
  ] = useState("");

  const [updatingField, setUpdatingField] =
    useState(false);

  // ==========================================
  // CHECK ADMIN SESSION
  // ==========================================

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(
          "/api/admin/session"
        );

        const data = await response.json();

        if (!data.authenticated) {
          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        setCheckingAuth(false);
      } catch (error) {
        navigate("/admin/login", {
          replace: true,
        });
      }
    }

    checkAuth();
  }, [navigate]);

  // ==========================================
  // LOAD STAGES
  // ==========================================

  useEffect(() => {
    if (checkingAuth) {
      return;
    }

    async function loadStages() {
      try {
        setLoadingStages(true);
        setError("");

        const response = await fetch(
          "/api/stages"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load stages"
          );
        }

        const data = await response.json();

        setStages(data);

        if (data.length > 0) {
          setSelectedStage((currentStage) => {
            const exists = data.some(
              (stage) =>
                stage.slug === currentStage
            );

            if (exists) {
              return currentStage;
            }

            return data[0].slug;
          });
        }
      } catch (error) {
        setError(
          "حدث خطأ أثناء تحميل المراحل."
        );
      } finally {
        setLoadingStages(false);
      }
    }

    loadStages();
  }, [checkingAuth]);

  // ==========================================
  // LOAD FIELDS
  // ==========================================

  async function loadFields() {
    if (!selectedStage) {
      return;
    }

    try {
      setLoadingFields(true);
      setError("");

      const response = await fetch(
        `/api/admin/fields?stage=${encodeURIComponent(
          selectedStage
        )}`
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load fields"
        );
      }

      const data = await response.json();

      setFields(data);
    } catch (error) {
      setError(
        "حدث خطأ أثناء تحميل المجالات."
      );
    } finally {
      setLoadingFields(false);
    }
  }

  useEffect(() => {
    if (
      checkingAuth ||
      !selectedStage
    ) {
      return;
    }

    loadFields();
  }, [selectedStage, checkingAuth]);

  // ==========================================
  // ADD FIELD
  // ==========================================

  function openAddField() {
    setNewFieldName("");
    setNewFieldDescription("");
    setError("");
    setShowAddField(true);
  }

  function closeAddField() {
    if (savingField) {
      return;
    }

    setShowAddField(false);
    setNewFieldName("");
    setNewFieldDescription("");
  }

  async function handleAddField(event) {
    event.preventDefault();

    if (!newFieldName.trim()) {
      return;
    }

    try {
      setSavingField(true);
      setError("");

      const response = await fetch(
        "/api/admin/fields",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            stageSlug: selectedStage,
            name: newFieldName.trim(),
            description:
              newFieldDescription.trim(),
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to create field"
        );
      }

      setShowAddField(false);
      setNewFieldName("");
      setNewFieldDescription("");

      await loadFields();
    } catch (error) {
      setError(
        "حدث خطأ أثناء إضافة المجال."
      );
    } finally {
      setSavingField(false);
    }
  }

  // ==========================================
  // EDIT FIELD
  // ==========================================

  function openEditField(field) {
    setError("");

    setEditingField(field);

    setEditFieldName(
      field.name || ""
    );

    setEditFieldDescription(
      field.description || ""
    );
  }

  function closeEditField() {
    if (updatingField) {
      return;
    }

    setEditingField(null);
    setEditFieldName("");
    setEditFieldDescription("");
  }

  async function handleEditField(event) {
    event.preventDefault();

    if (
      !editingField ||
      !editFieldName.trim()
    ) {
      return;
    }

    try {
      setUpdatingField(true);
      setError("");

      const response = await fetch(
        "/api/admin/fields",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: editingField.id,
            name: editFieldName.trim(),
            description:
              editFieldDescription.trim(),
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to update field"
        );
      }

      setEditingField(null);
      setEditFieldName("");
      setEditFieldDescription("");

      await loadFields();
    } catch (error) {
      setError(
        "حدث خطأ أثناء تعديل المجال."
      );
    } finally {
      setUpdatingField(false);
    }
  }

  // ==========================================
  // PUBLISH / UNPUBLISH FIELD
  // ==========================================

  async function toggleFieldPublish(field) {
    const currentlyPublished =
      Number(field.is_published) === 1;

    const newStatus =
      !currentlyPublished;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/fields",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: field.id,
            isPublished: newStatus,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to change status"
        );
      }

      await loadFields();
    } catch (error) {
      setError(
        "حدث خطأ أثناء تغيير حالة النشر."
      );
    }
  }

  // ==========================================
  // DELETE FIELD
  // ==========================================

  async function deleteField(field) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${field.name}"؟\n\nسيتم حذف جميع المحاضرات التابعة لهذا المجال أيضًا، ولا يمكن التراجع عن هذه العملية.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/admin/fields?id=${field.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to delete field"
        );
      }

      await loadFields();
    } catch (error) {
      setError(
        "حدث خطأ أثناء حذف المجال."
      );
    }
  }

  // ==========================================
  // AUTH LOADING SCREEN
  // ==========================================

  if (checkingAuth) {
    return (
      <div
        className="admin-login-loading"
        dir="rtl"
      >
        جاري التحقق من تسجيل الدخول...
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="admin-page"
      dir="rtl"
    >
      {/* HEADER */}

      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            Saint Mina Scouts
          </span>

          <h1>لوحة التحكم</h1>

          <p>
            إدارة المحتوى التدريبي لكشافة
            كنيسة مارمينا
          </p>
        </div>

        <button
          className="admin-site-button"
          onClick={() =>
            navigate("/")
          }
        >
          عرض الموقع
        </button>
      </header>

      {/* CONTENT */}

      <main className="admin-container">
        {/* INTRO */}

        <section className="admin-welcome">
          <div>
            <span>
              إدارة المحتوى
            </span>

            <h2>المجالات</h2>

            <p>
              اختر المرحلة لعرض المجالات
              التابعة لها وإدارتها.
            </p>
          </div>

          <button
            className="admin-add-button"
            onClick={openAddField}
            disabled={
              loadingStages ||
              stages.length === 0
            }
          >
            + إضافة مجال
          </button>
        </section>

        {/* STAGE SELECTOR */}

        <section className="admin-stage-selector">
          <label htmlFor="stage-select">
            المرحلة
          </label>

          {loadingStages ? (
            <p>
              جاري تحميل المراحل...
            </p>
          ) : (
            <select
              id="stage-select"
              value={selectedStage}
              onChange={(event) =>
                setSelectedStage(
                  event.target.value
                )
              }
            >
              {stages.map((stage) => (
                <option
                  key={stage.id}
                  value={stage.slug}
                >
                  {stage.name}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* ERROR */}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* FIELDS */}

        <section className="admin-fields-section">
          <div className="admin-section-heading">
            <div>
              <span>
                المحتوى الحالي
              </span>

              <h2>
                المجالات

                {!loadingFields && (
                  <small>
                    {" "}
                    ({fields.length})
                  </small>
                )}
              </h2>
            </div>
          </div>

          {loadingFields ? (
            <div className="admin-loading">
              جاري تحميل المجالات...
            </div>
          ) : fields.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">
                ＋
              </div>

              <h3>
                لا توجد مجالات في هذه
                المرحلة
              </h3>

              <p>
                اضغط على إضافة مجال لإنشاء
                أول مجال.
              </p>
            </div>
          ) : (
            <div className="admin-fields-list">
              {fields.map(
                (field, index) => {
                  const isPublished =
                    Number(
                      field.is_published
                    ) === 1;

                  return (
                    <article
                      className="admin-field-card"
                      key={field.id}
                    >
                      {/* ORDER */}

                      <div className="admin-field-order">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      {/* INFORMATION */}

                      <div className="admin-field-info">
                        <span>
                          {
                            field.stage_name
                          }
                        </span>

                        <h3>
                          {field.name}
                        </h3>

                        <span
                          className={
                            isPublished
                              ? "admin-status published"
                              : "admin-status hidden"
                          }
                        >
                          {isPublished
                            ? "منشور"
                            : "غير منشور"}
                        </span>

                        <p>
                          {field.description ||
                            "لا يوجد وصف لهذا المجال."}
                        </p>
                      </div>

                      {/* ACTIONS */}

                      <div className="admin-field-actions">
                        <button
                          onClick={() =>
                            openEditField(
                              field
                            )
                          }
                        >
                          تعديل
                        </button>

                        <button
                          onClick={() =>
                            toggleFieldPublish(
                              field
                            )
                          }
                        >
                          {isPublished
                            ? "إلغاء النشر"
                            : "إعادة النشر"}
                        </button>

                        <button
                          className="admin-delete-button"
                          onClick={() =>
                            deleteField(
                              field
                            )
                          }
                        >
                          حذف
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>

      {/* =====================================
          ADD FIELD MODAL
      ====================================== */}

      {showAddField && (
        <div
          className="admin-modal-overlay"
          onMouseDown={
            closeAddField
          }
        >
          <div
            className="admin-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-heading">
              <div>
                <span>
                  إضافة محتوى جديد
                </span>

                <h2>
                  إضافة مجال
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeAddField
                }
                disabled={
                  savingField
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddField
              }
            >
              {/* STAGE */}

              <div className="admin-form-group">
                <label>
                  المرحلة
                </label>

                <select
                  value={
                    selectedStage
                  }
                  onChange={(event) =>
                    setSelectedStage(
                      event.target
                        .value
                    )
                  }
                >
                  {stages.map(
                    (stage) => (
                      <option
                        key={
                          stage.id
                        }
                        value={
                          stage.slug
                        }
                      >
                        {
                          stage.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* NAME */}

              <div className="admin-form-group">
                <label>
                  اسم المجال *
                </label>

                <input
                  type="text"
                  value={
                    newFieldName
                  }
                  onChange={(
                    event
                  ) =>
                    setNewFieldName(
                      event.target
                        .value
                    )
                  }
                  placeholder="مثال: المجال الاجتماعي"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="admin-form-group">
                <label>
                  وصف المجال
                </label>

                <textarea
                  value={
                    newFieldDescription
                  }
                  onChange={(
                    event
                  ) =>
                    setNewFieldDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="اكتب وصفًا مختصرًا للمجال..."
                  rows="4"
                />
              </div>

              {/* ACTIONS */}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeAddField
                  }
                  disabled={
                    savingField
                  }
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    savingField ||
                    !newFieldName.trim()
                  }
                >
                  {savingField
                    ? "جاري الحفظ..."
                    : "حفظ المجال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================
          EDIT FIELD MODAL
      ====================================== */}

      {editingField && (
        <div
          className="admin-modal-overlay"
          onMouseDown={
            closeEditField
          }
        >
          <div
            className="admin-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-heading">
              <div>
                <span>
                  تعديل المحتوى
                </span>

                <h2>
                  تعديل المجال
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditField
                }
                disabled={
                  updatingField
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleEditField
              }
            >
              {/* NAME */}

              <div className="admin-form-group">
                <label>
                  اسم المجال *
                </label>

                <input
                  type="text"
                  value={
                    editFieldName
                  }
                  onChange={(
                    event
                  ) =>
                    setEditFieldName(
                      event.target
                        .value
                    )
                  }
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="admin-form-group">
                <label>
                  وصف المجال
                </label>

                <textarea
                  value={
                    editFieldDescription
                  }
                  onChange={(
                    event
                  ) =>
                    setEditFieldDescription(
                      event.target
                        .value
                    )
                  }
                  rows="4"
                />
              </div>

              {/* ACTIONS */}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeEditField
                  }
                  disabled={
                    updatingField
                  }
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    updatingField ||
                    !editFieldName.trim()
                  }
                >
                  {updatingField
                    ? "جاري الحفظ..."
                    : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;