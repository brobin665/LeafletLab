// JavaScript Document

function createMap(){
	var map =L.map('map').setView([38.8, -98.58],4);
	
	  //add OSM base tilelayer
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
	
		//Create  group layer
	var gmrp =  new L.LayerGroup();
	var gmr =  new L.LayerGroup();
	
	// Variable to hold basemaps
	var baseMaps  = {
    "Gross Median Rent": gmr,
	"Gross Median Rent as a Percent of 12-month Income": gmrp
	};
	
	//Get data for group layers
	getData(gmr,gmrp);
	//Add basemaps as through a layer control device
	L.control.layers(baseMaps).addTo(map); //Add as basemap for radio button usage
	console.log(baseMaps);
	console.log(map.gmr);
	
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
	
	 $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
	
	$('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
	
	//Step 5: click listener for buttons
    $('.skip').click(function(){
         var index = $('.range-slider').val();
		updatePropSymbols1(map.gmr, attributes[index]);
		updatePropSymbols2(map.gmrp, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        var index = $(this).val();
		
		   //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') === 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') === 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        };
		//update slider
		$('.range-slider').val(index);
		updatePropSymbols1(gmr, attributes[index]);
		updatePropSymbols2(gmrp, attributes[index]);
		
    });
};

function updatePropSymbols1(gmr, attribute){
	
	gmr.eachLayer(function(layer){
		if(layer.feature && layer.feature.properties[attribute]){
			
			var props = layer.feature.properties;
			
			var radius = calcPropRadius(props[attribute]);
			
			var year = attribute.split("_")[1];
			popupContent += "<p><b>Gross Median Rent in 20" + year + ":</b> $" + props[attribute] + "</p>";
			
			layer.bindPopup(popupContent, {
				offest: new L.Point(0,-radius)
			});
		}
	})
}

function updatePropSymbols2(map.gmrp, attribute){
	map.gmrp.eachLayer(function(layer){
		if(layer.feature && layer.feature.properties[attribute]){
			
			var props = layer.feature.properties;
			
			var radius = calcPropRadius(props[attribute]);
			
			var year = attribute.split("_")[1];
			popupContent += "<p> Gross Median Rent as a Percentage of Income over the last 12 Months in 20" + year + ":<b> " + feature.properties[attribute] + "%</b></p>";
			
			layer.bindPopup(popupContent, {
				offest: new L.Point(0,-radius)
			});
		}
	})
}



//Get Data
function getData(gmr, gmrp){
	$.ajax("data/gmr.geojson", {
        dataType: "json",
        success: function(response){
			var attributes = processData(response);
			createPropSymbolsGMR(response,gmr,attributes)
			;
			createSequenceControls(map,attributes);
			
        }
    });
	$.ajax("data/gmrp.geojson", {
        dataType: "json",
        success: function(response){
				var attributes =processData(response);
				createPropSymbolsGMRP(response,gmrp, attributes);
				createSequenceControls(map,attributes);
				
        }
    });
	
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
	
	return attributes;
}

//Convert markers to circle markers
function pointToLayerGMR(feature, latlng, attributes){
	//attribute to visualize with prop symbols
	var attribute = attributes[0];
	//check results
	console.log(attribute);

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
	console.log(attribute);
	
	var options = {
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
	

var attValue = Number(feature.properties[attribute]);

options.radius= (calcPropRadius(attValue)*3);

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

$(document).ready(createMap);


