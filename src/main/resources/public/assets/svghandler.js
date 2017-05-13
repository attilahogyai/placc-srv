window.xappc.initSvg=function(data){
	var currentReservations ;
	
	currentReservations = data;
	// console.log('I got the level data for:'+data.get('id')+' - '+data.get('name')); 
	data.get('seat.content').map(function(element){
		// console.log('seatid:'+element.get('id')+'- name:'+element.get('name'));
		var id = element.get('id');
		var reservationCount = element.get('reservationCount');

		var myReservationCount = element.get('myReservationCount');
		if(myReservationCount>0){
			console.log('i have '+myReservationCount+' reservations on desk:'+id);
		}
		setTableProperties(reservationCount,id);
	});
	
	var id = 0;
	
	var xhr = new XMLHttpRequest;
    xhr.open('get', '/assets/levels/'+data.get('id')+'.svg', true);
    xhr.onreadystatechange = function () {
		
        if (xhr.readyState != 4) return;
        var svg = xhr.responseXML.documentElement;
        svg = document.importNode(svg, true); 
        $('.myplaccsvg').append(svg);
        var svg=$('svg');
        svg.attr("width", "auto");
        svg.attr("height", "auto");		
        var svgPanZoom = $("svg").svgPanZoom();
				
		$('.g2_1').click(function (event) {
            var myRegexp = /table([0-9]*)/g;
			var match = myRegexp.exec($(event.target).attr('id'));

			if (match != undefined && match != null){
				if ($(event.target).attr('data-reservationCount') < 5 || $(event.target).attr('data-reservationCount') == undefined){
					var func=xappc.appInstance.__container__.lookup('controller:company.level').get('actions.setReservation');
					func.apply(xappc.appInstance.__container__.lookup('controller:company.level'), [match[1]] )
				}
			}
        });
		data.get('seat.content').map(function(element){
		// console.log('seatid:'+element.get('id')+'- name:'+element.get('name'));
			var id = element.get('id');
			var reservationCount = element.get('reservationCount');
			setTableProperties(reservationCount,id);
		});
    };
    xhr.send();
	
}

function setTableProperties(reservationCount,id){
	$('[id="table' +id + '"]').attr('class','g2_1 table rc_'+reservationCount);
	$('[id="table' +id + '"]').attr('data-reservationCount',reservationCount);
	$('[id="table' +id + '"]').attr('data-tableid',id);
}


window.xappc.refreshSvg=function(data){
	data.get('seat.content').map(function(element){
		var id = element.get('id');
		var reservationCount = element.get('reservationCount');
		var myReservationCount = element.get('myReservationCount');
		if(myReservationCount>0){
			console.log('i have '+myReservationCount+' reservations on desk:'+id);
		}		
		setTableProperties(reservationCount,id);
	});
}