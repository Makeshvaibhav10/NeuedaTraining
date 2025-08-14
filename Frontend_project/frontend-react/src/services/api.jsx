// Generic API call wrapper with timeout and JSON parsing
export const apiCall = async (url, options = {}) => {
  try {
    console.log(`Making API call to: ${url}`, options);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
    );

    const isMarketAPI = url.includes('https://marketdata.neueda.com/');
    const defaultHeaders = {
      'Accept': 'application/json',
      ...(isMarketAPI ? {} : { 'Content-Type': 'application/json' })
    };

    const fetchPromise = fetch(url, {
      method: 'GET',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    console.log(`Response status: ${response.status} for ${url}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }
      } else {
        data = text;
      }
    }

    console.log('Response data for', url, ':', data);
    return data;
  } catch (err) {
    console.error('API Call failed for', url, ':', err);
    throw err;
  }
};
