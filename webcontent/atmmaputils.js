/**
 * @author Marcus
 */

var UTILS = {};

(function() {

    var buildAtmIcon = function(iconPic) {
	return L.icon({
	    iconUrl : iconPic,
	    iconSize : [ 32, 37 ],
	    iconAnchor : [ 15, 37 ],
	    popupAnchor : [ -3, -37 ],
	    labelAnchor : [ 10, -18 ],
	});
    };

    UTILS.yesAtm = buildAtmIcon('bank_euro_atm_yes.png');
    UTILS.atm = buildAtmIcon('atm_euro_yes.png');
    UTILS.unknownAtm = buildAtmIcon('bank_euro_atm_unknow.png');
    UTILS.noAtm = buildAtmIcon('bank_icon_atm_no.png');

    UTILS.latLongToString = function(bounds) {

	/* The coordinate order is (lower lat, lower lon, upper lat, upper lon) */
	var result;
	var lowerLat, lowerLng, upperLat, upperLng;

	lowerLat = bounds.getSouthWest().lat;
	lowerLng = bounds.getSouthWest().lng;
	upperLat = bounds.getNorthEast().lat;
	upperLng = bounds.getNorthEast().lng;

	result = "(" + lowerLat + "," + lowerLng + "," + upperLat + ","
		+ upperLng + ")";

	return result;
    };

    UTILS.createNameFromeTags = function(node) {
	if (node.tags.name) {
	    return node.tags.name;
	} else if (node.tags.operator) {
	    return node.tags.operator;
	} else {
	    return "???";
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
	    table += 'Geldautomat:';
	    table += '</td>';
	    table += '<td>';
	    table += '<img src="atm_euro_yes.png" />';
	    table += '</td>';
	    table += '</tr>';

	    table += '<tr>';
	    table += '<td>';
	    table += 'Bank mit Geldautomat:';
	    table += '</td>';
	    table += '<td>';
	    table += '<img src="bank_euro_atm_yes.png" />';
	    table += '</td>';
	    table += '</tr>';

	    table += '<tr>';
	    table += '<td>';
	    table += 'Bank mit unbekannten<br />Geldautomaten-Status:';
	    table += '</td>';
	    table += '<td>';
	    table += '<img src="bank_euro_atm_unknow.png" />';
	    table += '</td>';
	    table += '</tr>';

	    table += '<tr>';
	    table += '<td>';
	    table += 'Bank ohne Geldautomat:';
	    table += '</td>';
	    table += '<td>';
	    table += '<img src="bank_icon_atm_no.png" />';
	    table += '</td>';
	    table += '</tr>';
	    table += '</table>';
	    table += '<p><a href="https://github.com/momolinus/atm-map">Sourcecode der Karte</a></p>';
	    table += '</div>';
	    
	    div.innerHTML += table;
	    
	    return div;
	};

	legend.addTo(map);
	
	$('#legend_but').on('click', function(){
	    $('#legend_table').toggle();
	});
	
	$('#legend_table').toggle();
    };
})();