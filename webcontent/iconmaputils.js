/**
 * @author Marcus
 */
var UTILS = {};

(function() {

	var buildIcon = function(iconPic) {
		return L.icon({
			iconUrl : iconPic,
			iconSize : [ 32, 37 ],
			iconAnchor : [ 15, 37 ],
			popupAnchor : [ -3, -37 ],
			labelAnchor : [ 10, -18 ],
		});
	};

	UTILS.latLongToString = function(bounds) {

		/* The coordinate order is (lower lat, lower lon, upper lat, upper lon) */
		var result;
		var lowerLat, lowerLng, upperLat, upperLng;

		lowerLat = bounds.getSouthWest().lat;
		lowerLng = bounds.getSouthWest().lng;
		upperLat = bounds.getNorthEast().lat;
		upperLng = bounds.getNorthEast().lng;

		result = lowerLat + "," + lowerLng + "," + upperLat + "," + upperLng;

		return result;
	};

    UTILS.createNameFromeTags = function(node) {
		if (node.tags.ref) {
			return 'ref: ' + node.tags.ref;
		} else if (node.tags.name) {
			return 'name: ' + node.tags.name;
		} else {
			return "?";
		}
    };

	UTILS.addLegendTo = function(map) {

		var legend = L.control({
			position : 'topright',
			collapsed : true
		});

		legend.onAdd = function(map) {

		    var div = L.DomUtil.create('div', 'legend');
		    var table = '';

		    table += '<p id="legend_but" style="cursor: pointer">Legende (+/-):</p>';
		    table += '<div id="legend_table">'
		    table += '<table>';
		    table += '<tr>';
		    table += '<td>';
		    table += 'red = only amenity';
		    table += '</td>';
		    table += '</tr>';

		    table += '<tr>';
		    table += '<td>';
		    table += 'orange = missing recycling:material';
		    table += '</td>';
		    table += '</tr>';

		    table += '<tr>';
		    table += '<td>';
		    table += 'yellow = missing recycling_type';
		    table += '</td>';
		    table += '</tr>';

			table += '<tr>';
		    table += '<td>';
		    table += 'green = complete';
		    table += '</td>';
		    table += '</tr>';
			
		    table += '</table>';
		    table += '</div>';
		    
		    div.innerHTML += table;
		    
		    return div;
		};

		legend.addTo(map);

		$('#legend_but').on('click', function() {
			$('#legend_table').toggle();
		});

		$('#legend_table').toggle();
	};
})();
