import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPage() {
  const navigate = useNavigate();

  // ==========================================
  // AUTH
  // ==========================================

  const [checkingAuth, setCheckingAuth] = useState(true);

  // ==========================================
  // MAIN DATA
  // ==========================================

  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] =
    useState("baraem");

  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] =
    useState(null);

  const [lectures, setLectures] = useState([]);

  // fields | lectures
  const [adminView, setAdminView] =
    useState("fields");

  // ==========================================
  // LOADING / ERRORS
  // ==========================================

  const [loadingStages, setLoadingStages] =
    useState(true);

  const [loadingFields, setLoadingFields] =
    useState(true);

  const [loadingLectures, setLoadingLectures] =
    useState(false);

  const [error, setError] = useState("");

    // ==========================================
  // STAGE MANAGEMENT
  // ==========================================

  const [editingStage, setEditingStage] =
    useState(null);

  const [editStageName, setEditStageName] =
    useState("");

  const [
    editStageDescription,
    setEditStageDescription,
  ] = useState("");

  const [
    editStageIntro,
    setEditStageIntro,
  ] = useState("");

  const [
    editStageImage,
    setEditStageImage,
  ] = useState("");

  const [
    editLeaderGuideTitle,
    setEditLeaderGuideTitle,
  ] = useState("");

  const [
    editLeaderGuidePdf,
    setEditLeaderGuidePdf,
  ] = useState("");

  const [
    editLeaderGuideDate,
    setEditLeaderGuideDate,
  ] = useState("");

  const [updatingStage, setUpdatingStage] =
    useState(false);

  // ==========================================
  // ADD FIELD
  // ==========================================

  const [showAddField, setShowAddField] =
    useState(false);

  const [newFieldName, setNewFieldName] =
    useState("");

  const [
    newFieldDescription,
    setNewFieldDescription,
  ] = useState("");

  const [savingField, setSavingField] =
    useState(false);

  // ==========================================
  // EDIT FIELD
  // ==========================================

  const [editingField, setEditingField] =
    useState(null);

  const [editFieldName, setEditFieldName] =
    useState("");

  const [
    editFieldDescription,
    setEditFieldDescription,
  ] = useState("");

  const [updatingField, setUpdatingField] =
    useState(false);

  // ==========================================
  // ADD LECTURE
  // ==========================================

  const [showAddLecture, setShowAddLecture] =
    useState(false);

  const [newLectureTitle, setNewLectureTitle] =
    useState("");

  const [
    newLectureDescription,
    setNewLectureDescription,
  ] = useState("");

  const [newLecturePdf, setNewLecturePdf] =
    useState("");

  const [newLecturePdfFile, setNewLecturePdfFile] =
    useState(null);

  const [newLectureDate, setNewLectureDate] =
    useState("");

  const [savingLecture, setSavingLecture] =
    useState(false);

  // ==========================================
  // EDIT LECTURE
  // ==========================================

  const [editingLecture, setEditingLecture] =
    useState(null);

  const [
    editLectureTitle,
    setEditLectureTitle,
  ] = useState("");

  const [
    editLectureDescription,
    setEditLectureDescription,
  ] = useState("");

  const [
    editLecturePdf,
    setEditLecturePdf,
  ] = useState("");

  const [editLecturePdfFile, setEditLecturePdfFile] =
    useState(null);

  const [
    editLectureDate,
    setEditLectureDate,
  ] = useState("");

  const [updatingLecture, setUpdatingLecture] =
    useState(false);

  // ==========================================
  // AUTH CHECK
  // ==========================================

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(
          "/api/admin/session"
        );

        const data = await response.json();

        if (!data.authenticated) {
          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        setCheckingAuth(false);
      } catch {
        navigate("/admin/login", {
          replace: true,
        });
      }
    }

    checkAuth();
  }, [navigate]);

  // ==========================================
  // LOAD STAGES
  // ==========================================

  useEffect(() => {
    if (checkingAuth) return;

    async function loadStages() {
      try {
        setLoadingStages(true);
        setError("");

        const response = await fetch(
  "/api/admin/stages"
);

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setStages(data);

        if (data.length > 0) {
          setSelectedStage((current) => {
            const exists = data.some(
              (stage) =>
                stage.slug === current
            );

            return exists
              ? current
              : data[0].slug;
          });
        }
      } catch {
        setError(
          "حدث خطأ أثناء تحميل المراحل."
        );
      } finally {
        setLoadingStages(false);
      }
    }

    loadStages();
  }, [checkingAuth]);

    // ==========================================
  // EDIT STAGE
  // ==========================================

  function openEditStage(stage) {
    setEditingStage(stage);

    setEditStageName(
      stage.name || ""
    );

    setEditStageDescription(
      stage.description || ""
    );

    setEditStageIntro(
      stage.intro || ""
    );

    setEditStageImage(
      stage.image_url || ""
    );

    setEditLeaderGuideTitle(
      stage.leader_guide_title ||
        "دليل القائد"
    );

    setEditLeaderGuidePdf(
      stage.leader_guide_pdf_key || ""
    );

    setEditLeaderGuideDate(
      stage.leader_guide_updated_at || ""
    );
  }

  function closeEditStage() {
    if (updatingStage) return;

    setEditingStage(null);
  }

  async function handleEditStage(event) {
    event.preventDefault();

    if (
      !editingStage ||
      !editStageName.trim()
    ) {
      return;
    }

    try {
      setUpdatingStage(true);
      setError("");

      const response = await fetch(
        "/api/admin/stages",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: editingStage.id,

            name:
              editStageName.trim(),

            description:
              editStageDescription.trim(),

            intro:
              editStageIntro.trim(),

            imageUrl:
              editStageImage.trim(),

            leaderGuideTitle:
              editLeaderGuideTitle.trim(),

            leaderGuidePdfKey:
              editLeaderGuidePdf.trim(),

            leaderGuideUpdatedAt:
              editLeaderGuideDate,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error();
      }

      setEditingStage(null);

      // Refresh admin stages
      const stagesResponse =
        await fetch(
          "/api/admin/stages"
        );

      if (!stagesResponse.ok) {
        throw new Error();
      }

      const stagesData =
        await stagesResponse.json();

      setStages(stagesData);
    } catch {
      setError(
        "حدث خطأ أثناء تعديل بيانات المرحلة."
      );
    } finally {
      setUpdatingStage(false);
    }
  }

  async function toggleStagePublish(stage) {
    const newStatus =
      Number(stage.is_published) !== 1;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/stages",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: stage.id,
            isPublished: newStatus,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      const stagesResponse =
        await fetch(
          "/api/admin/stages"
        );

      if (!stagesResponse.ok) {
        throw new Error();
      }

      const stagesData =
        await stagesResponse.json();

      setStages(stagesData);
    } catch {
      setError(
        "حدث خطأ أثناء تغيير حالة المرحلة."
      );
    }
  }

  // ==========================================
  // LOAD FIELDS
  // ==========================================

  async function loadFields() {
    if (!selectedStage) return;

    try {
      setLoadingFields(true);
      setError("");

      const response = await fetch(
        `/api/admin/fields?stage=${encodeURIComponent(
          selectedStage
        )}`
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setFields(data);
    } catch {
      setError(
        "حدث خطأ أثناء تحميل المجالات."
      );
    } finally {
      setLoadingFields(false);
    }
  }

  useEffect(() => {
    if (checkingAuth || !selectedStage) {
      return;
    }

    loadFields();
  }, [selectedStage, checkingAuth]);

  // ==========================================
  // LOAD LECTURES
  // ==========================================

  async function loadLectures(fieldId) {
    if (!fieldId) return;

    try {
      setLoadingLectures(true);
      setError("");

      const response = await fetch(
        `/api/admin/lectures?field=${fieldId}`
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setLectures(data);
    } catch {
      setError(
        "حدث خطأ أثناء تحميل المحاضرات."
      );
    } finally {
      setLoadingLectures(false);
    }
  }

  // ==========================================
  // OPEN FIELD LECTURES
  // ==========================================

  async function openLectures(field) {
    setSelectedField(field);
    setAdminView("lectures");

    await loadLectures(field.id);
  }

  function backToFields() {
    setAdminView("fields");
    setSelectedField(null);
    setLectures([]);
    setError("");
  }

  // ==========================================
  // ADD FIELD
  // ==========================================

  function openAddField() {
    setNewFieldName("");
    setNewFieldDescription("");
    setShowAddField(true);
  }

  function closeAddField() {
    if (savingField) return;

    setShowAddField(false);
  }

  async function handleAddField(event) {
    event.preventDefault();

    if (!newFieldName.trim()) return;

    try {
      setSavingField(true);
      setError("");

      const response = await fetch(
        "/api/admin/fields",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            stageSlug: selectedStage,
            name: newFieldName.trim(),
            description:
              newFieldDescription.trim(),
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error();
      }

      setShowAddField(false);
      setNewFieldName("");
      setNewFieldDescription("");

      await loadFields();
    } catch {
      setError(
        "حدث خطأ أثناء إضافة المجال."
      );
    } finally {
      setSavingField(false);
    }
  }

  // ==========================================
  // EDIT FIELD
  // ==========================================

  function openEditField(field) {
    setEditingField(field);

    setEditFieldName(
      field.name || ""
    );

    setEditFieldDescription(
      field.description || ""
    );
  }

  function closeEditField() {
    if (updatingField) return;

    setEditingField(null);
  }

  async function handleEditField(event) {
    event.preventDefault();

    if (
      !editingField ||
      !editFieldName.trim()
    ) {
      return;
    }

    try {
      setUpdatingField(true);
      setError("");

      const response = await fetch(
        "/api/admin/fields",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: editingField.id,
            name: editFieldName.trim(),
            description:
              editFieldDescription.trim(),
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error();
      }

      setEditingField(null);

      await loadFields();
    } catch {
      setError(
        "حدث خطأ أثناء تعديل المجال."
      );
    } finally {
      setUpdatingField(false);
    }
  }

  // ==========================================
  // FIELD PUBLISH
  // ==========================================

  async function toggleFieldPublish(field) {
    const newStatus =
      Number(field.is_published) !== 1;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/fields",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: field.id,
            isPublished: newStatus,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      await loadFields();
    } catch {
      setError(
        "حدث خطأ أثناء تغيير حالة النشر."
      );
    }
  }

  // ==========================================
  // DELETE FIELD
  // ==========================================

  async function deleteField(field) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${field.name}"؟\n\nسيتم حذف المحاضرات التابعة له أيضًا.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/fields?id=${field.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      await loadFields();
    } catch {
      setError(
        "حدث خطأ أثناء حذف المجال."
      );
    }
  }

  // ==========================================
  // PDF HELPERS
  // ==========================================

  function getPdfUrl(pdfKey) {
    if (!pdfKey) return "";

    if (pdfKey.startsWith("gdrive:")) {
      return `/api/pdf/${encodeURIComponent(pdfKey.slice(7))}`;
    }

    return pdfKey;
  }

  async function uploadPdf(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/google/upload", {
      method: "POST",
      body: formData,
    });

    if (response.status === 401) {
      navigate("/admin/login", { replace: true });
      throw new Error("Unauthorized");
    }

    const data = await response.json();

    if (!response.ok || !data.success || !data.pdfKey) {
      throw new Error(data.details || data.error || "PDF upload failed");
    }

    return data;
  }

  // ==========================================
  // ADD LECTURE
  // ==========================================

  function openAddLecture() {
    setNewLectureTitle("");
    setNewLectureDescription("");

    setNewLecturePdf("");
    setNewLecturePdfFile(null);

    setNewLectureDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setShowAddLecture(true);
  }

  function closeAddLecture() {
    if (savingLecture) return;

    setShowAddLecture(false);
  }

  async function handleAddLecture(event) {
    event.preventDefault();

    if (
      !selectedField ||
      !newLectureTitle.trim() ||
      !newLecturePdfFile
    ) {
      return;
    }

    try {
      setSavingLecture(true);
      setError("");

      const uploadedPdf = await uploadPdf(newLecturePdfFile);

      const response = await fetch(
        "/api/admin/lectures",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fieldId: selectedField.id,

            title:
              newLectureTitle.trim(),

            description:
              newLectureDescription.trim(),

            pdfKey: uploadedPdf.pdfKey,

            pdfOriginalName:
              uploadedPdf.fileName || newLecturePdfFile.name,

            updatedDate:
              newLectureDate,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error();
      }

      setShowAddLecture(false);
      setNewLecturePdf("");
      setNewLecturePdfFile(null);

      await loadLectures(
        selectedField.id
      );
    } catch {
      setError(
        "حدث خطأ أثناء إضافة المحاضرة."
      );
    } finally {
      setSavingLecture(false);
    }
  }

  // ==========================================
  // EDIT LECTURE
  // ==========================================

  function openEditLecture(lecture) {
    setEditingLecture(lecture);

    setEditLectureTitle(
      lecture.title || ""
    );

    setEditLectureDescription(
      lecture.description || ""
    );

    setEditLecturePdf(
      lecture.pdf_key || ""
    );
    setEditLecturePdfFile(null);

    setEditLectureDate(
      lecture.updated_date || ""
    );
  }

  function closeEditLecture() {
    if (updatingLecture) return;

    setEditingLecture(null);
  }

  async function handleEditLecture(event) {
    event.preventDefault();

    if (
      !editingLecture ||
      !editLectureTitle.trim()
    ) {
      return;
    }

    try {
      setUpdatingLecture(true);
      setError("");

      let pdfKey = editLecturePdf.trim();
      let pdfOriginalName = editingLecture.pdf_original_name || "";

      if (editLecturePdfFile) {
        const uploadedPdf = await uploadPdf(editLecturePdfFile);
        pdfKey = uploadedPdf.pdfKey;
        pdfOriginalName = uploadedPdf.fileName || editLecturePdfFile.name;
      }

      const response = await fetch(
        "/api/admin/lectures",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: editingLecture.id,

            title:
              editLectureTitle.trim(),

            description:
              editLectureDescription.trim(),

            pdfKey,

            pdfOriginalName,

            updatedDate:
              editLectureDate,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error();
      }

      setEditingLecture(null);

      await loadLectures(
        selectedField.id
      );
    } catch {
      setError(
        "حدث خطأ أثناء تعديل المحاضرة."
      );
    } finally {
      setUpdatingLecture(false);
    }
  }

  // ==========================================
  // LECTURE PUBLISH
  // ==========================================

  async function toggleLecturePublish(
    lecture
  ) {
    const newStatus =
      Number(
        lecture.is_published
      ) !== 1;

    try {
      setError("");

      const response = await fetch(
        "/api/admin/lectures",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: lecture.id,
            isPublished: newStatus,
          }),
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      await loadLectures(
        selectedField.id
      );
    } catch {
      setError(
        "حدث خطأ أثناء تغيير حالة المحاضرة."
      );
    }
  }

  // ==========================================
  // DELETE LECTURE
  // ==========================================

  async function deleteLecture(lecture) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف محاضرة "${lecture.title}"؟`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/lectures?id=${lecture.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      await loadLectures(
        selectedField.id
      );
    } catch {
      setError(
        "حدث خطأ أثناء حذف المحاضرة."
      );
    }
  }

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (checkingAuth) {
    return (
      <div
        className="admin-login-loading"
        dir="rtl"
      >
        جاري التحقق من تسجيل الدخول...
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="admin-page"
      dir="rtl"
    >
      {/* HEADER */}

      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">
            Saint Mina Scouts
          </span>

          <h1>لوحة التحكم</h1>

          <p>
            إدارة المحتوى التدريبي لكشافة
            كنيسة مارمينا
          </p>
        </div>

        <button
          className="admin-site-button"
          onClick={() =>
            navigate("/")
          }
        >
          عرض الموقع
        </button>
      </header>

      <main className="admin-container">

        {/* ==================================
            FIELDS VIEW
        ================================== */}

        {adminView === "fields" && (
          <>
<section className="admin-stages-management">

  <div className="admin-section-heading">
    <span>
      إعدادات المراحل
    </span>

    <h2>
      إدارة المراحل
    </h2>

    <p>
      تعديل نبذة المرحلة ودليل القائد
      وحالة النشر.
    </p>
  </div>

  {loadingStages ? (
    <div className="admin-loading">
      جاري تحميل المراحل...
    </div>
  ) : (
    <div className="admin-stage-cards">

      {stages.map((stage) => {
        const published =
          Number(
            stage.is_published
          ) === 1;

        return (
          <article
            className="admin-stage-card"
            key={stage.id}
          >
            <div className="admin-stage-card-info">

              <span>
                المرحلة
              </span>

              <h3>
                {stage.name}
              </h3>

              <span
                className={
                  published
                    ? "admin-status published"
                    : "admin-status hidden"
                }
              >
                {published
                  ? "منشورة"
                  : "غير منشورة"}
              </span>

              <p>
                {stage.intro
                  ? "تم إضافة نبذة المرحلة."
                  : "لم تتم إضافة نبذة المرحلة بعد."}
              </p>

              <p className="admin-meta">
                {stage.leader_guide_pdf_key
                  ? "دليل القائد متاح"
                  : "دليل القائد غير مضاف"}
              </p>

            </div>

            <div className="admin-field-actions">

              <button
                className="admin-manage-button"
                onClick={() =>
                  openEditStage(stage)
                }
              >
                تعديل بيانات المرحلة
              </button>

              <button
                onClick={() =>
                  toggleStagePublish(
                    stage
                  )
                }
              >
                {published
                  ? "إلغاء النشر"
                  : "إعادة النشر"}
              </button>

            </div>
          </article>
        );
      })}

    </div>

  )}

</section>

            <section className="admin-welcome">
              <div>
                <span>
                  إدارة المحتوى
                </span>

                <h2>المجالات</h2>

                <p>
                  اختر المرحلة ثم قم بإدارة
                  المجالات والمحاضرات.
                </p>
              </div>

              <button
                className="admin-add-button"
                onClick={openAddField}
              >
                + إضافة مجال
              </button>
            </section>

            <section className="admin-stage-selector">
              <label>
                المرحلة
              </label>

              {loadingStages ? (
                <p>
                  جاري تحميل المراحل...
                </p>
              ) : (
                <select
                  value={
                    selectedStage
                  }
                  onChange={(event) =>
                    setSelectedStage(
                      event.target.value
                    )
                  }
                >
                  {stages.map(
                    (stage) => (
                      <option
                        key={
                          stage.id
                        }
                        value={
                          stage.slug
                        }
                      >
                        {
                          stage.name
                        }
                      </option>
                    )
                  )}
                </select>
              )}
            </section>

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            <section>
              <div className="admin-section-heading">
                <span>
                  المحتوى الحالي
                </span>

                <h2>
                  المجالات{" "}
                  {!loadingFields && (
                    <small>
                      ({fields.length})
                    </small>
                  )}
                </h2>
              </div>

              {loadingFields ? (
                <div className="admin-loading">
                  جاري تحميل المجالات...
                </div>
              ) : fields.length === 0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    ＋
                  </div>

                  <h3>
                    لا توجد مجالات
                  </h3>

                  <p>
                    أضف أول مجال لهذه
                    المرحلة.
                  </p>
                </div>
              ) : (
                <div className="admin-fields-list">
                  {fields.map(
                    (field, index) => {
                      const published =
                        Number(
                          field.is_published
                        ) === 1;

                      return (
                        <article
                          className="admin-field-card"
                          key={field.id}
                        >
                          <div className="admin-field-order">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="admin-field-info">
                            <span>
                              {
                                field.stage_name
                              }
                            </span>

                            <h3>
                              {
                                field.name
                              }
                            </h3>

                            <span
                              className={
                                published
                                  ? "admin-status published"
                                  : "admin-status hidden"
                              }
                            >
                              {published
                                ? "منشور"
                                : "غير منشور"}
                            </span>

                            <p>
                              {field.description ||
                                "لا يوجد وصف لهذا المجال."}
                            </p>
                          </div>

                          <div className="admin-field-actions">

                            <button
                              className="admin-manage-button"
                              onClick={() =>
                                openLectures(
                                  field
                                )
                              }
                            >
                              إدارة المحاضرات
                            </button>

                            <button
                              onClick={() =>
                                openEditField(
                                  field
                                )
                              }
                            >
                              تعديل
                            </button>

                            <button
                              onClick={() =>
                                toggleFieldPublish(
                                  field
                                )
                              }
                            >
                              {published
                                ? "إلغاء النشر"
                                : "إعادة النشر"}
                            </button>

                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                deleteField(
                                  field
                                )
                              }
                            >
                              حذف
                            </button>

                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* ==================================
            LECTURES VIEW
        ================================== */}

        {adminView === "lectures" &&
          selectedField && (
            <>
              <button
                className="admin-back-button"
                onClick={backToFields}
              >
                ← العودة إلى المجالات
              </button>

              <section className="admin-welcome">
                <div>
                  <span>
                    {
                      selectedField.stage_name
                    }
                  </span>

                  <h2>
                    {
                      selectedField.name
                    }
                  </h2>

                  <p>
                    إدارة المحاضرات التابعة
                    لهذا المجال.
                  </p>
                </div>

                <button
                  className="admin-add-button"
                  onClick={
                    openAddLecture
                  }
                >
                  + إضافة محاضرة
                </button>
              </section>

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}

              <div className="admin-section-heading">
                <span>
                  المحتوى الحالي
                </span>

                <h2>
                  المحاضرات{" "}
                  {!loadingLectures && (
                    <small>
                      ({lectures.length})
                    </small>
                  )}
                </h2>
              </div>

              {loadingLectures ? (
                <div className="admin-loading">
                  جاري تحميل المحاضرات...
                </div>
              ) : lectures.length ===
                0 ? (
                <div className="admin-empty">
                  <div className="admin-empty-icon">
                    ＋
                  </div>

                  <h3>
                    لا توجد محاضرات
                  </h3>

                  <p>
                    اضغط على إضافة محاضرة
                    لإنشاء أول محاضرة في
                    هذا المجال.
                  </p>
                </div>
              ) : (
                <div className="admin-fields-list">
                  {lectures.map(
                    (
                      lecture,
                      index
                    ) => {
                      const published =
                        Number(
                          lecture.is_published
                        ) === 1;

                      return (
                        <article
                          className="admin-field-card"
                          key={
                            lecture.id
                          }
                        >
                          <div className="admin-field-order">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="admin-field-info">
                            <span>
                              {
                                selectedField.name
                              }
                            </span>

                            <h3>
                              {
                                lecture.title
                              }
                            </h3>

                            <span
                              className={
                                published
                                  ? "admin-status published"
                                  : "admin-status hidden"
                              }
                            >
                              {published
                                ? "منشور"
                                : "غير منشور"}
                            </span>

                            <p>
                              {lecture.description ||
                                "لا يوجد وصف لهذه المحاضرة."}
                            </p>

                            {lecture.updated_date && (
                              <p className="admin-meta">
                                آخر تحديث:{" "}
                                {
                                  lecture.updated_date
                                }
                              </p>
                            )}

                            {lecture.pdf_key && (
                              <a
                                className="admin-pdf-link"
                                href={
                                  getPdfUrl(lecture.pdf_key)
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                معاينة ملف PDF
                              </a>
                            )}
                          </div>

                          <div className="admin-field-actions">
                            <button
                              onClick={() =>
                                openEditLecture(
                                  lecture
                                )
                              }
                            >
                              تعديل
                            </button>

                            <button
                              onClick={() =>
                                toggleLecturePublish(
                                  lecture
                                )
                              }
                            >
                              {published
                                ? "إلغاء النشر"
                                : "إعادة النشر"}
                            </button>

                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                deleteLecture(
                                  lecture
                                )
                              }
                            >
                              حذف
                            </button>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}
      </main>
      {/* ==================================
          EDIT STAGE MODAL
      ================================== */}

      {editingStage && (
        <div
          className="admin-modal-overlay"
          onMouseDown={
            closeEditStage
          }
        >
          <div
            className="admin-modal admin-stage-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-heading">

              <div>
                <span>
                  إدارة المرحلة
                </span>

                <h2>
                  {editingStage.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditStage
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleEditStage
              }
            >

              <div className="admin-form-group">

                <label>
                  اسم المرحلة *
                </label>

                <input
                  value={
                    editStageName
                  }
                  onChange={(event) =>
                    setEditStageName(
                      event.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="admin-form-group">

                <label>
                  الوصف المختصر
                </label>

                <textarea
                  value={
                    editStageDescription
                  }
                  onChange={(event) =>
                    setEditStageDescription(
                      event.target.value
                    )
                  }
                  rows="3"
                  placeholder="وصف مختصر يظهر مع اسم المرحلة"
                />

              </div>

              <div className="admin-form-group">

                <label>
                  نبذة عن المرحلة
                </label>

                <textarea
                  value={
                    editStageIntro
                  }
                  onChange={(event) =>
                    setEditStageIntro(
                      event.target.value
                    )
                  }
                  rows="7"
                  placeholder="اكتب هنا نبذة المرحلة..."
                />

              </div>

              <div className="admin-form-group">

                <label>
                  مسار صورة المرحلة
                </label>

                <input
                  value={
                    editStageImage
                  }
                  onChange={(event) =>
                    setEditStageImage(
                      event.target.value
                    )
                  }
                  placeholder="/images/baraem.jpg"
                />

                <small>
                  مؤقتًا نستخدم صورة موجودة
                  داخل ملفات الموقع.
                </small>

              </div>

              <div className="admin-stage-form-divider">

                <span>
                  دليل القائد
                </span>

              </div>

              <div className="admin-form-group">

                <label>
                  عنوان دليل القائد
                </label>

                <input
                  value={
                    editLeaderGuideTitle
                  }
                  onChange={(event) =>
                    setEditLeaderGuideTitle(
                      event.target.value
                    )
                  }
                  placeholder="دليل القائد"
                />

              </div>

              <div className="admin-form-group">

                <label>
                  مسار ملف دليل القائد PDF
                </label>

                <input
                  value={
                    editLeaderGuidePdf
                  }
                  onChange={(event) =>
                    setEditLeaderGuidePdf(
                      event.target.value
                    )
                  }
                  placeholder="/pdfs/leader-guide.pdf"
                />

                <small>
                  رفع الملفات من لوحة التحكم
                  سنضيفه في مرحلة التخزين.
                  حاليًا يتم استخدام مسار PDF.
                </small>

              </div>

              <div className="admin-form-group">

                <label>
                  تاريخ تحديث الدليل
                </label>

                <input
                  type="date"
                  value={
                    editLeaderGuideDate
                  }
                  onChange={(event) =>
                    setEditLeaderGuideDate(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeEditStage
                  }
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    updatingStage ||
                    !editStageName.trim()
                  }
                >
                  {updatingStage
                    ? "جاري الحفظ..."
                    : "حفظ بيانات المرحلة"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
      {/* ==================================
          ADD FIELD MODAL
      ================================== */}

      {showAddField && (
        <div
          className="admin-modal-overlay"
          onMouseDown={
            closeAddField
          }
        >
          <div
            className="admin-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-heading">
              <div>
                <span>
                  إضافة محتوى جديد
                </span>

                <h2>
                  إضافة مجال
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeAddField
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddField
              }
            >
              <div className="admin-form-group">
                <label>
                  المرحلة
                </label>

                <select
                  value={
                    selectedStage
                  }
                  onChange={(event) =>
                    setSelectedStage(
                      event.target.value
                    )
                  }
                >
                  {stages.map(
                    (stage) => (
                      <option
                        key={
                          stage.id
                        }
                        value={
                          stage.slug
                        }
                      >
                        {
                          stage.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="admin-form-group">
                <label>
                  اسم المجال *
                </label>

                <input
                  value={
                    newFieldName
                  }
                  onChange={(event) =>
                    setNewFieldName(
                      event.target.value
                    )
                  }
                  placeholder="مثال: المجال الروحي"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  وصف المجال
                </label>

                <textarea
                  value={
                    newFieldDescription
                  }
                  onChange={(event) =>
                    setNewFieldDescription(
                      event.target.value
                    )
                  }
                  rows="4"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeAddField
                  }
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    savingField ||
                    !newFieldName.trim()
                  }
                >
                  {savingField
                    ? "جاري الحفظ..."
                    : "حفظ المجال"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================
          EDIT FIELD MODAL
      ================================== */}

      {editingField && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <div className="admin-modal-heading">
              <div>
                <span>
                  تعديل المحتوى
                </span>

                <h2>
                  تعديل المجال
                </h2>
              </div>

              <button
                onClick={
                  closeEditField
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleEditField
              }
            >
              <div className="admin-form-group">
                <label>
                  اسم المجال *
                </label>

                <input
                  value={
                    editFieldName
                  }
                  onChange={(event) =>
                    setEditFieldName(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  وصف المجال
                </label>

                <textarea
                  value={
                    editFieldDescription
                  }
                  onChange={(event) =>
                    setEditFieldDescription(
                      event.target.value
                    )
                  }
                  rows="4"
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeEditField
                  }
                >
                  إلغاء
                </button>

                <button
                  className="admin-save-button"
                  disabled={
                    updatingField
                  }
                >
                  {updatingField
                    ? "جاري الحفظ..."
                    : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================
          ADD LECTURE MODAL
      ================================== */}

      {showAddLecture && (
        <div
          className="admin-modal-overlay"
          onMouseDown={
            closeAddLecture
          }
        >
          <div
            className="admin-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-modal-heading">
              <div>
                <span>
                  {
                    selectedField?.name
                  }
                </span>

                <h2>
                  إضافة محاضرة
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeAddLecture
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleAddLecture
              }
            >
              <div className="admin-form-group">
                <label>
                  اسم المحاضرة *
                </label>

                <input
                  value={
                    newLectureTitle
                  }
                  onChange={(event) =>
                    setNewLectureTitle(
                      event.target.value
                    )
                  }
                  placeholder="مثال: الصلاة"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  وصف المحاضرة
                </label>

                <textarea
                  value={
                    newLectureDescription
                  }
                  onChange={(event) =>
                    setNewLectureDescription(
                      event.target.value
                    )
                  }
                  rows="4"
                />
              </div>

              <div className="admin-form-group">
                <label>
                  ملف المحاضرة PDF *
                </label>

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setNewLecturePdfFile(file);
                    setNewLecturePdf(file ? file.name : "");
                  }}
                  required
                />

                <small>
                  سيتم رفع الملف إلى التخزين الخاص تلقائيًا عند حفظ المحاضرة.
                </small>
              </div>

              <div className="admin-form-group">
                <label>
                  تاريخ التحديث
                </label>

                <input
                  type="date"
                  value={
                    newLectureDate
                  }
                  onChange={(event) =>
                    setNewLectureDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeAddLecture
                  }
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    savingLecture ||
                    !newLectureTitle.trim() ||
                    !newLecturePdfFile
                  }
                >
                  {savingLecture
                    ? "جاري الحفظ..."
                    : "حفظ المحاضرة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================
          EDIT LECTURE MODAL
      ================================== */}

      {editingLecture && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <div className="admin-modal-heading">
              <div>
                <span>
                  تعديل المحتوى
                </span>

                <h2>
                  تعديل المحاضرة
                </h2>
              </div>

              <button
                onClick={
                  closeEditLecture
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleEditLecture
              }
            >
              <div className="admin-form-group">
                <label>
                  اسم المحاضرة *
                </label>

                <input
                  value={
                    editLectureTitle
                  }
                  onChange={(event) =>
                    setEditLectureTitle(
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  وصف المحاضرة
                </label>

                <textarea
                  value={
                    editLectureDescription
                  }
                  onChange={(event) =>
                    setEditLectureDescription(
                      event.target.value
                    )
                  }
                  rows="4"
                />
              </div>

              <div className="admin-form-group">
                <label>
                  استبدال ملف PDF
                </label>

                {editLecturePdf && (
                  <a
                    className="admin-pdf-link"
                    href={getPdfUrl(editLecturePdf)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    معاينة الملف الحالي
                  </a>
                )}

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) =>
                    setEditLecturePdfFile(
                      event.target.files?.[0] || null
                    )
                  }
                />

                <small>
                  اتركه بدون اختيار ملف إذا كنت تريد الاحتفاظ بالـ PDF الحالي.
                </small>
              </div>

              <div className="admin-form-group">
                <label>
                  تاريخ التحديث
                </label>

                <input
                  type="date"
                  value={
                    editLectureDate
                  }
                  onChange={(event) =>
                    setEditLectureDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeEditLecture
                  }
                >
                  إلغاء
                </button>

                <button
                  className="admin-save-button"
                  disabled={
                    updatingLecture
                  }
                >
                  {updatingLecture
                    ? "جاري الحفظ..."
                    : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;