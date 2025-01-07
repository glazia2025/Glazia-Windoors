import React, { useState } from "react";
import {
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardImage,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBCheckbox,
  MDBBtn,
} from "mdb-react-ui-kit";

const profileOptions = {
  Casement: {
    options: ["40mm", "50mm", "55mm", "27mm"],
    products: {
      "40mm": [
        { id: 1, name: "Product A", image: "https://via.placeholder.com/150" },
        { id: 2, name: "Product B", image: "https://via.placeholder.com/150" },
      ],
      "50mm": [
        { id: 3, name: "Product C", image: "https://via.placeholder.com/150" },
      ],
    },
  },
  Sliding: {
    options: ["27mm", "29mm", "35mm", "40mm", "Slimo"],
    products: {
      "27mm": [
        { id: 4, name: "Product D", image: "https://via.placeholder.com/150" },
      ],
    },
  },
  "Slide and Fold": {
    options: ["3m", "4m"],
    products: {
      "3m": [
        { id: 5, name: "Product E", image: "https://via.placeholder.com/150" },
      ],
      "4m": [
        { id: 6, name: "Product F", image: "https://via.placeholder.com/150" },
      ],
    },
  },
  "Lift and Slide": {
    options: ["1 option"],
    products: {
      "1 option": [
        { id: 7, name: "Product G", image: "https://via.placeholder.com/150" },
      ],
    },
  },
  "Internal Partition": {
    options: ["16*45", "25*45"],
    products: {
      "16*45": [
        { id: 8, name: "Product H", image: "https://via.placeholder.com/150" },
      ],
      "25*45": [
        { id: 9, name: "Product I", image: "https://via.placeholder.com/150" },
      ],
    },
  },
  "Louvers": {
    options: ["1 option"],
    products: {
      "1 option": { id: 10, name: "Product J", image: "https://via.placeholder.com/150" },
    },
  },
  "Railing": {
    options: ["7 option"],
    products: {
      "7 option": { id: 11, name: "Product K", image: "https://via.placeholder.com/150" },
    },
  },
};

const ProfileSelection = ({ onProductSelect }) => {
  const [activeProfile, setActiveProfile] = useState(null);
  const [activeOption, setActiveOption] = useState(null);

  return (
    <>
      {/* Step 1: Profile Tabs */}
      <MDBTabs className="mb-4">
        {Object.keys(profileOptions).map((profile) => (
          <MDBTabsItem key={profile}>
            <MDBTabsLink
              active={activeProfile === profile}
              onClick={() => {
                setActiveProfile(profile);
                setActiveOption(null); // Reset the selected option
              }}
            >
              {profile}
            </MDBTabsLink>
          </MDBTabsItem>
        ))}
      </MDBTabs>

      {/* Step 2: Options Tabs */}
      {activeProfile && (
        <MDBTabs className="mb-4">
          {profileOptions[activeProfile].options.map((option) => (
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

      {/* Step 3: Products Multi-Select */}
      {activeOption && (
        <MDBRow className="mt-4">
          {profileOptions[activeProfile].products[activeOption]?.map(
            (product) => (
              <MDBCol md="4" key={product.id} className="mb-4">
                <MDBCard>
                  <MDBCardImage
                    src={product.image}
                    alt={product.name}
                    position="top"
                  />
                  <MDBCardBody>
                    <MDBCardTitle>{product.name}</MDBCardTitle>
                    <MDBCheckbox
                      label="Select"
                      onChange={() => onProductSelect(product)}
                    />
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            )
          )}
        </MDBRow>
      )}
    </>
  );
};

export default ProfileSelection;
