//modified version of https://github.com/nchaulet/node-geocoder/blob/master/lib/geocoder/googlegeocoder.js#L161
function formatResult(result) {

  var googleConfidenceLookup = {
    ROOFTOP: 1,
    RANGE_INTERPOLATED: 0.9,
    GEOMETRIC_CENTER: 0.7,
    APPROXIMATE: 0.5
  };

  var extractedObj = {
    formattedAddress: result.formatted_address || null,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    extra: {
      googlePlaceId: result.place_id || null,
      confidence: googleConfidenceLookup[result.geometry.location_type] || 0,
      premise: null,
      subpremise: null,
      neighborhood: null,
      establishment: null
    },
    administrativeLevels: []
  };

  for (var i = 0; i < result.address_components.length; i++) {
    for (var x = 0; x < result.address_components[i].types.length; x++) {
      var addressType = result.address_components[i].types[x];
      switch (addressType) {
        //Country
        case 'country':
          extractedObj.country = result.address_components[i].long_name;
          extractedObj.countryCode = result.address_components[i].short_name;
          break;
        //Administrative Level 1
        case 'administrative_area_level_1':
        case 'administrative_area_level_2':
        case 'administrative_area_level_3':
        case 'administrative_area_level_4':
        case 'administrative_area_level_5':
          extractedObj.administrativeLevels.push(result.address_components[i].long_name);
          break;
        // City
        case 'locality':
        case 'postal_town':
          extractedObj.city = result.address_components[i].long_name;
          break;
        // Address
        case 'postal_code':
          extractedObj.zipcode = result.address_components[i].long_name;
          break;
        case 'route':
          extractedObj.streetName = result.address_components[i].long_name;
          break;
        case 'street_number':
          extractedObj.streetNumber = result.address_components[i].long_name;
          break;
        case 'premise':
          extractedObj.extra.premise = result.address_components[i].long_name;
          break;
        case 'subpremise':
          extractedObj.extra.subpremise = result.address_components[i].long_name;
          break;
        case 'establishment':
          extractedObj.extra.establishment = result.address_components[i].long_name;
          break;
        case 'sublocality_level_1':
        case 'political':
        case 'sublocality':
        case 'neighborhood':
          if(!extractedObj.extra.neighborhood) {
            extractedObj.extra.neighborhood = result.address_components[i].long_name;
          }
          break;
      }
    }
  }
  return extractedObj;
};

module.exports = {
  formatResult: formatResult
}
