//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map =L.map('map').setView([37.8, -95.58],4);
	
	//Create data layer objects
	var gmr =new L.geoJson().addTo(map);
	var gmrp =new L.geoJson();
	
	//Call function to get data via ajax callbacks. 
	//getData(map, gmr, gmrp);
	getData(map,gmr,gmrp);
	
	//add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
	
	//variable to hold values to be used by control group 
	var radio  = {
    "Gross Median Rent": gmr,
	"Gross Median Rent as a Percentage of 12-month Income": gmrp
	};
	
	//Add layers to layer control for radio button usage
	L.control.layers(radio).addTo(map); 

	var panelContent = "<p><b>Click on a proportional symbol for more information</b></p>";
	$("#panel").html(panelContent);
	
	return map;
}

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
	
    if (attribute.includes("GMRP")){
		var options = {
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
		  };
    } else {
		var options = {
        fillColor: "#85bb65",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    	};	
	}

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
	
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build panel content string
    var panelContent = "<p><b> " + feature.properties.Geography + "</b></p>";
	
	var year = attribute.split("_")[1];
	panelContent += "<p> Gross Median Rent in 20" + year + ":<b> $" + feature.properties[attribute] + "</b></p>";

	// insert popup
	var popup = new Popup(feature.properties, attribute, layer, options.radius);

	//add popup to circle marker
	popup.bindToLayer();
	
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

//Create new sequence controls
function createSequenceControls(map, gmr, gmrp, attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range" max="8" min="0" step= 1" value="0">');
			
			//add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
			
			//kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
			
            return container;
        }
	});
	
    map.addControl(new SequenceControl());
	//Add icons to buttons
	$('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
	
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
		updatePropSymbolsGMR(gmr_props, map, attributes[index]);
		updatePropSymbolsGMRP(gmrp_props, map, attributes[index]);
		
	});
		
        $('.range-slider').on('input', function(){
			var index = $(this).val();
			updatePropSymbolsGMR(gmr_props, map, attributes[index]);
			updatePropSymbolsGMRP(gmrp_props, map, attributes[index]);
		});
}

function updatePropSymbolsGMR(gmr_props, map, attribute){
    gmr_props.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            // if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
			// Create popup instance
            var popup = new Popup(props, attribute, layer, radius);
			
			var panelContent = "<p><b> " + props.Geography + "</b></p>";
	
			var year = attribute.split("_")[1];
			panelContent += "<p> Gross Median Rent in 20" + year + ":<b> $" + props[attribute] + "</b></p>";
			
			//add popup to circle marker
			popup.bindToLayer();
			
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
        }
    });
	updateLegendGMR(map, attribute);
}
//Update Prop Symbols with Slider
function updatePropSymbolsGMRP(gmrp_props, map, attribute){
    gmrp_props.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            // if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = (calcPropRadius(props[attribute])*3);
            layer.setRadius(radius);
			// Create popup instance
            var popup = new Popup(props, attribute, layer, radius);
			
			var panelContent = "<p><b> " + props.Geography + "</b></p>";
	
			var year = attribute.split("_")[1];
			panelContent += "<p> Gross Median Rent As a Percentage of Income Over 12 Months in 20" + year + ":<b> " + props[attribute] + "%</b></p>";
			
			//add popup to circle marker
			popup.bindToLayer();
		
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
        
        }
    });
	updateLegendGMRP(map, attribute);
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

function createPropSymbolsGMR(data, gmr, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    gmr_props = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(gmr);
}

function createPropSymbolsGMRP(data, gmrp, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    gmrp_props = L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(gmrp);
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
function getData(map, gmr, gmrp){
    //load the data
    $.ajax("data/gmr.geojson", {
        dataType: "json",
        success: function(response){
			
			var attributes = processData(response);
            createPropSymbolsGMR(response, gmr, attributes);
			createSequenceControls(map,gmr,gmrp, attributes);
			createLegendGMR(map, attributes);
		
        }
    });
	$.ajax("data/gmrp.geojson", {
        dataType: "json",
        success: function(response){
			
			var attributes = processData(response);
            createPropSymbolsGMRP(response, gmrp, attributes);
			createSequenceControls(map, gmr, gmrp, attributes);
			createLegendGMRP(map,attributes);
        }
    });
}



function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
	 this.content = "<p><b>" + this.properties.Geography + "</b></p>";
	
	this.bindToLayer = function(){
		this.layer.bindPopup(this.content, {
			offset : new L.Point(0, -radius)
		});
	};
}


function createLegendGMR(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">');
            //Step 1: start attribute legend svg string
             var svg = '<svg id="attribute-legend" width="160px" height="100px">';

        //array of circle names to base loop on
       var circles = {
            max: 20,
            mean: 40,
            min: 60
        };

        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#85bb65" fill-opacity="0.8" stroke="#000000" cx="50"/>';

            //text string
            svg += '<text id="' + circle + '-text" x="90" y="' + (circles[circle]+15) + '"></text>';
        }
        //close svg string
        svg += "</svg>";

        //add attribute legend svg to container
        $(container).append(svg);
            return container;
        }
    });
    map.addControl(new LegendControl());
    updateLegendGMR(map, attributes[0]);
}

function createLegendGMRP(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">');
            //Step 1: start attribute legend svg string
             var svg = '<svg id="attribute-legend" width="160px" height="100px">';

        //array of circle names to base loop on
       var circles = {
            min: 20,
            mean: 40,
            max: 60
        };

        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#85bb65" fill-opacity="0.8" stroke="#000000" cx="50"/>';

            //text string
            svg += '<text id="' + circle + '-text" x="90" y="' + (circles[circle]+15) + '"></text>';
        }
        //close svg string
        svg += "</svg>";

        //add attribute legend svg to container
        $(container).append(svg);
            return container;
        }
    });
    map.addControl(new LegendControl());
    updateLegendGMRP(map, attributes[0]);
}


function getCircleValuesGMR(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            }

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            }
        }
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
}

function getCircleValuesGMRP(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            }

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            }
        }
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
}



//Update the legend with new attribute
function updateLegendGMR(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
   
	var content = "<p><em>Gross Median Rent 20" + year +'</em></p>';

    //replace legend content
    $('#temporal-legend').html(content);
	
	var circleValues = getCircleValuesGMR(map, attribute);
	
	for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 80 - radius,
            r: radius
        });
		
		//Step 4: add legend text
        $('#'+key+'-text').text("$" + Math.round(circleValues[key]*100)/100);
    }
}

function updateLegendGMRP(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
   
	var content = "<p><em>Gross Median Rent as a Percentage of Income over 12 Months in 20" + year +'</em></p>';
	
    //replace legend content
    $('#temporal-legend').html(content);
	
	var circleValues = getCircleValuesGMRP(map, attribute);
	
	for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 80 - radius,
            r: radius
        });
		
		//Step 4: add legend text
        $('#'+key+'-text').text("$" + Math.round(circleValues[key]*100)/100);
    }
}

$(document).ready(createMap);