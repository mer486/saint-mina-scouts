import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";
import { scoutsData } from "../data/scoutsData";

function FieldPage() {
  const { stageId, fieldId } = useParams();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const stage = scoutsData[stageId];

  const field = stage?.fields?.[fieldId];

  const lectures = field
    ? Object.values(field.lectures)
    : [];

  const filteredLectures = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return lectures;
    }

    return lectures.filter((lecture) =>
      lecture.title.toLowerCase().includes(term)
    );
  }, [searchTerm, lectures]);

  if (!stage || !field) {
    return (
      <div className="not-found-page">
        <h1>المحتوى غير موجود</h1>

        <button onClick={() => navigate("/")}>
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
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="شعار كشافة كنيسة مارمينا"
              className="brand-logo"
            />

            <div className="brand-text">
              <h1>كشافة كنيسة مارمينا</h1>

              <span>Saint Mina Scouts</span>
            </div>
          </button>

          <nav className="nav-links stage-nav-links">
            <button onClick={() => navigate("/")}>
              الرئيسية
            </button>

            <button
              onClick={() =>
                navigate(`/stage/${stageId}`)
              }
            >
              مرحلة {stage.name}
            </button>

            <button
              onClick={() =>
                navigate(
                  `/stage/${stageId}/curriculum`
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
                `/stage/${stageId}/curriculum`
              )
            }
          >
            العودة للمجالات
          </button>
        </div>
      </header>

      <main>
        <section className="field-hero">
          <div className="field-hero-overlay"></div>

          <div className="field-hero-content">
            <div className="breadcrumb">
              <button onClick={() => navigate("/")}>
                الرئيسية
              </button>

              <span>←</span>

              <button
                onClick={() =>
                  navigate(`/stage/${stageId}`)
                }
              >
                {stage.name}
              </button>

              <span>←</span>

              <button
                onClick={() =>
                  navigate(
                    `/stage/${stageId}/curriculum`
                  )
                }
              >
                المناهج
              </button>

              <span>←</span>

              <strong>{field.name}</strong>
            </div>

            <span className="field-hero-label">
              مناهج مرحلة {stage.name}
            </span>

            <h2>{field.name}</h2>

            <p>{field.description}</p>
          </div>
        </section>

        <section className="lectures-section">
          <div className="lectures-container">
            <div className="lectures-heading">
              <span>المحتوى التدريبي</span>

              <h2>المحاضرات</h2>

              <p>
                اختر المحاضرة التي تريد عرضها أو تحميل
                الملف الخاص بها.
              </p>
            </div>

            <div className="lectures-search">
              <span>⌕</span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="ابحث داخل محاضرات هذا المجال..."
              />
            </div>

            <div className="lectures-list">
              {filteredLectures.length > 0 ? (
                filteredLectures.map(
                  (lecture, index) => (
                    <article
                      className="lecture-card"
                      key={lecture.id}
                    >
                      <div className="lecture-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="lecture-info">
                        <span className="lecture-type">
                          محاضرة
                        </span>

                        <h3>{lecture.title}</h3>

                        <p>
                          آخر تحديث:{" "}
                          {lecture.updatedAt}
                        </p>
                      </div>

                      <div className="lecture-actions">
                        <button
                          className="lecture-view-button"
                          onClick={() =>
                            navigate(
                              `/stage/${stageId}/curriculum/${fieldId}/lecture/${lecture.id}`
                            )
                          }
                        >
                          عرض المحاضرة
                        </button>

                        <a
                          href={lecture.pdfUrl}
                          download={`${lecture.title}.pdf`}
                          className="lecture-download-button"
                        >
                          تحميل PDF
                        </a>
                      </div>
                    </article>
                  )
                )
              ) : (
                <div className="lectures-empty-state">
                  <span>⌕</span>

                  <h3>
                    لا توجد محاضرات مطابقة
                  </h3>

                  <p>
                    جرّب البحث بكلمة أخرى.
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