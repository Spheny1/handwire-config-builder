const addLineEvent = new Event('addLineEvent', {
	bubble: true,
	cancelable: true,
	composed: false
});
const switchEvent = new Event('switchEvent', {
	bubble: true,
	cancelable: true,
	composed: false
});
function makeConfigRequestJson(event){
        event.detail.parameters.name = 'test';
	rowArray = [];
	colArray = [];
	for(gpio of document.querySelectorAll(".gpio")){
		line = CreateOrGetLine(gpio, gpio.getBoundingClientRect,false,"line");
		if (line.getAttribute("points").split(" ").length == 1) {
			continue;
		}
		if(gpio)
		if(gpio.nextElementSibling.nextElementSibling.value == "col"){
			colArray.push(gpio.nextElementSibling.innerHTML);
		} else {
			rowArray.push(gpio.nextElementSibling.innerHTML);
		}
	}
        event.detail.parameters.orientation = document.getElementById("orientation").value; 
	event.detail.headers['Content-Type'] = 'application/json';
	let layout = [];
	let keys = document.getElementsByClassName("key");
	event.detail.parameters.id = 0;
	for(layer of document.querySelectorAll(".layer")){

		let layers = [];
		for(i = 0; i < rowArray.length * colArray.length; i++){
			layers.push('KC.NO');
		}
		for(row in rowArray){
			rowNum = parseInt(rowArray[row].substring(2));
			for(col in colArray){
				colNum = parseInt(colArray[col].substring(2));
				name = document.querySelector('[linecol="io' + colArray[col].substring(2) + '"][linerow="io' + rowArray[row].substring(2) + '"]').getAttribute("name");
				key = layer.querySelector('[name="' + name + '"]');
				//TODO change this later when we change the key detection
				value = key.firstElementChild.value;
				layers[parseInt(row*colArray.length) + parseInt(col)] = value;
			}
		}
		layout.push(layers);
	}
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
		document.querySelector("#keymap-editor").classList.remove("hide");
		document.querySelector("#wiring-editor").classList.add("hide");
		document.querySelector("#layout-editor").classList.add("hide");
	} else if(toLayer == 1){
		document.querySelector("#keymap-editor").classList.add("hide");
		document.querySelector("#wiring-editor").classList.remove("hide");
		document.querySelector("#layout-editor").classList.add("hide");
	} else {
		document.querySelector("#keymap-editor").classList.add("hide");
		document.querySelector("#wiring-editor").classList.add("hide");
		document.querySelector("#layout-editor").classList.remove("hide");
	}
}
function createWire(){
	svg = document.querySelector("#wirin}g-svg");
}

function makeAllWirable(){
	ioDivs = document.querySelectorAll(".gpio");
	for(ioDiv of ioDivs){
		makeWireable(ioDiv);
		document.querySelector("#wiring-editor").classList.remove("hide");
		ioDiv.newLine = CreateOrGetLine(ioDiv,ioDiv.getBoundingClientRect(),false,"");
		ioDiv.dispatchEvent(addLineEvent);
		document.querySelector("#wiring-editor").classList.add("hide");

	}
}
function makeWireable(ioDiv){
	let ioLine;
	//TODO Find a way to abstract this ideally In the future I want to use this for rotary encoders as well
	let ioLines = [null,null];
	let colLine;
	let rowLine;
	ioDiv.setAttribute("iswired","true");
	ioDiv.addEventListener('mousedown',startLine);
	ioDiv.addEventListener('dropWirableEvent', removeLine);
	ioDiv.addEventListener('addLineEvent',addLine);
	ioDiv.addEventListener('switchEvent',switchLines);
	function startLine(e){
		e.preventDefault();
		let isCol;
		if(e.layerX < 25){
			if(ioLines[0] == null){
				return
			}
		ioLine = ioLines[0];
		} else {
			if(ioLines[1] == null){
				return
			}
		ioLine = ioLines[1];
		}
		points = ioLine.getAttribute("points").split(" ");
		ioLine.setAttribute("points", points.join(" ") + " " + points[points.length - 1]);
		window.addEventListener('mousemove',dragLine);
		window.addEventListener('mouseup',dropLine);

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
				let isCol = ioLine.getAttribute("isCol") == "true";
				let attr;
				//TODO Make this ternary operator
				if(isCol){
					attr = "linecol"
				} else {
					attr = "linerow"
				}
				if(e.target.getAttribute(attr) != null){
					throw "already wired";
				}
				adjustedCoords = getAdjustedCoords(e.target.getBoundingClientRect(),document.querySelector("#wiring-svg").getBoundingClientRect());
				adjustedCoords = ColOrRowPos(adjustedCoords,ioLine.getAttribute("isCol") == "true");
				coordString = adjustedCoords.x + "," + adjustedCoords.y;
				points = ioLine.getAttribute("points").split(" ");
				points[points.length - 1] = coordString;
				ioLine.setAttribute("points", points.join(" "));
				if(e.target.getAttribute("iswired") == "true"){
					e.target.newLine = ioLine;
					e.target.dispatchEvent(addLineEvent);
				} else {
					makeWireable(e.target);
					e.target.newLine = ioLine;
					e.target.dispatchEvent(addLineEvent);
				}
				e.target.setAttribute(attr, ioLine.getAttribute("id").slice(0,-4));
				e.target.setAttribute(attr + "index", ioLine.getAttribute("buttoncount"));
				ioLine.setAttribute("buttoncount",(parseInt(ioLine.getAttribute("buttoncount")) + 1).toString());
			} else {
				throw "not wirable";
			}
		} catch( error ){
			console.log("something went wrong");
			console.log(error);
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
		//console.log(ioDiv);
	}
	function hover(e){
		//TODO UPDATE GET ATTRIBUTE
		let attr;
		let isCol;
		if(e.layerX < 25){
			attr = "linecol";
			isCol = true;
		} else {
			attr = "linerow";
			isCol = false;
		}
		try{
		line = CreateOrGetLine(ioDiv,e.target.getBoundingClientRect(),false,attr);
		e.target.style.backgroundColor = line.getAttribute("style").split(";")[2].slice(7);
		}catch (error){

		}
	}
	function unhover(e){
	//}		
		e.target.style.backgroundColor = "white";
	}
	function dropWirable(e){
		//Why cant I do below?
		//e.target.dispatchEvent(dropWirableEvent);
		line = e.target.line;
		let isCol = line.getAttribute("isCol") == "true";
		let attr;
		//TODO Make this ternary operator
		if(isCol){
			attr = "linecol"
		} else {
			attr = "linerow"
		}
		e.target.removeAttribute(attr);
		e.target.removeAttribute(attr+"index");
		e.target.removeAttribute("iswired");
		e.target.removeEventListener('dropWirableEvent',removeLine);
		e.target.removeEventListener('mousedown',startLine);
		e.target.removeEventListener('mousemove', hover);
	//}		
		e.target.removeEventListener('mouseleave',unhover);
		e.target.removeEventListener('addLineEvent',addLine);
		e.target.removeEventListener('switchEvent',switchLines);
	}
	function removeLine(e){
		lineToRemove = e.target.line;
		for(line in ioLines) {
			if(ioLines[line] == lineToRemove){
				ioLines[line] = null;
				break;
			}
		}
		let allNull = true;
		for(line of ioLines){
			if (line != null){
				allNull = false;
				break;
			}
		}
		if(allNull){
			dropWirable(e);
		}
	}
	function addLine(e){
		newLine = e.currentTarget.newLine	
		//Refactor the polyLine to have its own index attached to the line based on Row/Col
		if(newLine.getAttribute("isCol") == "true"){
			ioLines[0] = newLine;
		} else {
			ioLines[1] = newLine;
		}
	}
	function switchLines(e){
		//TODO When dealing with wirables with more than 2 wires we need more complex logic here
		let temp = ioLines[1];
		ioLines[1] = ioLines[0];
		ioLines[0] = temp;
	}
	ioDiv.addEventListener('mousemove',hover);
	ioDiv.addEventListener('mouseleave',unhover);

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
function CreateOrGetLine(ioDiv, rect, addpoint, attr){
	const lineId = ioDiv.getAttribute(attr)+"line";
	ioLine = document.querySelector("#" + lineId);
	if(ioLine == null) {
		maybeline = document.querySelector("#" + ioDiv.getAttribute("line") + "line");
		if(maybeline != null){
			return maybeline;
		}
		if (!ioDiv.getAttribute("class").includes("gpio")){
			return;
		}
		polyline = document.querySelector("#wiring-svg").appendChild(document.createElementNS('http://www.w3.org/2000/svg',"polyline"));
		ioDivName = "io" + ioDiv.getAttribute("id").slice(4);
		polyline.setAttribute("id",ioDivName + "line");
		polyline.setAttribute("style", "fill:none;stroke-width:3;stroke:" + getColor(ioDivName));
		polyline.setAttribute("buttoncount","0");
		coords = getAdjustedCoords(rect,document.querySelector("#wiring-svg").getBoundingClientRect());
		polyline.setAttribute("points", coords.x + "," + coords.y);
		polyline.setAttribute("isCol", ioDiv.nextElementSibling.nextElementSibling.value == "col");
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
//TODO UPDATE THIS TO THROW AN ERROR IF THERE IS ALREADY A WIRE IN THE TARGET 
function updateSvg(element){
	ioDiv = element.previousElementSibling.previousElementSibling;
	//UPDATE GET ATTRIBUTE
	const lineId = ioDiv.getAttribute("line")+"line";
	ioLine = document.querySelector("#" + lineId);
	let isCol = ioLine.getAttribute("isCol") == "true";
	let attr;
	let colString;
	//TODO Make this ternary operator
	if(!isCol){
		attr = "linecol";
		notAttr = "linerow"
		colString = "true";
	} else {
		attr = "linerow"
		notAttr ="linecol";
		colString = "false";
	}
	points = ioLine.getAttribute("points").split(" ");

	for(point of points){
		coords = point.split(",");
		button = getElementFromSvgPoint( parseInt(coords[0]),parseInt(coords[1]), document.querySelector("#wiring-svg").getBoundingClientRect())
		adjustedCoords = getAdjustedCoords(button.getBoundingClientRect(),document.querySelector("#wiring-svg").getBoundingClientRect());
		adjustedCoords = ColOrRowPos(adjustedCoords,!isCol);
		if(button.getAttribute(attr) != null){
		//TODO DISPLAY ERRO
			if(isCol){
				element.value="col"
			}else {
				element.value="row";
			}
			return;
		}
	}
	for (p in points){
		if(p == 0) {continue;}
		coords = points[p].split(",");
		button = getElementFromSvgPoint( parseInt(coords[0]),parseInt(coords[1]), document.querySelector("#wiring-svg").getBoundingClientRect())
		adjustedCoords = getAdjustedCoords(button.getBoundingClientRect(),document.querySelector("#wiring-svg").getBoundingClientRect());
		adjustedCoords = ColOrRowPos(adjustedCoords,!isCol);
		//TODO why is setAttribute not working?
		console.log(button);
		console.log(notAttr);
		console.log(ioLine.getAttribute("id").slice(0,-4))
		button.setAttribute(notAttr,ioLine.getAttribute("id").slice(0,-4));
		console.log(attr);
		button.removeAttribute(attr);
		button.dispatchEvent(switchEvent);
		points[p] = adjustedCoords.x.toString() + "," + adjustedCoords.y.toString();
	}
	console.log(colString);
	ioLine.setAttribute("isCol", colString);
	ioLine.setAttribute("points", points.join(" "));
}
function removeLine(element){
	ioDiv = element.previousElementSibling.previousElementSibling.previousElementSibling;
	//UPDATE GET ATTRIBUTE
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
		button.line = ioLine;
		button.dispatchEvent(dropWirableEvent);
		//return;
	}
	ioLine.setAttribute("points", points[0]);
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

