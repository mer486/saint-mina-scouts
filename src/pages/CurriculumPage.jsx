import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function CurriculumPage() {
  const navigate = useNavigate();

  const { stageId } = useParams();

  const [stage, setStage] =
    useState(null);

  const [fields, setFields] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD STAGE + FIELDS FROM D1
  // ==========================================

  useEffect(() => {
    async function loadCurriculum() {
      try {
        setLoading(true);
        setError("");

        // Load stages
        const stagesResponse =
          await fetch("/api/stages");

        if (!stagesResponse.ok) {
          throw new Error(
            "Failed to load stages"
          );
        }

        const stagesData =
          await stagesResponse.json();

        const currentStage =
          stagesData.find(
            (item) =>
              item.slug === stageId
          );

        if (!currentStage) {
          setError(
            "لم يتم العثور على المرحلة."
          );

          return;
        }

        setStage(currentStage);

        // Load fields
        const fieldsResponse =
          await fetch(
            `/api/fields?stage=${encodeURIComponent(
              stageId
            )}`
          );

        if (!fieldsResponse.ok) {
          throw new Error(
            "Failed to load fields"
          );
        }

        const fieldsData =
          await fieldsResponse.json();

        setFields(fieldsData);
      } catch (error) {
        setError(
          "حدث خطأ أثناء تحميل المناهج."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCurriculum();
  }, [stageId]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="page-state"
        dir="rtl"
      >
        <h2>
          جاري تحميل المناهج...
        </h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !stage) {
    return (
      <div
        className="page-state"
        dir="rtl"
      >
        <h2>
          {error ||
            "لم يتم العثور على المرحلة."}
        </h2>

        <button
          onClick={() =>
            navigate("/")
          }
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="curriculum-page"
      dir="rtl"
    >
      {/* HEADER */}

      <section className="curriculum-hero">
        <button
          className="back-link"
          onClick={() =>
            navigate(
              `/stage/${stageId}`
            )
          }
        >
          ← العودة إلى المرحلة
        </button>

        <span className="section-label">
          {stage.name}
        </span>

        <h1>المناهج</h1>

        <p>
          اختر المجال لعرض المحاضرات
          والمحتوى التدريبي الخاص به.
        </p>
      </section>

      {/* FIELDS */}

      <section className="curriculum-content">
        <div className="section-heading">
          <div>
            <span>
              المحتوى التدريبي
            </span>

            <h2>
              المجالات
            </h2>
          </div>

          <p>
            {fields.length} مجال
          </p>
        </div>

        {fields.length === 0 ? (
          <div className="empty-state">
            <h3>
              لا توجد مجالات متاحة حاليًا
            </h3>

            <p>
              سيتم إضافة المحتوى قريبًا.
            </p>
          </div>
        ) : (
          <div className="fields-grid">
            {fields.map(
              (field, index) => (
                <article
                  className="field-card"
                  key={field.id}
                  onClick={() =>
                    navigate(
                      `/stage/${stageId}/curriculum/${field.slug}`
                    )
                  }
                >
                  <div className="field-card-number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="field-card-content">
                    <span>
                      {stage.name}
                    </span>

                    <h3>
                      {field.name}
                    </h3>

                    <p>
                      {field.description ||
                        "عرض المحاضرات والمحتوى التدريبي الخاص بهذا المجال."}
                    </p>
                  </div>

                  <div className="field-card-arrow">
                    ←
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CurriculumPage;