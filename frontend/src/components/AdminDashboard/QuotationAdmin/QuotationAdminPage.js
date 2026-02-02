import React, { useEffect, useMemo, useState } from "react";
import { MDBBadge, MDBBtn, MDBIcon } from "mdb-react-ui-kit";
import api, { BASE_API_URL, buildQueryParams } from "../../../utils/api";
import "./QuotationAdminPage.css";

const splitCsv = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseKeyValuePairs = (value = "") =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, rate] = line.split(":").map((part) => part.trim());
      if (key) {
        acc[key] = Number(rate) || 0;
      }
      return acc;
    }, {});

const stringifyKeyValuePairs = (pairs = {}) =>
  Object.entries(pairs)
    .map(([key, rate]) => `${key}: ${rate}`)
    .join("\n");

const toPlainObject = (value) =>
  value instanceof Map ? Object.fromEntries(value) : value || {};

const entriesFromMap = (value) => Object.entries(toPlainObject(value));

const GLOBAL_OPTION_TYPES = ["colorFinish", "meshType", "glassSpec"];

const QuotationAdminPage = () => {
  const [activeTab, setActiveTab] = useState("quotations");
  const [systems, setSystems] = useState([]);
  const [series, setSeries] = useState([]);
  const [optionSets, setOptionSets] = useState([]);
  const [areaSlabs, setAreaSlabs] = useState([]);
  const [baseRates, setBaseRates] = useState([]);
  const [handleRules, setHandleRules] = useState([]);
  const [handleOptions, setHandleOptions] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [systemForm, setSystemForm] = useState({
    name: "",
    colorFinishes: "",
    meshTypes: "",
    glassSpecs: "",
    handleColors: "",
  });
  const [editingSystemId, setEditingSystemId] = useState(null);

  const [seriesForm, setSeriesForm] = useState({
    name: "",
    systemId: "",
    descriptions: [{ name: "", handleCount: "", handleTypes: "" }],
  });
  const [editingSeriesId, setEditingSeriesId] = useState(null);

  const [optionForm, setOptionForm] = useState({
    type: "colorFinish",
    systemId: "",
    valuesText: "",
  });
  const [editingOptionId, setEditingOptionId] = useState(null);

  const [slabForm, setSlabForm] = useState({
    label: "",
    max: "",
    order: "",
  });
  const [editingSlabId, setEditingSlabId] = useState(null);

  const [baseRateForm, setBaseRateForm] = useState({
    systemType: "",
    series: "",
    description: "",
    rates: ["", "", ""],
    notes: "",
  });
  const [editingBaseRateId, setEditingBaseRateId] = useState(null);

  const [handleRuleForm, setHandleRuleForm] = useState({
    description: "",
    handleTypes: "",
    handleCount: "",
    systemType: "",
    series: "",
    notes: "",
  });
  const [editingHandleRuleId, setEditingHandleRuleId] = useState(null);

  const [handleOptionForm, setHandleOptionForm] = useState({
    systemType: "",
    name: "",
    blackRate: "",
    silverRate: "",
  });
  const [editingHandleOptionId, setEditingHandleOptionId] = useState(null);

  const [quotationFilters, setQuotationFilters] = useState({
    systemType: "",
    series: "",
    description: "",
    userId: "",
    phone: "",

  });

  const filteredSeries = useMemo(
    () =>
      series.filter((item) =>
        baseRateForm.systemType ? item.system?.name === baseRateForm.systemType : true
      ),
    [series, baseRateForm.systemType]
  );

  const descriptionOptions = useMemo(() => {
    const match = filteredSeries.find((item) => item.name === baseRateForm.series);
    return match?.descriptions || [];
  }, [filteredSeries, baseRateForm.series]);

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
    }),
    []
  );

  const fetchSystems = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/systems`,
        authConfig
      );
      setSystems(data.systems || []);
    } catch (error) {
      console.error("Unable to load systems", error);
    }
  };

  const fetchSeries = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/series`,
        authConfig
      );
      setSeries(data.series || []);
    } catch (error) {
      console.error("Unable to load series", error);
    }
  };

  const fetchOptionSets = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/option-sets`,
        authConfig
      );
      setOptionSets(data.optionSets || []);
    } catch (error) {
      console.error("Unable to load option sets", error);
    }
  };

  const fetchAreaSlabs = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/area-slabs`,
        authConfig
      );
      setAreaSlabs(data.slabs || []);
    } catch (error) {
      console.error("Unable to load area slabs", error);
    }
  };

  const fetchBaseRates = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/base-rates`,
        authConfig
      );
      setBaseRates(data.baseRates || []);
    } catch (error) {
      console.error("Unable to load base rates", error);
    }
  };

  const fetchHandleRules = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/handle-rules`,
        authConfig
      );
      setHandleRules(data.rules || []);
    } catch (error) {
      console.error("Unable to load handle rules", error);
    }
  };

  const fetchHandleOptions = async () => {
    try {
      const { data } = await api.get(
        `${BASE_API_URL}/admin/quotations/handle-options`,
        authConfig
      );
      setHandleOptions(data.options || []);
    } catch (error) {
      console.error("Unable to load handle options", error);
    }
  };

  
const fetchQuotations = async (overrideFilters = {}) => {
  const filters = { ...quotationFilters, ...overrideFilters };

  const query = new URLSearchParams();

  if (filters.phone && filters.phone.trim() !== "") {
    query.append("phone", filters.phone.trim());
  }

  const url =
    query.toString()
      ? `${BASE_API_URL}/admin/quotations?${query.toString()}`
      : `${BASE_API_URL}/admin/quotations`;

  try {
    const { data } = await api.get(url, authConfig);
    setQuotations(data.quotations || []);
  } catch (error) {
    console.error("Unable to load quotations", error);
  }
};








  const refreshAllMasterData = async () => {
    await Promise.all([
      fetchSystems(),
      fetchSeries(),
      fetchOptionSets(),
      fetchAreaSlabs(),
      fetchBaseRates(),
      fetchHandleRules(),
      fetchHandleOptions(),
    ]);
  };

  useEffect(() => {
    refreshAllMasterData();
    fetchQuotations();
  }, []);

  const resetSystemForm = () => {
    setSystemForm({
      name: "",
      colorFinishes: "",
      meshTypes: "",
      glassSpecs: "",
      handleColors: "",
    });
    setEditingSystemId(null);
  };

  const handleSystemSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: systemForm.name.trim(),
      colorFinishes: splitCsv(systemForm.colorFinishes),
      meshTypes: splitCsv(systemForm.meshTypes),
      glassSpecs: splitCsv(systemForm.glassSpecs),
      handleColors: splitCsv(systemForm.handleColors),
    };

    if (!payload.name) return;

    try {
      if (editingSystemId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/systems/${editingSystemId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/systems`,
          payload,
          authConfig
        );
      }
      await fetchSystems();
      await fetchSeries();
      resetSystemForm();
    } catch (error) {
      console.error("Unable to save system", error);
    }
  };

  const handleSystemEdit = (system) => {
    setEditingSystemId(system._id);
    setSystemForm({
      name: system.name || "",
      colorFinishes: (system.colorFinishes || []).join(", "),
      meshTypes: (system.meshTypes || []).join(", "),
      glassSpecs: (system.glassSpecs || []).join(", "),
      handleColors: (system.handleColors || []).join(", "),
    });
  };

  const handleSystemDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/systems/${id}`,
        authConfig
      );
      await fetchSystems();
      await fetchSeries();
    } catch (error) {
      console.error("Unable to delete system", error);
    }
  };

  const resetSeriesForm = () => {
    setSeriesForm({
      name: "",
      systemId: "",
      descriptions: [{ name: "", handleCount: "", handleTypes: "" }],
    });
    setEditingSeriesId(null);
  };

  const handleSeriesSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: seriesForm.name.trim(),
      systemId: seriesForm.systemId,
      descriptions: seriesForm.descriptions
        .map((item) => ({
          name: item.name.trim(),
          handleCount: item.handleCount ? Number(item.handleCount) : undefined,
          handleTypes: splitCsv(item.handleTypes),
        }))
        .filter((item) => item.name),
    };

    if (!payload.name || !payload.systemId) return;

    try {
      if (editingSeriesId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/series/${editingSeriesId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/series`,
          payload,
          authConfig
        );
      }
      await fetchSeries();
      resetSeriesForm();
    } catch (error) {
      console.error("Unable to save series", error);
    }
  };

  const handleSeriesEdit = (seriesItem) => {
    setEditingSeriesId(seriesItem._id);
    setSeriesForm({
      name: seriesItem.name || "",
      systemId: seriesItem.system?._id || "",
      descriptions:
        seriesItem.descriptions?.length > 0
          ? seriesItem.descriptions.map((item) => ({
              name: item.name || "",
              handleCount: item.handleCount ?? "",
              handleTypes: (item.handleTypes || []).join(", "),
            }))
          : [{ name: "", handleCount: "", handleTypes: "" }],
    });
  };

  const handleSeriesDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/series/${id}`,
        authConfig
      );
      await fetchSeries();
    } catch (error) {
      console.error("Unable to delete series", error);
    }
  };

  const resetOptionForm = () => {
    setOptionForm({
      type: "colorFinish",
      systemId: "",
      valuesText: "",
    });
    setEditingOptionId(null);
  };

  const handleOptionSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: optionForm.type,
      values: parseKeyValuePairs(optionForm.valuesText),
      systemId: GLOBAL_OPTION_TYPES.includes(optionForm.type)
        ? undefined
        : optionForm.systemId || undefined,
    };

    try {
      if (editingOptionId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/option-sets/${editingOptionId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/option-sets`,
          payload,
          authConfig
        );
      }
      await fetchOptionSets();
      resetOptionForm();
    } catch (error) {
      console.error("Unable to save option set", error);
    }
  };

  const handleOptionEdit = (optionSet) => {
    setEditingOptionId(optionSet._id);
    setOptionForm({
      type: optionSet.type,
      systemId: optionSet.system?._id || "",
      valuesText: stringifyKeyValuePairs(toPlainObject(optionSet.values)),
    });
  };

  const handleOptionDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/option-sets/${id}`,
        authConfig
      );
      await fetchOptionSets();
    } catch (error) {
      console.error("Unable to delete option set", error);
    }
  };

  const resetSlabForm = () => {
    setSlabForm({ label: "", max: "", order: "" });
    setEditingSlabId(null);
  };

  const handleSlabSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      label: slabForm.label || undefined,
      max: Number(slabForm.max),
      order: slabForm.order ? Number(slabForm.order) : undefined,
    };

    if (!Number.isFinite(payload.max)) return;

    try {
      if (editingSlabId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/area-slabs/${editingSlabId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/area-slabs`,
          payload,
          authConfig
        );
      }
      await fetchAreaSlabs();
      resetSlabForm();
    } catch (error) {
      console.error("Unable to save area slab", error);
    }
  };

  const handleSlabEdit = (slab) => {
    setEditingSlabId(slab._id);
    setSlabForm({
      label: slab.label || "",
      max: slab.max ?? "",
      order: slab.order ?? "",
    });
  };

  const handleSlabDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/area-slabs/${id}`,
        authConfig
      );
      await fetchAreaSlabs();
    } catch (error) {
      console.error("Unable to delete area slab", error);
    }
  };

  const resetBaseRateForm = () => {
    setBaseRateForm({
      systemType: "",
      series: "",
      description: "",
      rates: ["", "", ""],
      notes: "",
    });
    setEditingBaseRateId(null);
  };

  const handleBaseRateSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      systemType: baseRateForm.systemType.trim(),
      series: baseRateForm.series.trim(),
      description: baseRateForm.description.trim(),
      rates: baseRateForm.rates.map((r) => (Number(r) || 0)),
      notes: baseRateForm.notes || undefined,
    };

    if (!payload.systemType || !payload.series || !payload.description) return;

    try {
      if (editingBaseRateId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/base-rates/${editingBaseRateId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/base-rates`,
          payload,
          authConfig
        );
      }
      await fetchBaseRates();
      resetBaseRateForm();
    } catch (error) {
      console.error("Unable to save base rate", error);
    }
  };

  const handleBaseRateEdit = (rate) => {
    setEditingBaseRateId(rate._id);
    setBaseRateForm({
      systemType: rate.systemType || "",
      series: rate.series || "",
      description: rate.description || "",
      rates: [
        rate.rates?.[0] ?? "",
        rate.rates?.[1] ?? "",
        rate.rates?.[2] ?? "",
      ],
      notes: rate.notes || "",
    });
  };

  const handleBaseRateDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/base-rates/${id}`,
        authConfig
      );
      await fetchBaseRates();
    } catch (error) {
      console.error("Unable to delete base rate", error);
    }
  };

  const resetHandleRuleForm = () => {
    setHandleRuleForm({
      description: "",
      handleTypes: "",
      handleCount: "",
      systemType: "",
      series: "",
      notes: "",
    });
    setEditingHandleRuleId(null);
  };

  const handleHandleRuleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      description: handleRuleForm.description.trim(),
      handleTypes: splitCsv(handleRuleForm.handleTypes),
      handleCount: handleRuleForm.handleCount
        ? Number(handleRuleForm.handleCount)
        : undefined,
      systemType: handleRuleForm.systemType.trim() || undefined,
      series: handleRuleForm.series.trim() || undefined,
      notes: handleRuleForm.notes || undefined,
    };

    if (!payload.description) return;

    try {
      if (editingHandleRuleId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/handle-rules/${editingHandleRuleId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/handle-rules`,
          payload,
          authConfig
        );
      }
      await fetchHandleRules();
      resetHandleRuleForm();
    } catch (error) {
      console.error("Unable to save handle rule", error);
    }
  };

  const handleHandleRuleEdit = (rule) => {
    setEditingHandleRuleId(rule._id);
    setHandleRuleForm({
      description: rule.description || "",
      handleTypes: (rule.handleTypes || []).join(", "),
      handleCount: rule.handleCount ?? "",
      systemType: rule.systemType || "",
      series: rule.series || "",
      notes: rule.notes || "",
    });
  };

  const handleHandleRuleDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/handle-rules/${id}`,
        authConfig
      );
      await fetchHandleRules();
    } catch (error) {
      console.error("Unable to delete handle rule", error);
    }
  };

  const resetHandleOptionForm = () => {
    setHandleOptionForm({
      systemType: "",
      name: "",
      blackRate: "",
      silverRate: "",
    });
    setEditingHandleOptionId(null);
  };

  const handleHandleOptionSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      systemType: handleOptionForm.systemType.trim(),
      name: handleOptionForm.name.trim(),
      colors: {
        Black: Number(handleOptionForm.blackRate) || 0,
        Silver: Number(handleOptionForm.silverRate) || 0,
      },
    };

    if (!payload.systemType || !payload.name) return;

    try {
      if (editingHandleOptionId) {
        await api.put(
          `${BASE_API_URL}/admin/quotations/handle-options/${editingHandleOptionId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${BASE_API_URL}/admin/quotations/handle-options`,
          payload,
          authConfig
        );
      }
      await fetchHandleOptions();
      resetHandleOptionForm();
    } catch (error) {
      console.error("Unable to save handle option", error);
    }
  };

  const handleHandleOptionEdit = (option) => {
    setEditingHandleOptionId(option._id);
    const colors = toPlainObject(option.colors);
    setHandleOptionForm({
      systemType: option.systemType || "",
      name: option.name || "",
      blackRate: colors.Black ?? "",
      silverRate: colors.Silver ?? "",
    });
  };

  const handleHandleOptionDelete = async (id) => {
    try {
      await api.delete(
        `${BASE_API_URL}/admin/quotations/handle-options/${id}`,
        authConfig
      );
      await fetchHandleOptions();
    } catch (error) {
      console.error("Unable to delete handle option", error);
    }
  };

  const descriptionRows = seriesForm.descriptions.map((item, idx) => (
    <div className="qa-subrow" key={idx}>
      <input
        type="text"
        placeholder="Description name"
        value={item.name}
        onChange={(e) =>
          setSeriesForm((prev) => ({
            ...prev,
            descriptions: prev.descriptions.map((desc, i) =>
              i === idx ? { ...desc, name: e.target.value } : desc
            ),
          }))
        }
      />
      <input
        type="number"
        placeholder="Handle count"
        value={item.handleCount}
        onChange={(e) =>
          setSeriesForm((prev) => ({
            ...prev,
            descriptions: prev.descriptions.map((desc, i) =>
              i === idx ? { ...desc, handleCount: e.target.value } : desc
            ),
          }))
        }
      />
      <input
        type="text"
        placeholder="Handle types (comma separated)"
        value={item.handleTypes}
        onChange={(e) =>
          setSeriesForm((prev) => ({
            ...prev,
            descriptions: prev.descriptions.map((desc, i) =>
              i === idx ? { ...desc, handleTypes: e.target.value } : desc
            ),
          }))
        }
      />
      <MDBBtn
        size="sm"
        color="light"
        type="button"
        onClick={() =>
          setSeriesForm((prev) => ({
            ...prev,
            descriptions:
              prev.descriptions.length === 1
                ? [{ name: "", handleCount: "", handleTypes: "" }]
                : prev.descriptions.filter((_, i) => i !== idx),
          }))
        }
      >
        <MDBIcon fas icon="trash" />
      </MDBBtn>
    </div>
  ));

  const renderTabs = () => {
    const tabs = [
      { id: "quotations", label: "Quotations", icon: "file-invoice-dollar" },
      { id: "systems", label: "Systems", icon: "boxes" },
      { id: "series", label: "Series", icon: "sitemap" },
      { id: "optionSets", label: "Option Sets", icon: "palette" },
      { id: "areaSlabs", label: "Area Slabs", icon: "chart-bar" },
      { id: "baseRates", label: "Base Rates", icon: "layer-group" },
      { id: "handleRules", label: "Handle Rules", icon: "hand-paper" },
      { id: "handleOptions", label: "Handle Options", icon: "swatchbook" },
    ];

    const tabCounts = {
      quotations: quotations.length,
      systems: systems.length,
      series: series.length,
      optionSets: optionSets.length,
      areaSlabs: areaSlabs.length,
      baseRates: baseRates.length,
      handleRules: handleRules.length,
      handleOptions: handleOptions.length,
    };

    return (
      <div className="qa-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`qa-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <MDBIcon fas icon={tab.icon} className="me-2" />
            {tab.label}
            <span className="qa-tab-count">{tabCounts[tab.id] ?? 0}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderSystemSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Systems</h4>
          <p className="qa-subtitle">
            Manage the window and door systems along with supported finishes.
          </p>
        </div>
        <div className="qa-actions">
          {editingSystemId && (
            <MDBBtn size="sm" color="light" onClick={resetSystemForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleSystemSubmit}>
        <input
          type="text"
          placeholder="System name"
          value={systemForm.name}
          onChange={(e) =>
            setSystemForm((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
        <input
          type="text"
          placeholder="Color finishes (comma separated)"
          value={systemForm.colorFinishes}
          onChange={(e) =>
            setSystemForm((prev) => ({
              ...prev,
              colorFinishes: e.target.value,
            }))
          }
        />
        <input
          type="text"
          placeholder="Mesh types (comma separated)"
          value={systemForm.meshTypes}
          onChange={(e) =>
            setSystemForm((prev) => ({ ...prev, meshTypes: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Glass specs (comma separated)"
          value={systemForm.glassSpecs}
          onChange={(e) =>
            setSystemForm((prev) => ({ ...prev, glassSpecs: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Handle colors (comma separated)"
          value={systemForm.handleColors}
          onChange={(e) =>
            setSystemForm((prev) => ({
              ...prev,
              handleColors: e.target.value,
            }))
          }
        />
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingSystemId ? "Update system" : "Add system"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Finishes</th>
              <th>Mesh</th>
              <th>Glass</th>
              <th>Handle colors</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {systems.map((system) => (
              <tr key={system._id}>
                <td>
                  <div className="qa-title">{system.name}</div>
                  <div className="qa-meta">
                    Updated {new Date(system.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td>{(system.colorFinishes || []).join(", ")}</td>
                <td>{(system.meshTypes || []).join(", ")}</td>
                <td>{(system.glassSpecs || []).join(", ")}</td>
                <td>{(system.handleColors || []).join(", ")}</td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleSystemEdit(system)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleSystemDelete(system._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!systems.length && (
          <div className="qa-empty">No systems yet. Add the first one.</div>
        )}
      </div>
    </div>
  );

  const renderSeriesSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Series</h4>
          <p className="qa-subtitle">
            Define series per system along with description level handle info.
          </p>
        </div>
        <div className="qa-actions">
          {editingSeriesId && (
            <MDBBtn size="sm" color="light" onClick={resetSeriesForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleSeriesSubmit}>
        <input
          type="text"
          placeholder="Series name"
          value={seriesForm.name}
          onChange={(e) =>
            setSeriesForm((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
        <select
          value={seriesForm.systemId}
          onChange={(e) =>
            setSeriesForm((prev) => ({ ...prev, systemId: e.target.value }))
          }
          required
        >
          <option value="">Select system</option>
          {systems.map((system) => (
            <option key={system._id} value={system._id}>
              {system.name}
            </option>
          ))}
        </select>
        <div className="qa-subrow-header">
          <span>Descriptions & handle defaults</span>
          <MDBBtn
            size="sm"
            color="light"
            type="button"
            onClick={() =>
              setSeriesForm((prev) => ({
                ...prev,
                descriptions: [
                  ...prev.descriptions,
                  { name: "", handleCount: "", handleTypes: "" },
                ],
              }))
            }
          >
            <MDBIcon fas icon="plus" className="me-1" />
            Add row
          </MDBBtn>
        </div>
        {descriptionRows}
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingSeriesId ? "Update series" : "Add series"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>Series</th>
              <th>System</th>
              <th>Descriptions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => (
              <tr key={item._id}>
                <td className="qa-title">{item.name}</td>
                <td>{item.system?.name}</td>
                <td className="qa-badges">
                  {(item.descriptions || []).map((desc) => (
                    <MDBBadge key={desc.name} color="secondary" light className="me-1">
                      {desc.name}
                      {desc.handleCount
                        ? ` · ${desc.handleCount} handles`
                        : ""}
                    </MDBBadge>
                  ))}
                </td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleSeriesEdit(item)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleSeriesDelete(item._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!series.length && (
          <div className="qa-empty">No series available.</div>
        )}
      </div>
    </div>
  );

  const renderOptionSetSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Option Sets</h4>
          <p className="qa-subtitle">
            Configure standalone lists for color finish, mesh, glass specs or generic options.
          </p>
        </div>
        <div className="qa-actions">
          {editingOptionId && (
            <MDBBtn size="sm" color="light" onClick={resetOptionForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleOptionSubmit}>
        <select
          value={optionForm.type}
          onChange={(e) =>
            setOptionForm((prev) => ({
              ...prev,
              type: e.target.value,
              systemId: GLOBAL_OPTION_TYPES.includes(e.target.value)
                ? ""
                : prev.systemId,
            }))
          }
          required
        >
          <option value="colorFinish">Color finish</option>
          <option value="glassSpec">Glass spec</option>
          <option value="meshType">Mesh type</option>
          <option value="handle">Handle</option>
          <option value="generic">Generic</option>
        </select>
        {!GLOBAL_OPTION_TYPES.includes(optionForm.type) && (
          <select
            value={optionForm.systemId}
            onChange={(e) =>
              setOptionForm((prev) => ({ ...prev, systemId: e.target.value }))
            }
          >
            <option value="">Global (all systems)</option>
            {systems.map((system) => (
              <option key={system._id} value={system._id}>
                {system.name}
              </option>
            ))}
          </select>
        )}
        <textarea
          rows={4}
          placeholder="One option per line, format: Label: Rate"
          value={optionForm.valuesText}
          onChange={(e) =>
            setOptionForm((prev) => ({ ...prev, valuesText: e.target.value }))
          }
          required
        />
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingOptionId ? "Update option set" : "Add option set"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>System</th>
              <th>Values</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {optionSets.map((item) => (
              <tr key={item._id}>
                <td className="qa-title text-capitalize">{item.type}</td>
                <td>
                  {GLOBAL_OPTION_TYPES.includes(item.type)
                    ? "Global"
                    : item.system?.name || "Global"}
                </td>
                <td>
                  <div className="qa-meta">
                    {entriesFromMap(item.values).map(([label, rate]) => (
                      <div key={label}>
                        {label}: <strong>{rate}</strong>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleOptionEdit(item)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleOptionDelete(item._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!optionSets.length && (
          <div className="qa-empty">No option sets configured.</div>
        )}
      </div>
    </div>
  );

  const renderAreaSlabSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Area Slabs</h4>
          <p className="qa-subtitle">
            Define slab cutoffs to align base rate tables.
          </p>
        </div>
        <div className="qa-actions">
          {editingSlabId && (
            <MDBBtn size="sm" color="light" onClick={resetSlabForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleSlabSubmit}>
        <input
          type="text"
          placeholder="Label (optional)"
          value={slabForm.label}
          onChange={(e) =>
            setSlabForm((prev) => ({ ...prev, label: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Max area (required)"
          value={slabForm.max}
          onChange={(e) =>
            setSlabForm((prev) => ({ ...prev, max: e.target.value }))
          }
          required
        />
        <input
          type="number"
          placeholder="Order (for sorting)"
          value={slabForm.order}
          onChange={(e) =>
            setSlabForm((prev) => ({ ...prev, order: e.target.value }))
          }
        />
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingSlabId ? "Update slab" : "Add slab"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Max area</th>
              <th>Order</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {areaSlabs.map((slab) => (
              <tr key={slab._id}>
                <td className="qa-title">{slab.label || "—"}</td>
                <td>{slab.max}</td>
                <td>{slab.order}</td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleSlabEdit(slab)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleSlabDelete(slab._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!areaSlabs.length && (
          <div className="qa-empty">No slabs defined.</div>
        )}
      </div>
    </div>
  );

  const renderBaseRateSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Base Rates</h4>
          <p className="qa-subtitle">
            Map system/series/description to exactly three base rates (aligned to your three area slabs).
          </p>
          <p className="qa-hint">Fill all three slab rates to avoid gaps in calculations.</p>
        </div>
        <div className="qa-actions">
          {editingBaseRateId && (
            <MDBBtn size="sm" color="light" onClick={resetBaseRateForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleBaseRateSubmit}>
        <select
          value={baseRateForm.systemType}
          onChange={(e) =>
            setBaseRateForm((prev) => ({
              ...prev,
              systemType: e.target.value,
              series: "",
              description: "",
            }))
          }
          required
        >
          <option value="">Select system</option>
          {systems.map((sys) => (
            <option key={sys._id} value={sys.name}>
              {sys.name}
            </option>
          ))}
        </select>
        <select
          value={baseRateForm.series}
          onChange={(e) =>
            setBaseRateForm((prev) => ({
              ...prev,
              series: e.target.value,
              description: "",
            }))
          }
          required
          disabled={!baseRateForm.systemType}
        >
          <option value="">Select series</option>
          {filteredSeries.map((item) => (
            <option key={item._id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={baseRateForm.description}
          onChange={(e) =>
            setBaseRateForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          required
          disabled={!baseRateForm.series}
        >
          <option value="">Select description</option>
          {descriptionOptions.map((desc) => (
            <option key={desc.name} value={desc.name}>
              {desc.name} {desc.handleCount ? `(handles: ${desc.handleCount})` : ""}
            </option>
          ))}
        </select>
        <div className="qa-rate-grid">
          {[0, 1, 2].map((idx) => (
            <input
              key={idx}
              type="number"
              placeholder={`Base rate slab ${idx + 1}`}
              value={baseRateForm.rates[idx]}
              onChange={(e) =>
                setBaseRateForm((prev) => {
                  const next = [...prev.rates];
                  next[idx] = e.target.value;
                  return { ...prev, rates: next };
                })
              }
              required
            />
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Notes (optional)"
          value={baseRateForm.notes}
          onChange={(e) =>
            setBaseRateForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingBaseRateId ? "Update base rate" : "Add base rate"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>System / Series</th>
              <th>Description</th>
              <th>Rates</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {baseRates.map((rate) => (
              <tr key={rate._id}>
                <td>
                  <div className="qa-title">{rate.systemType}</div>
                  <div className="qa-meta">{rate.series}</div>
                </td>
                <td>{rate.description}</td>
                <td className="qa-meta">{(rate.rates || []).join(", ")}</td>
                <td>{rate.notes}</td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleBaseRateEdit(rate)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleBaseRateDelete(rate._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!baseRates.length && (
          <div className="qa-empty">No base rates added.</div>
        )}
      </div>
    </div>
  );

  const renderHandleRulesSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Handle Rules</h4>
          <p className="qa-subtitle">
            Override handle defaults for matching system/series/description.
          </p>
        </div>
        <div className="qa-actions">
          {editingHandleRuleId && (
            <MDBBtn size="sm" color="light" onClick={resetHandleRuleForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleHandleRuleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={handleRuleForm.description}
          onChange={(e) =>
            setHandleRuleForm((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          required
        />
        <input
          type="text"
          placeholder="Handle types (comma separated)"
          value={handleRuleForm.handleTypes}
          onChange={(e) =>
            setHandleRuleForm((prev) => ({
              ...prev,
              handleTypes: e.target.value,
            }))
          }
        />
        <input
          type="number"
          placeholder="Handle count"
          value={handleRuleForm.handleCount}
          onChange={(e) =>
            setHandleRuleForm((prev) => ({
              ...prev,
              handleCount: e.target.value,
            }))
          }
        />
        <input
          type="text"
          placeholder="System type (optional)"
          value={handleRuleForm.systemType}
          onChange={(e) =>
            setHandleRuleForm((prev) => ({
              ...prev,
              systemType: e.target.value,
            }))
          }
        />
        <input
          type="text"
          placeholder="Series (optional)"
          value={handleRuleForm.series}
          onChange={(e) =>
            setHandleRuleForm((prev) => ({ ...prev, series: e.target.value }))
          }
        />
        <textarea
          rows={2}
          placeholder="Notes"
          value={handleRuleForm.notes}
          onChange={(e) =>
            setHandleRuleForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingHandleRuleId ? "Update rule" : "Add rule"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Scope</th>
              <th>Handle info</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {handleRules.map((rule) => (
              <tr key={rule._id}>
                <td className="qa-title">{rule.description}</td>
                <td>
                  <div className="qa-meta">
                    {rule.systemType || "Any"} / {rule.series || "Any"}
                  </div>
                </td>
                <td className="qa-meta">
                  {(rule.handleTypes || []).join(", ")}
                  {rule.handleCount ? ` · ${rule.handleCount} handles` : ""}
                </td>
                <td>{rule.notes}</td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleHandleRuleEdit(rule)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleHandleRuleDelete(rule._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!handleRules.length && (
          <div className="qa-empty">No handle rules configured.</div>
        )}
      </div>
    </div>
  );

  const renderHandleOptionsSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Handle Options</h4>
          <p className="qa-subtitle">
            Manage handle type and color pricing per system.
          </p>
          <p className="qa-hint">Each handle auto-includes Black and Silver color rates.</p>
        </div>
        <div className="qa-actions">
          {editingHandleOptionId && (
            <MDBBtn size="sm" color="light" onClick={resetHandleOptionForm}>
              Cancel edit
            </MDBBtn>
          )}
        </div>
      </div>
      <form className="qa-form" onSubmit={handleHandleOptionSubmit}>
        <input
          type="text"
          placeholder="System type"
          value={handleOptionForm.systemType}
          onChange={(e) =>
            setHandleOptionForm((prev) => ({
              ...prev,
              systemType: e.target.value,
            }))
          }
          required
        />
        <input
          type="text"
          placeholder="Handle name"
          value={handleOptionForm.name}
          onChange={(e) =>
            setHandleOptionForm((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
        <input
          type="number"
          placeholder="Black rate"
          value={handleOptionForm.blackRate}
          onChange={(e) =>
            setHandleOptionForm((prev) => ({
              ...prev,
              blackRate: e.target.value,
            }))
          }
          required
        />
        <input
          type="number"
          placeholder="Silver rate"
          value={handleOptionForm.silverRate}
          onChange={(e) =>
            setHandleOptionForm((prev) => ({
              ...prev,
              silverRate: e.target.value,
            }))
          }
          required
        />
        <div className="qa-form-actions">
          <MDBBtn type="submit" color="primary">
            {editingHandleOptionId ? "Update handle option" : "Add handle option"}
          </MDBBtn>
        </div>
      </form>

      <div className="qa-table-wrapper">
        <table className="qa-table">
          <thead>
            <tr>
              <th>System</th>
              <th>Name</th>
              <th>Colors</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {handleOptions.map((option) => (
              <tr key={option._id}>
                <td className="qa-title">{option.systemType}</td>
                <td>{option.name}</td>
                <td className="qa-meta">
                  {entriesFromMap(option.colors).map(([color, rate]) => (
                    <div key={color}>
                      {color}: <strong>{rate}</strong>
                    </div>
                  ))}
                </td>
                <td className="qa-actions">
                  <MDBBtn
                    size="sm"
                    color="light"
                    onClick={() => handleHandleOptionEdit(option)}
                  >
                    <MDBIcon fas icon="edit" />
                  </MDBBtn>
                  <MDBBtn
                    size="sm"
                    color="danger"
                    onClick={() => handleHandleOptionDelete(option._id)}
                  >
                    <MDBIcon fas icon="trash" />
                  </MDBBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!handleOptions.length && (
          <div className="qa-empty">No handle options added.</div>
        )}
      </div>
    </div>
  );

  const renderQuotationSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Quotations</h4>
          <p className="qa-subtitle">
            Search existing quotations. Filters are optional and combine when set.
          </p>
          <p className="qa-hint">
            Start broad to see everything, then narrow down by system, series, and description.
            Refresh brings the latest rows from the server.
          </p>
        </div>
        <div className="qa-actions">
          <MDBBtn size="sm" color="light" onClick={fetchQuotations}>
            Refresh list
          </MDBBtn>
        </div>
      </div>

      <div className="qa-form qa-filter-grid">
       
        <input
  type="text"
  placeholder="Phone number"
  value={quotationFilters.phone}
  onChange={(e) =>
    setQuotationFilters((prev) => ({
      ...prev,
      phone: e.target.value,
    }))
  }
/>
        <div className="qa-form-actions">
          <MDBBtn color="primary" size="sm"  onClick={() => fetchQuotations({ ...quotationFilters})}>
            <MDBIcon fas icon="search" className="me-1" />
            Apply filters
          </MDBBtn>
          <MDBBtn
            color="light"
            size="sm"
            onClick={() => {
              const cleared = {
                systemType: "",
                series: "",
                description: "",
                userId: "",
                phone: "",

              };
              setQuotationFilters(cleared);
              fetchQuotations(cleared);
            }}
          >
            Clear
          </MDBBtn>
        </div>
      </div>

      <div className="qa-table-wrapper">
        {/* // new table add */}
        <table className="qa-table">
  <thead>
    <tr>
      <th>Quotation ID</th>
      <th>Customer</th>
      <th>Date</th>
      <th>Profit (%)</th>
      <th>Amount (₹)</th>
    </tr>
  </thead>

  <tbody>
    {quotations?.length > 0 ? (
      quotations.map((quote) => (
        <tr key={quote._id}>
          {/* QUOTATION ID */}
          <td className="qa-title">
            {quote.generatedId || "—"}
          </td>

          {/* CUSTOMER */}
          <td>
            <div className="qa-title">
              {quote.customerDetails?.name || "—"}
            </div>
            {quote.customerDetails?.email && (
              <div className="qa-meta">
                {quote.customerDetails.email}
              </div>
            )}
          </td>

          {/* DATE */}
          <td className="qa-meta">
            {quote.quotationDetails?.date
              ? new Date(quote.quotationDetails.date).toLocaleDateString()
              : quote.createdAt
              ? new Date(quote.createdAt).toLocaleDateString()
              : "—"}
          </td>

          {/* PROFIT */}
          <td className="qa-meta">
            {quote.breakdown?.profitPercentage !== undefined
              ? `${quote.breakdown.profitPercentage}%`
              : "—"}
          </td>

          {/* AMOUNT */}
          <td>
            <strong>
              {quote.breakdown?.totalAmount !== undefined
                ? `₹ ${quote.breakdown.totalAmount.toLocaleString()}`
                : "—"}
            </strong>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={5} className="qa-meta" style={{ textAlign: "center" }}>
          No quotations found
        </td>
      </tr>
    )}
  </tbody>
</table>
       
      </div>
    </div>
  );

  return (
    <div className="quotation-admin">
      <div className="qa-header">
        <div>
          <p className="qa-kicker">Quotations</p>
          <h2>Quotation Data Control</h2>
          <p className="qa-subtitle">
            Keep system, series, pricing slabs and handles aligned for quick quotation creation.
          </p>
        </div>
        <div className="qa-actions">
          <MDBBtn color="info" outline size="sm" onClick={refreshAllMasterData}>
            <MDBIcon fas icon="sync" className="me-2" />
            Refresh master data
          </MDBBtn>
        </div>
      </div>

      <div className="qa-summary">
        {[
          {
            label: "Systems",
            value: systems.length,
            icon: "cubes",
            tone: "indigo",
            note: "Define your core product families",
          },
          {
            label: "Series",
            value: series.length,
            icon: "layer-group",
            tone: "emerald",
            note: "Pair systems with description defaults",
          },
          {
            label: "Base Rates",
            value: baseRates.length,
            icon: "money-check-alt",
            tone: "amber",
            note: "Per slab pricing rows",
          },
          {
            label: "Quotations",
            value: quotations.length,
            icon: "file-invoice-dollar",
            tone: "cyan",
            note: "Filtered results",
          },
        ].map((item) => (
          <div key={item.label} className={`qa-chip qa-chip-${item.tone}`}>
            <div className="qa-chip-icon">
              <MDBIcon fas icon={item.icon} />
            </div>
            <div>
              <div className="qa-chip-value">{item.value}</div>
              <div className="qa-chip-label">{item.label}</div>
              <div className="qa-chip-note">{item.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="qa-shell">
        <aside className="qa-sidenav">{renderTabs()}</aside>
        <div className="qa-body">
          <div className="qa-sections">
            {activeTab === "quotations" && renderQuotationSection()}
            {activeTab === "systems" && renderSystemSection()}
            {activeTab === "series" && renderSeriesSection()}
            {activeTab === "optionSets" && renderOptionSetSection()}
            {activeTab === "areaSlabs" && renderAreaSlabSection()}
            {activeTab === "baseRates" && renderBaseRateSection()}
            {activeTab === "handleRules" && renderHandleRulesSection()}
            {activeTab === "handleOptions" && renderHandleOptionsSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationAdminPage;
