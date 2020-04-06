	$(document).ready(function() {
		
	
	let overlays = {};
	let geoJsonData;
	let countyList = [];
	let countyListA = [];
	let selectdateoffset;
	let selectmarker;
	let daytot=0;
	let daytotd=0;
		
	

	let baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			minZoom: 3,
			maxZoom: 10,
			attribution: 'Map data &copy; <a  href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			id: 'mapbox/streets-v11'
		});

	let tl2="http://{s}.sm.mapstack.stamen.com/(toner-background,$eee[@70],$b3e6dd[hsl-color@60])[hsl-color]/{z}/{x}/{y}.png"
	let tlattr='<span style="background=color:#92b1ac">&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a></span>'

	let custom2 = L.tileLayer(tl2, {
			attribution: tlattr,
			subdomains: 'abcd',
			minZoom: 3,
			maxZoom: 10,
			ext: 'png'
		});

	let nomap = L.tileLayer("none", {
			minZoom: 4,
			maxZoom: 10,
			attribution: "none",
		});

	let map = L.map('map', {
			center: [39, -96],
			zoom: 4.5,
			layers: [custom2],
			zoomSnap: 0.25,
			attributionControl: false
		});
		
		L.control.attribution({
		position: 'topright'
	}).addTo(map);
		
	
		
		addk();


		
		
		
		//set these to map color
		//.leaflet-control-layers
		//.leaflet-control-layers-expanded
		//<div style="width: 90%;margin: 5%;">Cases per 100k</div>
		//leaflet-control-layers-separator
		function adjustControlLayer(){
		let pgg='#e3faf6'; //'#e4ebc5';
		
		$('.leaflet-control-layers').css('background-color',pgg);
		$('.leaflet-control-layers-expanded').css('background-color',pgg);
		$('.leaflet-control-layers-separator').after('<div style="width: 90%;margin: 5%;">Cases per 100k</div>');
		
		$('.leaflet-control-layers-selector:checkbox').each(function( index ) {
			let ubgcolor='rgba(255, 0, 0,' + calcOpacity(index+1) + ')';
			$(this).parent().parent().prepend("<div style='background-color:"+ubgcolor+";width:110px;height:20px;float:left;'>&nbsp</div>");
			$(this).css('margin-left','-100px');
		});

		
			
		
		};
		
		

		function refreshLayers(){
			countyList.length=0;	
			countyListA.length=0;	
			$.each(overlays, function(index, d) {
				d.clearLayers();
			});
			
			//$.each(geoJsonData.country.igroups, function(index, d) {
			//	overlays[d] = L.featureGroup().addTo(map);
			//});
			
		}


		function removeAnamationFromPath(){
			map.eachLayer(function(layer){
			if (layer.myData){
				let igroup=layer.myData.properties.IGROUP;
					if (isNaN(igroup)){igroup=0;}
					let igroupval =((0.15*(igroup+1))*.9).toFixed(2);
					layer.options.fillOpacity=igroupval;
					layer.options.opacity=0.75;

			}
			});
		}

		
		function addcounties(interv, ani){
			countyList.length=0;	
			countyListA.length=0;	
			selectdateoffset=0;	
			let i = 59;
			let intervalId = setInterval(function(){

				if(i < 1){
				clearInterval(intervalId);
				removeAnamationFromPath();
				return ;
				}
				addday(i,true);
				selectdateoffset=i;
				i--;
			}, interv);
		
		}
		
		
		
		
		
		function addday(offsetdate, anima){
			$("#infectedcount").text(formatNumber(geoJsonData.country.confirmed[offsetdate]));
			$("#facount").text(formatNumber(geoJsonData.country.deaths[offsetdate]));
			$("#timesince").text(geoJsonData.country.dateReport[offsetdate]);
			
			
			let rateC=((geoJsonData.country.deaths[offsetdate])/(geoJsonData.country.confirmed[offsetdate]))*100;
			let per100C=geoJsonData.country.confirmed[offsetdate]/(geoJsonData.country.totalPopulation/100000);
				
				rateC=parseFloat(rateC).toFixed(2)+"%";
				per100C=parseFloat(per100C).toFixed(0);
				$("#rate").text(rateC);
				$("#per100").text(per100C)
				$("#population").text(formatNumber(geoJsonData.country.totalPopulation));

			if (selectmarker){
			updateCounty(selectmarker);	
			}
			

			$.each(geoJsonData.features, function(index, d) {
				if (d.type=="Feature"){
						
					if (offsetdate in d.properties.DATES){
						if (d.properties.DATES[offsetdate][0] > 0){
							if (!countyList.includes(d.properties.GEOID)){
								countyList.push(d.properties.GEOID);
								if (d.properties.GEOID=='0500000US06037'){updateCounty(d);}  //LA default
								let igroup=d.properties.IGROUP;
								if (isNaN(igroup)){igroup=0;}
								let igroupval =calcOpacity(igroup+1) //((0.15*(igroup+1))*.7).toFixed(2);
								

								let polyline = L.polyline(d.geometry.coordinates,
									{color: 'white',
									fill:true,
									fillColor: 'red',
									fillOpacity: (anima ? 0 : igroupval),
									opacity:  (anima ? 0 : 0.75),
									weight: 1,
									className:"a"+d.properties.GEOID}
								//	).addTo(overlays[igroup.toString()]);
								).addTo(overlays[d.properties.IGROUPL]);
								//).addTo(overlays["0"]);
								
								if (anima){
								let anicounty = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
								$(anicounty)	
									.attr("attributeName", "fill-opacity")
									.attr("from" ,"0")
									.attr("to" ,igroupval )
									.attr("begin" ,tsi+"s")
									.attr("dur" ,"2s")
									.attr("fill","freeze");		
								$(".a"+d.properties.GEOID).append(anicounty);

								
								 anicounty = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
								$(anicounty)	
									.attr("attributeName", "stroke-opacity")
									.attr("from" ,"0")
									.attr("to" ,"0.75")
									.attr("begin" ,tsi+"s")
									.attr("dur" ,"2s")
									.attr("fill","freeze");		
								$(".a"+d.properties.GEOID).append(anicounty);									
								}	
								
									
							polyline.on('mouseover', cdetail);
							polyline.on('click', cdetail);
							polyline.myData=d;
							
							}
							else
							{
								if (d.properties.DATES[offsetdate][1] > 0){
									if (!countyListA.includes(d.properties.GEOID)){
										countyListA.push(d.properties.GEOID);
							//			$(".a"+d.properties.GEOID).attr("stroke","red");
							//			$(".a"+d.properties.GEOID).attr("stroke-opacity","0.1");
							
									}
								}
							}
					
						}
					}

					
				
				}
				
				
				
				
			})
			};

		

	 
			
		function cdetail(e){
			let marker = e.target;
			updateCounty(marker.myData)
			selectmarker=marker.myData;
		};
		
		function updateCounty(aa){
			
			$("#countyname").text(aa.properties.NAME);
			if (selectdateoffset in aa.properties.DATES){
				$("#infectedcountC").text(formatNumber(aa.properties.DATES[selectdateoffset][0]));
				$("#facountC").text(formatNumber(aa.properties.DATES[selectdateoffset][1]));
				$("#populationC").text(formatNumber(aa.properties.POP));
	
				//let perSM=geoJsonData.country.confirmed[offsetdate]/(geoJsonData.country.totalPopulation/100000);
			// divide ALAND by 2,589,988 to get sq miles
				let sqmi=(aa.properties.ALAND/2589988)
				$("#perSMC").text(formatNumber((aa.properties.DATES[selectdateoffset][0]/sqmi).toFixed(0)));
				
				let rateC=(aa.properties.DATES[selectdateoffset][1]/aa.properties.DATES[selectdateoffset][0])*100;
				let per100C=aa.properties.DATES[selectdateoffset][0]/(aa.properties.POP/100000);
				rateC=parseFloat(rateC).toFixed(2)+"%";
				per100C=parseFloat(per100C).toFixed(0);
				$("#rateC").text(rateC);
				$("#per100C").text(per100C);
				
				
				
			}
			
		}
		
		
		
		function addk(){
			  $.getJSON("js/covid_countyboundry_day4.json") 
				.done(function(data) {
						geoJsonData=data;
				})		

			.done(function(data) {
				refreshLayers();
			
			let baseLayers = {
				"Standard Map": baseMap,
				"Green": custom2
				};
			$.each(geoJsonData.country.igroups, function(index, d) {
				overlays[d] = L.featureGroup().addTo(map);
			});
			
				
				L.control.layers(baseLayers, overlays,{position: 'bottomright', collapsed:true}).addTo(map);
				map.inertia = false;
				adjustControlLayer();
			addday(0,false);
			})
		 }
		
		let tsi=-0.25;
		let ts = setInterval(function(){
				tsi=tsi+0.25;
			}, 250);
	//Events		
			
		map.on("overlayremove", function(e) {
			
		});
		
		map.on("overlayadd", function() {
			refreshLayers();	
			addday(0,false);
		});
		
		$('#startpan').click(function(){
			refreshLayers();
			x=addcounties(250);
		});
	
	
	//Helpers

		let curday = function(daysback){
			 let dt = new Date();
			 dt.setDate( dt.getDate() - daysback );
			 return dt.getMonth()+1 + '-' + dt.getDate() + '-' + dt.getFullYear();
		};
		
		
		function formatNumber(num) {
				return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
		}
		function calcOpacity(lev){
			
			return ((0.15*(lev))*.7).toFixed(2);
			
		}
	

	});



