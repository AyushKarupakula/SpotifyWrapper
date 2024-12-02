/**
 * Reports web vitals metrics to a specified performance entry handler.
 *
 * This function dynamically imports the 'web-vitals' library and, if a valid
 * function is provided as `onPerfEntry`, it retrieves and reports key metrics:
 * Cumulative Layout Shift (CLS), First Input Delay (FID), First Contentful Paint (FCP),
 * Largest Contentful Paint (LCP), and Time to First Byte (TTFB).
 *
 * @param {Function} onPerfEntry - A callback function to handle the performance entries.
 */
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals; 