// variables from short code
var startPlace = sc_atts.start;
var endPlace = sc_atts.end;
var endShort = sc_atts.endshort;
var taxiFare = sc_atts.taxifare;
var transitNote = sc_atts.transitnote;
var showTransit= sc_atts.showtransit;
var showDriving = sc_atts.showdriving;
var offset = sc_atts.offset;


var directions;
var routes=[];
window.onload = function(){
//wait for google maps api to load from the WP map plugin to instantiate directions
    directions = new google.maps.DirectionsService();
    if(showTransit == 'true'){
        getTransitRoutes(startPlace,endPlace,null);
    }
    if(showDriving == 'true'){
        getDrivingRoute(startPlace,endPlace,offset);
    }
};


function getTransitRoutes(o,d,departTime) {
    getTransitRoute(o,d,departTime);
}

function getTransitRoute(o,d,departTime) {

    if(departTime !=null)
    {
        var request = {
            origin: o,
            destination: d,
            travelMode: google.maps.DirectionsTravelMode.TRANSIT,
            provideRouteAlternatives: false,
            transitOptions: {
                departureTime: departTime
            }
        };
    }
    else
    {
        var request = {
            origin: o,
            destination: d,
            travelMode: google.maps.DirectionsTravelMode.TRANSIT,
            provideRouteAlternatives: false
        };
    }

    directions.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var obj = JSON.stringify(response);
            // renderer.setDirections(response);

            var duration = response.routes[0].legs[0].duration.text;
            var distance = response.routes[0].legs[0].distance.text;
            var dept_time = response.routes[0].legs[0].departure_time.text;
	    //var dept_time_ms = response.routes[0].legs[0].departure_time.value;
            var dept_DateTime = new Date(response.routes[0].legs[0].departure_time.value);
            var arri_time = response.routes[0].legs[0].arrival_time.text;
            var now_DateTime = new Date();
            var wait = new Date(dept_DateTime - now_DateTime);

            var waitTimeMin = Math.abs((dept_DateTime.getHours()*60+dept_DateTime.getMinutes()) - (now_DateTime.getHours()*60+now_DateTime.getMinutes()));
            var waitTimeHrs = Math.floor(waitTimeMin/60);
            waitTimeMin = waitTimeMin%60;
            var waitTime = (waitTimeHrs == 0 ? "" :waitTimeHrs +":")+waitTimeMin;

            for(var i=0;i<response.routes[0].legs[0].steps.length;i++)
            {

                if(response.routes[0].legs[0].steps[i].travel_mode == "TRANSIT")
                {
                    var departStop = response.routes[0].legs[0].steps[i].transit.departure_stop.name;
                    var vehicleName = response.routes[0].legs[0].steps[i].transit.line.name;
                    var serviceIcon = response.routes[0].legs[0].steps[i].transit.line.vehicle.local_icon;
                    var serviceTypeIcon = response.routes[0].legs[0].steps[i].transit.line.vehicle.icon;
                    var routeColor = response.routes[0].legs[0].steps[i].transit.line.color;
                    var headsign = response.routes[0].legs[0].steps[i].transit.headsign;
                    var agencyUrl = response.routes[0].legs[0].steps[i].transit.line.agencies[0].url;
                    var agencyName = response.routes[0].legs[0].steps[i].transit.line.agencies[0].name;
                    var fare = response.routes[0].fare.value;

                    routes.push({duration:duration,distance:distance,depart_time:dept_time,depart_datetime:dept_DateTime,arrival_time:arri_time,wait_time:waitTime,depart_stop:departStop,vehicle_name:vehicleName, service_icon:serviceIcon,servicetype_icon:serviceTypeIcon,route_color:routeColor,headsign:headsign,agency_url:agencyUrl,agency_name:agencyName,fare:fare});
                    var route = response.routes[0];
//console.log(route.legs[0].steps[i].transit.line.name);
                    break;
                }

            }
        }

        var time = routes[0].depart_datetime;
        if(routes != null && routes.length ==1)

            getTransitRoute(o,d,new Date(time.setMinutes(time.getMinutes()+5)));
        if(routes.length ==2)
        {renderRoutes(routes);
            return;}
    });
}

function renderRoutes(routes) {

    var panel = document.getElementById('transit_info_panel');

    if(routes == null || routes.length == 0)
    {
        panel.innerHTML = "<div style='padding-top:5px'> No transit found at this time.</div>";
        return;
    }


    for(var i=0;i<routes.length;i++)
    {

        if(i==0 ||(routes[i].vehicle_name != routes[i-1].vehicle_name))
        {
            panel.innerHTML = "<b style='text-decoration: underline;'>"+routes[i].agency_name+"</b> to "+ routes[i].headsign;
            panel.innerHTML += "<br/>";
            if(routes[i].service_icon != undefined)
                panel.innerHTML += "<a href="+(routes[i].agency_url== undefined?'#':routes[i].agency_url)+"><img style='vertical-align:bottom;width:25px;' src="+routes[i].service_icon+" ></a> ";

            if(routes[i].servicetype_icon != undefined)
                panel.innerHTML += "<img style='vertical-align:bottom;width:25px;' src='"+routes[i].servicetype_icon+"' /> <span style='border-bottom:2px solid "+routes[i].route_color+";'>"+routes[i].vehicle_name+"</span> departs from "+routes[i].depart_stop+" station in ";
        }
//else
//	panel.innerHTML += "<br/>";
        panel.innerHTML += " <br/><span  class='waitTime' > <b>"+routes[i].wait_time+" mins</b> takes <b>"+routes[i].duration+" ("+routes[i].depart_time+"-"+routes[i].arrival_time+")</b></span>";

        if((i < routes.length-1 && routes[i].vehicle_name != routes[i+1].vehicle_name) || i == routes.length-1)
            panel.innerHTML +="<br/>" + transitNote +  "<br/>Fare - <b>$"+routes[i].fare+"</b>";

    }
    panel.innerHTML +="</span>";

}
function getDrivingRoute(o,d,offset) {
    if(offset ==null)
        offset = 0;

    var request = {
        origin: o,
        destination: d,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        provideRouteAlternatives: false
    };

    var panel = document.getElementById('driving_info_panel');
    panel.innerHTML = '';
    directions.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var duration = response.routes[0].legs[0].duration.value;
            //add offset for traffic & missing route into airport
            duration = Math.round((duration/60)+Number(offset));

            var distance = response.routes[0].legs[0].distance.text;
            var viaRoute = response.routes[0].summary;
            panel.innerHTML = "<div  style='padding-top:5px'> <b><u>Taxi/Driving:</u> </b> via <span >"+viaRoute+"</span><br/>Estimate travel time <b>"+duration+" mins</b>. Click <a target='_blank'  href='https://www.google.com/maps/dir/"+o+"/"+d+"/'>here</a> for travel time with traffic. <br/>Fare - Approx <b>" + taxiFare + "</b><div/>";
        }
    });

}