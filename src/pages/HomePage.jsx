import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/saint-mina-logo.jpg";

import {
  scoutsData,
  stagesList,
} from "../data/scoutsData";

function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useMemo(() => {
  const term = searchTerm.trim().toLowerCase();

  if (!term) {
    return [];
  }

  const results = [];

  Object.values(scoutsData).forEach((stage) => {
    if (
      stage.name.toLowerCase().includes(term)
    ) {
      results.push({
        type: "stage",
        title: stage.name,
        subtitle: "مرحلة كشفية",
        path: `/stage/${stage.id}`,
      });
    }

    Object.values(stage.fields).forEach((field) => {
      if (
        field.name.toLowerCase().includes(term)
      ) {
        results.push({
          type: "field",
          title: field.name,
          subtitle: `مرحلة ${stage.name}`,
          path: `/stage/${stage.id}/curriculum/${field.id}`,
        });
      }

      Object.values(field.lectures).forEach(
        (lecture) => {
          if (
            lecture.title
              .toLowerCase()
              .includes(term)
          ) {
            results.push({
              type: "lecture",
              title: lecture.title,
              subtitle: `${stage.name} • ${field.name}`,
              path: `/stage/${stage.id}/curriculum/${field.id}/lecture/${lecture.id}`,
            });
          }
        }
      );
    });
  });

  return results.slice(0, 8);
}, [searchTerm]);

  const scrollToStages = () => {
    document
      .getElementById("stages")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="website">
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand">
            <img
              src={logo}
              alt="شعار كشافة كنيسة مارمينا"
              className="brand-logo"
            />

            <div className="brand-text">
              <h1>كشافة كنيسة مارمينا</h1>
              <span>Saint Mina Scouts</span>
            </div>
          </div>

          <nav className="nav-links">
            <a href="#home">الرئيسية</a>
            <a href="#stages">المراحل</a>
            <a href="#about">عن الكشافة</a>
            <a href="#contact">تواصل معنا</a>
          </nav>

          <button
            className="search-icon-button"
            aria-label="بحث"
          >
            <span>⌕</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-overlay"></div>

          <div className="hero-content">
            <div className="hero-badge">
              كشافة كنيسة مارمينا
            </div>

            <h2>
              المحتوى التدريبي
              <span> لمناهج المراحل</span>
            </h2>

            <p className="hero-description">
              منصة متكاملة للوصول إلى المناهج والمحتوى
              التدريبي المحدث لكل مرحلة كشفية بسهولة
              وتنظيم.
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

        <section className="floating-search-wrapper">
          <div className="floating-search">
            <div className="search-field">
              <span className="search-symbol">⌕</span>

              <input
  type="text"
  value={searchTerm}
  onChange={(event) =>
    setSearchTerm(event.target.value)
  }
  placeholder="ابحث عن مرحلة، مجال أو محاضرة..."
/>
            </div>

            <button
  className="search-button"
  onClick={() => {
    if (searchResults.length > 0) {
      navigate(searchResults[0].path);
    }
  }}
>
  بحث
</button>
          </div>
          {searchTerm.trim() && (
  <div className="search-results-panel">
    {searchResults.length > 0 ? (
      searchResults.map((result, index) => (
        <button
          key={`${result.type}-${index}`}
          className="search-result-item"
          onClick={() =>
            navigate(result.path)
          }
        >
          <div>
            <strong>{result.title}</strong>

            <span>{result.subtitle}</span>
          </div>

          <span className="search-result-arrow">
            ←
          </span>
        </button>
      ))
    ) : (
      <div className="no-search-results">
        لا توجد نتائج مطابقة
      </div>
    )}
  </div>
)}
        </section>

        <section
          className="stages-section"
          id="stages"
        >
          <div className="section-heading">
            <span>المحتوى الكشفي</span>

            <h2>المراحل الكشفية</h2>

            <p>
              اختر المرحلة للوصول إلى نبذة المرحلة،
              دليل القائد والمناهج الخاصة بها.
            </p>
          </div>

          <div className="stages-grid">
            {stagesList.map((stage) => (
              <article
                className="stage-card"
                key={stage.id}
              >
                <div className="stage-image-wrapper">
                  <img
                    src={stage.image}
                    alt={`مرحلة ${stage.name}`}
                    className="stage-image"
                  />

                  <div className="stage-image-overlay"></div>

                  <span className="stage-label">
                    مرحلة كشفية
                  </span>
                </div>

                <div className="stage-card-content">
                  <h3>{stage.name}</h3>

                  <p>{stage.description}</p>

                  <button
                    className="stage-button"
                    onClick={() =>
                      navigate(`/stage/${stage.id}`)
                    }
                  >
                    <span>استعرض المرحلة</span>

                    <span className="stage-arrow">
                      ←
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;