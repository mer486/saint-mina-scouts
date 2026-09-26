import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] =
    useState("baraem");

  const [fields, setFields] = useState([]);

  const [loadingStages, setLoadingStages] =
    useState(true);

  const [loadingFields, setLoadingFields] =
    useState(true);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [error, setError] = useState("");

  // ADD FIELD MODAL
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

  // ==============================
  // CHECK ADMIN SESSION
  // ==============================

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
      } catch {
        navigate("/admin/login", {
          replace: true,
        });
      }
    }

    checkAuth();
  }, [navigate]);

  // ==============================
  // LOAD STAGES
  // ==============================

  useEffect(() => {
    if (checkingAuth) return;

    async function loadStages() {
      try {
        setLoadingStages(true);

        const response = await fetch(
          "/api/stages"
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setStages(data);

        if (data.length > 0) {
          setSelectedStage((current) => {
            const exists = data.some(
              (stage) =>
                stage.slug === current
            );

            return exists
              ? current
              : data[0].slug;
          });
        }
      } catch {
        setError(
          "حدث خطأ أثناء تحميل المراحل."
        );
      } finally {
        setLoadingStages(false);
      }
    }

    loadStages();
  }, [checkingAuth]);

  // ==============================
  // LOAD FIELDS
  // ==============================

  async function loadFields() {
    try {
      setLoadingFields(true);
      setError("");

      const response = await fetch(
        `/api/fields?stage=${encodeURIComponent(
          selectedStage
        )}`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setFields(data);
    } catch {
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

  // ==============================
  // ADD FIELD
  // ==============================

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
            name: newFieldName,
            description:
              newFieldDescription,
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
        throw new Error();
      }

      setNewFieldName("");
      setNewFieldDescription("");
      setShowAddField(false);

      await loadFields();
    } catch {
      setError(
        "حدث خطأ أثناء إضافة المجال."
      );
    } finally {
      setSavingField(false);
    }
  }

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

  return (
    <div className="admin-page" dir="rtl">
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
          onClick={() => navigate("/")}
        >
          عرض الموقع
        </button>
      </header>

      <main className="admin-container">
        <section className="admin-welcome">
          <div>
            <span>إدارة المحتوى</span>

            <h2>المجالات</h2>

            <p>
              اختر المرحلة لعرض المجالات
              التابعة لها وإدارتها.
            </p>
          </div>

          <button
            className="admin-add-button"
            onClick={() =>
              setShowAddField(true)
            }
          >
            + إضافة مجال
          </button>
        </section>

        <section className="admin-stage-selector">
          <label htmlFor="stage-select">
            المرحلة
          </label>

          {loadingStages ? (
            <p>جاري تحميل المراحل...</p>
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

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <section className="admin-fields-section">
          <div className="admin-section-heading">
            <div>
              <span>المحتوى الحالي</span>

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
                (field, index) => (
                  <article
                    className="admin-field-card"
                    key={field.id}
                  >
                    <div className="admin-field-order">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </div>

                    <div className="admin-field-info">
                      <span>
                        {field.stage_name}
                      </span>

                      <h3>
                        {field.name}
                      </h3>

                      <p>
                        {field.description ||
                          "لا يوجد وصف لهذا المجال."}
                      </p>
                    </div>

                    <div className="admin-field-actions">
                      <button disabled>
                        تعديل
                      </button>

                      <button disabled>
                        إلغاء النشر
                      </button>

                      <button
                        className="admin-delete-button"
                        disabled
                      >
                        حذف
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </main>

      {/* ADD FIELD MODAL */}

      {showAddField && (
        <div
          className="admin-modal-overlay"
          onMouseDown={() =>
            !savingField &&
            setShowAddField(false)
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

                <h2>إضافة مجال</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddField(false)
                }
                disabled={savingField}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddField}
            >
              <div className="admin-form-group">
                <label>
                  المرحلة
                </label>

                <select
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
              </div>

              <div className="admin-form-group">
                <label>
                  اسم المجال *
                </label>

                <input
                  type="text"
                  value={newFieldName}
                  onChange={(event) =>
                    setNewFieldName(
                      event.target.value
                    )
                  }
                  placeholder="مثال: المجال الاجتماعي"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  وصف المجال
                </label>

                <textarea
                  value={
                    newFieldDescription
                  }
                  onChange={(event) =>
                    setNewFieldDescription(
                      event.target.value
                    )
                  }
                  placeholder="اكتب وصفًا مختصرًا للمجال..."
                  rows="4"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() =>
                    setShowAddField(false)
                  }
                  disabled={savingField}
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
    </div>
  );
}

export default AdminPage;