// constructs the module ICONMAP
var ICONMAP = {};

(function() {

	// dependencies
	utils = UTILS;

	/* private attributes */

	// contains the node id of the OSM objects
	var nodeIds = {}; // JavaScript pattern: object literal
	var wayNodeIds = {};
	var namedGroup = {};

	var operatorLayers;
	var operatorCategories = [ "amenity only", "amenity and type", "amenity and material", "complete" ];
	
	var map = null;

	var recyclingmaterial=/^recycling:.*/gi;
	
	// building the api call for atms (automated teller machine)
	// the overpass api URL
    var ovpCall = 'http://overpass-api.de/api/interpreter?data=';

    ovpCall += '[out:json][timeout:15];';
	ovpCall += 'area(3601263897)->.area;';
    ovpCall += '(';
	ovpCall += 'node["amenity"="recycling"]({{bbox}});';
    ovpCall += 'way["amenity"="recycling"]({{bbox}});';
    ovpCall += 'relation["amenity"="recycling"]({{bbox}});';
	ovpCall += ')';
    ovpCall += ';out body center qt;';

	/** **************** */
	/** private methods */
	/** **************** */

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
			$.each(data.elements, function(index, node) {

				if ("tags" in node) {

					if (!(node.id in nodeIds)) {

						nodeIds[node.id] = true;

						var status = 0;
						Object.keys(node.tags).forEach(function(k) {
							if (k === "amenity") {
								status = status | 0x01;
							}
							if (k === "recycling_type") {
								status = status | 0x02
							}
							if (recyclingmaterial.test(k)) {
								status = status | 0x04
							}
						});

						if (status == 1) {
							addIconToMap(node, operatorCategories[0], 'red',
									100);
						} else if (status == 3) {
							addIconToMap(node, operatorCategories[1], 'orange',
									100);
						} else if (status == 5) {
							addIconToMap(node, operatorCategories[2], 'yellow',
									100);
						} else if (status == 7) {
							addIconToMap(node, operatorCategories[3], 'green',
									100);
						} else {
							addIconToMap(node, operatorCategories[0], 'white',
									100);
						}
					}
				}
			});
		});
	};

	var addIconToMap = function(node, type, color, radius) {
		var name, marker;

		name = utils.createNameFromeTags(node);
		// marker = createMarker(node, name);
		circle = createCircle(node, color, radius);
		addToNamedGroup(type, circle);
		// addToNamedGroup(type, marker);
	};

	var createCircle = function(node, color, radius) {
		var circle = L.circle([ node.lat, node.lon ], radius, {
			stroke : false,
			color : color,
			fillColor : color,
			fillOpacity : 0.7
		});
		circle.bindPopup("<pre><code>"
				+ JSON.stringify(node.tags, null, 2).toString()
				+ "</code></pre>");
		return circle;
	};

	var createMarker = function(node, name) {
		if (node.type == "node") {
			var marker = L.marker([ node.lat, node.lon ]);

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

		buildLayers();

		utils.addLegendTo(map);

		loadPois();

		map.on('moveend', moveEnd);

		// map.locate();
	};

})();