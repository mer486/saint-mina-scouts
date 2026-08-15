import { useNavigate, useParams } from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";

import { scoutsData } from "../data/scoutsData";

function StagePage() {
  const { stageId } = useParams();

  const navigate = useNavigate();

const stage = scoutsData[stageId];

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
    <div className="website stage-page">
      <header className="navbar stage-navbar">
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
              onClick={() => {
                navigate("/");

                setTimeout(() => {
                  document
                    .getElementById("stages")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }, 100);
              }}
            >
              المراحل
            </button>
          </nav>

          <button
            className="back-home-button"
            onClick={() => navigate("/")}
          >
            العودة للرئيسية
          </button>
        </div>
      </header>

      <main>
        <section className="stage-hero">
          <div className="stage-hero-overlay"></div>

          <div className="stage-hero-content">
            <span className="stage-hero-label">
              المراحل الكشفية
            </span>

            <h2>مرحلة {stage.name}</h2>

            <p>
              تعرف على المرحلة ودليل القائد والمناهج
              التدريبية الخاصة بها.
            </p>
          </div>
        </section>

        <section className="stage-intro-section">
          <div className="stage-content-container">
            <div className="stage-section-heading">
              <span>عن المرحلة</span>

              <h2>
                نبذة عن مرحلة {stage.name}
              </h2>
            </div>

            <div className="stage-intro-card">
              <p>{stage.intro}</p>
            </div>
          </div>
        </section>

        <section className="leader-guide-section">
          <div className="stage-content-container">
            <div className="leader-guide-card">
              <div className="leader-guide-content">
                <span className="guide-small-title">
                  دليل القائد
                </span>

                <h2>{stage.leaderGuide.title}</h2>

                <p>
  الدليل المرجعي الخاص بقائد المرحلة،
  ويمكن عرضه مباشرة أو تحميله للاستخدام
  عند الحاجة.
</p>

<span className="guide-updated-date">
  آخر تحديث: {stage.leaderGuide.updatedAt}
</span>

                <div className="leader-guide-actions">
                  <a
  href={stage.leaderGuide.pdfUrl}
  target="_blank"
  rel="noreferrer"
  className="guide-primary-button"
>
  عرض الدليل
</a>

<a
  href={stage.leaderGuide.pdfUrl}
  download={`${stage.leaderGuide.title}.pdf`}
  className="guide-secondary-button"
>
  تحميل الدليل
</a>
                </div>
              </div>

              <div className="guide-document-preview">
                <div className="document-icon">
                  PDF
                </div>

                <span>دليل القائد</span>
              </div>
            </div>
          </div>
        </section>

        <section className="stage-curriculum-section">
          <div className="stage-content-container">
            <div className="curriculum-callout">
              <span>المحتوى التدريبي</span>

              <h2>
                مناهج مرحلة {stage.name}
              </h2>

              <p>
                استعرض المجالات والمحاضرات والمحتوى
                التدريبي الخاص بهذه المرحلة.
              </p>

              <button
  className="curriculum-button"
  onClick={() =>
    navigate(
      `/stage/${stageId}/curriculum`
    )
  }
>
  استعرض المناهج

  <span>←</span>
</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StagePage;