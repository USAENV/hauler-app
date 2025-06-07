let map;

function initMap() {
  fetch("hauler_data.json")
    .then(response => response.json())
    .then(data => {
      const addressInput = document.getElementById("addressInput");
      const vendorFilter = document.getElementById("vendorFilter");

      const geocoder = new google.maps.Geocoder();
      addressInput.addEventListener("change", () => {
        geocoder.geocode({ address: addressInput.value }, (results, status) => {
          if (status === "OK") {
            const location = results[0].geometry.location;
            map.setCenter(location);
            new google.maps.Marker({
              map,
              position: location,
              icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              title: "Entered Address"
            });
            renderMarkers(data, location, vendorFilter.value);
          }
        });
      });

      vendorFilter.addEventListener("change", () => {
        if (map && addressInput.value) {
          geocoder.geocode({ address: addressInput.value }, (results, status) => {
            if (status === "OK") {
              const location = results[0].geometry.location;
              renderMarkers(data, location, vendorFilter.value);
            }
          });
        }
      });

      map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 37.7749, lng: -122.4194 }
      });
    });
}

function renderMarkers(data, center, filter) {
  const bounds = new google.maps.LatLngBounds();
  data.forEach(hauler => {
    if (!hauler.Latitude || !hauler.Longitude) return;

    const isPreferred = String(hauler["Preferred Vendor"]).trim().toLowerCase() === "yes";
    const matchesFilter =
      filter === "All" ||
      (filter === "Yes" && isPreferred) ||
      (filter === "No" && !isPreferred);

    if (!matchesFilter) return;

    const pinColor = isPreferred ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                 : "http://maps.google.com/mapfiles/ms/icons/black-dot.png";

    const position = { lat: parseFloat(hauler.Latitude), lng: parseFloat(hauler.Longitude) };
    const marker = new google.maps.Marker({
      position,
      map,
      icon: pinColor,
      title: hauler["Company Name"]
    });

    const info = `
      <strong>${hauler["Company Name"]}</strong><br>
      ${hauler["Street Address"] || ""}, ${hauler.City || ""}, ${hauler.State || ""} ${hauler["Zip Code"] || ""}<br>
      Preferred Vendor: ${hauler["Preferred Vendor"]}
    `;

    const infowindow = new google.maps.InfoWindow({ content: info });
    marker.addListener("click", () => infowindow.open(map, marker));

    bounds.extend(position);
  });
  map.fitBounds(bounds);
}
