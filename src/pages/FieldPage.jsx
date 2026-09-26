import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function FieldPage() {
  const navigate = useNavigate();

  const { stageId, fieldId } =
    useParams();

  const [stage, setStage] =
    useState(null);

  const [field, setField] =
    useState(null);

  const [lectures, setLectures] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD FIELD + LECTURES FROM D1
  // ==========================================

  useEffect(() => {
    async function loadFieldPage() {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------
        // LOAD STAGE
        // --------------------------------------

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

        // --------------------------------------
        // LOAD FIELDS
        // --------------------------------------

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

        const currentField =
          fieldsData.find(
            (item) =>
              item.slug === fieldId
          );

        if (!currentField) {
          setError(
            "لم يتم العثور على المجال."
          );

          return;
        }

        setField(currentField);

        // --------------------------------------
        // LOAD LECTURES
        // --------------------------------------

        const lecturesResponse =
          await fetch(
            `/api/lectures?stage=${encodeURIComponent(
              stageId
            )}&field=${encodeURIComponent(
              fieldId
            )}`
          );

        if (!lecturesResponse.ok) {
          throw new Error(
            "Failed to load lectures"
          );
        }

        const lecturesData =
          await lecturesResponse.json();

        setLectures(lecturesData);
      } catch (error) {
        setError(
          "حدث خطأ أثناء تحميل المحاضرات."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFieldPage();
  }, [stageId, fieldId]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredLectures =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      if (!search) {
        return lectures;
      }

      return lectures.filter(
        (lecture) => {
          const title =
            lecture.title
              ?.toLowerCase() || "";

          const description =
            lecture.description
              ?.toLowerCase() || "";

          return (
            title.includes(search) ||
            description.includes(search)
          );
        }
      );
    }, [lectures, searchTerm]);

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
          جاري تحميل المحاضرات...
        </h2>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (
    error ||
    !stage ||
    !field
  ) {
    return (
      <div
        className="page-state"
        dir="rtl"
      >
        <h2>
          {error ||
            "لم يتم العثور على المحتوى."}
        </h2>

        <button
          onClick={() =>
            navigate(
              `/stage/${stageId}/curriculum`
            )
          }
        >
          العودة إلى المناهج
        </button>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="field-page"
      dir="rtl"
    >
      {/* HERO */}

      <section className="field-hero">
        <button
          className="back-link"
          onClick={() =>
            navigate(
              `/stage/${stageId}/curriculum`
            )
          }
        >
          ← العودة إلى المناهج
        </button>

        <span className="section-label">
          {stage.name}
        </span>

        <h1>
          {field.name}
        </h1>

        <p>
          {field.description ||
            "المحاضرات والمحتوى التدريبي الخاص بهذا المجال."}
        </p>
      </section>

      {/* CONTENT */}

      <section className="field-content">

        {/* TITLE + SEARCH */}

        <div className="field-toolbar">
          <div>
            <span className="section-label">
              المحتوى التدريبي
            </span>

            <h2>
              المحاضرات
            </h2>

            <p>
              {lectures.length} محاضرة
            </p>
          </div>

          <div className="lecture-search">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="ابحث عن محاضرة..."
              aria-label="البحث عن محاضرة"
            />
          </div>
        </div>

        {/* NO LECTURES */}

        {lectures.length === 0 ? (
          <div className="empty-state">
            <h3>
              لا توجد محاضرات متاحة حاليًا
            </h3>

            <p>
              سيتم إضافة المحتوى قريبًا.
            </p>
          </div>
        ) : filteredLectures.length ===
          0 ? (
          <div className="empty-state">
            <h3>
              لا توجد نتائج
            </h3>

            <p>
              جرّب البحث بكلمة أخرى.
            </p>
          </div>
        ) : (
          /* LECTURES */

          <div className="lectures-list">
            {filteredLectures.map(
              (lecture, index) => (
                <article
                  className="lecture-card"
                  key={lecture.id}
                  onClick={() =>
                    navigate(
                      `/stage/${stageId}/curriculum/${fieldId}/lecture/${lecture.slug}`
                    )
                  }
                >
                  <div className="lecture-number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <div className="lecture-info">
                    <span>
                      {field.name}
                    </span>

                    <h3>
                      {lecture.title}
                    </h3>

                    {lecture.description && (
                      <p>
                        {
                          lecture.description
                        }
                      </p>
                    )}

                    {lecture.updated_date && (
                      <small>
                        آخر تحديث:{" "}
                        {
                          lecture.updated_date
                        }
                      </small>
                    )}
                  </div>

                  <div className="lecture-arrow">
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

export default FieldPage;