import React, { useState } from "react";
import Lightbox from "react-18-image-lightbox";
import "react-18-image-lightbox/style.css"; // Add styles for lightbox

const ImageZoom = ({productImage}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const images = ["/Assets/Images/product_image.jpeg"];

  return (
    <div>
      <img
        src={productImage}
        alt="Product"
        style={{ width: "40px", cursor: "pointer" }}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <Lightbox
          mainSrc={productImage}
          enableZoom="true"
          onCloseRequest={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ImageZoom;
