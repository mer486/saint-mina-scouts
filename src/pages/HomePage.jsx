import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import logo from "../assets/saint-mina-logo.jpg";

function HomePage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [stages, setStages] =
    useState([]);

  const [searchItems, setSearchItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD CONTENT FROM D1
  // ==========================================

  useEffect(() => {
    async function loadWebsiteContent() {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------
        // 1. Load stages
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

        setStages(stagesData);

        const allSearchItems = [];

        // Add stages to search
        stagesData.forEach((stage) => {
          allSearchItems.push({
            type: "stage",
            title: stage.name,
            subtitle: "مرحلة كشفية",
            path: `/stage/${stage.slug}`,
          });
        });

        // --------------------------------------
        // 2. Load fields for each stage
        // --------------------------------------

        const stageContent =
          await Promise.all(
            stagesData.map(
              async (stage) => {
                try {
                  const response =
                    await fetch(
                      `/api/fields?stage=${encodeURIComponent(
                        stage.slug
                      )}`
                    );

                  if (!response.ok) {
                    return {
                      stage,
                      fields: [],
                    };
                  }

                  const fields =
                    await response.json();

                  return {
                    stage,
                    fields,
                  };
                } catch {
                  return {
                    stage,
                    fields: [],
                  };
                }
              }
            )
          );

        // Add fields to search
        stageContent.forEach(
          ({ stage, fields }) => {
            fields.forEach((field) => {
              allSearchItems.push({
                type: "field",
                title: field.name,
                subtitle:
                  `مرحلة ${stage.name}`,
                path:
                  `/stage/${stage.slug}/curriculum/${field.slug}`,
              });
            });
          }
        );

        // --------------------------------------
        // 3. Load lectures for search
        // --------------------------------------

        const lectureRequests = [];

        stageContent.forEach(
          ({ stage, fields }) => {
            fields.forEach((field) => {
              lectureRequests.push({
                stage,
                field,
              });
            });
          }
        );

        const lectureContent =
          await Promise.all(
            lectureRequests.map(
              async ({
                stage,
                field,
              }) => {
                try {
                  const response =
                    await fetch(
                      `/api/lectures?stage=${encodeURIComponent(
                        stage.slug
                      )}&field=${encodeURIComponent(
                        field.slug
                      )}`
                    );

                  if (!response.ok) {
                    return {
                      stage,
                      field,
                      lectures: [],
                    };
                  }

                  const lectures =
                    await response.json();

                  return {
                    stage,
                    field,
                    lectures,
                  };
                } catch {
                  return {
                    stage,
                    field,
                    lectures: [],
                  };
                }
              }
            )
          );

        lectureContent.forEach(
          ({
            stage,
            field,
            lectures,
          }) => {
            lectures.forEach(
              (lecture) => {
                allSearchItems.push({
                  type: "lecture",
                  title:
                    lecture.title,
                  subtitle:
                    `${stage.name} • ${field.name}`,
                  path:
                    `/stage/${stage.slug}/curriculum/${field.slug}/lecture/${lecture.slug}`,
                });
              }
            );
          }
        );

        setSearchItems(
          allSearchItems
        );
      } catch (error) {
        console.error(error);

        setError(
          "حدث خطأ أثناء تحميل المحتوى."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWebsiteContent();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const searchResults =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return [];
      }

      return searchItems
        .filter((item) =>
          item.title
            .toLowerCase()
            .includes(term)
        )
        .slice(0, 8);
    }, [
      searchTerm,
      searchItems,
    ]);

  const scrollToStages = () => {
    document
      .getElementById("stages")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <div className="website">

      {/* ======================================
          ORIGINAL NAVBAR
      ====================================== */}

      <header className="navbar">

        <div className="navbar-container">

          <div className="brand">

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

          </div>

          <nav className="nav-links">

            <a href="#home">
              الرئيسية
            </a>

            <a href="#stages">
              المراحل
            </a>

            <a href="#about">
              عن الكشافة
            </a>

            <a href="#contact">
              تواصل معنا
            </a>

          </nav>

          <button
            className="search-icon-button"
            aria-label="بحث"
            onClick={() =>
              document
                .querySelector(
                  ".floating-search input"
                )
                ?.focus()
            }
          >
            <span>⌕</span>
          </button>

        </div>

      </header>

      <main>

        {/* ======================================
            ORIGINAL HERO
        ====================================== */}

        <section
          className="hero"
          id="home"
        >

          <div className="hero-overlay"></div>

          <div className="hero-content">

            <div className="hero-badge">
              كشافة كنيسة مارمينا
            </div>

            <h2>
              المحتوى التدريبي
              <span>
                {" "}لمناهج المراحل
              </span>
            </h2>

            <p className="hero-description">
              منصة متكاملة للوصول إلى المناهج
              والمحتوى التدريبي المحدث لكل مرحلة
              كشفية بسهولة وتنظيم.
            </p>

            <button
              className="primary-button"
              onClick={scrollToStages}
            >
              استعرض المناهج

              <span>←</span>
            </button>

            <p className="slogan">
              نساهم في عالم نريد أن ننتمي إليه
            </p>

          </div>

        </section>

        {/* ======================================
            ORIGINAL SEARCH
        ====================================== */}

        <section className="floating-search-wrapper">

          <div className="floating-search">

            <div className="search-field">

              <span className="search-symbol">
                ⌕
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="ابحث عن مرحلة، مجال أو محاضرة..."
              />

            </div>

            <button
              className="search-button"
              onClick={() => {
                if (
                  searchResults.length >
                  0
                ) {
                  navigate(
                    searchResults[0]
                      .path
                  );
                }
              }}
            >
              بحث
            </button>

          </div>

          {searchTerm.trim() && (

            <div className="search-results-panel">

              {searchResults.length >
              0 ? (

                searchResults.map(
                  (
                    result,
                    index
                  ) => (

                    <button
                      key={`${result.type}-${index}`}
                      className="search-result-item"
                      onClick={() =>
                        navigate(
                          result.path
                        )
                      }
                    >

                      <div>

                        <strong>
                          {result.title}
                        </strong>

                        <span>
                          {result.subtitle}
                        </span>

                      </div>

                      <span className="search-result-arrow">
                        ←
                      </span>

                    </button>

                  )
                )

              ) : (

                <div className="no-search-results">
                  لا توجد نتائج مطابقة
                </div>

              )}

            </div>

          )}

        </section>

        {/* ======================================
            ORIGINAL STAGES SECTION
        ====================================== */}

        <section
          className="stages-section"
          id="stages"
        >

          <div className="section-heading">

            <span>
              المحتوى الكشفي
            </span>

            <h2>
              المراحل الكشفية
            </h2>

            <p>
              اختر المرحلة للوصول إلى نبذة
              المرحلة، دليل القائد والمناهج
              الخاصة بها.
            </p>

          </div>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {loading ? (

            <div className="admin-loading">
              جاري تحميل المراحل...
            </div>

          ) : stages.length > 0 ? (

            <div className="stages-grid">

              {stages.map(
                (stage) => (

                  <article
                    className="stage-card"
                    key={stage.id}
                  >

                    <div className="stage-image-wrapper">

                      {stage.image_url ? (

                        <img
                          src={stage.image_url}
                          alt={`مرحلة ${stage.name}`}
                          className="stage-image"
                        />

                      ) : (

                        <div className="stage-image stage-image-placeholder" />

                      )}

                      <div className="stage-image-overlay"></div>

                      <span className="stage-label">
                        مرحلة كشفية
                      </span>

                    </div>

                    <div className="stage-card-content">

                      <h3>
                        {stage.name}
                      </h3>

                      <p>
                        {stage.description ||
                          "استعرض محتوى ومناهج هذه المرحلة الكشفية."}
                      </p>

                      <button
                        className="stage-button"
                        onClick={() =>
                          navigate(
                            `/stage/${stage.slug}`
                          )
                        }
                      >

                        <span>
                          استعرض المرحلة
                        </span>

                        <span className="stage-arrow">
                          ←
                        </span>

                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          ) : (

            <div className="admin-empty">

              <h3>
                لا توجد مراحل متاحة حاليًا
              </h3>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default HomePage;