import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";

function FieldPage() {
  const { stageId, fieldId } =
    useParams();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [stage, setStage] =
    useState(null);

  const [field, setField] =
    useState(null);

  const [lectures, setLectures] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadField() {
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

        // Load fields
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

        const lecturesData =
          await lecturesResponse.json();

        setLectures(lecturesData);
      } catch (error) {
        console.error(error);

        setError(
          "حدث خطأ أثناء تحميل المحتوى"
        );
      } finally {
        setLoading(false);
      }
    }

    loadField();
  }, [stageId, fieldId]);

  const filteredLectures =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return lectures;
      }

      return lectures.filter(
        (lecture) =>
          lecture.title
            .toLowerCase()
            .includes(term)
      );
    }, [searchTerm, lectures]);

  if (loading) {
    return (
      <div className="not-found-page">
        <h1>
          جاري تحميل المحاضرات...
        </h1>
      </div>
    );
  }

  if (
    error ||
    !stage ||
    !field
  ) {
    return (
      <div className="not-found-page">
        <h1>
          {error ||
            "المحتوى غير موجود"}
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

  return (
    <div className="website field-page">

      <header className="navbar field-navbar">
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
                `/stage/${stage.slug}/curriculum`
              )
            }
          >
            العودة للمجالات
          </button>

        </div>
      </header>

      <main>

        <section className="field-hero">

          <div className="field-hero-overlay" />

          <div className="field-hero-content">

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

              <strong>
                {field.name}
              </strong>

            </div>

            <span className="field-hero-label">
              مناهج مرحلة {stage.name}
            </span>

            <h2>
              {field.name}
            </h2>

            <p>
              {field.description ||
                "المحتوى التدريبي الخاص بهذا المجال."}
            </p>

          </div>

        </section>

        <section className="lectures-section">

          <div className="lectures-container">

            <div className="lectures-heading">

              <span>
                المحتوى التدريبي
              </span>

              <h2>
                المحاضرات
              </h2>

              <p>
                اختر المحاضرة التي تريد عرضها
                أو تحميل الملف الخاص بها.
              </p>

            </div>

            <div className="lectures-search">

              <span>⌕</span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="ابحث داخل محاضرات هذا المجال..."
              />

            </div>

            <div className="lectures-list">

              {filteredLectures.length >
              0 ? (

                filteredLectures.map(
                  (lecture, index) => {

                    const pdfUrl =
                      lecture.pdf_key ||
                      "";

                    return (
                      <article
                        className="lecture-card"
                        key={lecture.id}
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

                          <span className="lecture-type">
                            محاضرة
                          </span>

                          <h3>
                            {lecture.title}
                          </h3>

                          <p>
                            {lecture.updated_date
                              ? `آخر تحديث: ${lecture.updated_date}`
                              : "ملف تدريبي"}
                          </p>

                        </div>

                        <div className="lecture-actions">

                          <button
                            className="lecture-view-button"
                            onClick={() =>
                              navigate(
                                `/stage/${stage.slug}/curriculum/${field.slug}/lecture/${lecture.slug}`
                              )
                            }
                          >
                            عرض المحاضرة
                          </button>

                          {pdfUrl && (
                            <a
                              href={pdfUrl}
                              download={`${lecture.title}.pdf`}
                              className="lecture-download-button"
                            >
                              تحميل PDF
                            </a>
                          )}

                        </div>

                      </article>
                    );
                  }
                )

              ) : (

                <div className="lectures-empty-state">

                  <span>⌕</span>

                  <h3>
                    {searchTerm.trim()
                      ? "لا توجد محاضرات مطابقة"
                      : "لا توجد محاضرات متاحة حاليًا"}
                  </h3>

                  <p>
                    {searchTerm.trim()
                      ? "جرّب البحث بكلمة أخرى."
                      : "سيتم إضافة المحاضرات قريبًا."}
                  </p>

                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default FieldPage;