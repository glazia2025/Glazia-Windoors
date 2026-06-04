import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MDBBadge,
  MDBBtn,
  MDBIcon,
  MDBModal,
  MDBModalBody,
  MDBModalContent,
  MDBModalDialog,
  MDBModalFooter,
  MDBModalHeader,
  MDBModalTitle,
} from "mdb-react-ui-kit";
import api, { QUOTATION_BASE_API_URL } from "../../../utils/api";
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
const CUTTING_SCHEDULES = [
  { key: "45_45", label: "45 / 45", horizontalAngle: "45", verticalAngle: "45" },
  { key: "45_90", label: "45 / 90", horizontalAngle: "45", verticalAngle: "90" },
  { key: "90_45", label: "90 / 45", horizontalAngle: "90", verticalAngle: "45" },
  { key: "90_90", label: "90 / 90", horizontalAngle: "90", verticalAngle: "90" },
];

const createCuttingLine = () => ({
  itemType: "profile",
  sapCode: "",
  description: "",
  quantityFormula: "1",
  dimensionFormula: "",
  cutAngle: "",
  position: "",
  unit: "Pcs",
  sortOrder: 0,
  sapCodeSelected: false,
});

const createGlassCuttingLine = () => ({
  ...createCuttingLine(),
  itemType: "glass",
  quantityFormula: "Q",
  unit: "Sqft",
  sapCodeSelected: true,
});

const createCuttingSchedules = (schedules = [], legacyLines = []) => {
  const byKey = new Map((Array.isArray(schedules) ? schedules : []).map((schedule) => [schedule.key, schedule]));

  return CUTTING_SCHEDULES.map((base) => {
    const existing = byKey.get(base.key);
    const sourceLines =
      existing?.lines?.length > 0
        ? existing.lines
        : base.key === "90_90" && legacyLines?.length > 0
          ? legacyLines
          : [];

    return {
      key: base.key,
      horizontalAngle: base.horizontalAngle,
      verticalAngle: base.verticalAngle,
      lines:
        sourceLines.length > 0
          ? sourceLines.map((line, index) => ({
            ...createCuttingLine(),
            ...line,
            cutAngle: line.cutAngle || line.cutAngleLeft || line.cutAngleRight || "",
            sortOrder: line.sortOrder ?? index,
            sapCodeSelected: Boolean(line.sapCode),
          }))
          : [createCuttingLine()],
    };
  });
};

const getCuttingLineCount = (config = {}) =>
  (config.schedules || []).reduce((total, schedule) => total + (schedule.lines?.length || 0), 0) ||
  config.lines?.length ||
  0;

const QuotationAdminPage = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("quotations");
  const [systems, setSystems] = useState([]);
  const [series, setSeries] = useState([]);
  const [optionSets, setOptionSets] = useState([]);
  const [areaSlabs, setAreaSlabs] = useState([]);
  const [baseRates, setBaseRates] = useState([]);
  const [handleRules, setHandleRules] = useState([]);
  const [handleOptions, setHandleOptions] = useState([]);
  const [cuttingDescriptions, setCuttingDescriptions] = useState([]);
  const [cuttingConfigs, setCuttingConfigs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [totalQuotations, setTotalQuotations] = useState(0);
  const [cuttingSearch, setCuttingSearch] = useState("");
  const [isCuttingModalOpen, setIsCuttingModalOpen] = useState(false);
  const [isGlassBeadingModalOpen, setIsGlassBeadingModalOpen] = useState(false);
  const [selectedCuttingRow, setSelectedCuttingRow] = useState(null);
  const [selectedGlassBeadingRow, setSelectedGlassBeadingRow] = useState(null);
  const [glassBeadingLinks, setGlassBeadingLinks] = useState([]);
  const [sapAutocomplete, setSapAutocomplete] = useState({});
  const [beadingAutocomplete, setBeadingAutocomplete] = useState({});
  const sapSearchTimers = useRef({});
  const beadingSearchTimers = useRef({});

  const [systemForm, setSystemForm] = useState({
    name: "",
    colorFinishes: "",
    meshTypes: "",
    glassSpecs: "",
    handleColors: "",
  });
  const [editingSystemId, setEditingSystemId] = useState(null);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

  const [seriesForm, setSeriesForm] = useState({
    name: "",
    systemId: "",
    descriptions: [{ name: "", handleCount: "", handleTypes: "" }],
  });
  const [editingSeriesId, setEditingSeriesId] = useState(null);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);

  const [optionForm, setOptionForm] = useState({
    type: "colorFinish",
    systemId: "",
    valuesText: "",
  });
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  const [slabForm, setSlabForm] = useState({
    label: "",
    max: "",
    order: "",
  });
  const [editingSlabId, setEditingSlabId] = useState(null);
  const [isSlabModalOpen, setIsSlabModalOpen] = useState(false);

  const [baseRateForm, setBaseRateForm] = useState({
    systemType: "",
    series: "",
    description: "",
    rates: ["", "", ""],
    notes: "",
  });
  const [editingBaseRateId, setEditingBaseRateId] = useState(null);
  const [isBaseRateModalOpen, setIsBaseRateModalOpen] = useState(false);

  const [handleRuleForm, setHandleRuleForm] = useState({
    description: "",
    handleTypes: "",
    handleCount: "",
    systemType: "",
    series: "",
    notes: "",
  });
  const [editingHandleRuleId, setEditingHandleRuleId] = useState(null);
  const [isHandleRuleModalOpen, setIsHandleRuleModalOpen] = useState(false);

  const [handleOptionForm, setHandleOptionForm] = useState({
    systemType: "",
    name: "",
    colorsText: "Black: 0\nSilver: 0",
  });
  const [editingHandleOptionId, setEditingHandleOptionId] = useState(null);
  const [isHandleOptionModalOpen, setIsHandleOptionModalOpen] = useState(false);
  const [cuttingForm, setCuttingForm] = useState({
    systemType: "",
    series: "",
    description: "",
    notes: "",
    defaultScheduleKey: "90_90",
    lines: [createCuttingLine()],
    schedules: createCuttingSchedules(),
    glassBeadingLinks: [],
  });
  const [activeCuttingScheduleKey, setActiveCuttingScheduleKey] = useState("45_45");
  const [phoneFilter, setphoneFilter] = useState("");
  const [limit, setLimit] = useState(10);

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

  const filteredCuttingDescriptions = useMemo(() => {
    const search = cuttingSearch.trim().toLowerCase();
    if (!search) return cuttingDescriptions;

    return cuttingDescriptions.filter((row) =>
      [row.systemType, row.series, row.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [cuttingDescriptions, cuttingSearch]);

  const glassSpecOptions = useMemo(() => {
    const labels = new Set();
    optionSets
      .filter((item) => item.type === "glassSpec")
      .forEach((item) => {
        entriesFromMap(item.values).forEach(([label]) => labels.add(label));
      });
    return Array.from(labels).sort((a, b) => a.localeCompare(b));
  }, [optionSets]);

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
        `${QUOTATION_BASE_API_URL}/admin/quotations/systems`,
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
        `${QUOTATION_BASE_API_URL}/admin/quotations/series`,
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
        `${QUOTATION_BASE_API_URL}/admin/quotations/option-sets`,
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
        `${QUOTATION_BASE_API_URL}/admin/quotations/area-slabs`,
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
        `${QUOTATION_BASE_API_URL}/admin/quotations/base-rates`,
        authConfig
      );
      setBaseRates(data.baseRates || []);
        console.log("BASE RATES ", data.baseRates);
    } catch (error) {
      console.error("Unable to load base rates", error);
    }
  };

  const fetchHandleRules = async () => {
    try {
      const { data } = await api.get(
        `${QUOTATION_BASE_API_URL}/admin/quotations/handle-rules`,
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
        `${QUOTATION_BASE_API_URL}/admin/quotations/handle-options`,
        authConfig
      );
      setHandleOptions(data.options || []);
    } catch (error) {
      console.error("Unable to load handle options", error);
    }
  };

  const fetchCuttingScheduleData = async () => {
    try {
      const [descriptionResponse, configResponse] = await Promise.all([
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/descriptions`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/configs`, authConfig),
      ]);
      setCuttingDescriptions(descriptionResponse.data.descriptions || []);
      setCuttingConfigs(configResponse.data.configs || []);
    } catch (error) {
      console.error("Unable to load cutting schedule data", error);
    }
  };

  const fetchQuotations = async (customPage = page,
    customPhone = phoneFilter,
    customLimit = limit

  ) => {
    const query = new URLSearchParams();
    query.append("page", customPage);
    query.append("limit", customLimit);

    if (customPhone && customPhone.trim() !== "") {
      query.append("phone", customPhone.trim());
    }

    const url = `${QUOTATION_BASE_API_URL}/admin/quotations?${query.toString()}`;

    try {
      const { data } = await api.get(url, authConfig);
      setQuotations(data.quotations || []);
      setTotalQuotations(data.total || 0);
      setTotalPages(data.totalPages || 1);
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
      fetchCuttingScheduleData(),
    ]);
  };

  useEffect(() => {
    refreshAllMasterData();
  }, []);

  useEffect(() => {
    fetchQuotations(page);
  }, [page]);

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
          `${QUOTATION_BASE_API_URL}/admin/quotations/systems/${editingSystemId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/systems`,
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
    setIsSystemModalOpen(true);
  };

  const handleSystemDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/systems/${id}`,
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
          `${QUOTATION_BASE_API_URL}/admin/quotations/series/${editingSeriesId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/series`,
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
    setIsSeriesModalOpen(true);
  };

  const handleSeriesDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/series/${id}`,
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
          `${QUOTATION_BASE_API_URL}/admin/quotations/option-sets/${editingOptionId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/option-sets`,
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
    setIsOptionModalOpen(true);
  };

  const handleOptionDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/option-sets/${id}`,
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
          `${QUOTATION_BASE_API_URL}/admin/quotations/area-slabs/${editingSlabId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/area-slabs`,
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
    setIsSlabModalOpen(true);
  };

  const handleSlabDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/area-slabs/${id}`,
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
    if (!payload.systemType) return;
if (payload.systemType === "Louvers") {
  payload.series = "NA";
  payload.description = "NA";
} else {
  if (!payload.series || !payload.description) return;
}

    try {
      if (editingBaseRateId) {
        await api.put(
          `${QUOTATION_BASE_API_URL}/admin/quotations/base-rates/${editingBaseRateId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/base-rates`,
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
      series: rate.series || "NA",
      description: rate.description || "NA",
      rates: [
        rate.rates?.[0] ?? "",
        rate.rates?.[1] ?? "",
        rate.rates?.[2] ?? "",
      ],
      notes: rate.notes || "",
    });
    setIsBaseRateModalOpen(true);
  };

  const handleBaseRateDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/base-rates/${id}`,
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
          `${QUOTATION_BASE_API_URL}/admin/quotations/handle-rules/${editingHandleRuleId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/handle-rules`,
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
    setIsHandleRuleModalOpen(true);
  };

  const handleHandleRuleDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/handle-rules/${id}`,
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
      colorsText: "Black: 0\nSilver: 0",
    });
    setEditingHandleOptionId(null);
  };

  const handleHandleOptionSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      systemType: handleOptionForm.systemType.trim(),
      name: handleOptionForm.name.trim(),
      colors: parseKeyValuePairs(handleOptionForm.colorsText),
    };

    if (!payload.systemType || !payload.name) return;

    try {
      if (editingHandleOptionId) {
        await api.put(
          `${QUOTATION_BASE_API_URL}/admin/quotations/handle-options/${editingHandleOptionId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/handle-options`,
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
      colorsText: stringifyKeyValuePairs(colors),
    });
    setIsHandleOptionModalOpen(true);
  };

  const handleHandleOptionDelete = async (id) => {
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/handle-options/${id}`,
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

  const selectCuttingDescription = (row) => {
    const existing = cuttingConfigs.find(
      (config) =>
        config.systemType === row.systemType &&
        config.series === row.series &&
        config.description === row.description
    );

    setCuttingForm({
      systemType: row.systemType || "",
      series: row.series || "",
      description: row.description || "",
      notes: existing?.notes || "",
      defaultScheduleKey: existing?.defaultScheduleKey || "90_90",
      lines: existing?.lines?.length > 0 ? existing.lines : [createCuttingLine()],
      schedules: createCuttingSchedules(existing?.schedules, existing?.lines),
      glassBeadingLinks: existing?.glassBeadingLinks || [],
    });
    setSelectedCuttingRow({
      ...row,
      configId: existing?._id,
      lineCount: getCuttingLineCount(existing),
      configured: Boolean(existing),
    });
    setActiveCuttingScheduleKey(existing?.defaultScheduleKey || "45_45");
    setIsCuttingModalOpen(true);
    setSapAutocomplete({});
  };

  const updateCuttingLine = (index, field, value) => {
    setCuttingForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.key === activeCuttingScheduleKey
          ? {
            ...schedule,
            lines: schedule.lines.map((line, lineIndex) => {
              if (lineIndex !== index) return line;
              const nextLine = { ...line, [field]: value };
              if (field === "itemType" && value === "hardware") {
                nextLine.dimensionFormula = "";
                nextLine.cutAngle = "";
                nextLine.unit = "Pcs";
              }
              if (field === "itemType" && value === "glass") {
                nextLine.sapCode = "";
                nextLine.sapCodeSelected = true;
                nextLine.cutAngle = "";
                nextLine.unit = "Sqft";
              }
              if (field === "itemType") {
                if (value !== "glass") {
                  nextLine.sapCode = "";
                  nextLine.sapCodeSelected = false;
                }
              }
              return nextLine;
            }),
          }
          : schedule
      ),
    }));
  };

  const closeSapAutocomplete = (index) => {
    setSapAutocomplete((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        open: false,
        loading: false,
      },
    }));
  };

  const handleSapCodeSearch = (index, value, itemType) => {
    setCuttingForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.key === activeCuttingScheduleKey
          ? {
            ...schedule,
            lines: schedule.lines.map((line, lineIndex) =>
              lineIndex === index
                ? {
                  ...line,
                  sapCode: value,
                  sapCodeSelected: false,
                }
                : line
            ),
          }
          : schedule
      ),
    }));

    if (sapSearchTimers.current[index]) {
      window.clearTimeout(sapSearchTimers.current[index]);
    }

    const query = value.trim();
    setSapAutocomplete((prev) => ({
      ...prev,
      [index]: {
        query: value,
        options: [],
        loading: Boolean(query),
        open: Boolean(query),
      },
    }));

    if (!query) return;

    sapSearchTimers.current[index] = window.setTimeout(async () => {
      try {
        const { data } = await api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/catalog`,
          {
            ...authConfig,
            params: {
              itemType,
              sapCode: query,
            },
          }
        );
        setSapAutocomplete((prev) => ({
          ...prev,
          [index]: {
            query,
            options: data.products || (data.product ? [data.product] : []),
            loading: false,
            open: true,
          },
        }));
      } catch (error) {
        console.error("Unable to search SAP code", error);
        setSapAutocomplete((prev) => ({
          ...prev,
          [index]: {
            query,
            options: [],
            loading: false,
            open: true,
          },
        }));
      }
    }, 250);
  };

  const getSapProductLabel = (product) =>
    product?.label || product?.description || product?.perticular || product?.part || product?.sapCode || "";

  const handleSapCodeSelect = (index, product) => {
    setCuttingForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.key === activeCuttingScheduleKey
          ? {
            ...schedule,
            lines: schedule.lines.map((line, lineIndex) =>
              lineIndex === index
                ? {
                  ...line,
                  sapCode: product.sapCode || "",
                  description: line.description || getSapProductLabel(product),
                  sapCodeSelected: true,
                }
                : line
            ),
          }
          : schedule
      ),
    }));
    closeSapAutocomplete(index);
  };

  const handleSapCodeBlur = (index) => {
    window.setTimeout(() => {
      setCuttingForm((prev) => ({
        ...prev,
        schedules: prev.schedules.map((schedule) =>
          schedule.key === activeCuttingScheduleKey
            ? {
              ...schedule,
              lines: schedule.lines.map((line, lineIndex) =>
                lineIndex === index && line.sapCode && !line.sapCodeSelected
                  ? {
                    ...line,
                    sapCode: "",
                  }
                  : line
              ),
            }
            : schedule
        ),
      }));
      closeSapAutocomplete(index);
    }, 150);
  };

  const addCuttingLine = () => {
    setCuttingForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.key === activeCuttingScheduleKey
          ? {
            ...schedule,
            lines: [...schedule.lines, { ...createCuttingLine(), sortOrder: schedule.lines.length }],
          }
          : schedule
      ),
    }));
  };

  const addGlassCuttingLine = () => {
    setCuttingForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.key === activeCuttingScheduleKey
          ? {
            ...schedule,
            lines:
            schedule.lines.filter((line) => line.itemType === "glass").length >= 2
              ? schedule.lines
              : [...schedule.lines, { ...createGlassCuttingLine(), sortOrder: schedule.lines.length }],
          }
          : schedule
      ),
    }));
  };

  const removeCuttingLine = (index) => {
    setCuttingForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((schedule) =>
        schedule.key === activeCuttingScheduleKey
          ? {
            ...schedule,
            lines:
              schedule.lines.length === 1
                ? [createCuttingLine()]
                : schedule.lines.filter((_, i) => i !== index),
          }
          : schedule
      ),
    }));
  };

  const handleCuttingConfigSubmit = async (event) => {
    event.preventDefault();
    if (!cuttingForm.systemType || !cuttingForm.series || !cuttingForm.description) return;

    const hasUnselectedSapCode = cuttingForm.schedules.some((schedule) =>
      schedule.lines.some((line) => line.itemType !== "glass" && line.sapCode && !line.sapCodeSelected)
    );
    if (hasUnselectedSapCode) {
      setCuttingForm((prev) => ({
        ...prev,
        schedules: prev.schedules.map((schedule) => ({
          ...schedule,
          lines: schedule.lines.map((line) =>
            line.sapCode && !line.sapCodeSelected ? { ...line, sapCode: "" } : line
          ),
        })),
      }));
      return;
    }

    const schedules = cuttingForm.schedules.map((schedule) => ({
      ...schedule,
      lines: schedule.lines
        .filter((line) => line.sapCode || line.description || line.dimensionFormula || line.cutAngle || line.position || line.itemType === "glass")
        .map((line, index) => {
          const sanitized = { ...line, sortOrder: index };
          delete sanitized.sapCodeSelected;
          delete sanitized.cutAngleLeft;
          delete sanitized.cutAngleRight;
          return sanitized;
        }),
    }));

    const hasBlankSapCode = schedules.some((schedule) =>
      schedule.lines.some((line) => line.itemType !== "glass" && !line.sapCode)
    );
    if (hasBlankSapCode) {
      setCuttingForm((prev) => ({
        ...prev,
        schedules: prev.schedules.map((schedule) => ({
          ...schedule,
          lines: schedule.lines.filter((line) => line.itemType === "glass" || line.sapCode),
        })),
      }));
      return;
    }

    const defaultLines = schedules.find((schedule) => schedule.key === cuttingForm.defaultScheduleKey)?.lines || [];
    const totalLines = schedules.reduce((total, schedule) => total + schedule.lines.length, 0);

    try {
      await api.post(
        `${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/configs`,
        {
          ...cuttingForm,
          lines: defaultLines,
          schedules,
        },
        authConfig
      );
      await fetchCuttingScheduleData();
      setSelectedCuttingRow((prev) =>
        prev
          ? {
            ...prev,
            configured: true,
            lineCount: totalLines,
          }
          : prev
      );
      setIsCuttingModalOpen(false);
    } catch (error) {
      console.error("Unable to save cutting schedule config", error);
    }
  };

  const handleCuttingConfigDelete = async () => {
    const existing = cuttingConfigs.find(
      (config) =>
        config.systemType === cuttingForm.systemType &&
        config.series === cuttingForm.series &&
        config.description === cuttingForm.description
    );
    if (!existing?._id) return;

    try {
      await api.delete(`${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/configs/${existing._id}`, authConfig);
      setCuttingForm((prev) => ({
        ...prev,
        notes: "",
        defaultScheduleKey: "90_90",
        lines: [createCuttingLine()],
        schedules: createCuttingSchedules(),
      }));
      setSelectedCuttingRow((prev) =>
        prev
          ? {
            ...prev,
            configured: false,
            lineCount: 0,
            configId: undefined,
          }
          : prev
      );
      setIsCuttingModalOpen(false);
      await fetchCuttingScheduleData();
    } catch (error) {
      console.error("Unable to delete cutting schedule config", error);
    }
  };

  const buildGlassBeadingRows = (links = []) => {
    const byGlass = new Map((links || []).map((link) => [link.glassSpec, link]));
    return glassSpecOptions.map((glassSpec) => ({
      glassSpec,
      beadingSapCode: byGlass.get(glassSpec)?.beadingSapCode || "",
      beadingDescription: byGlass.get(glassSpec)?.beadingDescription || "",
      beadingSapCodeSelected: Boolean(byGlass.get(glassSpec)?.beadingSapCode),
    }));
  };

  const selectGlassBeadingDescription = (row) => {
    const existing = cuttingConfigs.find(
      (config) =>
        config.systemType === row.systemType &&
        config.series === row.series &&
        config.description === row.description
    );
    setSelectedGlassBeadingRow({
      ...row,
      configId: existing?._id,
      linkCount: existing?.glassBeadingLinks?.filter((link) => link.beadingSapCode).length || 0,
    });
    setGlassBeadingLinks(buildGlassBeadingRows(existing?.glassBeadingLinks || []));
    setBeadingAutocomplete({});
    setIsGlassBeadingModalOpen(true);
  };

  const closeBeadingAutocomplete = (glassSpec) => {
    setBeadingAutocomplete((prev) => ({
      ...prev,
      [glassSpec]: {
        ...(prev[glassSpec] || {}),
        open: false,
        loading: false,
      },
    }));
  };

  const searchBeadingSapCode = (glassSpec, value) => {
    setGlassBeadingLinks((prev) =>
      prev.map((link) =>
        link.glassSpec === glassSpec
          ? {
            ...link,
            beadingSapCode: value,
            beadingDescription: "",
            beadingSapCodeSelected: false,
          }
          : link
      )
    );

    if (beadingSearchTimers.current[glassSpec]) {
      window.clearTimeout(beadingSearchTimers.current[glassSpec]);
    }

    const query = value.trim();
    setBeadingAutocomplete((prev) => ({
      ...prev,
      [glassSpec]: {
        query: value,
        options: [],
        loading: Boolean(query),
        open: Boolean(query),
      },
    }));

    if (!query) return;

    beadingSearchTimers.current[glassSpec] = window.setTimeout(async () => {
      try {
        const { data } = await api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/catalog`,
          {
            ...authConfig,
            params: {
              itemType: "profile",
              sapCode: query,
            },
          }
        );
        setBeadingAutocomplete((prev) => ({
          ...prev,
          [glassSpec]: {
            query,
            options: data.products || (data.product ? [data.product] : []),
            loading: false,
            open: true,
          },
        }));
      } catch (error) {
        console.error("Unable to search beading SAP code", error);
        setBeadingAutocomplete((prev) => ({
          ...prev,
          [glassSpec]: {
            query,
            options: [],
            loading: false,
            open: true,
          },
        }));
      }
    }, 250);
  };

  const selectBeadingSapCode = (glassSpec, product) => {
    setGlassBeadingLinks((prev) =>
      prev.map((link) =>
        link.glassSpec === glassSpec
          ? {
            ...link,
            beadingSapCode: product.sapCode || "",
            beadingDescription: getSapProductLabel(product),
            beadingSapCodeSelected: true,
          }
          : link
      )
    );
    closeBeadingAutocomplete(glassSpec);
  };

  const handleBeadingSapCodeBlur = (glassSpec) => {
    window.setTimeout(() => {
      setGlassBeadingLinks((prev) =>
        prev.map((link) =>
          link.glassSpec === glassSpec && link.beadingSapCode && !link.beadingSapCodeSelected
            ? {
              ...link,
              beadingSapCode: "",
              beadingDescription: "",
            }
            : link
        )
      );
      closeBeadingAutocomplete(glassSpec);
    }, 150);
  };

  const saveGlassBeadingLinks = async (event) => {
    event.preventDefault();
    if (!selectedGlassBeadingRow) return;

    const existing = cuttingConfigs.find(
      (config) =>
        config.systemType === selectedGlassBeadingRow.systemType &&
        config.series === selectedGlassBeadingRow.series &&
        config.description === selectedGlassBeadingRow.description
    );
    const payload = {
      systemType: selectedGlassBeadingRow.systemType,
      series: selectedGlassBeadingRow.series,
      description: selectedGlassBeadingRow.description,
      notes: existing?.notes || "",
      defaultScheduleKey: existing?.defaultScheduleKey || "90_90",
      lines: existing?.lines || [],
      schedules: existing?.schedules || [],
      glassBeadingLinks: glassBeadingLinks
        .filter((link) => link.glassSpec)
        .map((link) => ({
          glassSpec: link.glassSpec,
          beadingSapCode: link.beadingSapCodeSelected ? link.beadingSapCode : "",
          beadingDescription: link.beadingSapCodeSelected ? link.beadingDescription : "",
        })),
    };

    try {
      await api.post(`${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/configs`, payload, authConfig);
      await fetchCuttingScheduleData();
      setIsGlassBeadingModalOpen(false);
    } catch (error) {
      console.error("Unable to save glass beading links", error);
    }
  };

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
      { id: "cuttingSchedule", label: "Cutting Schedule", icon: "ruler-combined" },
      { id: "glassBeading", label: "Glass Beading", icon: "link" },
    ];

    const tabCounts = {
      quotations: totalQuotations,
      systems: systems.length,
      series: series.length,
      optionSets: optionSets.length,
      areaSlabs: areaSlabs.length,
      baseRates: baseRates.length,
      handleRules: handleRules.length,
      handleOptions: handleOptions.length,
      cuttingSchedule: cuttingConfigs.filter((config) => getCuttingLineCount(config) > 0).length,
      glassBeading: cuttingConfigs.reduce(
        (total, config) => total + (config.glassBeadingLinks?.filter((link) => link.beadingSapCode).length || 0),
        0
      ),
    };

    return (
      <div className="qa-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`qa-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() =>
              setActiveTab(tab.id)}
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
    <>
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Systems</h4>
            <p className="qa-subtitle">
              Manage the window and door systems along with supported finishes.
            </p>
          </div>
          <div className="qa-actions">
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetSystemForm();
                setIsSystemModalOpen(true);
              }}
            >
              Add System
            </MDBBtn>

          </div>
        </div>
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
      <MDBModal open={isSystemModalOpen} setOpen={setIsSystemModalOpen} tabIndex='-1'>
        <MDBModalDialog centered>
          <MDBModalContent>

            <MDBModalHeader>

              <MDBModalTitle>
                {editingSystemId ? "Edit System" : "Add System"}
              </MDBModalTitle>
              <MDBBtn className='btn-close' color='none' onClick={() => { setIsSystemModalOpen(false); resetSystemForm(); }} />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">
                <div className="qa-form-group">
                  <label>System Name</label>
                  <input
                    type="text"
                    placeholder="System name"
                    value={systemForm.name}
                    onChange={(e) =>
                      setSystemForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="qa-form-group">
                  <label>Color Finishes (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Color finishes"
                    value={systemForm.colorFinishes}
                    onChange={(e) =>
                      setSystemForm((prev) => ({ ...prev, colorFinishes: e.target.value }))
                    }
                  />
                </div>
                <div className="qa-form-group">
                  <label>Mesh Types (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Mesh types"
                    value={systemForm.meshTypes}
                    onChange={(e) =>
                      setSystemForm((prev) => ({ ...prev, meshTypes: e.target.value }))
                    }
                  />
                </div>
                <div className="qa-form-group">
                  <label>Glass Specifications (comma separated)</label>

                  <input
                    type="text"
                    placeholder="Glass specs"
                    value={systemForm.glassSpecs}
                    onChange={(e) =>
                      setSystemForm((prev) => ({ ...prev, glassSpecs: e.target.value }))
                    }
                  />
                </div>
                <div className="qa-form-group">
                  <label>Handle Colors (comma separated)</label>

                  <input
                    type="text"
                    placeholder="Handle colors"
                    value={systemForm.handleColors}
                    onChange={(e) =>
                      setSystemForm((prev) => ({ ...prev, handleColors: e.target.value }))
                    }
                  />
                </div>

              </form>
            </MDBModalBody>

            <MDBModalFooter>

              <MDBBtn
                color="primary"
                onClick={async () => {

                  const fakeEvent = { preventDefault: () => { } };
                  await handleSystemSubmit(fakeEvent);
                  setIsSystemModalOpen(false);
                  resetSystemForm();
                }}
              >
                {editingSystemId ? "Update System" : "Add System"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );


  const renderSeriesSection = () => (
    <>
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Series</h4>
            <p className="qa-subtitle">
              Define series per system along with description level handle info.
            </p>
          </div>
          <div className="qa-actions">
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetSeriesForm();
                setIsSeriesModalOpen(true);
              }}
            >
              Add Series
            </MDBBtn>

          </div>
        </div>


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
      <MDBModal open={isSeriesModalOpen} setOpen={setIsSeriesModalOpen} tabIndex='-1'>
        <MDBModalDialog centered size="lg">
          <MDBModalContent>

            <MDBModalHeader>

              <MDBModalTitle>
                {editingSeriesId ? "Edit Series" : "Add Series"}
              </MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => {
                  setIsSeriesModalOpen(false);
                  resetSeriesForm();
                }}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">

                {/* Series Name */}
                <div className="qa-form-group">
                  <label>Series Name</label>
                  <input
                    type="text"
                    value={seriesForm.name}
                    onChange={(e) =>
                      setSeriesForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                {/* System Select */}
                <div className="qa-form-group">
                  <label>Select System</label>
                  <select
                    value={seriesForm.systemId}
                    onChange={(e) =>
                      setSeriesForm((prev) => ({ ...prev, systemId: e.target.value }))
                    }
                  >
                    <option value="">Select system</option>
                    {systems.map((system) => (
                      <option key={system._id} value={system._id}>
                        {system.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description Rows */}
                <div className="qa-subrow-header">
                  <span>Descriptions & Handle defaults</span>
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

                {seriesForm.descriptions.map((item, idx) => (
                  <div className="qa-subrow" key={idx}>

                    <input
                      type="text"
                      placeholder="Description name"
                      value={item.name}
                      onChange={(e) =>
                        setSeriesForm((prev) => ({
                          ...prev,
                          descriptions: prev.descriptions.map((d, i) =>
                            i === idx ? { ...d, name: e.target.value } : d
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
                          descriptions: prev.descriptions.map((d, i) =>
                            i === idx ? { ...d, handleCount: e.target.value } : d
                          ),
                        }))
                      }
                    />

                    <input
                      type="text"
                      placeholder="Handle types"
                      value={item.handleTypes}
                      onChange={(e) =>
                        setSeriesForm((prev) => ({
                          ...prev,
                          descriptions: prev.descriptions.map((d, i) =>
                            i === idx ? { ...d, handleTypes: e.target.value } : d
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
                ))}

              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="primary"
                onClick={async () => {
                  const fakeEvent = { preventDefault: () => { } };
                  await handleSeriesSubmit(fakeEvent);
                  setIsSeriesModalOpen(false);
                  resetSeriesForm();
                }}
              >
                {/* Update Series */}
                {editingSeriesId ? "Update Series" : "Add Series"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );

  const renderOptionSetSection = () => (
    <>
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Option Sets</h4>
            <p className="qa-subtitle">
              Configure standalone lists for color finish, mesh, glass specs or generic options.
            </p>
          </div>
          <div className="qa-actions">
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetOptionForm();
                setIsOptionModalOpen(true);
              }}
            >
              Add Option Set
            </MDBBtn>

          </div>
        </div>

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
      <MDBModal open={isOptionModalOpen} setOpen={setIsOptionModalOpen} tabIndex='-1'>
        <MDBModalDialog centered>
          <MDBModalContent>

            <MDBModalHeader>

              <MDBModalTitle>
                {editingOptionId ? "Edit Option Set" : "Add Option Set"}
              </MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => {
                  setIsOptionModalOpen(false);
                  resetOptionForm();
                }}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">

                {/* Type */}
                <div className="qa-form-group">
                  <label>Option Type</label>
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
                  >
                    <option value="colorFinish">Color finish</option>
                    <option value="glassSpec">Glass spec</option>
                    <option value="meshType">Mesh type</option>
                    <option value="handle">Handle</option>
                    <option value="generic">Generic</option>
                  </select>
                </div>

                {/* System */}
                {!GLOBAL_OPTION_TYPES.includes(optionForm.type) && (
                  <div className="qa-form-group">
                    <label>Select System</label>
                    <select
                      value={optionForm.systemId}
                      onChange={(e) =>
                        setOptionForm((prev) => ({
                          ...prev,
                          systemId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Global</option>
                      {systems.map((system) => (
                        <option key={system._id} value={system._id}>
                          {system.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Values */}
                <div className="qa-form-group">
                  <label>Values (Label: Rate)</label>
                  <textarea
                    rows={4}
                    value={optionForm.valuesText}
                    onChange={(e) =>
                      setOptionForm((prev) => ({
                        ...prev,
                        valuesText: e.target.value,
                      }))
                    }
                  />
                </div>

              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="primary"
                onClick={async () => {
                  const fakeEvent = { preventDefault: () => { } };
                  await handleOptionSubmit(fakeEvent);
                  setIsOptionModalOpen(false);
                  resetOptionForm();
                }}
              >
                {editingOptionId ? "Update Option Set" : "Add Option Set"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

    </>
  );

  const renderGlassBeadingSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div>
          <h4>Glass Beading Links</h4>
          <p className="qa-subtitle">
            Link each item description to a beading profile for every available glass spec.
          </p>
        </div>
        <div className="qa-actions">
          <MDBBtn size="sm" color="light" onClick={fetchCuttingScheduleData}>
            <MDBIcon fas icon="sync" className="me-2" />
            Refresh
          </MDBBtn>
        </div>
      </div>

      <div className="qa-table-wrapper">
        <table className="qa-table qa-cutting-table">
          <thead>
            <tr>
              <th>System</th>
              <th>Series</th>
              <th>Description</th>
              <th>Linked Glasses</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCuttingDescriptions.map((row) => {
              const config = cuttingConfigs.find(
                (item) =>
                  item.systemType === row.systemType &&
                  item.series === row.series &&
                  item.description === row.description
              );
              const linkCount = config?.glassBeadingLinks?.filter((link) => link.beadingSapCode).length || 0;
              return (
                <tr key={`beading-${row.systemType}-${row.series}-${row.description}`}>
                  <td>{row.systemType}</td>
                  <td>{row.series||"NA"}</td>
                  <td className="qa-title">{row.description || "NA"}</td>
                  <td>
                    <MDBBadge color={linkCount ? "success" : "warning"}>
                      {linkCount} / {glassSpecOptions.length}
                    </MDBBadge>
                  </td>
                  <td className="qa-actions-cell">
                    <MDBBtn size="sm" color={linkCount ? "light" : "primary"} onClick={() => selectGlassBeadingDescription(row)}>
                      <MDBIcon fas icon={linkCount ? "pen" : "plus"} className="me-2" />
                      Configure
                    </MDBBtn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredCuttingDescriptions.length && (
          <div className="qa-empty">No item descriptions found.</div>
        )}
      </div>

      <MDBModal open={isGlassBeadingModalOpen} onClose={() => setIsGlassBeadingModalOpen(false)} tabIndex="-1">
        <MDBModalDialog size="xl" scrollable className="qa-config-modal">
          <MDBModalContent>
            <form className="qa-modal-form" onSubmit={saveGlassBeadingLinks}>
              <MDBModalHeader>
                <MDBModalTitle>
                  Glass Beading Config
                  <span className="qa-modal-subtitle">
                    {selectedGlassBeadingRow?.systemType} / {selectedGlassBeadingRow?.series} / {selectedGlassBeadingRow?.description}
                  </span>
                </MDBModalTitle>
                <MDBBtn className="btn-close" color="none" type="button" onClick={() => setIsGlassBeadingModalOpen(false)} />
              </MDBModalHeader>
              <MDBModalBody>
                <div className="qa-table-wrapper qa-modal-table-wrapper">
                  <table className="qa-table qa-editor-table">
                    <thead>
                      <tr>
                        <th>Glass</th>
                        <th>Beading Profile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {glassBeadingLinks.map((link) => (
                        <tr key={link.glassSpec}>
                          <td className="qa-title">{link.glassSpec}</td>
                          <td>
                            <div className="qa-sap-autocomplete">
                              <input
                                value={link.beadingSapCode || ""}
                                onChange={(e) => searchBeadingSapCode(link.glassSpec, e.target.value)}
                                onBlur={() => handleBeadingSapCodeBlur(link.glassSpec)}
                                onFocus={() => {
                                  if (link.beadingSapCode && !link.beadingSapCodeSelected) {
                                    setBeadingAutocomplete((prev) => ({
                                      ...prev,
                                      [link.glassSpec]: {
                                        ...(prev[link.glassSpec] || {}),
                                        open: true,
                                      },
                                    }));
                                  }
                                }}
                                placeholder="Type beading SAP code"
                                autoComplete="off"
                              />
                              {beadingAutocomplete[link.glassSpec]?.open && (
                                <div className="qa-sap-menu">
                                  {beadingAutocomplete[link.glassSpec]?.loading && (
                                    <div className="qa-sap-message">Searching...</div>
                                  )}
                                  {!beadingAutocomplete[link.glassSpec]?.loading &&
                                    beadingAutocomplete[link.glassSpec]?.options?.length === 0 && (
                                      <div className="qa-sap-message">No SAP codes found</div>
                                    )}
                                  {!beadingAutocomplete[link.glassSpec]?.loading &&
                                    beadingAutocomplete[link.glassSpec]?.options?.map((product) => (
                                      <button
                                        key={`${link.glassSpec}-${product._id || product.sapCode}`}
                                        type="button"
                                        className="qa-sap-option"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selectBeadingSapCode(link.glassSpec, product)}
                                      >
                                        <span className="qa-sap-code">{product.sapCode}</span>
                                        <span className="qa-sap-name">{getSapProductLabel(product)}</span>
                                      </button>
                                    ))}
                                </div>
                              )}
                            </div>
                            {link.beadingDescription && (
                              <div className="qa-meta mt-1">{link.beadingDescription}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!glassBeadingLinks.length && (
                  <div className="qa-empty">Add glass specs in Option Sets before configuring beading links.</div>
                )}
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color="light" type="button" onClick={() => setIsGlassBeadingModalOpen(false)}>
                  Cancel
                </MDBBtn>
                <MDBBtn color="primary" type="submit" disabled={!glassBeadingLinks.length}>
                  Save links
                </MDBBtn>
              </MDBModalFooter>
            </form>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );

  const renderAreaSlabSection = () => (
    <>
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Area Slabs</h4>
            <p className="qa-subtitle">
              Define slab cutoffs to align base rate tables.
            </p>
          </div>
          <div className="qa-actions">
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetSlabForm();
                setIsSlabModalOpen(true);
              }}
            >
              Add Area Slab
            </MDBBtn>

          </div>
        </div>

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
      <MDBModal open={isSlabModalOpen} setOpen={setIsSlabModalOpen} tabIndex='-1'>
        <MDBModalDialog centered>
          <MDBModalContent>

            <MDBModalHeader>
              <MDBModalTitle>
                {editingSlabId ? "Edit Area Slab" : "Add Area Slab"}
              </MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => {
                  setIsSlabModalOpen(false);
                  resetSlabForm();
                }}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">

                {/* Label */}
                <div className="qa-form-group">
                  <label>Label</label>
                  <input
                    type="text"
                    value={slabForm.label}
                    onChange={(e) =>
                      setSlabForm((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Max */}
                <div className="qa-form-group">
                  <label>Max Area</label>
                  <input
                    type="number"
                    value={slabForm.max}
                    onChange={(e) =>
                      setSlabForm((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Order */}
                <div className="qa-form-group">
                  <label>Order</label>
                  <input
                    type="number"
                    value={slabForm.order}
                    onChange={(e) =>
                      setSlabForm((prev) => ({
                        ...prev,
                        order: e.target.value,
                      }))
                    }
                  />
                </div>

              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="primary"
                onClick={async () => {
                  const fakeEvent = { preventDefault: () => { } };
                  await handleSlabSubmit(fakeEvent);
                  setIsSlabModalOpen(false);
                  resetSlabForm();
                }}
              >
                {editingSlabId ? "Update Area Slab" : "Add Area Slab"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );

  const renderBaseRateSection = () => (
    <>
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
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetBaseRateForm();
                setIsBaseRateModalOpen(true);
              }}
            >
              Add Base Rate
            </MDBBtn>

          </div>
        </div>
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
      <MDBModal open={isBaseRateModalOpen} setOpen={setIsBaseRateModalOpen} tabIndex='-1'>
        <MDBModalDialog centered size="lg">
          <MDBModalContent>

            <MDBModalHeader>
              <MDBModalTitle>
                {editingBaseRateId ? "Edit Base Rate" : "Add Base Rate"}
              </MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => {
                  setIsBaseRateModalOpen(false);
                  resetBaseRateForm();
                }}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">

                {/* System Type */}
                <div className="qa-form-group">
                  <label>System Type</label>
                  <select
                    value={baseRateForm.systemType}
                    onChange={(e) =>
                      setBaseRateForm((prev) => ({
                        ...prev,
                        systemType: e.target.value,
                        series: "",       // reset
                        description: "",  // reset
                      }))
                    }
                  >
                    <option value="">Select system</option>
                    {systems.map((sys) => (
                      <option key={sys._id} value={sys.name}>
                        {sys.name}
                      </option>
                    ))}
                  </select>
                </div>
                {baseRateForm.systemType !== "Louvers" && (
  <>

                {/* Series */}
                <div className="qa-form-group">
                  <label>Series</label>
                  <select
                    value={baseRateForm.series}
                    onChange={(e) =>
                      setBaseRateForm((prev) => ({
                        ...prev,
                        series: e.target.value,
                        description: "", // reset
                      }))
                    }
                  >
                    <option value="">Select series</option>
                    {filteredSeries.map((item) => (
                      <option key={item._id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="qa-form-group">
                  <label>Description</label>
                  <select
                    value={baseRateForm.description}
                    onChange={(e) =>
                      setBaseRateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select description</option>
                    {descriptionOptions.map((desc) => (
                      <option key={desc.name} value={desc.name}>
                        {desc.name}
                      </option>
                    ))}
                  </select>
                
                </div>
                </>
                )}

                {/* Rates */}
                <div className="qa-form-group">
                  <label>Rates</label>

                  {baseRateForm.rates.map((rate, index) => (
                    <input
                      key={index}
                      type="number"
                      placeholder={`Rate ${index + 1}`}
                      value={rate}
                      onChange={(e) => {
                        const updatedRates = [...baseRateForm.rates];
                        updatedRates[index] = e.target.value;

                        setBaseRateForm((prev) => ({
                          ...prev,
                          rates: updatedRates,
                        }));
                      }}
                    />
                  ))}
                </div>

                {/* Notes */}
                <div className="qa-form-group">
                  <label>Notes</label>
                  <textarea
                    value={baseRateForm.notes}
                    onChange={(e) =>
                      setBaseRateForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="primary"
                onClick={async () => {
                  const fakeEvent = { preventDefault: () => { } };
                  await handleBaseRateSubmit(fakeEvent);
                  setIsBaseRateModalOpen(false);
                  resetBaseRateForm();
                }}
              >
                {editingBaseRateId ? "Update Base Rate" : "Add Base Rate"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );

  const renderHandleRulesSection = () => (
    <>
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Handle Rules</h4>
            <p className="qa-subtitle">
              Override handle defaults for matching system/series/description.
            </p>
          </div>
          <div className="qa-actions">
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetHandleRuleForm();
                setIsHandleRuleModalOpen(true);
              }}
            >
              Add Handle Rule
            </MDBBtn>

          </div>
        </div>
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
      <MDBModal open={isHandleRuleModalOpen} setOpen={setIsHandleRuleModalOpen} tabIndex='-1'>
        <MDBModalDialog centered>
          <MDBModalContent>

            <MDBModalHeader>
              <MDBModalTitle>
                {editingHandleRuleId ? "Edit Handle Rule" : "Add Handle Rule"}
              </MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => {
                  setIsHandleRuleModalOpen(false);
                  resetHandleRuleForm();
                }}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">

                {/* Description */}
                <div className="qa-form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={handleRuleForm.description}
                    onChange={(e) =>
                      setHandleRuleForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Handle Types */}
                <div className="qa-form-group">
                  <label>Handle types (comma separated)</label>
                  <input
                    type="text"
                    value={handleRuleForm.handleTypes}
                    onChange={(e) =>
                      setHandleRuleForm((prev) => ({
                        ...prev,
                        handleTypes: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Handle Count */}
                <div className="qa-form-group">
                  <label>Handle count</label>
                  <input
                    type="number"
                    value={handleRuleForm.handleCount}
                    onChange={(e) =>
                      setHandleRuleForm((prev) => ({
                        ...prev,
                        handleCount: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* System Type */}
                <div className="qa-form-group">
                  <label>System type (optional)</label>
                  <input
                    type="text"
                    value={handleRuleForm.systemType}
                    onChange={(e) =>
                      setHandleRuleForm((prev) => ({
                        ...prev,
                        systemType: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Series */}
                <div className="qa-form-group">
                  <label>Series (optional)</label>
                  <input
                    type="text"
                    value={handleRuleForm.series}
                    onChange={(e) =>
                      setHandleRuleForm((prev) => ({
                        ...prev,
                        series: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Notes */}
                <div className="qa-form-group">
                  <label>Notes</label>
                  <textarea
                    value={handleRuleForm.notes}
                    onChange={(e) =>
                      setHandleRuleForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="primary"
                onClick={async () => {
                  const fakeEvent = { preventDefault: () => { } };
                  await handleHandleRuleSubmit(fakeEvent);
                  setIsHandleRuleModalOpen(false);
                  resetHandleRuleForm();
                }}
              >
                {editingHandleRuleId ? "Update Handle Rule" : "Add Handle Rule"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

    </>
  );

  const renderHandleOptionsSection = () => (
    <>
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Handle Options</h4>
            <p className="qa-subtitle">
              Manage handle type and color pricing per system.
            </p>
            <p className="qa-hint">Enter one color rate per line, for example Black: 0.</p>
          </div>
          <div className="qa-actions">
            <MDBBtn
              size="sm"
              color="primary"
              onClick={() => {
                resetHandleOptionForm();
                setIsHandleOptionModalOpen(true);
              }}
            >
              Add Handle Option
            </MDBBtn>

          </div>
        </div>
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

      <MDBModal open={isHandleOptionModalOpen} setOpen={setIsHandleOptionModalOpen} tabIndex='-1'>
        <MDBModalDialog centered>
          <MDBModalContent>

            <MDBModalHeader>
              <MDBModalTitle>
                {editingHandleOptionId ? "Edit Handle Option" : "Add Handle Option"}
              </MDBModalTitle>
              <MDBBtn
                className='btn-close'
                color='none'
                onClick={() => {
                  setIsHandleOptionModalOpen(false);
                  resetHandleOptionForm();
                }}
              />
            </MDBModalHeader>

            <MDBModalBody>
              <form className="qa-form">

                {/* System Type */}
                <div className="qa-form-group">
                  <label>System Type</label>
                  <input
                    type="text"
                    value={handleOptionForm.systemType}
                    onChange={(e) =>
                      setHandleOptionForm((prev) => ({
                        ...prev,
                        systemType: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Handle Name */}
                <div className="qa-form-group">
                  <label>Handle Name</label>
                  <input
                    type="text"
                    value={handleOptionForm.name}
                    onChange={(e) =>
                      setHandleOptionForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Colors */}
                <div className="qa-form-group">
                  <label>Colors (Label: Rate)</label>
                  <textarea
                    rows={4}
                    value={handleOptionForm.colorsText}
                    onChange={(e) =>
                      setHandleOptionForm((prev) => ({
                        ...prev,
                        colorsText: e.target.value,
                      }))
                    }
                  />
                </div>

              </form>
            </MDBModalBody>

            <MDBModalFooter>
              <MDBBtn
                color="primary"
                onClick={async () => {
                  const fakeEvent = { preventDefault: () => { } };
                  await handleHandleOptionSubmit(fakeEvent);
                  setIsHandleOptionModalOpen(false);
                  resetHandleOptionForm();
                }}
              >
                {editingHandleOptionId ? "Update Handle Option" : "Add Handle Option"}
              </MDBBtn>
            </MDBModalFooter>

          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
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
          value={phoneFilter}
          onChange={(e) => setphoneFilter(e.target.value)


          }
        />
        <div className="qa-form-actions">
          <MDBBtn color="primary" size="sm" onClick={() => {
            setPage(1);
            fetchQuotations(1)
          }}>
            <MDBIcon fas icon="search" className="me-1" />
            Apply filters
          </MDBBtn>
          <MDBBtn
            color="light"
            size="sm"
            onClick={() => {
              setphoneFilter("");
              setPage(1);
              fetchQuotations(1, "");
            }}
          >
            Clear
          </MDBBtn>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f8f9fa",
            padding: "6px 12px",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              fontWeight: 500,
              fontSize: "13px",
              color: "#495057",
              whiteSpace: "nowrap",
            }}
          >
            Rows per page
          </span>

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              width: "60px",
              minWidth: "60px",
              maxWidth: "60px",
              padding: "4px 6px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
              fontSize: "13px",
              height: "30px",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>

          <MDBBtn
            size="sm"
            color="primary"
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              borderRadius: "6px",
              height: "32px"
            }}
            onClick={() => {
              const newLimit = Number(limit);
              setPage(1);
              fetchQuotations(1, phoneFilter, newLimit);
            }}
          >
            Show
          </MDBBtn>
        </div>
      </div>

      <div className="qa-table-wrapper">
        {/* // new table add */}
        <table className="qa-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Quotation ID</th>
              <th>Customer</th>
              <th>User</th>
              <th>Date</th>
              <th>Profit (%)</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {quotations?.length > 0 ? (
              quotations.map((quote, index) => (
                <tr key={quote._id}>
                  {/* Serial nummber */}
                  <td className="qa-meta">
                    {(page - 1) * limit + index + 1}
                  </td>
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
                  {/* Username */}
                  <td className="qa-title">
                    {quote.user?.name || "—"}
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
        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <MDBBtn
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </MDBBtn>

          <span>Page {page} of {totalPages}</span>

          <MDBBtn
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </MDBBtn>
        </div>
      </div>
    </div>
  );

  const renderCuttingScheduleSection = () => {
    const selectedConfig = cuttingConfigs.find(
      (config) =>
        config.systemType === cuttingForm.systemType &&
        config.series === cuttingForm.series &&
        config.description === cuttingForm.description
    );
    const activeCuttingSchedule =
      cuttingForm.schedules.find((schedule) => schedule.key === activeCuttingScheduleKey) ||
      cuttingForm.schedules[0] ||
      createCuttingSchedules()[0];
    const activeCuttingLines = activeCuttingSchedule.lines || [createCuttingLine()];

    return (
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Cutting Schedule Rules</h4>
            <p>
              Configure fabrication items against each quotation description. Profile formulas can use W, H, Q and AREA.
            </p>
          </div>
          <div className="qa-actions">
            <MDBBtn size="sm" color="light" onClick={fetchCuttingScheduleData}>
              <MDBIcon fas icon="sync" className="me-2" />
              Refresh
            </MDBBtn>
          </div>
        </div>

        <div className="qa-cutting-layout">
          <aside className="qa-cutting-sidebar">
            <div className="qa-side-card">
              <div className="qa-side-label">Configured</div>
              <div className="qa-side-value">{cuttingConfigs.filter((config) => getCuttingLineCount(config) > 0).length}</div>
              <div className="qa-meta">Descriptions with at least one saved rule set.</div>
            </div>
            <div className="qa-side-card">
              <div className="qa-side-label">Pending</div>
              <div className="qa-side-value">
                {Math.max(0, cuttingDescriptions.length - cuttingConfigs.filter((config) => getCuttingLineCount(config) > 0).length)}
              </div>
              <div className="qa-meta">Descriptions still needing fabrication rules.</div>
            </div>
            <div className="qa-side-card qa-selected-card">
              <div className="qa-side-label">Selected</div>
              {selectedCuttingRow ? (
                <>
                  <div className="qa-title">{selectedCuttingRow.description}</div>
                  <div className="qa-meta">{selectedCuttingRow.systemType} / {selectedCuttingRow.series}</div>
                  <div className="qa-badges mt-2">
                    <MDBBadge color={selectedCuttingRow.configured ? "success" : "warning"}>
                      {selectedCuttingRow.configured ? "Configured" : "Not configured"}
                    </MDBBadge>
                    <MDBBadge color="light">{selectedCuttingRow.lineCount || 0} total lines</MDBBadge>
                  </div>
                </>
              ) : (
                <div className="qa-meta">Pick a description from the table to edit its rules.</div>
              )}
            </div>
          </aside>

          <div className="qa-cutting-main">
            <div className="qa-toolbar">
              <div className="qa-search">
                <MDBIcon fas icon="search" />
                <input
                  value={cuttingSearch}
                  onChange={(e) => setCuttingSearch(e.target.value)}
                  placeholder="Search system, series or description"
                />
              </div>
              <MDBBadge color="light">{filteredCuttingDescriptions.length} shown</MDBBadge>
            </div>

            <div className="qa-table-wrapper">
              <table className="qa-table qa-cutting-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>System</th>
                    <th>Series</th>
                    <th>Description</th>
                    <th>Rules</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCuttingDescriptions.map((row) => (
                    <tr
                      key={`${row.systemType}-${row.series}-${row.description}`}
                      className={
                        selectedCuttingRow?.systemType === row.systemType &&
                          selectedCuttingRow?.series === row.series &&
                          selectedCuttingRow?.description === row.description
                          ? "selected"
                          : ""
                      }
                    >
                      <td>
                        <MDBBadge color={row.configured ? "success" : "warning"}>
                          {row.configured ? "Ready" : "Pending"}
                        </MDBBadge>
                      </td>
                      <td>{row.systemType}</td>
                      <td>{row.series}</td>
                      <td className="qa-title">{row.description}</td>
                      <td>{row.lineCount || 0}</td>
                      <td className="qa-actions-cell">
                        <MDBBtn size="sm" color={row.configured ? "light" : "primary"} onClick={() => selectCuttingDescription(row)}>
                          <MDBIcon fas icon={row.configured ? "pen" : "plus"} className="me-2" />
                          {row.configured ? "Edit" : "Create"}
                        </MDBBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filteredCuttingDescriptions.length && (
              <div className="qa-empty">No matching descriptions found.</div>
            )}
          </div>
        </div>

        <MDBModal open={isCuttingModalOpen} onClose={() => setIsCuttingModalOpen(false)} tabIndex="-1">
          <MDBModalDialog size="xl" scrollable className="qa-config-modal">
            <MDBModalContent>
              <form className="qa-modal-form" onSubmit={handleCuttingConfigSubmit}>
                <MDBModalHeader>
                  <MDBModalTitle>
                    Cutting Schedule Config
                    <span className="qa-modal-subtitle">
                      {cuttingForm.systemType} / {cuttingForm.series} / {cuttingForm.description}
                    </span>
                  </MDBModalTitle>
                  <MDBBtn className="btn-close" color="none" type="button" onClick={() => setIsCuttingModalOpen(false)} />
                </MDBModalHeader>
                <MDBModalBody>
                  <div className="qa-modal-summary">
                    <label>
                      System
                      <input value={cuttingForm.systemType} readOnly />
                    </label>
                    <label>
                      Series
                      <input value={cuttingForm.series} readOnly />
                    </label>
                    <label>
                      Description
                      <input value={cuttingForm.description} readOnly />
                    </label>
                    <label>
                      Notes
                      <input
                        value={cuttingForm.notes}
                        onChange={(e) => setCuttingForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Optional internal note"
                      />
                    </label>
                    <label>
                      Default Schedule
                      <select
                        value={cuttingForm.defaultScheduleKey}
                        onChange={(e) =>
                          setCuttingForm((prev) => ({ ...prev, defaultScheduleKey: e.target.value }))
                        }
                      >
                        {CUTTING_SCHEDULES.map((schedule) => (
                          <option key={schedule.key} value={schedule.key}>
                            {schedule.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="qa-schedule-tabs">
                    {CUTTING_SCHEDULES.map((schedule) => {
                      const scheduleLines =
                        cuttingForm.schedules.find((item) => item.key === schedule.key)?.lines || [];
                      const lineCount = scheduleLines.filter((line) => line.sapCode || line.itemType === "glass").length;
                      return (
                        <button
                          key={schedule.key}
                          type="button"
                          className={activeCuttingScheduleKey === schedule.key ? "active" : ""}
                          onClick={() => {
                            setActiveCuttingScheduleKey(schedule.key);
                            setSapAutocomplete({});
                          }}
                        >
                          <span>{schedule.label}</span>
                          <small>H {schedule.horizontalAngle}° / V {schedule.verticalAngle}°</small>
                          <MDBBadge color="light">{lineCount}</MDBBadge>
                        </button>
                      );
                    })}
                  </div>

                  <div className="qa-line-toolbar">
                    <div>
                      <div className="qa-title">Required Items</div>
                      <div className="qa-meta">
                        Editing H {activeCuttingSchedule.horizontalAngle}° / V {activeCuttingSchedule.verticalAngle}°.
                        Hardware rows only need SAP code and quantity. Profile rows use dimensions and cut angle. Add one glass row for the glass size formula.
                      </div>
                    </div>
                    {/* cutting schedule */}
                    <div className="qa-actions">
                      <MDBBtn size="sm" color="light" type="button" onClick={addGlassCuttingLine} disabled={activeCuttingLines.filter((line) => line.itemType === "glass").length>=2}>
                        <MDBIcon fas icon="plus" className="me-2" />
                        Add glass row
                      </MDBBtn>
                      <MDBBtn size="sm" color="primary" type="button" onClick={addCuttingLine}>
                        <MDBIcon fas icon="plus" className="me-2" />
                        Add line
                      </MDBBtn>
                    </div>
                  </div>

                  <div className="qa-table-wrapper qa-modal-table-wrapper">
                    <table className="qa-table qa-editor-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>SAP Code</th>
                          <th>Description Override</th>
                          <th>Qty</th>
                          <th>Dimension</th>
                          <th>Cut Angle</th>
                          <th>Position</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCuttingLines.map((line, index) => (
                          <tr key={index}>
                            <td>
                              <select value={line.itemType} onChange={(e) => updateCuttingLine(index, "itemType", e.target.value)}>
                                <option value="profile">Profile</option>
                                <option value="hardware">Hardware</option>
                                <option value="glass" disabled={line.itemType !== "glass" && activeCuttingLines.some((item) => item.itemType === "glass")}>
                                  Glass
                                </option>
                              </select>
                            </td>
                            <td>
                              {line.itemType === "glass" ? (
                                <input value="Selected quotation glass" disabled />
                              ) : (
                                <div className="qa-sap-autocomplete">
                                  <input
                                    value={line.sapCode}
                                    onChange={(e) => handleSapCodeSearch(index, e.target.value, line.itemType)}
                                    onBlur={() => handleSapCodeBlur(index)}
                                    onFocus={() => {
                                      if (line.sapCode && !line.sapCodeSelected) {
                                        setSapAutocomplete((prev) => ({
                                          ...prev,
                                          [index]: {
                                            ...(prev[index] || {}),
                                            open: true,
                                          },
                                        }));
                                      }
                                    }}
                                    placeholder="Type SAP code"
                                    autoComplete="off"
                                  />
                                  {sapAutocomplete[index]?.open && (
                                    <div className="qa-sap-menu">
                                      {sapAutocomplete[index]?.loading && (
                                        <div className="qa-sap-message">Searching...</div>
                                      )}
                                      {!sapAutocomplete[index]?.loading &&
                                        sapAutocomplete[index]?.options?.length === 0 && (
                                          <div className="qa-sap-message">No SAP codes found</div>
                                        )}
                                      {!sapAutocomplete[index]?.loading &&
                                        sapAutocomplete[index]?.options?.map((product) => (
                                          <button
                                            key={`${line.itemType}-${product._id || product.sapCode}`}
                                            type="button"
                                            className="qa-sap-option"
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => handleSapCodeSelect(index, product)}
                                          >
                                            <span className="qa-sap-code">{product.sapCode}</span>
                                            <span className="qa-sap-name">{getSapProductLabel(product)}</span>
                                          </button>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              <input value={line.description || ""} onChange={(e) => updateCuttingLine(index, "description", e.target.value)} placeholder="Use product name if blank" />
                            </td>
                            <td>
                              <input value={line.quantityFormula} onChange={(e) => updateCuttingLine(index, "quantityFormula", e.target.value)} placeholder="1, 2, Q*2" />
                            </td>
                            <td>
                              <input
                                value={line.dimensionFormula || ""}
                                disabled={line.itemType === "hardware"}
                                onChange={(e) => updateCuttingLine(index, "dimensionFormula", e.target.value)}
                                placeholder="W, H-30, (W/2)-65"
                              />
                            </td>
                            <td>
                              <input
                                value={line.cutAngle || ""}
                                disabled={line.itemType === "hardware" || line.itemType === "glass"}
                                onChange={(e) => updateCuttingLine(index, "cutAngle", e.target.value)}
                                placeholder="45°, 90°"
                              />
                            </td>
                            <td>
                              <input value={line.position || ""} onChange={(e) => updateCuttingLine(index, "position", e.target.value)} placeholder="W, H, S1" />
                            </td>
                            <td>
                              <MDBBtn size="sm" color="danger" outline type="button" onClick={() => removeCuttingLine(index)}>
                                <MDBIcon fas icon="trash" />
                              </MDBBtn>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </MDBModalBody>
                <MDBModalFooter>
                  {selectedConfig?._id && (
                    <MDBBtn color="danger" outline type="button" onClick={handleCuttingConfigDelete}>
                      Delete config
                    </MDBBtn>
                  )}
                  <MDBBtn color="light" type="button" onClick={() => setIsCuttingModalOpen(false)}>
                    Cancel
                  </MDBBtn>
                  <MDBBtn color="primary" type="submit" disabled={!cuttingForm.description}>
                    Save rules
                  </MDBBtn>
                </MDBModalFooter>
              </form>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </div>
    );
  };

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
            value: totalQuotations,
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
            {activeTab === "cuttingSchedule" && renderCuttingScheduleSection()}
            {activeTab === "glassBeading" && renderGlassBeadingSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationAdminPage;
