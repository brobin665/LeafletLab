// JavaScript Document

function createMap(){
	var map =L.map('map', {
	}).setView([38.8, -98.58],4);
	
	  //add OSM base tilelayer
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

	var gmr = new L.LayerGroup();
    //load the data
	   $.ajax("data/gmr.geojson", {
        dataType: "json",
        success: function(response){
			 //create an attribute array to hold attribute values
			//var attributes = processData(response);
			//CreatePropSymbols(response, gmr);
			//createSequenceControls(map, attributes);
			L.geoJson(response).addTo(gmr);

			}
    	});
	// Create a group layer	
	var gmrp =  new L.LayerGroup();
	//Load the data
	$.ajax("data/gmrp.geojson", {
		dataType:"json",
		success: function(response){
			
			//Temporary
			//create marker options
    		var geojsonMarkerOptions = {
        	radius: 8,
        	fillColor: "#ff7800",
				color: "#000",
        	weight: 1,
        	opacity: 1,
        	fillOpacity: 0.8
			};
			
			//add layer to map
			 L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(gmrp);
        
		
	 var baseMaps = {
    "Gross Median Rent": gmr,
	"Gross Median Rent as a Percent of 12-month Income": gmrp
	};
		
	L.control.layers(baseMaps).addTo(map); 
	}
	}
		


/*function CreatePropSymbols(data, baseMaps){
	//create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
	//create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(baseMaps);
}*/

//Build an attribute array
/*function processData(data){
	var attributes = [];
	
	var properties = data.features[0].properties;
	
	for ( var attribute in properties){
		if (attribute.indexOf("GMR")> -1){
			attributes.push(attribute);
		}
	}
	
	//check result
	console.log(attributes);
	
	return attributes;
}*/

	
	
	


//Create sequence controls
/*function createSequenceControls(map, attributes){
	//Create range input element (slider)
	
	$('#panel').append('<input class="range-slider" type="range">' );
	
	$('.range-slider').attr({
		max: 8,
		min: 0,
		value:0,
		step:1
	});
	//Add Buttons
	$('#panel').append('<button class= "skip" id="reverse">Reverse</button> ');
	$('#panel').append('<button class= "skip" id="forward">Skip</button> ');
	//Add Icons to Buttons
	$('#reverse').html('<img src="img/reverse.png" alt="Reverse">');
    $('#forward').html('<img src="img/forward.png" alt= "Forward" >');
	
	//Add click listeners for buttons and sliders
	$('.skip').click(function(){
		//get the old index value
		 var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') === 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') === 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        }

		
		// Update Slider
		$('.range-slider').val(index);
		//Pass new attributes to update symbols
		updatePropSymbols(map, attributes[index]);
		console.log(attributes[index]);
		
	});
	
	$('.range-slider').on('input', function(){
		var index = $(this).val();
		//console.log(index);
		updatePropSymbols(map, attributes[index]);
	});
}
*/
//Convert markers to circle markers
/*function pointToLayer(feature, latlng, attributes){
	//attribute to visualize with prop symbols
	var attribute = attributes[0];
	//check results
	//console.log(attribute);
	
	var options = {
			fillColor: "#ff7800",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
};*/

/*var attValue = Number(feature.properties[attribute]);

//options.radius= calcPropRadius(attValue);

var layer = L.circleMarker(latlng,options);

var panelContent = "<p><b>City: </b> " + feature.properties.Geography + "</p>";
	
//var year = attribute.split("_")[1];
//panelContent += "<p><b> Gross Median Rent in 20" + year + ":</b> $" + feature.properties[attribute] + "</p>";

var popupContent = feature.properties.Geography;	
	
layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
		closeButton: false 
    });
	
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
*/
//return layer;

}

/*//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.5;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
	//console.log(attValue);
	//console.log(area);
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
	//console.log(radius);

    return radius;
}*/


/*function CreatePropSymbols(data, gmr, attributes){
	L.geoJson(data, {
		pointToLayer: function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		}
	}).addTo(gmr);
}*/

/*function updatePropSymbols(grmp, attribute){
    grmp.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
             if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.Geography + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Gross Median Rent in 20" + year + ":</b> $" + props[attribute] + "</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        }
        }
    });
}*/

$(document).ready(createMap);

