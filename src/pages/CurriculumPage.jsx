import { useNavigate, useParams } from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";

import { scoutsData } from "../data/scoutsData";



function CurriculumPage() {
  const { stageId } = useParams();

  const navigate = useNavigate();

const stage = scoutsData[stageId];

const fields = stage
  ? Object.values(stage.fields)
  : [];


  if (!stage) {
    return (
      <div className="not-found-page">
        <h1>المرحلة غير موجودة</h1>

        <button onClick={() => navigate("/")}>
          العودة إلى الرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="website curriculum-page">
      <header className="navbar curriculum-navbar">
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
          </nav>

          <button
            className="back-home-button"
            onClick={() =>
              navigate(`/stage/${stageId}`)
            }
          >
            العودة للمرحلة
          </button>
        </div>
      </header>

      <main>
        <section className="curriculum-hero">
          <div className="curriculum-hero-overlay"></div>

          <div className="curriculum-hero-content">
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

              <strong>المناهج</strong>
            </div>

            <span className="curriculum-hero-label">
              المحتوى التدريبي
            </span>

            <h2>
              مناهج مرحلة {stage.name}
            </h2>

            <p>
              اختر المجال الذي تريد استعراضه للوصول
              إلى المحاضرات والمحتوى التدريبي الخاص به.
            </p>
          </div>
        </section>

        <section className="fields-section">
          <div className="fields-container">
            <div className="fields-heading">
              <span>المناهج</span>

              <h2>المجالات</h2>

              <p>
                اختر أحد المجالات لاستعراض المحاضرات
                والموضوعات المتاحة داخله.
              </p>
            </div>

            <div className="fields-grid">
              {fields.map((field) => (
                <article
                  className="field-card"
                  key={field.id}
                >
                  <div className="field-icon">
                    {field.icon}
                  </div>

                  <div className="field-content">
                    <span className="field-count">
                      {Object.keys(field.lectures).length} محاضرات
                    </span>

                    <h3>{field.name}</h3>

                    <p>
                      {field.description}
                    </p>

                    <button
                      className="field-button"
                      onClick={() =>
                        navigate(
                          `/stage/${stageId}/curriculum/${field.id}`
                        )
                      }
                    >
                      <span>استعرض المجال</span>

                      <span>←</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CurriculumPage;