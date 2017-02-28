// JavaScript Document


function createMap(){
    // Store base layer in variable
	var base = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
	
	
	var lyr1 = L.layerGroup(), 
		lyr2= L.layerGroup();
	
	var radio  = {
    "Gross Median Rent": lyr1,
	"Gross Median Rent as a Percent of 12-month Income": lyr2
	};
	
    var map =L.map('map',{
		layers: [base]
	}).setView([38.8, -98.58],4);
	
	L.control.layers(radio).addTo(map); //Add layers to layer control for radio button usage
	getData(lyr1, lyr2);
	
}

function getData(lyr1, lyr2){
	$.ajax("data/gmr.geojson", {
        dataType: "json",
        success: function(response){
			     //create an attributes array
            var attributes = processData(response);
			
			createPropSymbols1(response, lyr1, attributes);
			createSequenceControls(map, attributes);
		}
    });
			
	$.ajax("data/gmrp.geojson", {
        dataType: "json",
        success: function(response){
			     //create an attributes array
            var attributes = processData(response);
			
			createPropSymbols2(response, lyr2,attributes);
			createSequenceControls(map, attributes);
			}
    });
}

function processData(data){
	var attributes = [];
	
	var properties= data.features[0].properties;
	
	for (var attribute in properties){
		if (attribute.indexOf("GMR")> -1){
			attributes.push(attribute);
		}
	}
	console.log(attributes);
	
	return attributes;
}

function createPropSymbols1(data,lyr1, attributes){
		
	L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer1(feature, latlng, attributes);
        }
    }).addTo(lyr1);
}
function createPropSymbols2(data, lyr2, attributes){
		
		L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer2(feature, latlng, attributes);
        }
    }).addTo(lyr2);
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

function pointToLayer1(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
	
	console.log(attribute);

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
	return layer;
}
	

function pointToLayer2(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
	
	console.log(attribute);
    //create marker options
    var options = {
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = (calcPropRadius(attValue)*3);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var panelContent = "<p>City:<b> " + feature.properties.Geography + "</b></p>";
	
	var year = attribute.split("_")[1];
	panelContent += "<p> Gross Median Rent as a Percentage of Income over the last 12 Months in 20" + year + ":<b> " + feature.properties[attribute] + "%</b></p>";

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
	return layer;
	
}

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
	
	 //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

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
		updatePropSymbols1(map, attributes[index]);
		updatePropSymbols2(map, attributes[index]);
    });
    

    //Step 5: input listener for slider
          $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
			  console.log(index);
			  
    });
}

function updatePropSymbols1(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            // if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            
            //add city to popup content string
            var popupContent = "<p>City:<b> " + feature.properties.Geography + "</b></p>"

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "Gross Median Rent in 20" + year + ":<b> $" + feature.properties[attribute] + "</b></p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        
        }
    });
}

function updatePropSymbols2(lyr2, attribute){
    lyr2.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            // if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        
        }
    });
}
					   

$(document).ready(createMap);
