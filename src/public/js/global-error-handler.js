/**
 * Global API Error Handler
 * Intercepts all fetch calls (including HTMX) and automatically displays error alerts
 * Works with both fetch API and HTMX requests
 * Include this script early in your page (in partials/bottom.ejs or head.ejs)
 */

(function() {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();

      if (!response.ok) {
        try {
          const errorData = await clonedResponse.json();
          const errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;
          
          if (typeof showError === 'function') {
            showError(errorMessage);
          } else {
            console.error('API Error:', errorMessage);
          }
        } catch (parseError) {
          const errorMessage = `API Error: ${response.status} ${response.statusText}`;
          if (typeof showError === 'function') {
            showError(errorMessage);
          } else {
            console.error('API Error:', errorMessage);
          }
        }
      }

      return response;
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred';
      if (typeof showError === 'function') {
        showError(errorMessage);
      } else {
        console.error('Fetch error:', errorMessage);
      }
      throw error;
    }
  };

  // HTMX event handler for response errors (4xx, 5xx status codes)
//   if (typeof htmx !== 'undefined') {
//     document.addEventListener('htmx:responseError', function(evt) {
//       const xhr = evt.detail.xhr;
//       const status = xhr.status;
//       let errorMessage = `Error: ${status} ${xhr.statusText}`;
      
//       try {
//         const response = JSON.parse(xhr.response);
//         errorMessage = response.message || errorMessage;
//       } catch (e) {
//         // Response wasn't JSON, use default message
//       }
      
//       if (typeof showError === 'function') {
//         showError(errorMessage);
//       } else {
//         console.error('HTMX Error:', errorMessage);
//       }
//     });
//   }
})();
