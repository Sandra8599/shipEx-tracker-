<script>
  const map = L.map('map').setView([40.7128, -74.0060], 5); // New York default
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([34.0522, -118.2437]).addTo(map).bindPopup("Current Location: Los Angeles Hub");
</script>
