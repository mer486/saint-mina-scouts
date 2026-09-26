import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState("baraem");
  const [fields, setFields] = useState([]);

  const [loadingStages, setLoadingStages] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStages() {
      try {
        setLoadingStages(true);

        const response = await fetch("/api/stages");

        if (!response.ok) {
          throw new Error("Failed to load stages");
        }

        const data = await response.json();

        setStages(data);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل المراحل.");
      } finally {
        setLoadingStages(false);
      }
    }

    loadStages();
  }, []);

  useEffect(() => {
    async function loadFields() {
      try {
        setLoadingFields(true);
        setError("");

        const response = await fetch(
          `/api/fields?stage=${encodeURIComponent(selectedStage)}`
        );

        if (!response.ok) {
          throw new Error("Failed to load fields");
        }

        const data = await response.json();

        setFields(data);
      } catch (err) {
        setError("حدث خطأ أثناء تحميل المجالات.");
      } finally {
        setLoadingFields(false);
      }
    }

    if (selectedStage) {
      loadFields();
    }
  }, [selectedStage]);

  return (
    <div className="admin-page" dir="rtl">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Saint Mina Scouts</span>
          <h1>لوحة التحكم</h1>
          <p>إدارة المحتوى التدريبي لكشافة كنيسة مارمينا</p>
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
              اختر المرحلة لعرض المجالات التابعة لها وإدارتها.
            </p>
          </div>

          <button className="admin-add-button" disabled>
            + إضافة مجال
          </button>
        </section>

        <section className="admin-stage-selector">
          <label htmlFor="stage-select">المرحلة</label>

          {loadingStages ? (
            <p>جاري تحميل المراحل...</p>
          ) : (
            <select
              id="stage-select"
              value={selectedStage}
              onChange={(event) =>
                setSelectedStage(event.target.value)
              }
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.slug}>
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
                  <small> ({fields.length})</small>
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
              <div className="admin-empty-icon">＋</div>

              <h3>لا توجد مجالات في هذه المرحلة</h3>

              <p>
                سيتمكن المسؤول من إضافة أول مجال من هنا.
              </p>
            </div>
          ) : (
            <div className="admin-fields-list">
              {fields.map((field, index) => (
                <article
                  className="admin-field-card"
                  key={field.id}
                >
                  <div className="admin-field-order">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="admin-field-info">
                    <span>
                      {field.stage_name}
                    </span>

                    <h3>{field.name}</h3>

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
              ))}
            </div>
          )}
        </section>

        <div className="admin-security-note">
          <strong>وضع الإعداد</strong>

          <p>
            أدوات الإضافة والتعديل والحذف ستعمل بعد تأمين
            لوحة التحكم بحساب المسؤول.
          </p>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;