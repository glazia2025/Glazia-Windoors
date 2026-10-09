import React, { useState, useEffect, useRef } from "react"; // Removed useCallback as onResize is removed
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./PDFViewer.css"; // Assuming you have this file for custom styles
import { MDBBtn, MDBTypography } from "mdb-react-ui-kit";

// Configure the worker for PDF.js
// Ensure this path or the unpkg URL is correct for your pdfjs-dist version
// The .mjs extension is specific, make sure it matches what your pdfjs-dist version provides.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PDFViewer({ base64Pdf, file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDataUri, setPdfDataUri] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const [documentKey, setDocumentKey] = useState(0); // Key for re-rendering Document

  const containerRef = useRef(null);

  // Effect to prepare pdfDataUri and reset states if base64Pdf changes
  useEffect(() => {
    if (base64Pdf || file) {
      const newUri = base64Pdf
        ? base64Pdf.startsWith("data:application/pdf;base64,")
          ? base64Pdf
          : `data:application/pdf;base64,${base64Pdf}`
        : URL.createObjectURL(file);
      setPdfDataUri(newUri);
      setNumPages(null); // Reset numPages when PDF source changes
      setPageNumber(1); // Reset to first page
      setDocumentKey((prevKey) => prevKey + 1); // Force Document to re-render
    } else {
      setPdfDataUri(null); // Clear URI if no base64Pdf is provided
      setNumPages(null);
      setPageNumber(1);
    }
  }, [base64Pdf, file]);

  // Effect for ResizeObserver to set containerWidth
  useEffect(() => {
    const currentContainer = containerRef.current; // Capture current ref value

    if (!currentContainer) {
      return; // Exit if containerRef is not yet available
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === currentContainer) {
          const newWidth = Math.floor(entry.contentRect.width);
          if (newWidth > 0) {
            setContainerWidth(newWidth);
          }
        }
      }
    });

    resizeObserver.observe(currentContainer);

    // Set initial width after the observer is set up
    const initialWidth = Math.floor(currentContainer.clientWidth);
    if (initialWidth > 0) {
      setContainerWidth(initialWidth);
    }

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      resizeObserver.disconnect(); // More thorough cleanup
    };
  }, []); // Empty dependency array: runs once on mount and cleans up on unmount

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    // Page number is already reset when base64Pdf changes or defaults to 1
  }

  function onDocumentLoadError(error) {
    console.error("Error while loading PDF document:", error.message);
    // You could set an error state here to display a message to the user
  }

  function onPageLoadError(error) {
    console.error("Error while loading PDF page:", error.message);
    // You could set an error state here for the specific page
  }

  function goToPrevPage() {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  }

  function goToNextPage() {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      {pdfDataUri ? ( // Check if pdfDataUri is available
        <Document
          key={documentKey} // Re-render Document if PDF source (documentKey) changes
          file={pdfDataUri}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          options={{
            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
            cMapPacked: true,
          }}
        >
          {numPages && containerWidth && containerWidth > 0 ? (
            <Page
              key={`${pageNumber}-${containerWidth}`} // Key for re-rendering Page on width or page change
              pageNumber={pageNumber}
              width={containerWidth}
              onLoadError={onPageLoadError}
              // renderTextLayer={false} // DIAGNOSTIC: Uncomment to test if text layer is the issue
            />
          ) : (
            // Show a loading indicator for the page if conditions aren't met
            // (e.g., containerWidth not yet calculated, or numPages not yet known)
            <div style={{ textAlign: "center", padding: "20px" }}>
              Loading page...
            </div>
          )}
        </Document>
      ) : (
        // Show a loading indicator or message if pdfDataUri is not yet available
        <div style={{ textAlign: "center", padding: "20px" }}>
          Loading PDF...
        </div>
      )}
      {numPages && ( // Only show pagination if numPages is known
        <div className="d-flex flex-row align-items-center justify-content-between gap-3 mt-2 w-100">
          <MDBTypography className="text-muted small fw-bold m-0">
            Page {pageNumber} of {numPages}
          </MDBTypography>
          <div className="d-flex flex-row align-items-center gap-2">
            <MDBBtn
              color={"link"}
              onClick={goToPrevPage}
              disabled={pageNumber <= 1} // Simpler disabled condition
            >
              Previous
            </MDBBtn>
            <MDBBtn
              color={"link"}
              onClick={goToNextPage}
              disabled={pageNumber >= numPages} // Simpler disabled condition
            >
              Next
            </MDBBtn>
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
