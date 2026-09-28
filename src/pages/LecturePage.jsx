import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";

function LecturePage() {
  const {
    stageId,
    fieldId,
    lectureId,
  } = useParams();

  const navigate = useNavigate();

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

  useEffect(() => {
    async function loadLecture() {
      try {
        setLoading(true);
        setError("");

        // Load stage
        const stagesResponse =
          await fetch("/api/stages");

        if (!stagesResponse.ok) {
          throw new Error();
        }

        const stages =
          await stagesResponse.json();

        const currentStage =
          stages.find(
            (item) =>
              item.slug === stageId
          );

        if (!currentStage) {
          setError(
            "المرحلة غير موجودة"
          );
          return;
        }

        setStage(currentStage);

        // Load field
        const fieldsResponse =
          await fetch(
            `/api/fields?stage=${encodeURIComponent(
              stageId
            )}`
          );

        if (!fieldsResponse.ok) {
          throw new Error();
        }

        const fields =
          await fieldsResponse.json();

        const currentField =
          fields.find(
            (item) =>
              item.slug === fieldId
          );

        if (!currentField) {
          setError(
            "المجال غير موجود"
          );
          return;
        }

        setField(currentField);

        // Load lectures
        const lecturesResponse =
          await fetch(
            `/api/lectures?stage=${encodeURIComponent(
              stageId
            )}&field=${encodeURIComponent(
              fieldId
            )}`
          );

        if (!lecturesResponse.ok) {
          throw new Error();
        }

        const lectures =
          await lecturesResponse.json();

        const currentLecture =
          lectures.find(
            (item) =>
              item.slug === lectureId
          );

        if (!currentLecture) {
          setError(
            "المحاضرة غير موجودة"
          );
          return;
        }

        setLecture(currentLecture);
      } catch (error) {
        console.error(error);

        setError(
          "حدث خطأ أثناء تحميل المحاضرة"
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

  if (loading) {
    return (
      <div className="not-found-page">
        <h1>
          جاري تحميل المحاضرة...
        </h1>
      </div>
    );
  }

  if (
    error ||
    !stage ||
    !field ||
    !lecture
  ) {
    return (
      <div className="not-found-page">

        <h1>
          {error ||
            "المحاضرة غير موجودة"}
        </h1>

        <button
          onClick={() =>
            navigate("/")
          }
        >
          العودة إلى الرئيسية
        </button>

      </div>
    );
  }

  const pdfUrl =
    lecture.pdf_key || "";

  const updatedDate =
    lecture.updated_date || "";

  return (
    <div className="website lecture-page">

      <header className="navbar lecture-navbar">

        <div className="navbar-container">

          <button
            className="brand brand-button"
            onClick={() =>
              navigate("/")
            }
          >
            <img
              src={logo}
              alt="شعار كشافة كنيسة مارمينا"
              className="brand-logo"
            />

            <div className="brand-text">
              <h1>
                كشافة كنيسة مارمينا
              </h1>

              <span>
                Saint Mina Scouts
              </span>
            </div>
          </button>

          <nav className="nav-links stage-nav-links">

            <button
              onClick={() =>
                navigate("/")
              }
            >
              الرئيسية
            </button>

            <button
              onClick={() =>
                navigate(
                  `/stage/${stage.slug}`
                )
              }
            >
              مرحلة {stage.name}
            </button>

            <button
              onClick={() =>
                navigate(
                  `/stage/${stage.slug}/curriculum`
                )
              }
            >
              المناهج
            </button>

          </nav>

          <button
            className="back-home-button"
            onClick={() =>
              navigate(
                `/stage/${stage.slug}/curriculum/${field.slug}`
              )
            }
          >
            العودة للمحاضرات
          </button>

        </div>

      </header>

      <main>

        <section className="lecture-hero">

          <div className="lecture-hero-overlay" />

          <div className="lecture-hero-content">

            <div className="breadcrumb">

              <button
                onClick={() =>
                  navigate("/")
                }
              >
                الرئيسية
              </button>

              <span>←</span>

              <button
                onClick={() =>
                  navigate(
                    `/stage/${stage.slug}`
                  )
                }
              >
                {stage.name}
              </button>

              <span>←</span>

              <button
                onClick={() =>
                  navigate(
                    `/stage/${stage.slug}/curriculum`
                  )
                }
              >
                المناهج
              </button>

              <span>←</span>

              <button
                onClick={() =>
                  navigate(
                    `/stage/${stage.slug}/curriculum/${field.slug}`
                  )
                }
              >
                {field.name}
              </button>

              <span>←</span>

              <strong>
                {lecture.title}
              </strong>

            </div>

            <span className="lecture-hero-label">
              {field.name}
            </span>

            <h2>
              {lecture.title}
            </h2>

            <p>
              مرحلة {stage.name}

              {updatedDate && (
                <>
                  <span className="lecture-dot">
                    •
                  </span>

                  آخر تحديث:{" "}
                  {updatedDate}
                </>
              )}
            </p>

          </div>

        </section>

        <section className="lecture-document-section">

          <div className="lecture-document-container">

            <div className="lecture-document-header">

              <div>

                <span className="document-small-label">
                  الملف التدريبي
                </span>

                <h2>
                  {lecture.title}
                </h2>

                <p>
                  {lecture.description ||
                    "يمكنك قراءة المحاضرة مباشرة من خلال الموقع أو تحميل الملف على جهازك."}
                </p>

              </div>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`${lecture.title}.pdf`}
                  className="main-download-button"
                >
                  <span>
                    تحميل PDF
                  </span>

                  <span className="download-icon">
                    ↓
                  </span>
                </a>
              )}

            </div>

            {pdfUrl ? (

              <div className="pdf-viewer-card">

                <div className="pdf-viewer-topbar">

                  <div className="pdf-file-info">

                    <div className="mini-pdf-icon">
                      PDF
                    </div>

                    <div>

                      <strong>
                        {lecture.title}
                      </strong>

                      <span>
                        {updatedDate
                          ? `آخر تحديث: ${updatedDate}`
                          : "ملف PDF"}
                      </span>

                    </div>

                  </div>

                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="open-fullscreen-button"
                  >
                    فتح بحجم كامل
                  </a>

                </div>

                <div className="pdf-viewer-wrapper">

                  <iframe
                    src={pdfUrl}
                    title={`ملف محاضرة ${lecture.title}`}
                    className="pdf-viewer"
                  />

                </div>

              </div>

            ) : (

              <div className="lectures-empty-state">

                <span>PDF</span>

                <h3>
                  الملف غير متاح حاليًا
                </h3>

                <p>
                  سيتم إضافة ملف المحاضرة قريبًا.
                </p>

              </div>

            )}

            <div className="lecture-bottom-actions">

              <button
                className="return-to-lectures-button"
                onClick={() =>
                  navigate(
                    `/stage/${stage.slug}/curriculum/${field.slug}`
                  )
                }
              >
                العودة إلى محاضرات{" "}
                {field.name}
              </button>

              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`${lecture.title}.pdf`}
                  className="secondary-download-button"
                >
                  تحميل المحاضرة
                </a>
              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default LecturePage;