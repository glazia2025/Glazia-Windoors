import React, { useState } from "react";
import Lightbox from "react-18-image-lightbox";
import "react-18-image-lightbox/style.css";

const ImageZoom = ({ productImage, imageWidth = "40px" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!productImage || hasError) {
    return (
      <div
        style={{
          width: imageWidth,
          height: imageWidth,
          borderRadius: "8px",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "14px",
        }}
        title="Hardware item"
      >
        <i className="fas fa-cube"></i>
      </div>
    );
  }

  return (
    <div style={{ display: "inline-block" }}>
      <img
        src={productImage}
        alt="Product"
        onError={() => setHasError(true)}
        style={{
          width: imageWidth,
          cursor: "pointer",
          height: imageWidth,
          objectFit: "cover",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <Lightbox
          mainSrc={productImage}
          enableZoom={true}
          onCloseRequest={() => setIsOpen(false)}
          reactModalStyle={{
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};

export default ImageZoom;
