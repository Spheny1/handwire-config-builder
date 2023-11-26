function makeConfigRequestJson(event){
        event.detail.parameters.name = 'test';
	rowArray = [];
	colArray = [];
	//Loop thru gpio elements push the proper col/row arrays
	for(gpio of document.querySelectorAll(".gpio")){
		if(gpio.nextElementSibling.nextElementSibling.value == "col"){
			rowArray.push(gpio.nextElementSibling.innerHTML);
		} else {
			colArray.push(gpio.nextElementSibling.innerHTML);
		}
	}
        event.detail.parameters.orientation = document.getElementById("orientation").value; 
	event.detail.headers['Content-Type'] = 'application/json';
	let layout = [];
	let keys = document.getElementsByClassName("key");
	event.detail.parameters.id = 0;
	let layer = [];
	
	for(i in rowArray){
		// get ioline
		//
		//Loop thru points and get key div at each
		//
	}

	//assign outer loop based on row-col and build the layers
	//for( key of keys){
	//	layer.push(key.value);
	//	if(layer.length == event.detail.parameters.row.length * event.detail.parameters.column.length){
	//		layout.push(layer);
	//		while (layer.length > 0) {
  	//			layer.pop();
	//		}
	//	}
	//}		
	event.detail.parameters.layer = layout;
	event.detail.parameters.layout = {};
	event.detail.parameters.default_circuit_id = 0;
	event.detail.parameters.row = rowArray;
        event.detail.parameters.column = colArray;

}
function ChangeTab(layer, tabToSelect){
	allRows = document.querySelectorAll(".layer");
	for(row of allRows){
		row.classList.add("hide");	
	}
	toMakeVisibile = document.querySelectorAll("[name=layer" + layer.toString() + "]");
	for(row of toMakeVisibile){
		row.classList.remove("hide");
	}
	document.querySelector(".tab-selected").classList.remove("tab-selected");
	tabToSelect.parentElement.classList.add("tab-selected");
}

function NewLayer(child){
	//Create the new tab
	let newTab = document.querySelector(".tab");
	numTabs = document.querySelectorAll(".tab").length;
	addedTab = document.querySelector(".tab-holder").insertBefore(newTab.cloneNode(true),child.parentElement);
	addedTab.children[0].setAttribute( "onclick", "ChangeTab(" + numTabs.toString() + ",this)" );
	addedTab.children[1].setAttribute( "onclick", "RemoveLayer(" + numTabs.toString() + ",this)" );
	addedTab.children[0].innerHTML = "tab" + (numTabs+1).toString();
	addedTab.classList.remove("tab-selected");
	addedTab.setAttribute("name", "tab" + (numTabs).toString());
	let newLayer = document.querySelector("[name=layer"+(numTabs-1).toString()+"]");
	addedLayer = document.querySelector(".keyboard-container").appendChild(newLayer.cloneNode(true));
	addedLayer.setAttribute("name","layer"+(numTabs).toString()+"");
	addedLayer.classList.add("layer");
	addedLayer.classList.add("hide");
	for(row of addedLayer.children){
		row.classList.remove("layer-" + (numTabs-1).toString());
		row.classList.add("layer-" + numTabs.toString());
	}
}

function RemoveLayer(layerNum, tabToRemove){	
	tabToRemove.parentElement.remove();
	layerToRemove = document.querySelector("[name=layer"+layerNum.toString()+"]");
	layerToRemove.remove();
	console.log("layerNum: " + layerNum);
	for(layer of document.querySelectorAll(".layer")){
		let curLayer = parseInt(layer.getAttribute("name").slice(-1));
		if(curLayer < layerNum){ continue;}
		layer.setAttribute("name", "layer" + (curLayer-1).toString());
	}
	for(tab of document.querySelectorAll(".tab")){
		let curTab = parseInt(tab.getAttribute("name").slice(-1));
		
		if(curTab < layerNum){ console.log("we dont want to do anythiung here"); continue;}
		tab.children[0].setAttribute("onclick", "ChangeTab(" + (curTab-1).toString() + ",this)");
		tab.children[0].innerHTML = "tab" + (curTab).toString();
		tab.children[1].setAttribute("onclick", "RemoveLayer(" + (curTab-1).toString() + ",this)");
		tab.setAttribute("name", "tab" + (curTab-1).toString());
	}
}
function ChangeVerticalTab(toLayer, tabToSelect){
	document.querySelector(".vertical-tab-selected").classList.remove(".vertical-tab-selected");
	tabToSelect.classList.add(".vertical-tab-selected");
	if(toLayer == 0){
		//console.log("to keymap");
		document.querySelector("#keymap-editor").classList.remove("hide");
		document.querySelector("#wiring-editor").classList.add("hide");
		document.querySelector("#layout-editor").classList.add("hide");
	} else if(toLayer == 1){
		//console.log("to wiring");
		document.querySelector("#keymap-editor").classList.add("hide");
		document.querySelector("#wiring-editor").classList.remove("hide");
		document.querySelector("#layout-editor").classList.add("hide");
	} else {
		//console.log("to layout");
		document.querySelector("#keymap-editor").classList.add("hide");
		document.querySelector("#wiring-editor").classList.add("hide");
		document.querySelector("#layout-editor").classList.remove("hide");
	}
}
function createWire(){
	console.log("clicked");
	svg = document.querySelector("#wiring-svg");
}

function makeAllWirable(){
	ioDivs = document.querySelectorAll(".gpio");
	for(ioDiv of ioDivs){
		makeWireable(ioDiv);
	}
}
function makeWireable(ioDiv){
	let ioLine;
	ioDiv.addEventListener('mousedown',startLine);
	ioDiv.addEventListener('dropWirableEvent', dropWirable);
	function startLine(e){
		e.preventDefault();
	//TODO make a way to edit effectively
	//	if( e.button == 2) {
	//		ioLine = CreateOrGetLine(ioDiv, e, false);
	//		window.addEventListener('mousemove',dragEditLine);
	//		window.addEventListener('mouseup', dropEditLine);
	//	} else if ( e.button == 0){
			ioLine = CreateOrGetLine(ioDiv, e, true);
			window.addEventListener('mousemove',dragLine);
			window.addEventListener('mouseup',dropLine);
	//	}
	}
	function dragLine(e){
		adjustedCoords = getAdjustedCoords(e,document.querySelector("#wiring-svg").getBoundingClientRect());
		coordString = adjustedCoords.x + "," + adjustedCoords.y;
		points = ioLine.getAttribute("points").split(" ");
		points[points.length - 1] = coordString;
		ioLine.setAttribute("points", points.join(" "));
	}
	function dragEditLine(e){
		index = e.target.getAttribute("lineindex");
		adjustedCoords = getAdjustedCoords(e,document.querySelector("#wiring-svg").getBoundingClientRect());
		coordString = adjustedCoords.x + "," + adjustedCoords.y;
		points = ioLine.getAttribute("points").split(" ");
		points[index] = coordString;
		ioLine.setAttribute("points", points.join(" "));
	}

	function dropLine(e){
		try{
			if(e.target.getAttribute("class").includes("wirable")){
				adjustedCoords = getAdjustedCoords(e.target.getBoundingClientRect(),document.querySelector("#wiring-svg").getBoundingClientRect());
				adjustedCoords = ColOrRowPos(adjustedCoords,ioLine.getAttribute("isCol") == "true");
				//console.log(adjustedCoords);
				coordString = adjustedCoords.x + "," + adjustedCoords.y;
				points = ioLine.getAttribute("points").split(" ");
				points[points.length - 1] = coordString;
				ioLine.setAttribute("points", points.join(" "));
				makeWireable(e.target);
				rowOrCol = "";//ioLine.getAttribute("isCol") == true ? "col" : "row";
				e.target.setAttribute("line" + rowOrCol, ioLine.getAttribute("id").slice(0,-4));
				e.target.setAttribute("lineindex", ioLine.getAttribute("buttoncount"));
				ioLine.setAttribute("buttoncount",(parseInt(ioLine.getAttribute("buttoncount")) + 1).toString());
				
				e.target.addEventListener('dropWirableEvent', dropWirable);
			} else {
				throw Error("not wirable");
			}
		} catch( error ){
				points = ioLine.getAttribute("points").split(" ");
				points[points.length - 1] = points[points.length - 2];
				ioLine.setAttribute("points", points.join(" "));
		}
		window.removeEventListener('mousemove', dragLine);
		window.removeEventListener('mouseup', dropLine);

	}
	function dropEditLine(e){
		window.removeEventListener('mousemove', dragEditLine);
		window.removeEventListener('mouseup', dropEditLine);
		console.log(ioDiv);
	}
	function dropWirable(e){
		//Why cant I do below?
		//e.target.dispatchEvent(dropWirableEvent);
		e.target.removeEventListener('dropWirableEvent',dropWirable);
		e.target.removeEventListener('mousedown',startLine);
	}
}
function ColOrRowPos(divCoords, isCol){
	if(isCol){
		divCoords.x -= 10;
		divCoords.y -= 15;
	} else {
		divCoords.x += 10;
		divCoords.y -= 5;
	}	
	return divCoords;
}
function CreateOrGetLine(ioDiv, e, addpoint){
	const lineId = ioDiv.getAttribute("line")+"line";
	ioLine = document.querySelector("#" + lineId);
	if(ioLine == null) { 
		if (!ioDiv.getAttribute("class").includes("gpio")){
			return;
		}
		polyline = document.querySelector("#wiring-svg").appendChild(document.createElementNS('http://www.w3.org/2000/svg',"polyline"));
		ioDivName = "io" + ioDiv.getAttribute("id").slice(4);
		polyline.setAttribute("id",ioDivName + "line");
		polyline.setAttribute("style", "fill:none;stroke-width:3;stroke:" + getColor(ioDivName));
		polyline.setAttribute("buttoncount","0");
		coords = getAdjustedCoords(e.target.getBoundingClientRect(),document.querySelector("#wiring-svg").getBoundingClientRect());
		polyline.setAttribute("points", coords.x + "," + coords.y + " " + coords.x + "," + coords.y);
		polyline.setAttribute("isCol", ioDiv.nextElementSibling.nextElementSibling.value == "col");
		//console.log(polyline);
		ioDiv.setAttribute("line",ioDivName);
		return polyline;
	}
	points = ioLine.getAttribute("points").split(" ");
	if(points[points.length - 1] == points[points.length - 2]) {
		return ioLine;
	}
	if(addpoint){
		ioLine.setAttribute("points", points.join(" ") + " " + points[points.length - 1]);
	}
	return ioLine;
}
function getAdjustedCoords(targetDivRect, svgRect){
	return{
		x: (targetDivRect.x + (targetDivRect.width ?? 0)/2) - svgRect.x,
		y: (targetDivRect.y + (targetDivRect.height ?? 0)/2) - svgRect.y
	};
}
function updateSvg(element){
	ioDiv = element.previousElementSibling.previousElementSibling;
	const lineId = ioDiv.getAttribute("line")+"line";
	ioLine = document.querySelector("#" + lineId);
	ioLine.setAttribute("isCol", element.value == "col");
	// loop thru points and update them to be the col/row position
	points = ioLine.getAttribute("points").split(" ");
	
	for (p in points){
		if(p == 0) {continue;}
		coords = points[p].split(",");
		button = getElementFromSvgPoint( parseInt(coords[0]),parseInt(coords[1]), document.querySelector("#wiring-svg").getBoundingClientRect())
		adjustedCoords = getAdjustedCoords(button.getBoundingClientRect(),document.querySelector("#wiring-svg").getBoundingClientRect());
		adjustedCoords = ColOrRowPos(adjustedCoords,ioLine.getAttribute("isCol") == "true");

		points[p] = adjustedCoords.x.toString() + "," + adjustedCoords.y.toString();
	}
	ioLine.setAttribute("points", points.join(" "));
}
function removeLine(element){
	ioDiv = element.previousElementSibling.previousElementSibling.previousElementSibling;
	const lineId = ioDiv.getAttribute("line")+"line";
	ioLine = document.querySelector("#" + lineId);
	//Loop thru the line and get each key and drop this as a line
	points = ioLine.getAttribute("points").split(" ");
	//This loop might be unecessary
	for (p in points){
		if(p == 0) {continue;}
		coords = points[p].split(",");
		button = getElementFromSvgPoint( parseInt(coords[0]),parseInt(coords[1]), document.querySelector("#wiring-svg").getBoundingClientRect());
		//console.log(button);
		button.dispatchEvent(dropWirableEvent);
		//return;
	}
	ioLine.remove();
	ioDiv.removeAttribute("line")

}

function getColor(lineId){
	hValue = parseInt(lineId.slice(2)) * 30;
	color = "hsl(" + hValue.toString() + ", 70%, 50%)"
	return color; 
}
function getElementFromSvgPoint(x, y, svgRect){
	return document.elementFromPoint(x+svgRect.x,y+svgRect.y);
}

const dropWirableEvent = new Event('dropWirableEvent', {
	bubbles: true,
	cancelable: true,
	composed: false
});
