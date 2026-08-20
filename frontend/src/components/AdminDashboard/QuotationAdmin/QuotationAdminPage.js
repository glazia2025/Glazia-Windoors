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
      if (key) acc[key] = Number(rate) || 0;
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
let optionRowSequence = 0;
const createOptionRow = (label = "", rate = "", color = "#C0C0C0") => ({
  id: `option-row-${optionRowSequence += 1}`,
  label,
  rate,
  color,
});
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
  glassRef: "",
  quantityFormula: "1",
  dimensionFormula: "",
  cutAngle: "",
  position: "",
  unit: "Pcs",
  sortOrder: 0,
  sapCodeSelected: false,
});

const createGlassCuttingLine = (glassRef = "G1") => ({
  ...createCuttingLine(),
  itemType: "glass",
  glassRef,
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
            glassRef: line.itemType === "glass" ? (line.glassRef || "G1").toUpperCase() : "",
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
  const [gasketAutocomplete, setGasketAutocomplete] = useState({});
  const [glassBeadingDescriptions, setGlassBeadingDescriptions] = useState([]);
  const [glassBeadingConfigs, setGlassBeadingConfigs] = useState([]);
  const [mullionCouplerSeries, setMullionCouplerSeries] = useState([]);
  const [mullionCouplerConfigs, setMullionCouplerConfigs] = useState([]);
  const [selectedMullionCouplerRow, setSelectedMullionCouplerRow] = useState(null);
  const [isMullionCouplerModalOpen, setIsMullionCouplerModalOpen] = useState(false);
  const [mullionCouplerForm, setMullionCouplerForm] = useState({
    mullions: [],
    couplers: [],
  });
  const [joinProfileAutocomplete, setJoinProfileAutocomplete] = useState({});
  const [hardwareLinkingDescriptions, setHardwareLinkingDescriptions] = useState([]);
  const [hardwareLinkingConfigs, setHardwareLinkingConfigs] = useState([]);
  const [hardwareLinkingOptions, setHardwareLinkingOptions] = useState({ glassSpecs: [], hardware: [] });
  const [selectedHardwareLinkingRow, setSelectedHardwareLinkingRow] = useState(null);
  const [isHardwareLinkingModalOpen, setIsHardwareLinkingModalOpen] = useState(false);
  const [hardwareLinkingForm, setHardwareLinkingForm] = useState({ shutterCount: 1, glassRules: [] });
  const [hardwareLinkingAutocomplete, setHardwareLinkingAutocomplete] = useState({});
  const sapSearchTimers = useRef({});
  const beadingSearchTimers = useRef({});
  const gasketSearchTimers = useRef({});
  const joinProfileSearchTimers = useRef({});
  const loadedTabsRef = useRef(new Set());

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
    items: [createOptionRow()],
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
    systemType: "Louvers",
    series: "NA",
    description: "NA",
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
  const [isCopyScheduleModalOpen, setIsCopyScheduleModalOpen] = useState(false);

  const [copyScheduleForm, setCopyScheduleForm] = useState({
    from: "45_45",
    to: "45_90",
  });
  const [copySuccessMessage, setCopySuccessMessage] = useState("");
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
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
      setSystems((data.systems || []).filter((system) => system.name !== "Exhaust Fan"));
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

  const fetchGlassBeadingData = async () => {
    try {
      const [descriptionResponse, configResponse] = await Promise.all([
        api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/glass-beading/descriptions`,
          authConfig
        ),
        api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/glass-beading/configs`,
          authConfig
        ),
      ]);

      setGlassBeadingDescriptions(descriptionResponse.data.descriptions || []);
      setGlassBeadingConfigs(configResponse.data.configs || []);
    } catch (error) {
      console.error("Unable to load glass beading data", error);
    }
  };

  const fetchMullionCouplerData = async () => {
    try {
      const [seriesResponse, configResponse] = await Promise.all([
        api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/mullion-coupler/series`,
          authConfig
        ),
        api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/mullion-coupler/configs`,
          authConfig
        ),
      ]);
      setMullionCouplerSeries(seriesResponse.data.series || []);
      setMullionCouplerConfigs(configResponse.data.configs || []);
    } catch (error) {
      console.error("Unable to load mullion/coupler data", error);
    }
  };

  const fetchHardwareLinkingData = async () => {
    try {
      const [descriptions, configs] = await Promise.all([
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/hardware-linking/descriptions`, authConfig),
        api.get(`${QUOTATION_BASE_API_URL}/admin/quotations/hardware-linking/configs`, authConfig),
      ]);
      setHardwareLinkingDescriptions(descriptions.data.descriptions || []);
      setHardwareLinkingConfigs(configs.data.configs || []);
    } catch (error) { console.error("Unable to load hardware linking data", error); }
  };

  const fetchHardwareLinkingOptions = async () => {
    if (hardwareLinkingOptions.glassSpecs.length || hardwareLinkingOptions.hardware.length) {
      return hardwareLinkingOptions;
    }
    const { data } = await api.get(
      `${QUOTATION_BASE_API_URL}/admin/quotations/hardware-linking/options`,
      authConfig
    );
    const options = data || { glassSpecs: [], hardware: [] };
    setHardwareLinkingOptions(options);
    return options;
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
      fetchBaseRates(),
      fetchHandleRules(),
      fetchHandleOptions(),
      fetchCuttingScheduleData(),
      fetchGlassBeadingData(),
      fetchMullionCouplerData(),
      fetchHardwareLinkingData(),
    ]);
  };

  useEffect(() => {
    if (loadedTabsRef.current.has(activeTab)) return;
    loadedTabsRef.current.add(activeTab);

    const loadActiveTab = async () => {
      switch (activeTab) {
        case "systems":
          await fetchSystems();
          break;
        case "series":
          await Promise.all([fetchSystems(), fetchSeries()]);
          break;
        case "optionSets":
          await Promise.all([fetchSystems(), fetchOptionSets()]);
          break;
        case "baseRates":
          await Promise.all([fetchSystems(), fetchSeries(), fetchAreaSlabs(), fetchBaseRates()]);
          break;
        case "handleRules":
          await Promise.all([fetchSystems(), fetchSeries(), fetchHandleRules()]);
          break;
        case "handleOptions":
          await Promise.all([fetchSystems(), fetchHandleOptions()]);
          break;
        case "cuttingSchedule":
          await fetchCuttingScheduleData();
          break;
        case "glassBeading":
          await Promise.all([fetchGlassBeadingData(), fetchOptionSets()]);
          break;
        case "mullionCoupler":
          await fetchMullionCouplerData();
          break;
        case "hardwareLinking":
          await fetchHardwareLinkingData();
          break;
        default:
          break;
      }
    };

    loadActiveTab();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "quotations") fetchQuotations(page);
  }, [activeTab, page]);

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
      items: [createOptionRow()],
    });
    setEditingOptionId(null);
  };

  const handleOptionSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: optionForm.type,
      values: Object.fromEntries(
        optionForm.items
          .map((item) => [item.label.trim(), Number(item.rate) || 0])
          .filter(([label]) => label)
      ),
      colors: optionForm.type === "colorFinish"
        ? Object.fromEntries(
          optionForm.items
            .map((item) => [item.label.trim(), item.color || "#C0C0C0"])
            .filter(([label]) => label)
        )
        : {},
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
    const values = entriesFromMap(optionSet.values);
    const colors = toPlainObject(optionSet.colors);
    setEditingOptionId(optionSet._id);
    setOptionForm({
      type: optionSet.type,
      systemId: optionSet.system?._id || "",
      items: values.length
        ? values.map(([label, rate]) => createOptionRow(label, rate, colors[label] || "#C0C0C0"))
        : [createOptionRow()],
    });
    setIsOptionModalOpen(true);
  };

  const updateOptionRow = (id, field, value) => {
    setOptionForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const removeOptionRow = (id) => {
    setOptionForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : [createOptionRow()],
    }));
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
      systemType: "Louvers",
      series: "NA",
      description: "NA",
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
        (row.systemType === "Louvers" ||
          (config.series === row.series && config.description === row.description))
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
                const glassCount = schedule.lines.filter(
                  (item) => item.itemType === "glass"
                ).length;
                nextLine.sapCode = "";
                nextLine.sapCodeSelected = true;
                nextLine.cutAngle = "";
                nextLine.unit = "Sqft";
                nextLine.glassRef = `G${Math.floor(glassCount / 2) + 1}`;
              }
              if (field === "itemType") {
                if (value !== "glass") {
                  nextLine.glassRef = "";
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
            lines: (() => {
              const glassCount = schedule.lines.filter(
                (line) => line.itemType === "glass"
              ).length;
              const glassRef = `G${Math.floor(glassCount / 2) + 1}`;
              return [
                ...schedule.lines,
                {
                  ...createGlassCuttingLine(glassRef),
                  sortOrder: schedule.lines.length,
                },
              ];
            })(),
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
    const isLouvers = cuttingForm.systemType === "Louvers";
    if (!cuttingForm.systemType || (!isLouvers && (!cuttingForm.series || !cuttingForm.description))) return;

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
          series: isLouvers ? "" : cuttingForm.series,
          description: isLouvers ? "" : cuttingForm.description,
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
        (cuttingForm.systemType === "Louvers" ||
          (config.series === cuttingForm.series && config.description === cuttingForm.description))
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

  const performCopySchedule = () => {
    const { from, to } = copyScheduleForm;

    setCuttingForm((prev) => {
      const sourceSchedule = prev.schedules.find(
        (schedule) => schedule.key === from
      );

      if (!sourceSchedule) return prev;

      return {
        ...prev,
        schedules: prev.schedules.map((schedule) => {
          if (schedule.key !== to) return schedule;

          return {
            ...schedule,
            lines: sourceSchedule.lines.map((line) => ({
              ...line,
            })),
          };
        }),
      };
    });

    setActiveCuttingScheduleKey(to);
    setIsCopyScheduleModalOpen(false);
    setIsOverwriteModalOpen(false);
    setCopySuccessMessage("Schedule copied successfully.");

    setTimeout(() => {
      setCopySuccessMessage("");
    }, 2500);
  };

  const handleCopySchedule = () => {
    const { from, to } = copyScheduleForm;
    const targetSchedule = cuttingForm.schedules.find(
      (schedule) => schedule.key === to
    );

    const hasExistingData =
      targetSchedule?.lines?.some(
        (line) =>
          line.sapCode ||
          line.description ||
          line.dimensionFormula ||
          line.cutAngle ||
          line.position ||
          line.itemType === "glass"
      ) ?? false;
    if (hasExistingData) {
      setIsOverwriteModalOpen(true);
      return;
    }
    performCopySchedule();

  };

  const buildGlassBeadingRows = (configs = []) => {
    const byGlass = new Map(
      (configs || []).map((config) => [config.glassSpec, config])
    );

    return glassSpecOptions.map((glassSpec) => {
      const existing = byGlass.get(glassSpec);

      return {
        glassSpec,

        beadings:
          existing?.beadings?.length > 0
            ? existing.beadings.map((beading) => ({
              sapCode: beading.sapCode || "",
              description: beading.description || "",
              formula: beading.formula || "",
              quantity: beading.quantity || "",
              sapCodeSelected: Boolean(beading.sapCode),
            }))
            : [
              {
                sapCode: "",
                description: "",
                formula: "",
                quantity: "",
                sapCodeSelected: false,
              },
            ],

        gaskets:
          existing?.gaskets?.length > 0
            ? existing.gaskets.map((gasket) => ({
              sapCode: gasket.sapCode || "",
              description: gasket.description || "",
              formula: gasket.formula || "",
              sapCodeSelected: Boolean(gasket.sapCode),
            }))
            : [
              {
                sapCode: "",
                description: "",
                formula: "",
                sapCodeSelected: false,
              },
            ],
      };
    });
  };

  const selectGlassBeadingDescription = (row) => {
    const existingConfigs = glassBeadingConfigs.filter(
      (config) =>
        config.systemType === row.systemType &&
        config.series === row.series &&
        config.description === row.description
    );

    setSelectedGlassBeadingRow({
      ...row,
      configId: existingConfigs[0]?._id,
      linkCount: existingConfigs.length,
    });

    setGlassBeadingLinks(buildGlassBeadingRows(existingConfigs));

    setBeadingAutocomplete({});
    setGasketAutocomplete({});
    setIsGlassBeadingModalOpen(true);
  };

  const closeBeadingAutocomplete = (glassSpec, rowIndex) => {
    const key = `${glassSpec}-${rowIndex}`;

    setBeadingAutocomplete((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        open: false,
        loading: false,
      },
    }));
  };
  const closeGasketAutocomplete = (glassSpec, rowIndex) => {
    const key = `${glassSpec}-${rowIndex}`;

    setGasketAutocomplete((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        open: false,
        loading: false,
      },
    }));
  };

  const searchBeadingSapCode = (glassSpec, rowIndex, value) => {
    setGlassBeadingLinks((prev) =>
      prev.map((link) =>
        link.glassSpec === glassSpec
          ? {
            ...link,
            beadings: link.beadings.map((beading, index) =>
              index === rowIndex
                ? {
                  ...beading,
                  sapCode: value,
                  description: "",
                  sapCodeSelected: false,
                }
                : beading
            ),
          }
          : link
      )
    );

    const key = `${glassSpec}-${rowIndex}`;

    if (beadingSearchTimers.current[key]) {
      window.clearTimeout(beadingSearchTimers.current[key]);
    }

    const query = value.trim();

    setBeadingAutocomplete((prev) => ({
      ...prev,
      [key]: {
        query: value,
        options: [],
        loading: Boolean(query),
        open: Boolean(query),
      },
    }));

    if (!query) return;

    beadingSearchTimers.current[key] = window.setTimeout(async () => {
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
          [key]: {
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
          [key]: {
            query,
            options: [],
            loading: false,
            open: true,
          },
        }));
      }
    }, 250);
  };

  const selectBeadingSapCode = (glassSpec, rowIndex, product) => {
    setGlassBeadingLinks((prev) =>
      prev.map((link) =>
        link.glassSpec === glassSpec
          ? {
            ...link,
            beadings: link.beadings.map((beading, index) =>
              index === rowIndex
                ? {
                  ...beading,
                  sapCode: product.sapCode || "",
                  description: getSapProductLabel(product),
                  sapCodeSelected: true,
                }
                : beading
            ),
          }
          : link
      )
    );

    closeBeadingAutocomplete(glassSpec, rowIndex);
  };

  const handleBeadingSapCodeBlur = (glassSpec, rowIndex) => {
    window.setTimeout(() => {
      setGlassBeadingLinks((prev) =>
        prev.map((link) =>
          link.glassSpec === glassSpec
            ? {
              ...link,
              beadings: link.beadings.map((beading, index) =>
                index === rowIndex &&
                  beading.sapCode &&
                  !beading.sapCodeSelected
                  ? {
                    ...beading,
                    sapCode: "",
                    description: "",
                  }
                  : beading
              ),
            }
            : link
        )
      );

      closeBeadingAutocomplete(glassSpec, rowIndex);
    }, 150);
  };

  const searchGasketSapCode = (glassSpec, rowIndex, value) => {
    setGlassBeadingLinks((prev) =>
      prev.map((link) =>
        link.glassSpec === glassSpec
          ? {
            ...link,
            gaskets: link.gaskets.map((gasket, index) =>
              index === rowIndex
                ? {
                  ...gasket,
                  sapCode: value,
                  description: "",
                  sapCodeSelected: false,
                }
                : gasket
            ),
          }
          : link
      )
    );

    if (gasketSearchTimers.current[`${glassSpec}-${rowIndex}`]) {
      window.clearTimeout(
        gasketSearchTimers.current[`${glassSpec}-${rowIndex}`]
      );
    }

    const query = value.trim();

    setGasketAutocomplete((prev) => ({
      ...prev,
      [`${glassSpec}-${rowIndex}`]: {
        query: value,
        options: [],
        loading: Boolean(query),
        open: Boolean(query),
      },
    }));

    if (!query) return;

    gasketSearchTimers.current[`${glassSpec}-${rowIndex}`] =
      window.setTimeout(async () => {
        try {
          const { data } = await api.get(
            `${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/catalog`,
            {
              ...authConfig,
              params: {
                itemType: "hardware",
                sapCode: query,
              },
            }
          );

          setGasketAutocomplete((prev) => ({
            ...prev,
            [`${glassSpec}-${rowIndex}`]: {
              query,
              options: data.products || (data.product ? [data.product] : []),
              loading: false,
              open: true,
            },
          }));
        } catch (error) {
          console.error("Unable to search gasket SAP code", error);

          setGasketAutocomplete((prev) => ({
            ...prev,
            [`${glassSpec}-${rowIndex}`]: {
              query,
              options: [],
              loading: false,
              open: true,
            },
          }));
        }
      }, 250);
  };

  const selectGasketSapCode = (glassSpec, rowIndex, product) => {
    setGlassBeadingLinks((prev) =>
      prev.map((link) =>
        link.glassSpec === glassSpec
          ? {
            ...link,
            gaskets: link.gaskets.map((gasket, index) =>
              index === rowIndex
                ? {
                  ...gasket,
                  sapCode: product.sapCode || "",
                  description: getSapProductLabel(product),
                  sapCodeSelected: true,
                }
                : gasket
            ),
          }
          : link
      )
    );

    closeGasketAutocomplete(`${glassSpec}-${rowIndex}`);
  };

  const handleGasketSapCodeBlur = (glassSpec, rowIndex) => {
    window.setTimeout(() => {
      setGlassBeadingLinks((prev) =>
        prev.map((link) =>
          link.glassSpec === glassSpec
            ? {
              ...link,
              gaskets: link.gaskets.map((gasket, index) =>
                index === rowIndex &&
                  gasket.sapCode &&
                  !gasket.sapCodeSelected
                  ? {
                    ...gasket,
                    sapCode: "",
                    description: "",
                  }
                  : gasket
              ),
            }
            : link
        )
      );

      closeGasketAutocomplete(glassSpec, rowIndex);
    }, 150);
  };
  const addBeadingRow = (glassSpec) => {
    setGlassBeadingLinks((prev) =>
      prev.map((item) =>
        item.glassSpec === glassSpec
          ? {
            ...item,
            beadings: [
              ...item.beadings,
              {
                sapCode: "",
                description: "",
                formula: "",
                quantity: "",
                sapCodeSelected: false,
              },
            ],
          }
          : item
      )
    );
  };

  const addGasketRow = (glassSpec) => {
    setGlassBeadingLinks((prev) =>
      prev.map((item) =>
        item.glassSpec === glassSpec
          ? {
            ...item,
            gaskets: [
              ...item.gaskets,
              {
                sapCode: "",
                description: "",
                formula: "",
                sapCodeSelected: false,
              },
            ],
          }
          : item
      )
    );
  };
  const removeBeadingRow = (glassSpec, indexToRemove) => {
    setGlassBeadingLinks((prev) =>
      prev.map((item) =>
        item.glassSpec === glassSpec
          ? {
            ...item,
            beadings: item.beadings.filter(
              (_, index) => index !== indexToRemove
            ),
          }
          : item
      )
    );
  };

  const removeGasketRow = (glassSpec, indexToRemove) => {
    setGlassBeadingLinks((prev) =>
      prev.map((item) =>
        item.glassSpec === glassSpec
          ? {
            ...item,
            gaskets: item.gaskets.filter(
              (_, index) => index !== indexToRemove
            ),
          }
          : item
      )
    );
  };

  const saveGlassBeadingLinks = async (event) => {
    event.preventDefault();

    if (!selectedGlassBeadingRow) return;

    try {
      for (const link of glassBeadingLinks) {
        if (!link.glassSpec) continue;

        const payload = {
          glassSpec: link.glassSpec,
          systemType: selectedGlassBeadingRow.systemType,
          series: selectedGlassBeadingRow.series,
          description: selectedGlassBeadingRow.description,

          beadings: (link.beadings || [])
            .filter((b) => b.sapCodeSelected)
            .map((b) => ({
              sapCode: b.sapCode,
              description: b.description,
              formula: b.formula,
              quantity: Number(b.quantity) || 1,
            })),

          gaskets: (link.gaskets || [])
            .filter((g) => g.sapCodeSelected)
            .map((g) => ({
              sapCode: g.sapCode,
              description: g.description,
              formula: g.formula,
            })),


        };
        console.log(glassBeadingLinks);

        await api.post(
          `${QUOTATION_BASE_API_URL}/admin/quotations/glass-beading/configs`,
          payload,
          authConfig
        );
      }

      await fetchGlassBeadingData();

      setIsGlassBeadingModalOpen(false);
    } catch (error) {
      console.error("Unable to save glass beading config", error);
    }
  };

  const createJoinProfileLine = (formula = "H") => ({
    sapCode: "",
    description: "",
    formula,
    quantity: 1,
    glassDimensionEffect: 0,
    sapCodeSelected: false,
  });

  const selectMullionCouplerSeries = (row) => {
    const existing = mullionCouplerConfigs.find(
      (config) =>
        config.systemType === row.systemType && config.series === row.series
    );
    const prepare = (lines, formula) =>
      lines?.length
        ? lines.map((line) => ({
          ...line,
          sapCodeSelected: Boolean(line.sapCode),
        }))
        : [createJoinProfileLine(formula)];

    setSelectedMullionCouplerRow({ ...row, configId: existing?._id });
    setMullionCouplerForm({
      mullions: prepare(existing?.mullions, "H"),
      couplers: prepare(existing?.couplers, "H"),
    });
    setJoinProfileAutocomplete({});
    setIsMullionCouplerModalOpen(true);
  };

  const updateJoinProfileLine = (kind, index, patch) => {
    setMullionCouplerForm((prev) => ({
      ...prev,
      [kind]: prev[kind].map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line
      ),
    }));
  };

  const addJoinProfileLine = (kind) => {
    setMullionCouplerForm((prev) => ({
      ...prev,
      [kind]: [...prev[kind], createJoinProfileLine("H")],
    }));
  };

  const removeJoinProfileLine = (kind, index) => {
    setMullionCouplerForm((prev) => ({
      ...prev,
      [kind]: prev[kind].filter((_, lineIndex) => lineIndex !== index),
    }));
  };

  const searchJoinProfileSapCode = (kind, index, value) => {
    const key = `${kind}-${index}`;
    updateJoinProfileLine(kind, index, {
      sapCode: value,
      description: "",
      sapCodeSelected: false,
    });
    if (joinProfileSearchTimers.current[key]) {
      window.clearTimeout(joinProfileSearchTimers.current[key]);
    }
    const query = value.trim();
    setJoinProfileAutocomplete((prev) => ({
      ...prev,
      [key]: { query: value, options: [], loading: Boolean(query), open: Boolean(query) },
    }));
    if (!query) return;

    joinProfileSearchTimers.current[key] = window.setTimeout(async () => {
      try {
        const { data } = await api.get(
          `${QUOTATION_BASE_API_URL}/admin/quotations/cutting-schedule/catalog`,
          { ...authConfig, params: { itemType: "profile", sapCode: query } }
        );
        setJoinProfileAutocomplete((prev) => ({
          ...prev,
          [key]: {
            query,
            options: data.products || (data.product ? [data.product] : []),
            loading: false,
            open: true,
          },
        }));
      } catch (error) {
        console.error("Unable to search mullion/coupler SAP code", error);
        setJoinProfileAutocomplete((prev) => ({
          ...prev,
          [key]: { query, options: [], loading: false, open: true },
        }));
      }
    }, 250);
  };

  const selectJoinProfileSapCode = (kind, index, product) => {
    updateJoinProfileLine(kind, index, {
      sapCode: product.sapCode || "",
      description: getSapProductLabel(product),
      sapCodeSelected: true,
    });
    setJoinProfileAutocomplete((prev) => ({
      ...prev,
      [`${kind}-${index}`]: { ...(prev[`${kind}-${index}`] || {}), open: false },
    }));
  };

  const handleJoinProfileSapCodeBlur = (kind, index) => {
    window.setTimeout(() => {
      setMullionCouplerForm((prev) => ({
        ...prev,
        [kind]: prev[kind].map((line, lineIndex) =>
          lineIndex === index && line.sapCode && !line.sapCodeSelected
            ? { ...line, sapCode: "", description: "" }
            : line
        ),
      }));
      setJoinProfileAutocomplete((prev) => ({
        ...prev,
        [`${kind}-${index}`]: { ...(prev[`${kind}-${index}`] || {}), open: false },
      }));
    }, 150);
  };

  const saveMullionCouplerConfig = async (event) => {
    event.preventDefault();
    if (!selectedMullionCouplerRow) return;
    try {
      const normalize = (lines) =>
        lines
          .filter((line) => line.sapCodeSelected)
          .map((line) => ({
            sapCode: line.sapCode,
            description: line.description,
            formula: line.formula || "H",
            quantity: Number(line.quantity) || 1,
            glassDimensionEffect: Math.max(0, Number(line.glassDimensionEffect) || 0),
          }));
      await api.post(
        `${QUOTATION_BASE_API_URL}/admin/quotations/mullion-coupler/configs`,
        {
          systemType: selectedMullionCouplerRow.systemType,
          series: selectedMullionCouplerRow.series,
          mullions: normalize(mullionCouplerForm.mullions),
          couplers: normalize(mullionCouplerForm.couplers),
        },
        authConfig
      );
      await fetchMullionCouplerData();
      setIsMullionCouplerModalOpen(false);
    } catch (error) {
      console.error("Unable to save mullion/coupler config", error);
    }
  };

  const deleteMullionCouplerConfig = async () => {
    if (!selectedMullionCouplerRow?.configId) return;
    if (!window.confirm("Delete this mullion/coupler linking?")) return;
    try {
      await api.delete(
        `${QUOTATION_BASE_API_URL}/admin/quotations/mullion-coupler/configs/${selectedMullionCouplerRow.configId}`,
        authConfig
      );
      await fetchMullionCouplerData();
      setIsMullionCouplerModalOpen(false);
    } catch (error) {
      console.error("Unable to delete mullion/coupler config", error);
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: "quotations", label: "Quotations", icon: "file-invoice-dollar" },
      { id: "systems", label: "Systems", icon: "boxes" },
      { id: "series", label: "Series", icon: "sitemap" },
      { id: "optionSets", label: "Option Sets", icon: "palette" },
      { id: "baseRates", label: "Louvers Rate", icon: "layer-group" },
      { id: "handleRules", label: "Handle Rules", icon: "hand-paper" },
      { id: "handleOptions", label: "Handle Options", icon: "swatchbook" },
      { id: "cuttingSchedule", label: "Cutting Schedule", icon: "ruler-combined" },
      { id: "glassBeading", label: "Glass Beading", icon: "link" },
      { id: "mullionCoupler", label: "Mullion / Coupler", icon: "grip-lines-vertical" },
      { id: "hardwareLinking", label: "Hardware", icon: "tools" },
    ];

    const tabCounts = {
      quotations: totalQuotations,
      systems: systems.length,
      series: series.length,
      optionSets: optionSets.length,
      baseRates: baseRates.length,
      handleRules: handleRules.length,
      handleOptions: handleOptions.length,
      cuttingSchedule: cuttingConfigs.filter((config) => getCuttingLineCount(config) > 0).length,
      glassBeading: cuttingConfigs.reduce(
        (total, config) => total + (config.glassBeadingLinks?.filter((link) => link.beadingSapCode).length || 0),
        0
      ),
      mullionCoupler: mullionCouplerSeries.filter((item) => item.configured).length,
      hardwareLinking: hardwareLinkingDescriptions.filter((item) => item.configured).length,
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
                        <div key={label} className="qa-option-summary-row">
                          {item.type === "colorFinish" && (
                            <span
                              className="qa-option-swatch"
                              style={{ backgroundColor: toPlainObject(item.colors)[label] || "#C0C0C0" }}
                              title={toPlainObject(item.colors)[label] || "#C0C0C0"}
                            />
                          )}
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
        <MDBModalDialog centered size="lg">
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

                <div className="qa-option-editor">
                  <div className="qa-option-editor-header">
                    <div>
                      <label>Options</label>
                      <p>Add each option and its rate separately.</p>
                    </div>
                    <MDBBtn
                      size="sm"
                      color="light"
                      type="button"
                      onClick={() => setOptionForm((prev) => ({ ...prev, items: [...prev.items, createOptionRow()] }))}
                    >
                      <MDBIcon fas icon="plus" className="me-2" />
                      Add option
                    </MDBBtn>
                  </div>

                  <div className={`qa-option-editor-columns ${optionForm.type === "colorFinish" ? "has-color" : ""}`} aria-hidden="true">
                    <span>Option name</span>
                    <span>Rate</span>
                    {optionForm.type === "colorFinish" && <span>Frame colour</span>}
                    <span />
                  </div>

                  <div className="qa-option-editor-rows">
                    {optionForm.items.map((item) => (
                      <div className={`qa-option-editor-row ${optionForm.type === "colorFinish" ? "has-color" : ""}`} key={item.id}>
                        <input
                          type="text"
                          aria-label="Option name"
                          placeholder="e.g. Matt Black"
                          value={item.label}
                          onChange={(e) => updateOptionRow(item.id, "label", e.target.value)}
                        />
                        <input
                          type="number"
                          aria-label={`${item.label || "Option"} rate`}
                          placeholder="0.00"
                          value={item.rate}
                          onChange={(e) => updateOptionRow(item.id, "rate", e.target.value)}
                        />
                        {optionForm.type === "colorFinish" && (
                          <label className="qa-option-color-control">
                            <input
                              type="color"
                              aria-label={`${item.label || "Option"} frame colour`}
                              value={item.color || "#C0C0C0"}
                              onChange={(e) => updateOptionRow(item.id, "color", e.target.value)}
                            />
                            <span>{item.color || "#C0C0C0"}</span>
                          </label>
                        )}
                        <button type="button" className="qa-option-remove" onClick={() => removeOptionRow(item.id)} aria-label={`Remove ${item.label || "option"}`}>
                          <MDBIcon fas icon="trash" />
                        </button>
                      </div>
                    ))}
                  </div>
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
          <MDBBtn size="sm" color="light" onClick={fetchGlassBeadingData}>
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
                  <td>{row.series || "NA"}</td>
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
                        <th>Beading Profile
                        </th>
                        <th>Gasket
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {glassBeadingLinks.map((link) => (
                        <tr key={link.glassSpec}>
                          <td className="qa-title">{link.glassSpec}</td>
                          <td className="border-end">
                            {link.beadings.map((beading, index) => (
                              <div key={index}>
                                <div className="d-flex align-items-start gap-2">
                                  {/* SAP CODE */}
                                  <div className="qa-sap-autocomplete">
                                    <input
                                      value={beading.sapCode || ""}
                                      onChange={(e) => searchBeadingSapCode(link.glassSpec, index, e.target.value)}
                                      onBlur={() => handleBeadingSapCodeBlur(link.glassSpec, index)}
                                      onFocus={() => {
                                        if (beading.sapCode && !beading.sapCodeSelected) {
                                          setBeadingAutocomplete((prev) => ({
                                            ...prev,
                                            [link.glassSpec]: {
                                              ...(prev[link.glassSpec] || {}),
                                              open: true,
                                            },
                                          }));
                                        }
                                      }}
                                      placeholder="Type SAP code"
                                      autoComplete="off"
                                    />
                                    {beadingAutocomplete[`${link.glassSpec}-${index}`]?.open && (
                                      <div className="qa-sap-menu">
                                        {beadingAutocomplete[`${link.glassSpec}-${index}`]?.loading && (
                                          <div className="qa-sap-message">Searching...</div>
                                        )}
                                        {!beadingAutocomplete[`${link.glassSpec}-${index}`]?.loading &&
                                          beadingAutocomplete[`${link.glassSpec}-${index}`]?.options?.length === 0 && (
                                            <div className="qa-sap-message">No SAP codes found</div>
                                          )}
                                        {!beadingAutocomplete[`${link.glassSpec}-${index}`]?.loading &&
                                          beadingAutocomplete[`${link.glassSpec}-${index}`]?.options?.map((product) => (
                                            <button
                                              key={`${link.glassSpec}-${product._id || product.sapCode}`}
                                              type="button"
                                              className="qa-sap-option"
                                              onMouseDown={(event) => event.preventDefault()}
                                              onClick={() => selectBeadingSapCode(link.glassSpec, index, product)}
                                            >
                                              <span className="qa-sap-code">{product.sapCode}</span>
                                              <span className="qa-sap-name">{getSapProductLabel(product)}</span>
                                            </button>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                  {beading.description && (
                                    <div className="qa-meta mt-1">{beading.description}</div>
                                  )}
                                  {/* FORMULA */}
                                  <input
                                    className="qa-formula-input"
                                    placeholder="Formula"
                                    value={beading.formula || ""}
                                    onChange={(e) =>
                                      setGlassBeadingLinks((prev) =>
                                        prev.map((item) =>
                                          item.glassSpec === link.glassSpec
                                            ? {
                                              ...item,
                                              beadings: item.beadings.map((b, i) =>
                                                i === index
                                                  ? {
                                                    ...b,
                                                    formula: e.target.value,
                                                  }
                                                  : b
                                              ),
                                            }
                                            : item
                                        )
                                      )
                                    }
                                  />
                                  {/* QUANTITY */}
                                  <input
                                    className="qa-qty-input"
                                    placeholder="Qty"
                                    value={beading.quantity || ""}
                                    onChange={(e) =>
                                      setGlassBeadingLinks((prev) =>
                                        prev.map((item) =>
                                          item.glassSpec === link.glassSpec
                                            ? {
                                              ...item,
                                              beadings: item.beadings.map((b, i) =>
                                                i === index
                                                  ? {
                                                    ...b,
                                                    quantity: e.target.value,
                                                  }
                                                  : b
                                              ),
                                            }
                                            : item
                                        )
                                      )
                                    }
                                  />
                                  {link.beadings.length > 1 && (
                                    <MDBBtn
                                      color="danger"
                                      size="sm"
                                      type="button"
                                      onClick={() => removeBeadingRow(link.glassSpec, index)}
                                    >
                                      <MDBIcon fas icon="trash" />
                                    </MDBBtn>

                                  )}

                                </div>

                              </div>
                            ))}
                            <MDBBtn
                              size="sm"
                              color="primary"
                              type="button"
                              onClick={() => addBeadingRow(link.glassSpec)}
                            >
                              + Add Row
                            </MDBBtn>

                          </td>

                          <td>
                            {link.gaskets.map((gasket, index) => (
                              <div key={index}>

                                <div className="d-flex align-items-start gap-2">
                                  {/* SAP CODE */}
                                  <div className="qa-sap-autocomplete qa-sap-input">
                                    <input
                                      value={gasket.sapCode || ""}
                                      onChange={(e) => searchGasketSapCode(link.glassSpec, index, e.target.value)}
                                      onBlur={() => handleGasketSapCodeBlur(link.glassSpec, index)}
                                      onFocus={() => {
                                        if (gasket.sapCode && !gasket.sapCodeSelected) {
                                          setGasketAutocomplete((prev) => ({
                                            ...prev,
                                            [link.glassSpec]: {
                                              ...(prev[link.glassSpec] || {}),
                                              open: true,
                                            },
                                          }));
                                        }
                                      }}
                                      placeholder="Type SAP code"
                                      autoComplete="off"
                                    />
                                    {gasketAutocomplete[`${link.glassSpec}-${index}`]?.open && (
                                      <div className="qa-sap-menu">
                                        {gasketAutocomplete[`${link.glassSpec}-${index}`]?.loading && (
                                          <div className="qa-sap-message">Searching...</div>
                                        )}
                                        {!gasketAutocomplete[`${link.glassSpec}-${index}`]?.loading &&
                                          gasketAutocomplete[`${link.glassSpec}-${index}`]?.options?.length === 0 && (
                                            <div className="qa-sap-message">No SAP codes found</div>
                                          )}
                                        {!gasketAutocomplete[`${link.glassSpec}-${index}`]?.loading &&
                                          gasketAutocomplete[`${link.glassSpec}-${index}`]?.options?.map((product) => (
                                            <button
                                              key={`${link.glassSpec}-${product._id || product.sapCode}`}
                                              type="button"
                                              className="qa-sap-option"
                                              onMouseDown={(event) => event.preventDefault()}
                                              onClick={() => selectGasketSapCode(link.glassSpec, index, product)}
                                            >
                                              <span className="qa-sap-code">{product.sapCode}</span>
                                              <span className="qa-sap-name">{getSapProductLabel(product)}</span>
                                            </button>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                  {gasket.description && (
                                    <div className="qa-meta mt-1">{gasket.description}</div>
                                  )}
                                  {/* FORMULA */}
                                  <input
                                    placeholder="Formula"
                                    value={gasket.formula || ""}
                                    onChange={(e) =>
                                      setGlassBeadingLinks((prev) =>
                                        prev.map((item) =>
                                          item.glassSpec === link.glassSpec
                                            ? {
                                              ...item,
                                              gaskets: item.gaskets.map((g, i) =>
                                                i === index
                                                  ? {
                                                    ...g,
                                                    formula: e.target.value,
                                                  }
                                                  : g
                                              ),
                                            }
                                            : item
                                        )
                                      )
                                    }
                                  />
                                  {link.gaskets.length > 1 && (
                                    <MDBBtn
                                      size="sm"
                                      color="danger"
                                      type="button"
                                      onClick={() => removeGasketRow(link.glassSpec, index)}
                                    >
                                      <MDBIcon fas icon="trash" />
                                    </MDBBtn>
                                  )}
                                </div>


                              </div>
                            ))}
                            <MDBBtn
                              size="sm"
                              color="primary"
                              type="button"

                              onClick={() => addGasketRow(link.glassSpec)}
                            >
                              + Add Row
                            </MDBBtn>


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

  const renderMullionCouplerSection = () => {
    const renderLinkingLines = (kind, label) => (
      <div className="qa-join-profile-section">
        <div className="qa-line-toolbar">
          <div>
            <strong>{label}</strong>
            <div className="qa-meta">SAP profile, cutting formula and quantity per divider.</div>
          </div>
          <MDBBtn size="sm" color="primary" type="button" onClick={() => addJoinProfileLine(kind)}>
            <MDBIcon fas icon="plus" className="me-2" />
            Add row
          </MDBBtn>
        </div>
        <div className="qa-table-wrapper">
          <table className="qa-table qa-editor-table">
            <thead>
              <tr>
                <th>SAP Code</th>
                <th>Profile</th>
                <th>Cutting Schedule</th>
                <th>Effect on Glass Dimension (mm)</th>
                <th>Quantity</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mullionCouplerForm[kind].map((line, index) => {
                const autocomplete = joinProfileAutocomplete[`${kind}-${index}`];
                return (
                  <tr key={`${kind}-${index}`}>
                    <td>
                      <div className="qa-sap-autocomplete">
                        <input
                          value={line.sapCode || ""}
                          onChange={(event) =>
                            searchJoinProfileSapCode(kind, index, event.target.value)
                          }
                          onBlur={() => handleJoinProfileSapCodeBlur(kind, index)}
                          placeholder="Type SAP code"
                          autoComplete="off"
                        />
                        {autocomplete?.open && (
                          <div
                            className="qa-sap-menu"
                            style={{
                              display: "block",
                              position: "relative",
                              background: "white",
                              border: "2px solid white",
                              zIndex: 999999,
                            }}
                          >
                            {autocomplete.loading && (
                              <div className="qa-sap-message">Searching...</div>
                            )}
                            {!autocomplete.loading && autocomplete.options?.length === 0 && (
                              <div className="qa-sap-message">No SAP codes found</div>
                            )}
                            {!autocomplete.loading &&
                              autocomplete.options?.map((product) => (
                                <button
                                  key={product._id || product.sapCode}
                                  type="button"
                                  className="qa-sap-option"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() =>
                                    selectJoinProfileSapCode(kind, index, product)
                                  }
                                >
                                  <span className="qa-sap-code">{product.sapCode}</span>
                                  <span className="qa-sap-name">
                                    {getSapProductLabel(product)}
                                  </span>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="qa-meta">{line.description || "Select a SAP code"}</td>
                    <td>
                      <input
                        value={line.formula || ""}
                        onChange={(event) =>
                          updateJoinProfileLine(kind, index, { formula: event.target.value })
                        }
                        placeholder="e.g. H - 20"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.glassDimensionEffect ?? 0}
                        onChange={(event) =>
                          updateJoinProfileLine(kind, index, {
                            glassDimensionEffect: event.target.value,
                          })
                        }
                        placeholder="mm"
                        className="qa-qty-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(event) =>
                          updateJoinProfileLine(kind, index, { quantity: event.target.value })
                        }
                        className="qa-qty-input"
                      />
                    </td>
                    <td className="qa-actions-cell">
                      <MDBBtn
                        size="sm"
                        color="danger"
                        type="button"
                        disabled={mullionCouplerForm[kind].length === 1}
                        onClick={() => removeJoinProfileLine(kind, index)}
                      >
                        <MDBIcon fas icon="trash" />
                      </MDBBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <div className="qa-card">
        <div className="qa-card-header">
          <div>
            <h4>Mullion / Coupler Linking</h4>
            <p className="qa-subtitle">
              Link profiles at system and series level. These rules apply to every
              description in the series.
            </p>
          </div>
          <MDBBtn size="sm" color="light" onClick={fetchMullionCouplerData}>
            <MDBIcon fas icon="sync" className="me-2" />
            Refresh
          </MDBBtn>
        </div>
        <div className="qa-table-wrapper">
          <table className="qa-table qa-cutting-table">
            <thead>
              <tr>
                <th>System</th>
                <th>Series</th>
                <th>Mullion Profiles</th>
                <th>Coupler Profiles</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mullionCouplerSeries.map((row) => (
                <tr key={`${row.systemType}-${row.series}`}>
                  <td>{row.systemType}</td>
                  <td className="qa-title">{row.series}</td>
                  <td>{row.mullionCount || 0}</td>
                  <td>{row.couplerCount || 0}</td>
                  <td>
                    <MDBBadge color={row.configured ? "success" : "warning"}>
                      {row.configured ? "Configured" : "Not configured"}
                    </MDBBadge>
                  </td>
                  <td className="qa-actions-cell">
                    <MDBBtn
                      size="sm"
                      color={row.configured ? "light" : "primary"}
                      onClick={() => selectMullionCouplerSeries(row)}
                    >
                      <MDBIcon fas icon={row.configured ? "pen" : "plus"} className="me-2" />
                      Configure
                    </MDBBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!mullionCouplerSeries.length && (
            <div className="qa-empty">No system series found.</div>
          )}
        </div>

        <MDBModal
          open={isMullionCouplerModalOpen}
          onClose={() => setIsMullionCouplerModalOpen(false)}
          tabIndex="-1"
        >
          <MDBModalDialog size="xl" scrollable className="qa-config-modal">
            <MDBModalContent>
              <form className="qa-modal-form" onSubmit={saveMullionCouplerConfig}>
                <MDBModalHeader>
                  <MDBModalTitle>
                    Mullion / Coupler Config
                    <span className="qa-modal-subtitle">
                      {selectedMullionCouplerRow?.systemType} / {selectedMullionCouplerRow?.series}
                    </span>
                  </MDBModalTitle>
                  <MDBBtn
                    className="btn-close"
                    color="none"
                    type="button"
                    onClick={() => setIsMullionCouplerModalOpen(false)}
                  />
                </MDBModalHeader>
                <MDBModalBody>
                  <div className="qa-join-profile-grid">
                    {renderLinkingLines("mullions", "Mullion")}
                    {renderLinkingLines("couplers", "Coupler")}
                  </div>
                  <div className="qa-hint mt-3">
                    Formula variables: W = frame width, H = frame height, Q = quotation quantity.
                    Glass effect reduces W for vertical splits and H for horizontal splits on
                    both sections touching the divider.
                  </div>
                </MDBModalBody>
                <MDBModalFooter>
                  {selectedMullionCouplerRow?.configId && (
                    <MDBBtn color="danger" type="button" onClick={deleteMullionCouplerConfig}>
                      Delete
                    </MDBBtn>
                  )}
                  <MDBBtn
                    color="light"
                    type="button"
                    onClick={() => setIsMullionCouplerModalOpen(false)}
                  >
                    Cancel
                  </MDBBtn>
                  <MDBBtn color="primary" type="submit">
                    Save links
                  </MDBBtn>
                </MDBModalFooter>
              </form>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </div>
    );
  };

  const openHardwareLinking = async (row) => {
    let options;
    try {
      options = await fetchHardwareLinkingOptions();
    } catch (error) {
      console.error("Unable to load hardware linking options", error);
      return;
    }
    const existing = hardwareLinkingConfigs.find((config) =>
      config.systemType === row.systemType && config.series === row.series && config.description === row.description
    );
    const configuredRules = new Map((existing?.glassRules || []).map((rule) => [rule.glassSpec, rule]));
    setSelectedHardwareLinkingRow({ ...row, configId: existing?._id });
    setHardwareLinkingForm({
      shutterCount: existing?.shutterCount || 1,
      glassRules: (options.glassSpecs || []).map((glassSpec) => ({
        glassSpec,
        conditions: (configuredRules.get(glassSpec)?.conditions || []).map((condition) => ({ ...condition })),
      })),
    });
    setIsHardwareLinkingModalOpen(true);
  };

  const updateHardwareRule = (glassIndex, updater) => setHardwareLinkingForm((prev) => ({
    ...prev,
    glassRules: prev.glassRules.map((rule, index) => index === glassIndex ? updater(rule) : rule),
  }));

  const updateHardwareLine = (glassIndex, conditionIndex, lineIndex, patch) =>
    updateHardwareRule(glassIndex, (current) => ({
      ...current,
      conditions: current.conditions.map((entry, index) => index === conditionIndex
        ? { ...entry, hardware: entry.hardware.map((line, idx) => idx === lineIndex ? { ...line, ...patch } : line) }
        : entry),
    }));

  const searchHardwareLinkingSap = (key, value, glassIndex, conditionIndex, lineIndex) => {
    updateHardwareLine(glassIndex, conditionIndex, lineIndex, { sapCode: value });
    const query = value.trim().toLowerCase();
    const options = query
      ? hardwareLinkingOptions.hardware.filter((item) =>
        String(item.sapCode || "").toLowerCase().includes(query) ||
        String(item.perticular || "").toLowerCase().includes(query)
      ).slice(0, 12)
      : [];
    setHardwareLinkingAutocomplete((prev) => ({
      ...prev,
      [key]: { open: Boolean(query), options },
    }));
  };

  const selectHardwareLinkingSap = (key, product, glassIndex, conditionIndex, lineIndex) => {
    updateHardwareLine(glassIndex, conditionIndex, lineIndex, {
      sapCode: product.sapCode || "",
      description: product.perticular || "",
    });
    setHardwareLinkingAutocomplete((prev) => ({ ...prev, [key]: { open: false, options: [] } }));
  };

  const saveHardwareLinking = async (event) => {
    event.preventDefault();
    if (!selectedHardwareLinkingRow) return;
    await api.post(
      `${QUOTATION_BASE_API_URL}/admin/quotations/hardware-linking/configs`,
      { ...selectedHardwareLinkingRow, ...hardwareLinkingForm },
      authConfig
    );
    await fetchHardwareLinkingData();
    setIsHardwareLinkingModalOpen(false);
  };

  const deleteHardwareLinking = async () => {
    if (!selectedHardwareLinkingRow?.configId || !window.confirm("Delete this hardware linking?")) return;
    await api.delete(
      `${QUOTATION_BASE_API_URL}/admin/quotations/hardware-linking/configs/${selectedHardwareLinkingRow.configId}`,
      authConfig
    );
    await fetchHardwareLinkingData();
    setIsHardwareLinkingModalOpen(false);
  };

  const renderHardwareLinkingSection = () => (
    <div className="qa-card">
      <div className="qa-card-header">
        <div><h4>Hardware Linking</h4><p className="qa-subtitle">Apply hardware by individual shutter glass weight.</p></div>
        <MDBBtn size="sm" color="light" onClick={fetchHardwareLinkingData}>Refresh</MDBBtn>
      </div>
      <div className="qa-table-wrapper">
        <table className="qa-table qa-cutting-table">
          <thead><tr><th>System</th><th>Series</th><th>Description</th><th>Status</th><th></th></tr></thead>
          <tbody>{hardwareLinkingDescriptions.map((row) => (
            <tr key={row.systemType + row.series + row.description}>
              <td>{row.systemType}</td><td>{row.series}</td><td>{row.description}</td>
              <td><MDBBadge color={row.configured ? "success" : "warning"}>{row.configured ? "Configured" : "Not configured"}</MDBBadge></td>
              <td><MDBBtn size="sm" onClick={() => openHardwareLinking(row)}>{row.configured ? "Edit" : "Configure"}</MDBBtn></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <MDBModal open={isHardwareLinkingModalOpen} onClose={() => setIsHardwareLinkingModalOpen(false)} tabIndex="-1">
        <MDBModalDialog size="xl" scrollable className="qa-config-modal"><MDBModalContent><form className="qa-modal-form qa-hardware-config-form" onSubmit={saveHardwareLinking}>
          <MDBModalHeader><MDBModalTitle>Hardware Config</MDBModalTitle><MDBBtn className="btn-close" color="none" type="button" onClick={() => setIsHardwareLinkingModalOpen(false)} /></MDBModalHeader>
          <MDBModalBody className="qa-hardware-config-body">
            <label className="qa-field">Number of shutters<input type="number" min="1" value={hardwareLinkingForm.shutterCount} onChange={(e) => setHardwareLinkingForm((prev) => ({ ...prev, shutterCount: Math.max(1, Number(e.target.value) || 1) }))} /></label>
            <p className="qa-hint">Weight = H(m) × W(m) × 2.56 × 1.25. Quantity applies to every shutter.</p>
            {hardwareLinkingForm.glassRules.map((rule, glassIndex) => (
              <div className="qa-card mb-3" key={rule.glassSpec}>
                <div className="qa-card-header"><strong>{rule.glassSpec}</strong>
                  <MDBBtn size="sm" type="button" onClick={() => updateHardwareRule(glassIndex, (current) => ({ ...current, conditions: [...current.conditions, { operator: "<=", weightKg: 0, hardware: [] }] }))}>Add condition</MDBBtn>
                </div>
                {rule.conditions.map((condition, conditionIndex) => (
                  <div className="p-3 border-top" key={conditionIndex}>
                    <div className="d-flex gap-2 mb-2">
                      <select value={condition.operator} onChange={(e) => updateHardwareRule(glassIndex, (current) => ({ ...current, conditions: current.conditions.map((entry, index) => index === conditionIndex ? { ...entry, operator: e.target.value } : entry) }))}>{["<", "<=", "=", ">=", ">"].map((operator) => <option key={operator}>{operator}</option>)}</select>
                      <input type="number" min="0" step="0.001" placeholder="Weight kg" value={condition.weightKg} onChange={(e) => updateHardwareRule(glassIndex, (current) => ({ ...current, conditions: current.conditions.map((entry, index) => index === conditionIndex ? { ...entry, weightKg: Number(e.target.value) } : entry) }))} />
                      <MDBBtn color="danger" size="sm" type="button" onClick={() => updateHardwareRule(glassIndex, (current) => ({ ...current, conditions: current.conditions.filter((_, index) => index !== conditionIndex) }))}>Remove condition</MDBBtn>
                    </div>
                    {condition.hardware.length > 0 && <div className="qa-table-wrapper qa-hardware-link-table"><table className="qa-table qa-editor-table"><thead><tr><th>SAP Code</th><th>Description</th><th>Qty</th><th>Applies To</th><th></th></tr></thead><tbody>
                      {condition.hardware.map((line, lineIndex) => {
                        const autocompleteKey = glassIndex + "-" + conditionIndex + "-" + lineIndex;
                        const autocomplete = hardwareLinkingAutocomplete[autocompleteKey];
                        return (
                          <tr key={lineIndex}>
                            <td><div className="qa-sap-autocomplete qa-hardware-sap-input"><input value={line.sapCode} placeholder="Type SAP code" autoComplete="off" onChange={(e) => searchHardwareLinkingSap(autocompleteKey, e.target.value, glassIndex, conditionIndex, lineIndex)} onFocus={() => { if (line.sapCode) searchHardwareLinkingSap(autocompleteKey, line.sapCode, glassIndex, conditionIndex, lineIndex); }} onBlur={() => window.setTimeout(() => setHardwareLinkingAutocomplete((prev) => ({ ...prev, [autocompleteKey]: { ...(prev[autocompleteKey] || {}), open: false } })), 150)} />
                              {autocomplete?.open && <div className="qa-sap-menu">{autocomplete.options?.length ? autocomplete.options.map((product) => <button key={product._id || product.sapCode} type="button" className="qa-sap-option" onMouseDown={(event) => event.preventDefault()} onClick={() => selectHardwareLinkingSap(autocompleteKey, product, glassIndex, conditionIndex, lineIndex)}><span className="qa-sap-code">{product.sapCode}</span><span className="qa-sap-name">{product.perticular}</span></button>) : <div className="qa-sap-message">No SAP codes found</div>}</div>}
                            </div></td>
                            <td><input value={line.description || ""} placeholder="Description" onChange={(e) => updateHardwareLine(glassIndex, conditionIndex, lineIndex, { description: e.target.value })} /></td>
                            <td><input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => updateHardwareLine(glassIndex, conditionIndex, lineIndex, { quantity: Number(e.target.value) })} /></td>
                            <td><select value={line.applicability || "always"} onChange={(e) => updateHardwareLine(glassIndex, conditionIndex, lineIndex, { applicability: e.target.value })}><option value="always">Always</option><option value="hinges">Hinges only</option><option value="frictionStay">Friction stay only</option></select></td>
                            <td><MDBBtn color="light" size="sm" type="button" onClick={() => updateHardwareRule(glassIndex, (current) => ({ ...current, conditions: current.conditions.map((entry, index) => index === conditionIndex ? { ...entry, hardware: entry.hardware.filter((_, idx) => idx !== lineIndex) } : entry) }))}><MDBIcon fas icon="trash" /></MDBBtn></td>
                          </tr>
                        );
                      })}
                    </tbody></table></div>}
                    <MDBBtn color="light" size="sm" type="button" onClick={() => updateHardwareRule(glassIndex, (current) => ({ ...current, conditions: current.conditions.map((entry, index) => index === conditionIndex ? { ...entry, hardware: [...entry.hardware, { sapCode: "", description: "", quantity: 1, applicability: "always" }] } : entry) }))}>Add SAP code</MDBBtn>
                  </div>
                ))}
              </div>
            ))}
          </MDBModalBody>
          <MDBModalFooter>{selectedHardwareLinkingRow?.configId && <MDBBtn color="danger" type="button" onClick={deleteHardwareLinking}>Delete</MDBBtn>}<MDBBtn color="light" type="button" onClick={() => setIsHardwareLinkingModalOpen(false)}>Cancel</MDBBtn><MDBBtn type="submit">Save links</MDBBtn></MDBModalFooter>
        </form></MDBModalContent></MDBModalDialog>
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
            <h4>Louvers Rate</h4>
            <p className="qa-subtitle">
              Maintain the three legacy area-based rates used only for Louvers.
            </p>
            <p className="qa-hint">Window and door rates are calculated from cutting schedules and NALCO.</p>
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
              Add Louvers Rate
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
            <div className="qa-empty">No Louvers rate added.</div>
          )}
        </div>
      </div>
      <MDBModal open={isBaseRateModalOpen} setOpen={setIsBaseRateModalOpen} tabIndex='-1'>
        <MDBModalDialog centered size="lg">
          <MDBModalContent>

            <MDBModalHeader>
              <MDBModalTitle>
                {editingBaseRateId ? "Edit Louvers Rate" : "Add Louvers Rate"}
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
                    disabled
                  >
                    <option value="Louvers">Louvers</option>
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
        (cuttingForm.systemType === "Louvers" ||
          (config.series === cuttingForm.series && config.description === cuttingForm.description))
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
                  <div className="qa-title">{selectedCuttingRow.description || selectedCuttingRow.systemType}</div>
                  <div className="qa-meta">
                    {selectedCuttingRow.systemType === "Louvers"
                      ? "System-level schedule"
                      : `${selectedCuttingRow.systemType} / ${selectedCuttingRow.series}`}
                  </div>
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
                      <td>{row.series || "—"}</td>
                      <td className="qa-title">{row.description || "System-level"}</td>
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
        {copySuccessMessage && (
          <div
            className="alert alert-success position-fixed"
            style={{
              top: "20px",
              right: "20px",
              zIndex: 9999,
              minWidth: "320px",
            }}
          >
            <MDBIcon fas icon="check-circle" className="me-2" />
            {copySuccessMessage}
          </div>
        )}

        <MDBModal open={isCuttingModalOpen} onClose={() => setIsCuttingModalOpen(false)} tabIndex="-1">
          <MDBModalDialog size="xl" scrollable className="qa-config-modal">
            <MDBModalContent>
              <form className="qa-modal-form" onSubmit={handleCuttingConfigSubmit}>
                <MDBModalHeader>
                  <MDBModalTitle>
                    Cutting Schedule Config
                    <span className="qa-modal-subtitle">
                      {cuttingForm.systemType === "Louvers"
                        ? `${cuttingForm.systemType} / System-level`
                        : `${cuttingForm.systemType} / ${cuttingForm.series} / ${cuttingForm.description}`}
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
                    {cuttingForm.systemType !== "Louvers" && (
                      <>
                        <label>
                          Series
                          <input value={cuttingForm.series} readOnly />
                        </label>
                        <label>
                          Description
                          <input value={cuttingForm.description} readOnly />
                        </label>
                      </>
                    )}
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
                        Hardware rows only need SAP code and quantity. Profile rows use dimensions and cut angle. Each glass needs two rows with the same reference: one W formula and one H formula.
                      </div>
                    </div>
                    {/* cutting schedule */}
                    <div className="qa-actions">
                      <MDBBtn size="sm" color="light" type="button" onClick={addGlassCuttingLine}>
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
                          <th>Glass Ref</th>
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
                                <option value="glass">
                                  Glass
                                </option>
                              </select>
                            </td>
                            <td>
                              <input
                                value={
                                  line.itemType === "glass"
                                    ? line.glassRef || ""
                                    : "-"
                                }
                                disabled={line.itemType !== "glass"}
                                onChange={(e) =>
                                  updateCuttingLine(
                                    index,
                                    "glassRef",
                                    e.target.value.toUpperCase()
                                  )
                                }
                                placeholder="G1"
                              />
                            </td>
                            <td>
                              {line.itemType === "glass" ? (
                                <input value="-" disabled />
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
                  <MDBBtn
                    type="button"
                    color="info"
                    outline
                    onClick={() => setIsCopyScheduleModalOpen(true)}
                  >
                    Copy
                  </MDBBtn>
                  {selectedConfig?._id && (
                    <MDBBtn color="danger" outline type="button" onClick={handleCuttingConfigDelete}>
                      Delete config
                    </MDBBtn>
                  )}
                  <MDBBtn color="light" type="button" onClick={() => setIsCuttingModalOpen(false)}>
                    Cancel
                  </MDBBtn>
                  <MDBBtn
                    color="primary"
                    type="submit"
                    disabled={!cuttingForm.systemType || (cuttingForm.systemType !== "Louvers" && !cuttingForm.description)}
                  >
                    Save rules
                  </MDBBtn>
                </MDBModalFooter>
              </form>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
        <MDBModal
          open={isCopyScheduleModalOpen}
          onClose={() => setIsCopyScheduleModalOpen(false)}
          tabIndex="-1"
        >
          <MDBModalDialog>
            <MDBModalContent>

              <MDBModalHeader>
                <MDBModalTitle>Copy Schedule
                  <span className="qa-modal-subtitle">
                      {cuttingForm.systemType} / {cuttingForm.series} / {cuttingForm.description}
                    </span>
                </MDBModalTitle>

                <MDBBtn
                  className="btn-close"
                  color="none"
                  type="button"
                  onClick={() => setIsCopyScheduleModalOpen(false)}
                />
              </MDBModalHeader>

              <MDBModalBody>

                <label className="mb-3 w-100">
                  Copy From

                  <select
                    className="form-select mt-2"
                    value={copyScheduleForm.from}
                    onChange={(e) =>
                      setCopyScheduleForm((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                  >
                    {CUTTING_SCHEDULES.map((schedule) => (
                      <option key={schedule.key} value={schedule.key}>
                        {schedule.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="w-100">
                  Copy To

                  <select
                    className="form-select mt-2"
                    value={copyScheduleForm.to}
                    onChange={(e) =>
                      setCopyScheduleForm((prev) => ({
                        ...prev,
                        to: e.target.value,
                      }))
                    }
                  >
                    {CUTTING_SCHEDULES.map((schedule) => (
                      <option key={schedule.key} value={schedule.key}>
                        {schedule.label}
                      </option>
                    ))}
                  </select>
                </label>
                {isSameSchedule && (
                  <div className="alert alert-danger mt-3 mb-0">
                    Source and destination schedules cannot be the same.
                  </div>
                )}

              </MDBModalBody>

              <MDBModalFooter>

                <MDBBtn
                  type="button"
                  color="light"
                  onClick={() => setIsCopyScheduleModalOpen(false)}
                >
                  Cancel
                </MDBBtn>

                <MDBBtn
                  type="button"
                  color="primary"
                  onClick={handleCopySchedule}
                  disabled={isSameSchedule}
                >
                  Copy
                </MDBBtn>

              </MDBModalFooter>

            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
        <MDBModal
          open={isOverwriteModalOpen}
          onClose={() => setIsOverwriteModalOpen(false)}
          tabIndex="-1"
        >
          <MDBModalDialog centered>
            <MDBModalContent>

              <MDBModalHeader>
                <MDBModalTitle>Overwrite Schedule</MDBModalTitle>

                <MDBBtn
                  className="btn-close"
                  color="none"
                  type="button"
                  onClick={() => setIsOverwriteModalOpen(false)}
                />
              </MDBModalHeader>

              <MDBModalBody>
                The destination schedule already contains data.
                <br />
                Continuing will replace all existing rows.
              </MDBModalBody>

              <MDBModalFooter>

                <MDBBtn
                  type="button"
                  color="light"
                  onClick={() => setIsOverwriteModalOpen(false)}
                >
                  Cancel
                </MDBBtn>
                <MDBBtn
                  type="button"
                  color="danger"
                  onClick={() => {
                    performCopySchedule();
                    setIsOverwriteModalOpen(false);
                  }}
                >
                  Overwrite
                </MDBBtn>



              </MDBModalFooter>

            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </div>
    );
  };
  const isSameSchedule =
    copyScheduleForm.from === copyScheduleForm.to;

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
            label: "Louvers Rate",
            value: baseRates.length,
            icon: "money-check-alt",
            tone: "amber",
            note: "Legacy Louvers pricing only",
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
            {activeTab === "baseRates" && renderBaseRateSection()}
            {activeTab === "handleRules" && renderHandleRulesSection()}
            {activeTab === "handleOptions" && renderHandleOptionsSection()}
            {activeTab === "cuttingSchedule" && renderCuttingScheduleSection()}
            {activeTab === "glassBeading" && renderGlassBeadingSection()}
            {activeTab === "mullionCoupler" && renderMullionCouplerSection()}
            {activeTab === "hardwareLinking" && renderHardwareLinkingSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationAdminPage;
