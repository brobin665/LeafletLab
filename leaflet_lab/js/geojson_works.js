//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map =L.map('map').setView([38.8, -98.58],4);

//add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
}
//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)	
	$('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
	
	$('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
	 $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
	
	
	
	$('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
		 updatePropSymbols(map, attributes[index]);

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') === 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') === 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        }

        //Step 8: update slider
        $('.range-slider').val(index);
		 updatePropSymbols(map, attributes[index]);
    });
}

function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            // if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p>City:<b> " + props.Geography + "</b></p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "Gross Median Rent in 20" + year + ":<b> $" + props[attribute] + "</b></p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        
        }
    });
}

 //function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var panelContent = "<p>City:<b> " + feature.properties.Geography + "</b></p>";
	
	var year = attribute.split("_")[1];
	panelContent += "<p> Gross Median Rent in 20" + year + ":<b> $" + feature.properties[attribute] + "</b></p>";

	var popupContent = feature.properties.Geography;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
		closeButton: false
    });
	
	
	//event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
		click: function(){
            $("#panel").html(panelContent);
        }
    });
	
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}
//Build an attribute array
function processData(data){
	var attributes = [];
	
	var properties = data.features[0].properties;
	
	for ( var attribute in properties){
		if (attribute.indexOf("GMR")> -1){
			attributes.push(attribute);
		}
	}
	console.log(attributes);
	return attributes;
}

function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}


function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 2;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}


//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/gmr.geojson", {
        dataType: "json",
        success: function(response){
			
			var attributes = processData(response);
            createPropSymbols(response,map,attributes);
			createSequenceControls(map,attributes);
        }
    });
}


$(document).ready(createMap);