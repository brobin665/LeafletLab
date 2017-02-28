// JavaScript Document

function createMap(){
	var map =L.map('map',{
		center: [20,0],
		zoom:2
	});
	
	
	  //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
	}


//function getData(map){
//    //load the data
//    $.ajax("data/GrossMedianRent.geojson", {
//        dataType: "json",
//        success: function(response){
//            //create a Leaflet GeoJSON layer
//            var geoJsonLayer = L.geoJson(response);
//            //create a L.markerClusterGroup layer
//            var markers = L.markerClusterGroup();
//            //add geojson to marker cluster layer
//            markers.addLayer(geoJsonLayer);
//            //add marker cluster layer to map
//            map.addLayer(markers);
//        }
//    });
//};

/*function getData(map) {		   
		$.ajax("data/MegaCities.geojson", {
        		dataType: "json",
        		success: function(response){

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                //use filter function to only show cities with 2015 populations greater than 20 million
                filter: function(feature, layer) {
                    return feature.properties.Pop_2015 > 20;
                }
            }).addTo(map);
        }
    });
 }*/
/*function onEachFeature(feature, layer) {
    no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    }
}

function to retrieve the data and place it on the map
function getData(map){
    load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){

            create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
}*/

$(document).ready(createMap);

