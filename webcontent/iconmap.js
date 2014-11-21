// constructs the module ICONMAP
var ICONMAP = {};

(function() {

	utils = UTILS;

	var map = null;

	var osmIds = {};
	var namedGroup = {};
	var circles = new Array();
	var radius = 100;

	var operatorLayers;
	var operatorCategories = [ "amenity only", "amenity and type",
			"amenity and material", "complete" ];

	var zoom = {
		start : 0,
		end : 0
	};

	var recyclingmaterial = /^recycling:.*/gi;

	// the overpass api URL
	var ovpCall = 'http://overpass-api.de/api/interpreter?data=';

	ovpCall += '[out:json][timeout:15];';
	ovpCall += '(';
	ovpCall += 'node["amenity"="recycling"]({{bbox}});';
	ovpCall += 'way["amenity"="recycling"]({{bbox}});';
	ovpCall += 'relation["amenity"="recycling"]({{bbox}});';
	ovpCall += ')';
	ovpCall += ';out body center qt;';

	var loadPois = function() {
		var overpassCall;

		if (map.getZoom() < 12) {
			return;
		}

		// note: g in /{{bbox}}/g means replace all occurrences of
		// {{bbox}} not just first occurrence
		overpassCall = ovpCall.replace(/{{bbox}}/g, utils.latLongToString(map
				.getBounds()));

		console.log("calling overpass-api: " + overpassCall);

		// using JQuery executing overpass api
		$.getJSON(overpassCall, function(data) {

			// overpass returns a list with elements, which contains the nodes
			$.each(data.elements, function(index, element) {

				if ("tags" in element) {

					if (!(element.id in osmIds)) {

						osmIds[element.id] = true;

						var status = 0;
						Object.keys(element.tags).forEach(function(k) {
							if (k === "amenity") {
								status = status | 0x01;
							}
							if (k === "recycling_type") {
								status = status | 0x02;
							}
							if (recyclingmaterial.test(k)) {
								status = status | 0x04;
							}
						});

						if (status == 1) {
							addIconToMap(element, operatorCategories[0], 'red',
									radius);
						} else if (status == 3) {
							addIconToMap(element, operatorCategories[1],
									'orange', radius);
						} else if (status == 5) {
							addIconToMap(element, operatorCategories[2],
									'yellow', radius);
						} else if (status == 7) {
							addIconToMap(element, operatorCategories[3],
									'green', radius);
						} else {
							addIconToMap(element, operatorCategories[0],
									'white', radius);
						}
					}
				}
			});
		});
	};

	var addIconToMap = function(element, type, color, radius) {
		var name, marker;

		name = utils.createNameFromeTags(element);
		// marker = createMarker(element, name);
		circle = createCircle(element, color, radius);
		circles.push(circle);
		addToNamedGroup(type, circle);
		// addToNamedGroup(type, marker);
	};

	var createCircle = function(element, color, radius) {
		var lat, lon;
		if (element.type == "node") {
			lat = element.lat;
			lon = element.lon;
		} else if (element.type == "way") {
			lat = element.center.lat;
			lon = element.center.lon;
		}

		var circle = L.circle([ lat, lon ], radius, {
			stroke : false,
			color : color,
			fillColor : color,
			fillOpacity : 0.7
		});
		circle.bindPopup("<pre><code>"
				+ JSON.stringify(element.tags, null, 2).toString()
				+ "</code></pre>");
		return circle;
	};

	var createMarker = function(element, name) {
		if (element.type == "node") {
			var marker = L.marker([ element.lat, element.lon ]);

			marker.bindPopup(name);

			return marker;
		}
	};

	var addToNamedGroup = function(type, marker) {
		var group

		try {
			group = namedGroup[type];
			group.addLayer(marker);
		} catch (e) {
		}
	};

	var buildLayers = function() {

		operatorLayers = L.control.layers(null, null, {
			collapsed : false
		}).addTo(map);

		for ( var i = 0; i < operatorCategories.length; i++) {
			group = L.layerGroup();
			group.addTo(map);
			namedGroup[operatorCategories[i]] = group;
			operatorLayers.addOverlay(group, operatorCategories[i]);
		}
	};

	var moveEnd = function() {
		loadPois();
	};

	var photonSearchAction = function photonSearchAction(geojson) {
		console.debug(geojson);
	};

	// public interface
	ICONMAP.initMap = function() {
		var attr_osm, attr_overpass, attr_icons, osm;

		attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors';
		attr_overpass = '<br>POIs via <a href="http://www.overpass-api.de/">Overpass API</a>';
		attr_icons = 'IconMap by <a href="https://github.com/it4workflow/iconmap">iconmap</a>';

		osm = new L.TileLayer(
				'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution : [ attr_osm, attr_overpass, attr_icons ]
							.join(' | ')
				});

		map = L.map('map', {
			center : new L.LatLng(50.5488, 10.8978),
			zoom : 12,
			layers : osm
		});

		L.control.locate().addTo(map);

		map.addControl(new L.Control.Photon({
			resultsHandler : photonSearchAction,
			placeholder : 'Suche ...',
			position : 'topleft',
			emptyMessage : "Nichts gefunden",
			noResultLabel : "kein Ergebnis"
		}));

		map.addControl(new L.Control.Permalink({
			text : 'Permalink',
			layers : map.layers
		}));

		
		buildLayers();

		utils.addLegendTo(map);

		loadPois();

		map.on('moveend', moveEnd);

		map.on('zoomstart', function(e) {
			zoom.start = map.getZoom();
		});

		map.on('zoomend', function(e) {
			zoom.end = map.getZoom();
			var diff = zoom.start - zoom.end;
			if (diff > 0) {
				radius = radius * 2;
			} else if (diff < 0) {
				radius = radius / 2;
			}
			circles.forEach(function(circle) {
				circle.setRadius(radius)
			});
		});

		// map.locate();
	};

})();
