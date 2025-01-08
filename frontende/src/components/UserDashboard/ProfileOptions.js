import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTypography,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";
import { clearSelectedProducts } from "../../redux/selectionSlice";
import { useDispatch } from "react-redux";
import ImageZoom from "./ImageZoom";
// import prImage from '../../Assets/Images/product_image.jpeg';

// const profileOptions = {
//   Casement: {
//     options: ["40mm", "50mm", "55mm", "27mm"],
//     products: {
//       "40mm": [
//         {
//           id: 1,
//           sapCode: "SAP001",
//           description: "Inward Door Sash",
//           rate: 300,
//           per: "Unit",
//           kgm: 2.5,
//           length: "3m",
//           image: "/Assets/Images/product_image.jpeg",
//         },
//         {
//           id: 3,
//           sapCode: "SAP002",
//           description: "Outward Door Sash",
//           rate: 280,
//           per: "Unit",
//           kgm: 2.2,
//           length: "2.5m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//         {
//           id: 4,
//           sapCode: "SAP002",
//           description: "Outward Door Sash",
//           rate: 280,
//           per: "Unit",
//           kgm: 2.2,
//           length: "2.5m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//         {
//           id: 5,
//           sapCode: "SAP002",
//           description: "Outward Door Sash",
//           rate: 280,
//           per: "Unit",
//           kgm: 2.2,
//           length: "2.5m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//         {
//           id: 6,
//           sapCode: "SAP002",
//           description: "Outward Door Sash",
//           rate: 280,
//           per: "Unit",
//           kgm: 2.2,
//           length: "2.5m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//       ],
//       "50mm": [
//         {
//           id: 3,
//           sapCode: "SAP003",
//           description: "Sliding Door Sash",
//           rate: 320,
//           per: "Unit",
//           kgm: 3.0,
//           length: "3.5m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//       ],
//     },
//   },
//   Sliding: {
//     options: ["27mm", "29mm"],
//     products: {
//       "27mm": [
//         {
//           id: 4,
//           sapCode: "SAP004",
//           description: "Fixed Window Frame",
//           rate: 150,
//           per: "Meter",
//           kgm: 1.8,
//           length: "2m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//       ],
//       "29mm": [
//         {
//           id: 5,
//           sapCode: "SAP005",
//           description: "Sliding Window Frame",
//           rate: 180,
//           per: "Meter",
//           kgm: 2.0,
//           length: "2.5m",
//           image: "/Assets/Images/product_image.jpeg", 
//         },
//       ],
//     },
//   },
//   'Slide and Fold': {
//     options: ["3 m", "4 m"],
//     products: {
//       "3 m": [
//         {
//           id: 5,
//           sapCode: "SAP006",
//           description: "Fixed Window Frame",
//           rate: 150,
//           per: "Meter",
//           kgm: 1.8,
//           length: "2m",
//           image: "/Assets/Images/product_image.jpeg", 
//         }
//       ],
//     }
//   },
//   'Lift n Slide': {
//     options: ["1 option"],
//     products: {
//       "1 option": [{
//           id: 5,
//           sapCode: "SAP007",
//           description: "Fixed Window Frame",
//           rate: 150,
//           per: "Meter",
//           kgm: 1.8,
//           length: "2m",
//           image: "/Assets/Images/product_image.jpeg", 
//         }
//       ],
//     }
//   },
//   'Internal Partition': {
//     options: ["16*45", "25*45"],
//     products: {
//       "16*45": [{
//         id: 5,
//         sapCode: "SAP008",
//         description: "Fixed Window Frame",
//         rate: 150,
//         per: "Meter",
//         kgm: 1.8,
//         length: "2m",
//         image: "/Assets/Images/product_image.jpeg", 
//       }],
//       "25*45": [{
//         id: 5,
//         sapCode: "SAP009",
//         description: "Fixed Window Frame",
//         rate: 150,
//         per: "Meter",
//         kgm: 1.8,
//         length: "2m",
//         image: "/Assets/Images/product_image.jpeg", 
//       }]
//     }
//   },
//   'Louvers': {
//     options: ["1 option"],
//     products: {
//       "1 option":[{
//         id: 5,
//         sapCode: "SAP0010",
//         description: "Fixed Window Frame",
//         rate: 150,
//         per: "Meter",
//         kgm: 1.8,
//         length: "2m",
//         image: "/Assets/Images/product_image.jpeg", 
//       }],
//     }
//   },
//   'Railing': {
//     options: ["7 option"],
//     products: {
//       "7 option": [{
//         id: 5,
//         sapCode: "SAP0011",
//         description: "Fixed Window Frame",
//         rate: 150,
//         per: "Meter",
//         kgm: 1.8,
//         length: "2m",
//         image: "/Assets/Images/product_image.jpeg", 
//       }],
//     }
//   },
// };
const ProfileSelection = ({ onProductSelect, selectedProfiles, profileData }) => {
  const [quantities, setQuantities] = useState({});
  const [profileOptions, setProfileOptions] = useState({});
  const [activeProfile, setActiveProfile] = useState(Object.keys(profileOptions)[0]);
  const [activeOption, setActiveOption] = useState(profileOptions[Object.keys(profileOptions)[0]]?.options[0]);

  const dispatch = useDispatch()
  useEffect(() => {
    setProfileOptions(profileData);
  }, [profileData]);
  useEffect(() => {
    if (!selectedProfiles || selectedProfiles.length === 0) {
      setQuantities((prev) => {
        if (Object.keys(prev).length > 0) {
          console.log("Resa")
          onProductSelect([]); // Emit empty array only when necessary
        }
        return {}; // Clear quantities
      });
    } else {
      const updatedQuantities = {};
      selectedProfiles.forEach((element) => {
        updatedQuantities[`${element.profile}-${element.option}-${element.id}`] = {
          profile: element.profile,
          option: element.option,
          id: element.id,
          quantity: element.quantity || 0,
        };
      });
      setQuantities(updatedQuantities);
    }
  }, [selectedProfiles, onProductSelect]);
  
  

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

  const handlePowderCoating = (profile, option, id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [`${profile}-${option}-${id}`]: {
        profile,
        option,
        id,
        powderCoating: value,
      },
    }));
  };


  const onConfirmation = () => {
    const selectedProducts = Object.values(quantities)
      .filter((item) => item.quantity > 0)
      .map(({ profile, option, id, quantity }) => {
        const product = profileOptions[profile]?.products[option]?.find(
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
        {Object.keys(profileOptions).map((profile) => (
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
          {profileOptions[activeProfile]?.options.map((option) => (
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
              <div className="d-flex align-items-center">
                <MDBTypography tag="h4" className="mb-0" style={{marginRight: '20px'}}>
                  Products
                </MDBTypography>
                <form className='d-flex input-group w-auto me-3'>
                  <input
                    type='search'
                    className='form-control'
                    placeholder='Search Items'
                    aria-label='Search'
                  />
                  <MDBBtn color='primary'>Search</MDBBtn>
                </form>
              </div>
              <div>
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClear}
                  disabled={!selectedProfiles.length}
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
                  <th>Image</th> 
                  <th>SAP Code</th>
                  <th>Description</th>
                  <th>Rate</th>
                  <th>Per</th>
                  <th>Kg/m</th>
                  <th>Length</th>
                  <th>Quantity</th>
                  <th>Powder Coating</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {profileOptions[activeProfile]?.products[activeOption]?.map(
                  (product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>
                        {/* <img
                          src={product.image}  // Image path from the product
                          alt={product.description}
                          style={{ width: "50px", height: "50px", objectFit: "cover" }} // Style the image
                        /> */}
                      <ImageZoom productImage={product.image}/>
                      </td>
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
                          style={{minWidth: '80px'}}
                        />
                      </td>
                      <td>
                      <MDBInput
                          type="number"
                          min="0"
                          value={
                            product.powderCoating
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
                          style={{minWidth: '80px'}}
                        />
                      </td>
                      <td>
                        <MDBInput
                          disabled
                          type="number"
                          min="0"
                          value={
                            (quantities[`${activeProfile}-${activeOption}-${product.id}`]?.quantity)*product.rate || ""
                          }
                          size="sm"
                          style={{minWidth: '80px'}}
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

export default ProfileSelection;
