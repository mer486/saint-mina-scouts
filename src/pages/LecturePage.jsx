import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function LecturePage() {
  const navigate = useNavigate();

  const {
    stageId,
    fieldId,
    lectureId,
  } = useParams();

  const [stage, setStage] =
    useState(null);

  const [field, setField] =
    useState(null);

  const [lecture, setLecture] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD LECTURE FROM D1
  // ==========================================

  useEffect(() => {
    async function loadLecture() {
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
        // LOAD FIELD
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

        const currentLecture =
          lecturesData.find(
            (item) =>
              item.slug === lectureId
          );

        if (!currentLecture) {
          setError(
            "لم يتم العثور على المحاضرة."
          );
          return;
        }

        setLecture(currentLecture);
      } catch (error) {
        setError(
          "حدث خطأ أثناء تحميل المحاضرة."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLecture();
  }, [
    stageId,
    fieldId,
    lectureId,
  ]);

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
          جاري تحميل المحاضرة...
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
    !field ||
    !lecture
  ) {
    return (
      <div
        className="page-state"
        dir="rtl"
      >
        <h2>
          {error ||
            "لم يتم العثور على المحاضرة."}
        </h2>

        <button
          onClick={() =>
            navigate(
              `/stage/${stageId}/curriculum/${fieldId}`
            )
          }
        >
          العودة إلى المحاضرات
        </button>
      </div>
    );
  }

  const pdfUrl =
    lecture.pdf_key || "";

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="lecture-page"
      dir="rtl"
    >
      {/* HERO */}

      <section className="lecture-hero">

        <button
          className="back-link"
          onClick={() =>
            navigate(
              `/stage/${stageId}/curriculum/${fieldId}`
            )
          }
        >
          ← العودة إلى المحاضرات
        </button>

        <div className="lecture-breadcrumb">
          <span>
            {stage.name}
          </span>

          <span>•</span>

          <span>
            {field.name}
          </span>
        </div>

        <h1>
          {lecture.title}
        </h1>

        {lecture.description && (
          <p>
            {lecture.description}
          </p>
        )}

        {lecture.updated_date && (
          <div className="lecture-updated">
            آخر تحديث:{" "}
            {lecture.updated_date}
          </div>
        )}
      </section>

      {/* PDF CONTENT */}

      <section className="lecture-content">

        <div className="lecture-content-heading">
          <div>
            <span className="section-label">
              المحتوى التدريبي
            </span>

            <h2>
              ملف المحاضرة
            </h2>
          </div>

          {pdfUrl && (
            <div className="lecture-actions">

              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="lecture-open-button"
              >
                فتح بالحجم الكامل
              </a>

              <a
                href={pdfUrl}
                download={
                  lecture.pdf_original_name ||
                  `${lecture.title}.pdf`
                }
                className="lecture-download-button"
              >
                تحميل PDF
              </a>

            </div>
          )}
        </div>

        {!pdfUrl ? (
          <div className="empty-state">
            <h3>
              ملف المحاضرة غير متاح حاليًا
            </h3>

            <p>
              سيتم إضافة ملف PDF قريبًا.
            </p>
          </div>
        ) : (
          <div className="pdf-viewer-wrapper">
            <iframe
              src={pdfUrl}
              title={lecture.title}
              className="pdf-viewer"
            />
          </div>
        )}

      </section>
    </div>
  );
}

export default LecturePage;