// Function to validate the location
function validateLocation(latitude, longitude) {
    // Implement your location validation logic here
    // You can compare the latitude and longitude with the office coordinates or use a geofencing approach
    // Return true if the location is within the acceptable range, otherwise return false
  
    // Example validation using hardcoded office coordinates
    const officeLatitude = 23.62574902754726;
    const officeLongitude = 90.4923767;
    const acceptableDistance = 100; // in meters
  
    // Calculate the distance between the location and the office coordinates
    const distance = calculateDistance(latitude, longitude, officeLatitude, officeLongitude);
  
    // Check if the distance is within the acceptable range
    return distance <= acceptableDistance;
  }
  
  // Function to calculate the distance between two coordinates using the Haversine formula
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // in kilometers
  
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c * 1000; // Convert to meters
  
    return distance;
  }
  
  // Function to convert degrees to radians
  function degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  module.exports = {
    validateLocation
  }
  