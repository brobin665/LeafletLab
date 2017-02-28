// JavaScript Document

function createMap(){
	var map =L.map('map').setView([38.8, -98.58],4);
	
	  //add OSM base tilelayer
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
	
	
		//Create empty group layer
	var gmrp =  new L.LayerGroup();
	var gmr =  new L.LayerGroup();
	// Variable to hold basemaps
	var baseMaps  = [];
    "Gross Median Rent": gmr,
	"Gross Median Rent as a Percent of 12-month Income": gmrp
	};
	
	//Get data for group layers
	getData(gmr,gmrp);
		
	//Add basemaps as through a layer control device
	L.control.layers(baseMaps).addTo(map); //Add as basemap for radio button usage
	
	
} //End of Create Map

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 2;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}

function createPropSymbolsGMR(data,gmr, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng){
			return pointToLayerGMR(feature, latlng, attributes);
		}
    }).addTo(gmr);
}



function createPropSymbolsGMRP(data, gmrp, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
			return pointToLayerGMRP(feature, latlng, attributes);
		}
		
    }).addTo(gmrp);
}

function createSequenceControls(map,attributes){
	$('#panel').append('<input class="range-slider" type="range">');
	
	 //set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
	//Add Buttons
	$('#panel').append('<button class= "skip" id="reverse">Reverse</button> ');
	$('#panel').append('<button class= "skip" id="forward">Skip</button> ');
	//Add Icons to Buttons
	$('#reverse').html('<img src="img/reverse.png" alt="Reverse">');
    $('#forward').html('<img src="img/forward.png" alt= "Forward" >');
	
	//button listener
	$('.skip').click(function(){
		var index= $('.range-slider').val();
		
		if($(this).attr('id')=== 'forward'){
			index++;
			
			index = index >8 ? 0 : index;
		}else if ($(this).attr('id')=== 'reverse'){
			index--;
			
			index = index < 0 ? 8 : index;
		}
		
		$('.range_slider').val(index);
		updateGMR(map, attributes[index]);
	});
	
	//slider listener
 $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
	 	updateGMR(map, attributes[index]);
    });
	
	
}

//Get Data
function getData(gmr, gmrp){
	$.ajax("data/gmr.geojson", {
        dataType: "json",
        success: function(response){
			var attributes = processData(response);
			createPropSymbolsGMR(response,gmr,attributes);
			createSequenceControls(map,attributes);
			
        }
    });
	$.ajax("data/gmrp.geojson", {
        dataType: "json",
        success: function(response){
				var attributes =processData(response);
				createPropSymbolsGMRP(response,gmrp, attributes);
				
        }
    });
	
}
/*Get GMRP Data
function getGMRP(gmrp){
	$.ajax("data/gmrp.geojson", {
        dataType: "json",
        success: function(response){
				var attributes =processGMRP(response);
				createPropSymbolsGMRP(response,gmrp, attributes);
				
        }
    });
	
}
*/
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

	



/*Create sequence controls
function createSequenceControlsGMR(gmr, attributes){
	Create range input element (slider)
	console.log(attributes);
	$('#panel').append('<input class="range-slider" type="range">' );
	
	$('.range-slider').attr({
		max: 8,
		min: 0,
		value:0,
		step:1
	});
	Add Buttons
	$('#panel').append('<button class= "skip" id="reverse">Reverse</button> ');
	$('#panel').append('<button class= "skip" id="forward">Skip</button> ');
	Add Icons to Buttons
	$('#reverse').html('<img src="img/reverse.png" alt="Reverse">');
    $('#forward').html('<img src="img/forward.png" alt= "Forward" >');
	
	Add click listeners for buttons and sliders
	$('.skip').click(function(){
		get the old index value
		 var index = $('.range-slider').val();

       /* Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') === 'forward'){
            index++;
            Step 7: if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') === 'reverse'){
            index--;
            Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        }

		
		 Update Slider
		$('.range-slider').val(index);
		Pass new attributes to update symbols
		updateGMR(gmr, attributes[index]);
		console.log(attributes);
		console.log(attributes[index]);
		updateGMRP(map,attributes[index]);
		
		
	});
	
	$('.range-slider').on('input', function(){
		var index = $(this).val();*/
		/*updateGMR(map, attributes[index]);
		console.log(attributes);
		console.log(attributes[index]);
		updateGMRP(map,attributes[index]);
	});
}*/

//Convert markers to circle markers
function pointToLayerGMR(feature, latlng, attributes){
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
};

var attValue = Number(feature.properties[attribute]);

options.radius= calcPropRadius(attValue);

var layer = L.circleMarker(latlng,options);

var panelContent = "<p>City: <b>" + feature.properties.Geography + "</b></p>";
	
var year = attribute.split("_")[1];
panelContent += "<p> Gross Median Rent in 20" + year + ":<b> $" + feature.properties[attribute] + "</b></p>";

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

return layer;
}
function pointToLayerGMRP(feature, latlng, attributes){
	//attribute to visualize with prop symbols
	var attribute = attributes[0];
	//check results
	//console.log(attribute);
	
	var options = {
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
	

var attValue = Number(feature.properties[attribute]);

options.radius= calcPropRadius(attValue);

var layer = L.circleMarker(latlng,options);

var panelContent = "<p>City: <b>" + feature.properties.Geography + "</b></p>";
	
var year = attribute.split("_")[1];
panelContent += "<p> Gross Median Rent as a Percentage of Income over the last 12 Months in 20" + year + ":<b> " + feature.properties[attribute] + "%</b></p>";

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

return layer;
}

function updateGMR(baseMaps, attribute){
	var lyr = baseMaps["Gross Median Rent"];
    lyr.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
             if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
			console.log(props);

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
			console.log(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.Geography + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p> Gross Median Rent in 20" + year + ":<b> $" + feature.properties[attribute] + "</b></p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        }
        }
    });
}
/*function updateGMRP(gmrp, attribute){
    gmrp.eachLayer(function(layer){
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
            popupContent += "<p> Gross Median Rent as a Percentage of Income over the last 12 Months in 20" + year + ":<b> " + feature.properties[attribute] + "%</b></p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        }
        }
    });
}*/
$(document).ready(createMap);


