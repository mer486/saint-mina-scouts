import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

function StagePage() {
  const navigate = useNavigate();

  const { stageId } =
    useParams();

  const [stage, setStage] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD STAGE FROM D1
  // ==========================================

  useEffect(() => {
    async function loadStage() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch("/api/stages");

        if (!response.ok) {
          throw new Error(
            "Failed to load stages"
          );
        }

        const stages =
          await response.json();

        const currentStage =
          stages.find(
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
      } catch (error) {
        setError(
          "حدث خطأ أثناء تحميل بيانات المرحلة."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStage();
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
          جاري تحميل المرحلة...
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

  const leaderGuidePdf =
    stage.leader_guide_pdf_key || "";

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="stage-page"
      dir="rtl"
    >
      {/* ======================================
          HERO
      ====================================== */}

      <section className="stage-hero">

        <button
          className="back-link"
          onClick={() =>
            navigate("/")
          }
        >
          ← العودة للرئيسية
        </button>

        <span className="section-label">
          المرحلة
        </span>

        <h1>
          {stage.name}
        </h1>

        {stage.description && (
          <p>
            {stage.description}
          </p>
        )}

      </section>

      {/* ======================================
          INTRODUCTION
      ====================================== */}

      <section className="stage-section">

        <div className="section-heading">
          <div>
            <span>
              تعرف على المرحلة
            </span>

            <h2>
              نبذة عن المرحلة
            </h2>
          </div>
        </div>

        <div className="stage-intro-card">

          {stage.image_url && (
            <div className="stage-intro-image">
              <img
                src={stage.image_url}
                alt={stage.name}
              />
            </div>
          )}

          <div className="stage-intro-content">

            {stage.intro ? (
              <p>
                {stage.intro}
              </p>
            ) : (
              <p>
                سيتم إضافة نبذة المرحلة قريبًا.
              </p>
            )}

          </div>

        </div>

      </section>

      {/* ======================================
          LEADER GUIDE
      ====================================== */}

      <section className="stage-section">

        <div className="section-heading">
          <div>
            <span>
              للقادة
            </span>

            <h2>
              {stage.leader_guide_title ||
                "دليل القائد"}
            </h2>
          </div>
        </div>

        <div className="leader-guide-card">

          <div className="leader-guide-info">

            <div className="leader-guide-icon">
              PDF
            </div>

            <div>
              <h3>
                {stage.leader_guide_title ||
                  "دليل القائد"}
              </h3>

              <p>
                الدليل الخاص بقادة مرحلة{" "}
                {stage.name}
              </p>

              {stage.leader_guide_updated_at && (
                <small>
                  آخر تحديث:{" "}
                  {
                    stage.leader_guide_updated_at
                  }
                </small>
              )}
            </div>

          </div>

          {leaderGuidePdf ? (
            <div className="leader-guide-actions">

              <a
                href={leaderGuidePdf}
                target="_blank"
                rel="noreferrer"
                className="lecture-open-button"
              >
                فتح الدليل
              </a>

              <a
                href={leaderGuidePdf}
                download
                className="lecture-download-button"
              >
                تحميل PDF
              </a>

            </div>
          ) : (
            <span className="guide-unavailable">
              سيتم إضافة الدليل قريبًا
            </span>
          )}

        </div>

      </section>

      {/* ======================================
          CURRICULUM
      ====================================== */}

      <section className="stage-section stage-curriculum-section">

        <div className="stage-curriculum-card">

          <div>
            <span className="section-label">
              المحتوى التدريبي
            </span>

            <h2>
              المناهج
            </h2>

            <p>
              استعرض المجالات والمحاضرات
              الخاصة بمرحلة {stage.name}.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate(
                `/stage/${stage.slug}/curriculum`
              )
            }
          >
            عرض المناهج
          </button>

        </div>

      </section>

    </div>
  );
}

export default StagePage;