import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";

function CurriculumPage() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] =
    useState(null);

  const [fields, setFields] =
    useState([]);

  const [lectureCounts, setLectureCounts] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCurriculum() {
      try {
        setLoading(true);
        setError("");

        // ==============================
        // LOAD STAGE
        // ==============================

        const stagesResponse =
          await fetch("/api/stages");

        if (!stagesResponse.ok) {
          throw new Error(
            "Failed to load stages"
          );
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

        // ==============================
        // LOAD FIELDS
        // ==============================

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

        // ==============================
        // LOAD LECTURE COUNTS
        // ==============================

        const countResults =
          await Promise.all(
            fieldsData.map(
              async (field) => {
                try {
                  const response =
                    await fetch(
                      `/api/lectures?stage=${encodeURIComponent(
                        stageId
                      )}&field=${encodeURIComponent(
                        field.slug
                      )}`
                    );

                  if (!response.ok) {
                    return [
                      field.slug,
                      0,
                    ];
                  }

                  const lectures =
                    await response.json();

                  return [
                    field.slug,
                    lectures.length,
                  ];
                } catch {
                  return [
                    field.slug,
                    0,
                  ];
                }
              }
            )
          );

        setLectureCounts(
          Object.fromEntries(
            countResults
          )
        );
      } catch (error) {
        console.error(error);

        setError(
          "حدث خطأ أثناء تحميل المناهج"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCurriculum();
  }, [stageId]);

  if (loading) {
    return (
      <div className="not-found-page">
        <h1>
          جاري تحميل المناهج...
        </h1>
      </div>
    );
  }

  if (error || !stage) {
    return (
      <div className="not-found-page">

        <h1>
          {error ||
            "المرحلة غير موجودة"}
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
    <div className="website curriculum-page">

      {/* ==============================
          ORIGINAL NAVBAR
      ============================== */}

      <header className="navbar curriculum-navbar">

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

          </nav>

          <button
            className="back-home-button"
            onClick={() =>
              navigate(
                `/stage/${stage.slug}`
              )
            }
          >
            العودة للمرحلة
          </button>

        </div>

      </header>

      <main>

        {/* ==============================
            ORIGINAL HERO
        ============================== */}

        <section className="curriculum-hero">

          <div className="curriculum-hero-overlay" />

          <div className="curriculum-hero-content">

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

              <strong>
                المناهج
              </strong>

            </div>

            <span className="curriculum-hero-label">
              المحتوى التدريبي
            </span>

            <h2>
              مناهج مرحلة {stage.name}
            </h2>

            <p>
              اختر المجال الذي تريد استعراضه
              للوصول إلى المحاضرات والمحتوى
              التدريبي الخاص به.
            </p>

          </div>

        </section>

        {/* ==============================
            ORIGINAL FIELDS DESIGN
        ============================== */}

        <section className="fields-section">

          <div className="fields-container">

            <div className="fields-heading">

              <span>
                المناهج
              </span>

              <h2>
                المجالات
              </h2>

              <p>
                اختر أحد المجالات لاستعراض
                المحاضرات والموضوعات المتاحة
                داخله.
              </p>

            </div>

            {fields.length > 0 ? (

              <div className="fields-grid">

                {fields.map(
                  (field) => (

                    <article
                      className="field-card"
                      key={field.id}
                    >

                      <div className="field-icon">
                        {field.icon ||
                          "✦"}
                      </div>

                      <div className="field-content">

                        <span className="field-count">
                          {lectureCounts[
                            field.slug
                          ] ?? 0}{" "}
                          محاضرات
                        </span>

                        <h3>
                          {field.name}
                        </h3>

                        <p>
                          {field.description ||
                            "استعرض المحاضرات والمحتوى التدريبي الخاص بهذا المجال."}
                        </p>

                        <button
                          className="field-button"
                          onClick={() =>
                            navigate(
                              `/stage/${stage.slug}/curriculum/${field.slug}`
                            )
                          }
                        >
                          <span>
                            استعرض المجال
                          </span>

                          <span>
                            ←
                          </span>
                        </button>

                      </div>

                    </article>

                  )
                )}

              </div>

            ) : (

              <div className="lectures-empty-state">

                <span>✦</span>

                <h3>
                  لا توجد مجالات متاحة
                </h3>

                <p>
                  سيتم إضافة محتوى هذه المرحلة
                  قريبًا.
                </p>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default CurriculumPage;