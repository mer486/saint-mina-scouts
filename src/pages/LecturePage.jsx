import { useNavigate, useParams } from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";
import { scoutsData } from "../data/scoutsData";





function LecturePage() {
  const { stageId, fieldId, lectureId } = useParams();

  const navigate = useNavigate();

  const stage = scoutsData[stageId];

const field = stage?.fields?.[fieldId];

const lecture = field?.lectures?.[lectureId];

  if (!stage || !field || !lecture) {
    return (
      <div className="not-found-page">
        <h1>المحاضرة غير موجودة</h1>

        <button onClick={() => navigate("/")}>
          العودة إلى الرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="website lecture-page">
      <header className="navbar lecture-navbar">
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
                `/stage/${stageId}/curriculum/${fieldId}`
              )
            }
          >
            العودة للمحاضرات
          </button>
        </div>
      </header>

      <main>
        <section className="lecture-hero">
          <div className="lecture-hero-overlay"></div>

          <div className="lecture-hero-content">
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

              <button
                onClick={() =>
                  navigate(
                    `/stage/${stageId}/curriculum/${fieldId}`
                  )
                }
              >
                {field.name}
              </button>

              <span>←</span>

              <strong>{lecture.title}</strong>
            </div>

            <span className="lecture-hero-label">
              {field.name}
            </span>

            <h2>{lecture.title}</h2>

            <p>
              مرحلة {stage.name}
              <span className="lecture-dot">•</span>
              آخر تحديث: {lecture.updatedAt}
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

                <h2>{lecture.title}</h2>

                <p>
                  يمكنك قراءة المحاضرة مباشرة من خلال
                  الموقع أو تحميل الملف على جهازك.
                </p>
              </div>

              <a
                href={lecture.pdfUrl}
                download={`${lecture.title}.pdf`}
                className="main-download-button"
              >
                <span>تحميل PDF</span>

                <span className="download-icon">
                  ↓
                </span>
              </a>
            </div>

            <div className="pdf-viewer-card">
              <div className="pdf-viewer-topbar">
                <div className="pdf-file-info">
                  <div className="mini-pdf-icon">
                    PDF
                  </div>

                  <div>
                    <strong>{lecture.title}</strong>

                    <span>
                      آخر تحديث: {lecture.updatedAt}
                    </span>
                  </div>
                </div>

                <a
                  href={lecture.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="open-fullscreen-button"
                >
                  فتح بحجم كامل
                </a>
              </div>

              <div className="pdf-viewer-wrapper">
                <iframe
                  src={lecture.pdfUrl}
                  title={`ملف محاضرة ${lecture.title}`}
                  className="pdf-viewer"
                />
              </div>
            </div>

            <div className="lecture-bottom-actions">
              <button
                className="return-to-lectures-button"
                onClick={() =>
                  navigate(
                    `/stage/${stageId}/curriculum/${fieldId}`
                  )
                }
              >
                العودة إلى محاضرات {field.name}
              </button>

              <a
                href={lecture.pdfUrl}
                download={`${lecture.title}.pdf`}
                className="secondary-download-button"
              >
                تحميل المحاضرة
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LecturePage;