import React, { useEffect, useState } from "react";
import {
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBInput,
} from "mdb-react-ui-kit";
import { clearSelectedProducts } from "../../redux/selectionSlice";
import { useDispatch } from "react-redux";
const harwareOptions = {
  'Hardware 1': {
    options: ["40mm", "50mm", "55mm", "27mm"],
    products: {
      "40mm": [
        {
          id: 1,
          sapCode: "SAP001",
          description: "Inward Door Sash",
          rate: 300,
          per: "Unit",
          kgm: 2.5,
          length: "3m",
        },
        {
          id: 3,
          sapCode: "SAP002",
          description: "Outward Door Sash",
          rate: 280,
          per: "Unit",
          kgm: 2.2,
          length: "2.5m",
        },
        {
          id: 4,
          sapCode: "SAP002",
          description: "Outward Door Sash",
          rate: 280,
          per: "Unit",
          kgm: 2.2,
          length: "2.5m",
        },
        {
          id: 5,
          sapCode: "SAP002",
          description: "Outward Door Sash",
          rate: 280,
          per: "Unit",
          kgm: 2.2,
          length: "2.5m",
        },
        {
          id: 6,
          sapCode: "SAP002",
          description: "Outward Door Sash",
          rate: 280,
          per: "Unit",
          kgm: 2.2,
          length: "2.5m",
        },
      ],
      "50mm": [
        {
          id: 3,
          sapCode: "SAP003",
          description: "Sliding Door Sash",
          rate: 320,
          per: "Unit",
          kgm: 3.0,
          length: "3.5m",
        },
      ],
    },
  },
  'Hardware 2': {
    options: ["27mm", "29mm"],
    products: {
      "27mm": [
        {
          id: 4,
          sapCode: "SAP004",
          description: "Fixed Window Frame",
          rate: 150,
          per: "Meter",
          kgm: 1.8,
          length: "2m",
        },
      ],
      "29mm": [
        {
          id: 5,
          sapCode: "SAP005",
          description: "Sliding Window Frame",
          rate: 180,
          per: "Meter",
          kgm: 2.0,
          length: "2.5m",
        },
      ],
    },
  },
  'Hardware 3': {
    options: ["3 m", "4 m"],
    products: {
      "3 m": [
        {
          id: 5,
          sapCode: "SAP006",
          description: "Fixed Window Frame",
          rate: 150,
          per: "Meter",
          kgm: 1.8,
          length: "2m",
        }
      ],
    }
  },
};
const HardwareSelection = ({ onProductSelect, selectedHardwares }) => {
  const [activeProfile, setActiveProfile] = useState(null);
  const [activeOption, setActiveOption] = useState(null);
  const [quantities, setQuantities] = useState({});

  const dispatch = useDispatch()

  useEffect(() => {
    if (!selectedHardwares || selectedHardwares.length === 0) {
      setQuantities((prev) => {
        if (Object.keys(prev).length > 0) {
          console.log("Resa")
          onProductSelect([]); // Emit empty array only when necessary
        }
        return {}; // Clear quantities
      });
    } else {
      const updatedQuantities = {};
      selectedHardwares.forEach((element) => {
        updatedQuantities[`${element.profile}-${element.option}-${element.id}`] = {
          profile: element.profile,
          option: element.option,
          id: element.id,
          quantity: element.quantity || 0,
        };
      });
      setQuantities(updatedQuantities);
    }
  }, [selectedHardwares, onProductSelect]);
  
  

  const handleQuantityChange = (profile, option, id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [`${profile}-${option}-${id}`]: {
        profile,
        option,
        id,
        quantity: parseInt(value, 10) || 0,
      },
    }));
  };

  const onConfirmation = () => {
    const selectedProducts = Object.values(quantities)
      .filter((item) => item.quantity > 0)
      .map(({ profile, option, id, quantity }) => {
        const product = harwareOptions[profile]?.products[option]?.find(
          (prod) => prod.id === id
        );
        return {
          ...product,
          profile,
          option,
          quantity,
        };
      });

    console.log("Selected Products:", selectedProducts);
    onProductSelect(selectedProducts);
  };

  const onClear = () => {
    dispatch(clearSelectedProducts({option: 'profile'}));
    // alert("Quantities cleared!");
  };

  return (
    <>
      <MDBTabs className="mb-4">
        {Object.keys(harwareOptions).map((profile) => (
          <MDBTabsItem key={profile}>
            <MDBTabsLink
              active={activeProfile === profile}
              onClick={() => {
                setActiveProfile(profile);
                setActiveOption(null);
              }}
            >
              {profile}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>

      {activeProfile && (
        <MDBTabs className="mb-4">
          {harwareOptions[activeProfile]?.options.map((option) => (
            <MDBTabsItem key={option}>
              <MDBTabsLink
                active={activeOption === option}
                onClick={() => setActiveOption(option)}
              >
                {option}
              </MDBTabsLink>
            </MDBTabsItem>
          ))}
        </MDBTabs>
      )}

      {activeOption && (
        <MDBCard className="mt-4">
          <MDBCardBody>
            <div
              className="d-flex justify-content-between align-items-center mb-3 sticky-top bg-white p-3"
              style={{ top: "0", zIndex: 1 }}
            >
              <MDBTypography tag="h4" className="mb-0">
                Products
              </MDBTypography>
              <div>
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClear}
                  disabled={!selectedHardwares.length}
                >
                  Clear
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onConfirmation}
                  disabled={
                    !Object.values(quantities).some((q) => q.quantity > 0)
                  }
                >
                  Confirm
                </button>
              </div>
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>SAP Code</th>
                  <th>Description</th>
                  <th>Rate</th>
                  <th>Per</th>
                  <th>Kg/m</th>
                  <th>Length</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {harwareOptions[activeProfile]?.products[activeOption]?.map(
                  (product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{product.sapCode}</td>
                      <td>{product.description}</td>
                      <td>{product.rate}</td>
                      <td>{product.per}</td>
                      <td>{product.kgm}</td>
                      <td>{product.length}</td>
                      <td>
                      <MDBInput
                          type="number"
                          min="0"
                          value={
                            quantities[`${activeProfile}-${activeOption}-${product.id}`]?.quantity || ""
                          }
                          onChange={(e) =>
                            handleQuantityChange(
                              activeProfile,
                              activeOption,
                              product.id,
                              e.target.value
                            )
                          }
                          size="sm"
                        />

                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </MDBCardBody>
        </MDBCard>
      )}
    </>
  );
};

export default HardwareSelection;