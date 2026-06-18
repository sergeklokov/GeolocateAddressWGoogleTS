const apiKey = 'BIzaSyApUD1TQRJtKd-CgLdfY1yUTDU8lp7I7nw';
let RouteMatrixClass;

async function initMap() {
  const routes = await google.maps.importLibrary('routes');
  RouteMatrixClass = routes.RouteMatrix;
  document.getElementById('calculateButton').addEventListener('click', getDrivingDistance);
}

async function getDrivingDistance() {
  const originText = document.getElementById('address1').value.trim();
  const destinationText = document.getElementById('address2').value.trim();
  const resultDiv = document.getElementById('result');

  if (!originText || !destinationText) {
    alert('Please enter both addresses.');
    return;
  }

  if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
    resultDiv.style.display = 'block';
    resultDiv.textContent = 'Please put your Google API key into the apiKey variable in driving-distance.js and in the Maps script URL.';
    return;
  }

  if (!RouteMatrixClass) {
    resultDiv.style.display = 'block';
    resultDiv.textContent = 'Google Maps routes library is not loaded yet. Please refresh the page.';
    return;
  }

  resultDiv.style.display = 'block';
  resultDiv.textContent = 'Calculating...';

  try {
    const request = {
      origins: [originText],
      destinations: [destinationText],
      travelMode: 'DRIVING',
      departureTime: new Date(Date.now() + 15 * 60 * 1000), // future timestamp required for traffic-aware routing
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
      fields: ['durationMillis', 'distanceMeters', 'condition'],
    };

    console.log('RouteMatrix request', request);
    const response = await RouteMatrixClass.computeRouteMatrix(request);
    console.log('RouteMatrix response', response);

    if (!response?.matrix?.rows?.length) {
      const details = JSON.stringify(response || {}, null, 2);
      resultDiv.textContent = `Error: INVALID_RESPONSE - ${details}`;
      return;
    }

    const element = response.matrix.rows[0]?.items?.[0];
    if (!element) {
      resultDiv.textContent = 'No route data returned.';
      return;
    }

    if (element.condition && element.condition !== 'ROUTE_EXISTS') {
      resultDiv.textContent = `Route error: ${element.condition}`;
      return;
    }

    const originAddress = originText;
    const destinationAddress = destinationText;

    const distanceText = typeof element.distanceMeters === 'number'
      ? `${(element.distanceMeters / 1609.344).toFixed(1)} mi (${element.distanceMeters} meters)`
      : 'Unknown';
    const durationMillis = element.durationMillis || element.staticDurationMillis;

    resultDiv.innerHTML = `
      <strong>Origin:</strong> ${originAddress}<br>
      <strong>Destination:</strong> ${destinationAddress}<br><br>
      <strong>Distance:</strong> ${distanceText}<br>
      <strong>Duration in traffic:</strong> ${durationMillis ? Math.round(durationMillis / 1000) + ' seconds' : 'Unknown'}<br>
      <strong>Travel Mode:</strong> Driving
    `;
  } catch (error) {
    console.error(error);
    resultDiv.textContent = `Unable to calculate route: ${error.message}`;
  }
}

window.initMap = initMap;
