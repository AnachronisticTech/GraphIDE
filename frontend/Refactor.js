// Licenced under Creative Common - Attribution-NonCommercial Licence.
// https://github.com/sketchpunk/NEditorJS

//Copyright 2016 Sketchpunk Labs

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

//###########################################################################
//Main Static Object
//###########################################################################

const NEditor = {

    dragMode: 0,
    dragItem: null, //reference to the dragging item
    startPos: null, //Used for starting position of dragging lines
    offsetX: 0, //OffsetX for dragging nodes
    offsetY: 0, //OffsetY for dragging nodes
    svg: null, //SVG where the line paths are drawn.

    pathColor: "#999999",
    pathColorA: "#86d530",
    pathWidth: 2,
    pathDashArray: "20,5,5,5,5,5",

    init: function() {
        NEditor.svg = document.getElementById("connsvg");
        NEditor.svg.ns = NEditor.svg.namespaceURI;
    },

    /*--------------------------------------------------------
    Global Function */

    //Trail up the parent nodes to get the X,Y position of an element
    getOffset: function(elm) {
        var pos = { x: 0, y: 0 };
        while (elm) {
            pos.x += elm.offsetLeft;
            pos.y += elm.offsetTop;
            elm = elm.offsetParent;
        }
        return pos;
    },

    //Gets the position of one of the connection points
    getConnPos: function(elm) {
        var pos = NEditor.getOffset(elm);
        pos.x += elm.offsetWidth / 2 + 1.5; //Add some offset so its centers on the element
        pos.y += elm.offsetHeight / 2 + 0.5;
        return pos;
    },

    //Used to reset the svg path between two nodes
    updateConnPath: function(o) {
        var pos1 = o.output.getPos(),
            pos2 = o.input.getPos();
        NEditor.setQCurveD(o.path, pos1.x, pos1.y, pos2.x, pos2.y);
    },

    //Creates an Quadratic Curve path in SVG
    createQCurve: function(x1, y1, x2, y2) {
        var elm = document.createElementNS(NEditor.svg.ns, "path");
        elm.setAttribute("fill", "none");
        elm.setAttribute("stroke", NEditor.pathColor);
        elm.setAttribute("stroke-width", NEditor.pathWidth);
        elm.setAttribute("stroke-dasharray", NEditor.pathDashArray);

        NEditor.setQCurveD(elm, x1, y1, x2, y2);
        return elm;
    },

    //This is seperated from the create so it can be reused as a way to update an existing path without duplicating code.
    setQCurveD: function(elm, x1, y1, x2, y2) {
        var dif = Math.abs(x1 - x2) / 1.5,
            str =
            "M" + x1 + "," + y1 + " C" + /* MoveTo */ (x1 + dif) + "," + y1 + " " + /* First Control Point */ (x2 - dif) + "," + y2 + " " + /* Second Control Point */ x2 + "," + y2; /* End Point */

        elm.setAttribute("d", str);
    },

    setCurveColor: function(elm, isActive) {
        elm.setAttribute("stroke", isActive ? NEditor.pathColorA : NEditor.pathColor);
    },

    /*Unused function at the moment, it creates a straight line
    NEditor.createline = function (x1, y1, x2, y2, color, w) {
    	var line = document.createElementNS(NEditor.svg.ns, 'line');
    	line.setAttribute('x1', x1);
    	line.setAttribute('y1', y1);
    	line.setAttribute('x2', x2);
    	line.setAttribute('y2', y2);
    	line.setAttribute('stroke', color);
    	line.setAttribute('stroke-width', w);
    	return line;
    }*/

    /*--------------------------------------------------------
    Dragging Nodes */
    beginNodeDrag: function(n, x, y) {
        if (NEditor.dragMode != 0) return;

        NEditor.dragMode = 1;
        NEditor.dragItem = n;
        this.offsetX = n.offsetLeft - x;
        this.offsetY = n.offsetTop - y;

        window.addEventListener("mousemove", NEditor.onNodeDragMouseMove);
        window.addEventListener("mouseup", NEditor.onNodeDragMouseUp);
    },

    onNodeDragMouseUp: function(e) {
        e.stopPropagation();
        e.preventDefault();
        NEditor.dragItem = null;
        NEditor.dragMode = 0;

        window.removeEventListener("mousemove", NEditor.onNodeDragMouseMove);
        window.removeEventListener("mouseup", NEditor.onNodeDragMouseUp);
    },

    onNodeDragMouseMove: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (NEditor.dragItem) {
            NEditor.dragItem.style.left = e.pageX + NEditor.offsetX + "px";
            NEditor.dragItem.style.top = e.pageY + NEditor.offsetY + "px";
            NEditor.dragItem.ref.updatePaths();
        }
    },

    /*--------------------------------------------------------
    Dragging Paths */
    beginConnDrag: function(path) {
        if (NEditor.dragMode != 0) return;

        NEditor.dragMode = 2;
        NEditor.dragItem = path;
        NEditor.startPos = path.output.getPos();

        NEditor.setCurveColor(path.path, false);
        window.addEventListener("click", NEditor.onConnDragClick);
        window.addEventListener("mousemove", NEditor.onConnDragMouseMove);
    },

    endConnDrag: function() {
        NEditor.dragMode = 0;
        NEditor.dragItem = null;

        window.removeEventListener("click", NEditor.onConnDragClick);
        window.removeEventListener("mousemove", NEditor.onConnDragMouseMove);
    },

    onConnDragClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        NEditor.dragItem.output.removePath(NEditor.dragItem);
        NEditor.endConnDrag();
    },

    onConnDragMouseMove: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (NEditor.dragItem)
            NEditor.setQCurveD(
                NEditor.dragItem.path,
                NEditor.startPos.x,
                NEditor.startPos.y,
                e.pageX,
                e.pageY
            );
    },

    /*--------------------------------------------------------
    Connection Event Handling */
    onOutputClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        var path = e.target.parentNode.ref.addPath();

        NEditor.beginConnDrag(path);
    },

    onInputClick: function(e) {
        e.stopPropagation();
        e.preventDefault();
        var o = this.parentNode.ref;

        switch (NEditor.dragMode) {
            case 2: //Path Drag
                o.applyPath(NEditor.dragItem);
                NEditor.endConnDrag();
                break;
            case 0: //Not in drag mode
                var path = o.clearPath();
                if (path != null) NEditor.beginConnDrag(path);
                break;
        }
    },

};

//###########################################################################
// Connector Object
//###########################################################################

//Connector UI Object. Ideally this should be an abstract class as a base for an output and input class, but save time
//I wrote this object to handle both types. Its a bit hokey but if it becomes a problem I'll rewrite it in a better OOP way.
class Connector {
    constructor(pElm, isInput, name) {
        name = escapeHtml(name);
        this.name = name;
        this.root = document.createElement("li");
        this.dot = document.createElement("i");
        this.label = document.createElement("span");

        //Input/Output Specific values
        if (isInput) this.OutputConn = null;
        //Input can only handle a single connection.
        else this.paths = []; //Outputs can connect to as many inputs is needed

        //Create Elements
        pElm.appendChild(this.root);
        this.root.appendChild(this.dot);
        this.root.appendChild(this.label);

        //Define the Elements
        this.root.className = isInput ? "Input" : "Output";
        this.root.ref = this;
        this.label.innerHTML = name;
        this.dot.innerHTML = "&nbsp;";

        this.dot.addEventListener(
            "click",
            isInput ? NEditor.onInputClick : NEditor.onOutputClick
        );
    }

    /* Input methods */

    // Get the position of the connection ui element
    getPos() {
        return NEditor.getConnPos(this.dot);
    }

    // Just updates the UI if the connection is currently active
    resetState() {
        var isActive =
            (this.paths && this.paths.length > 0) || this.OutputConn != null;

        if (isActive) this.root.classList.add("Active");
        else this.root.classList.remove("Active");
    }

    // Used mostly for dragging nodes, so this allows the paths to be redrawn
    updatePaths() {
        if (this.paths && this.paths.length > 0)
            for (var i = 0; i < this.paths.length; i++)
                NEditor.updateConnPath(this.paths[i]);
        else if (this.OutputConn) NEditor.updateConnPath(this.OutputConn);
    }

    /* Output Methods */

    // This creates a new path between nodes
    addPath() {
        var pos = NEditor.getConnPos(this.dot),
            dat = {
                path: NEditor.createQCurve(pos.x, pos.y, pos.x, pos.y),
                input: null,
                output: this,
            };

        NEditor.svg.appendChild(dat.path);
        this.paths.push(dat);
        return dat;
    }

    //Remove Path
    removePath(o) {
        var i = this.paths.indexOf(o);

        if (i > -1) {
            NEditor.svg.removeChild(o.path);
            this.paths.splice(i, 1);
            this.resetState();
        }
    }

    connectTo(o) {
        if (o.OutputConn === undefined) {
            console.log("connectTo - not an input");
            return;
        }

        var conn = this.addPath();
        o.applyPath(conn);
    }

    /*--------------------------------------------------------
            Input Methods */

    //Applying a connection from an output
    applyPath(o) {
        //If a connection exists, disconnect it.
        //if (this.OutputConn != null) this.OutputConn.output.removePath(this.OutputConn);

        //If moving a connection to here, tell previous input to clear itself.
        if (o.input != null) o.input.clearPath();

        o.input = this; //Saving this connection as the input reference
        this.OutputConn = o; //Saving the path reference to this object
        this.resetState(); //Update the state on both sides of the connection, TODO some kind of event handling scheme would work better maybe
        o.output.resetState();

        NEditor.updateConnPath(o);
        NEditor.setCurveColor(o.path, true);
    }

    //clearing the connection from an output
    clearPath() {
        if (this.OutputConn != null) {
            var tmp = this.OutputConn;
            tmp.input = null;

            this.OutputConn = null;
            this.resetState();
            return tmp;
        }
    }
}

NEditor.InlineCodeConnector = function(pElm, isInput, name) {
    name = escapeHtml(name);
    this.name = name;
    this.root = document.createElement("li");
    this.dot = document.createElement("i");
    this.label1 = document.createElement("span");
    this.label2 = document.createElement("span");

    //Input/Output Specific values
    if (isInput) this.OutputConn = null;
    //Input can only handle a single connection.
    else this.paths = []; //Outputs can connect to as many inputs is needed

    //Create Elements
    pElm.appendChild(this.root);
    this.root.appendChild(this.label1);
    this.root.appendChild(this.dot);
    this.root.appendChild(this.label2);

    //Define the Elements
    this.root.className = isInput ? "Input" : "Output";
    this.root.ref = this;
    this.label1.innerHTML = name.slice(0, name.indexOf("@"));
    this.label1.style.paddingRight = "0.5em";
    this.label2.innerHTML = name.slice(name.indexOf("@") + 1);
    this.dot.innerHTML = "&nbsp;";
    this.dot.className = "inline";

    this.dot.addEventListener(
        "click",
        isInput ? NEditor.onInputClick : NEditor.onOutputClick
    );
};

NEditor.ReturnConnector = function(pElm, isInput, name) {
    name = escapeHtml(name);
    this.name = name;
    this.root = document.createElement("li");
    this.dot = document.createElement("i");
    this.label = document.createElement("span");

    //Input/Output Specific values
    if (isInput) this.OutputConn = null;
    //Input can only handle a single connection.
    else this.paths = []; //Outputs can connect to as many inputs is needed

    //Create Elements
    pElm.appendChild(this.root);
    //this.root.appendChild(this.dot);
    this.root.appendChild(this.label);

    //Define the Elements
    this.root.className = isInput ? "Input" : "Output";
    this.root.ref = this;
    this.label.innerHTML = name;
    this.dot.innerHTML = "&nbsp;";

    this.dot.addEventListener(
        "click",
        isInput ? NEditor.onInputClick : NEditor.onOutputClick
    );
};

NEditor.InlineCodeConnector.prototype.getPos =
    Connector.prototype.getPos;
NEditor.InlineCodeConnector.prototype.resetState =
    Connector.prototype.resetState;
NEditor.InlineCodeConnector.prototype.updatePaths =
    Connector.prototype.updatePaths;
NEditor.InlineCodeConnector.prototype.addPath =
    Connector.prototype.addPath;
NEditor.InlineCodeConnector.prototype.removePath =
    Connector.prototype.removePath;
NEditor.InlineCodeConnector.prototype.connectTo =
    Connector.prototype.connectTo;
NEditor.InlineCodeConnector.prototype.applyPath =
    Connector.prototype.applyPath;
NEditor.InlineCodeConnector.prototype.clearPath =
    Connector.prototype.clearPath;

NEditor.ReturnConnector.prototype.getPos = Connector.prototype.getPos;
NEditor.ReturnConnector.prototype.resetState =
    Connector.prototype.resetState;
NEditor.ReturnConnector.prototype.updatePaths =
    Connector.prototype.updatePaths;
NEditor.ReturnConnector.prototype.addPath = Connector.prototype.addPath;
NEditor.ReturnConnector.prototype.removePath =
    Connector.prototype.removePath;
NEditor.ReturnConnector.prototype.connectTo =
    Connector.prototype.connectTo;
NEditor.ReturnConnector.prototype.applyPath =
    Connector.prototype.applyPath;
NEditor.ReturnConnector.prototype.clearPath =
    Connector.prototype.clearPath;

//###########################################################################
// Node Object
//###########################################################################

class Node {
    constructor(sTitle) {
        this.Title = sTitle;
        this.Inputs = [];
        this.Outputs = [];

        //.........................
        this.eRoot = document.createElement("div");
        document.body.appendChild(this.eRoot);
        this.eRoot.className = "NodeContainer";
        this.eRoot.ref = this;

        //.........................
        this.eHeader = document.createElement("header");
        this.eRoot.appendChild(this.eHeader);
        this.eHeader.innerHTML = this.Title;
        this.eHeader.addEventListener("mousedown", this.onHeaderDown);

        //.........................
        this.eList = document.createElement("ul");
        this.eRoot.appendChild(this.eList);
    }

    addInput(name) {
        var connector = new Connector(this.eList, true, name);
        this.Inputs.push(connector);
        return connector;
    }

    addOutput(name) {
        var connector = new Connector(this.eList, false, name);
        this.Outputs.push(connector);
        return connector;
    }

    addOutputAt(name) {
        var connector = new NEditor.InlineCodeConnector(this.eList, false, name);
        this.Outputs.push(connector);
        return connector;
    }

    addReturn(name) {
        var connector = new NEditor.ReturnConnector(this.eList, false, name);
        this.Outputs.push(connector);
        return connector;
    }

    getInputPos(i) {
        return NEditor.getConnPos(this.Inputs[i].dot);
    }

    getOutputPos(i) {
        return NEditor.getConnPos(this.Outputs[i].dot);
    }

    updatePaths() {
        for (const connector of[...this.Inputs, ...this.Outputs]) {
            connector.updatePaths();
        }
    }

    //Handle the start node dragging functionality
    onHeaderDown(e) {
        e.stopPropagation();
        NEditor.beginNodeDrag(e.target.parentNode, e.pageX, e.pageY);
    }

    setPosition(x, y) {
        this.eRoot.style.left = x + "px";
        this.eRoot.style.top = y + "px";
    }

    setWidth(w) {
        this.eRoot.style.width = w + "px";
    }
}

//###########################################################################
// SETUP
//###########################################################################
window.addEventListener("load", function(e) {
    NEditor.init();
});