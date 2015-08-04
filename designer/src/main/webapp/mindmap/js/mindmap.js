var mindmapModel;
var nodeDataArray = [],
    brushArray = {readonly: "grey", rmnode: "skyblue", subtree: "darkseagreen", added: "forestgreen"};

var initializeMindMap = function(panelId, archetypeModel, referenceModel, language, info) {
		mindmapModel = null;
		nodeDataArray = [];
		var mindmapOptions = {};
		var targetId = panelId + '_mindmap';
		mindmapOptions.archetypeModel = archetypeModel;
	  mindmapOptions.referenceModel = referenceModel;
	  if(language)
	  	mindmapOptions.language = language;
	  $("#" + panelId + "_mindmap_container").show().append('<div id="' + panelId + '_mindmap" class="definition-mindmap"></div>');
	  var openEHR = ArchetypeEditor.getRmModule('openEHR');
	  mindmapModel = new openEHR.MindmapModel(mindmapOptions);
	  var model = mindmapModel.convertToMindmap();
    var goJS = go.GraphObject.make;
    var myDiagram =
        goJS(go.Diagram, (targetId || "diagram-target"),
            {
                "commandHandler.copiesTree": true,
                "commandHandler.deletesTree": true,
                "draggingTool.dragsTree": true,
                initialContentAlignment: go.Spot.Center,  // center the whole graph
                "undoManager.isEnabled": false,
                initialAutoScale: go.Diagram.Uniform,
                allowMove: false
            });

    myDiagram.toolManager.draggingTool.isEnabled = false;
    myDiagram.toolManager.panningTool.isEnabled = false;
    myDiagram.toolManager.dragSelectingTool.isEnabled = false;
    
    var defaultNodeAdornmentTemplate = goJS(go.Adornment, "Spot",
        goJS(go.Panel, "Auto",         		
            goJS(go.Shape, "RoundedRectangle", { fill: null, stroke: null, strokeWidth: 2 }),
            goJS(go.Placeholder, { margin: new go.Margin(-16,6,-15,0) })
        ),
        goJS(go.Panel, "Horizontal", {
	          alignment: go.Spot.TopRight, 
	          alignmentFocus: go.Spot.BottomRight
          },
					goJS("Button", {
				 				width: 20, 
				 				height: 20,
			          "ButtonBorder.fill": "lightblue",
			          "ButtonBorder.stroke": "dodgerblue",
			          "_buttonFillOver": "rgb(0,128,255)",
			          "_buttonStrokeOver": null,
			          "_buttonStrokeNormal": "dodgerblue",
			          "_buttonFillNormal": "lightblue",
			          alignment: go.Spot.TopRight, 
			          alignmentFocus: go.Spot.BottomLeft,
			          margin: new go.Margin(0,3,0,0),
                cursor: "pointer",                 
                  click: function(e, obj) {
                  	addDefaultNodeAndLink(e, obj);
                    e.event.stopPropagation();
                    e.event.stopImmediatePropagation();
                    return false;
                	}  
            },
            goJS(go.TextBlock, " + ",  // the Button content
                { font: "bold 12pt sans-serif" }),
            new go.Binding("visible", "fixed", function(v) { return !v; })
          ),
          goJS("Button", {
		 				width: 20, 
		 				height: 20,
	          "ButtonBorder.fill": "lightblue",
	          "ButtonBorder.stroke": "dodgerblue",
	          "_buttonFillOver": "rgb(0,128,255)",
	          "_buttonStrokeOver": null,
	          "_buttonStrokeNormal": "dodgerblue",
	          "_buttonFillNormal": "lightblue",
	          alignment: go.Spot.TopRight, 
	          alignmentFocus: go.Spot.BottomLeft,
            cursor: "pointer",                 
              click: function(e, obj) {
              	removeNodeAndLink(e, obj);
              	info.propertiesPanel.clear();
                e.event.stopPropagation();
                e.event.stopImmediatePropagation();
                return false;
            	}  
	          },
	          goJS(go.TextBlock, " - ",  // the Button content
	              { font: "bold 12pt sans-serif" }),
	          new go.Binding("visible", "mandatory", function(v) { return !v; })
	        )
      	)
    );
    
    var simpleTemplate = goJS(go.Node, "Auto", {
				selectionAdornmentTemplate: defaultNodeAdornmentTemplate
    	},
  		goJS(go.Shape, {
      	figure: "RoundedRectangle",
      	strokeWidth: 1,
      	margin: new go.Margin(1,1,1,1)
      }, 
      new go.Binding("fill", "mandatory", function(v) { return !v ? "lightblue" : "lightgray"; }),
      new go.Binding("stroke", "mandatory", function(v) { return !v ? "darkblue" : "darkgray"; })
      ),    
      goJS(go.Panel, "Horizontal",
        { 
    			margin: new go.Margin(1,1,1,1),
    			defaultAlignment: go.Spot.Left,
    			stretch: go.GraphObject.Horizontal,
    			minSize: new go.Size(30, 20),
    			click: function(e, obj) {
    				repaintPropertiesPanel(obj, info);
    			}
    		},
    		goJS("TreeExpanderButton", {
          width: 14,
          "ButtonBorder.fill": "whitesmoke",
          "ButtonBorder.stroke": null,
          "_buttonFillOver": "rgba(0,128,255,0.25)",
          "_buttonStrokeOver": null
        }),
        goJS(go.TextBlock, {
            name: "TEXT",
            font: "12px SourceSansPro",
            margin: new go.Margin(0, 8, 0, 4),
            isMultiline: false
          },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("editable", "mandatory", function(v) { return !v; })
        )
      ),
      new go.Binding("isTreeExpanded", "expand")
    );

    var rootTemplate = goJS(go.Node, "Auto", {selectionAdorned: false},
        goJS(go.Shape, {
        	figure: "Ellipse",
        	strokeWidth: 1,
        	margin: new go.Margin(1,1,1,1)
        }, 
        new go.Binding("fill", "mandatory", function(v) { return !v ? "lightblue" : "lightgray"; }),
        new go.Binding("stroke", "mandatory", function(v) { return !v ? "darkblue" : "darkgray"; })),            
        goJS(go.Panel, "Horizontal",
          { 
      			margin: new go.Margin(1,1,1,1),
      			defaultAlignment: go.Spot.Left,
      			stretch: go.GraphObject.Horizontal,
      			minSize: new go.Size(10, 10),
      			click: function(e, obj) {
      				repaintPropertiesPanel(obj, info);
      			}
      		},    
          goJS(go.TextBlock, {
              name: "TEXT",
              font: "13px SourceSansPro",
              margin: new go.Margin(0, 8, 0, 4),
              editable: false
            },
            new go.Binding("text", "text").makeTwoWay()
          )
        )
      );  // end Node    
    
    var rmNodeTemplate = goJS(go.Node, "Auto",  {
				selectionAdornmentTemplate: defaultNodeAdornmentTemplate,
				cursor: "pointer"
  		},
    		goJS(go.Shape, {
        	figure: "RoundedRectangle",
        	strokeWidth: 1,
        	margin: new go.Margin(1,1,1,1)
        }, 
        new go.Binding("fill", "mandatory", function(v) { return !v ? "lightblue" : "lightgray"; }),
        new go.Binding("stroke", "mandatory", function(v) { return !v ? "darkblue" : "darkgray"; })),     		
      goJS(go.Panel, "Horizontal",
        { 
    			margin: new go.Margin(1,1,1,1),
    			defaultAlignment: go.Spot.Left,
    			stretch: go.GraphObject.Horizontal,
    			minSize: new go.Size(30, 15),
    			click: function(e, obj) {
    				repaintPropertiesPanel(obj, info);
    			}
    		},
    		goJS("TreeExpanderButton", {
          width: 14,
          "ButtonBorder.fill": "whitesmoke",
          "ButtonBorder.stroke": null,
          "_buttonFillOver": "rgba(0,128,255,0.25)",
          "_buttonStrokeOver": null
        }),    		
        // icon
        goJS(go.Picture, {
        	name: "ICON",
      		desiredSize: new go.Size(15, 15),
      		margin: new go.Margin(2, 2, 2, 5),
          imageStretch: go.GraphObject.Uniform,
          alignment: go.Spot.TopRight,
          cursor: "pointer",
          click: function(e, obj) {
          	createRmTypeSelect(myDiagram, obj);
            e.event.stopPropagation();
            e.event.stopImmediatePropagation();
            return false;
          }
        }, new go.Binding("source", "img", function(v,f,g,h) { 
        	return v;
        })),
        // text
        goJS(go.TextBlock, {
            name: "TEXT",
            font: "12px SourceSansPro",
            margin: new go.Margin(0, 8, 0, 4),
            isMultiline: false
          },
          new go.Binding("text", "text").makeTwoWay(),
          new go.Binding("editable", "mandatory", function(v) { return !v; })
        )
      ),
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("locationSpot", "dir", function(d) { return spotConverter(d, false); }),
      new go.Binding("isTreeExpanded", "expand")
    );  
    
    var templmap = new go.Map("string", go.Node);
    templmap.add("simple", simpleTemplate);
    templmap.add("root", rootTemplate);
    templmap.add("rmNode", rmNodeTemplate);
    templmap.add("", myDiagram.nodeTemplate);
    myDiagram.nodeTemplateMap = templmap;
    
    myDiagram.linkTemplate =  goJS(go.Link,
      {
        curve: go.Link.Bezier,
        fromShortLength: -1,
        toShortLength: -1,
        selectable: false
      },
      goJS(go.Shape,
        { strokeWidth: 2 },
        new go.Binding("stroke", "toNode", function(n) { return n.data.brush; }).ofObject())
    );

    
    // Diagram event listeners
    myDiagram.addDiagramListener("ChangedSelection", function(e) {
    	$("#customNodeEditor").remove();
    });

    myDiagram.addDiagramListener("TreeExpanded", function(e) {
  		layoutAll(e.diagram);
    });

    myDiagram.addDiagramListener("TreeCollapsed", function(e) {
  		layoutAll(e.diagram);
    });
    
    myDiagram.addDiagramListener("BackgroundSingleClicked", function(e) {
			info.propertiesPanel.clear();
    });
    
    myDiagram.addDiagramListener("TextEdited", function(e) {
			mindmapModel.renameConstraint(e.subject.part.data.node.rmPath, e.subject.text);
			repaintMindmapNode(e.subject.part, e.subject.part.data.node.rmPath);
    });
    
  $("#getMindmapModel").on("click touchstart", function() { // "Generate" button
      console.log(myDiagram.model.toJson());
  });
  
  // Fill data & arrange nodes
  myDiagram.model = go.Model.fromJson(formatBuilder(model));
  arrangeLayout(myDiagram);
}

function createRmTypeSelect(myDiagram, obj) {
  var loc = obj.getDocumentPoint(go.Spot.BottomLeft);
  var svgPosition = myDiagram.transformDocToView(loc);
	var panelPosition = $(myDiagram.div).offset();
	$("#customNodeEditor").remove();
	var rmPath = obj.part.data.node.rmPath;
	if(rmPath != undefined) {
		var availableOptions = mindmapModel.getValidRmTypesForConstraint(rmPath);
		if(availableOptions.length > 1) {
  		$("body").append("<div id='customNodeEditor' style='display:inline;position:absolute;z-index:1000;'><select id='availableRmTypes'></div>");
  		$("#customNodeEditor").offset({left: panelPosition.left + svgPosition.x, top: panelPosition.top + svgPosition.y});
      for (var i = 0; i < availableOptions.length; i++) {
      	$("#availableRmTypes").append("<option value='" + availableOptions[i] + "'>" + availableOptions[i] + "</option>");
      }
      $("#availableRmTypes").val(obj.part.data.node.rmType);
      $("#availableRmTypes").change(obj, function(ev) {
      	var newNode = mindmapModel.changeConstraintType(rmPath, $(this).val());
  			repaintMindmapNode(ev.data.part, rmPath);
  			repaintPropertiesPanel(obj, info);
      	$(this).parent().remove();
      });
		}       		
	}
}

function repaintPropertiesPanel(obj, info) {
	var rmPath = obj.part.data.node.rmPath;
	if(rmPath != undefined) {
    var fullObject = mindmapModel.getConstraintObject(rmPath);
    var current = {
        mindmapNode: obj.part.data,
        data: fullObject
    };
    var constraintData = {
        info: info,
        cons: fullObject
    };
    constraintData.specializeCallback = function () {
        //specializeConstraint(archetypeModel, constraintData, treeEvent.node);
    };
    constraintData.saveCallback = function() {
    	repaintMindmapNode(obj.part, rmPath);
    };
    info.propertiesPanel.show(constraintData);   
	} else {
		info.propertiesPanel.clear();
	}
}

function repaintMindmapNode(oldData, rmPath) {
	var nodeData = mindmapModel.getMindmapConstraint(rmPath);
	oldData.setProperties({
    "ICON.source": "mindmap/resources/icons/" + (nodeData.rmType ? nodeData.rmType.toLowerCase() : "DV_TEXT".toLowerCase()) + ".png",
    "TEXT.text": nodeData.label
	});
	oldData.data.node = nodeData;
}

function formatBuilder(data){
  var key = 0;
  if (data) {
  	var nodeData = $.extend({}, data);
  	delete nodeData.children;
    nodeDataArray.push( {"key": key, "text": data.label , "loc":"0 0", "category": "root", "node": nodeData, "mandatory": true} );
    if (data.children){
        recursiveChildrenFormatBuilder(data.children, key);
    }
  }
  return { "class": "go.TreeModel", "nodeDataArray": nodeDataArray };
}

function recursiveChildrenFormatBuilder(data, parentKey, brush, dir) {
  for (var i=0; i<data.length; i++){
      var key = "";
      var brush = brushArray["rmnode"];
      if (data[i].children && !data[i].rmType) {
      	brush = brushArray["subtree"];
      }
      if(parentKey == 0){
          key = (i + 1);
          brush = brush;
          dir = (dir == "left") ? "right" : "left";
      }
      else {
          key = parentKey + "" + (i + 1);
      }
    	var nodeData = $.extend({}, data[i]);
    	delete nodeData.children;
      var nodeObj = {"key": parseInt(key), "parent": parentKey, "text": data[i].label, "brush": brush, "dir": dir, "node": nodeData, "expand": (data[i].section != "description" && data[i].section != "attribution")};

      if (data[i].rmType) {
          nodeObj["img"] = "mindmap/resources/icons/" + data[i].rmType.toLowerCase() + ".png";
          nodeObj["category"] = "rmNode";
      } else {
      	nodeObj["category"] = "simple";
      }
      if(data[i].hasOwnProperty("canDelete") && data[i].canDelete) {
      	nodeObj["mandatory"] = false;
      } else {
      	nodeObj["mandatory"] = true;
      }
      if(data[i].hasOwnProperty("canAddChildren") && data[i].canAddChildren) {
      	nodeObj["fixed"] = false;
      } else {
      	nodeObj["fixed"] = true;
      }
      nodeDataArray.push(nodeObj);

      if (data[i].children){
          recursiveChildrenFormatBuilder(data[i].children , key, brush, dir);
      }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spotConverter(dir, from) {
  if (dir === "left") {
      return (from ? go.Spot.Left : go.Spot.Right);
  } else {
      return (from ? go.Spot.Right : go.Spot.Left);
  }
}

function toggleTextWeight(obj) {
  var adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Weight");
  var node = adorn.adornedPart;
  var tb = node.findObject("TEXT");
  var idx = tb.font.indexOf("bold");
  if (idx < 0) {
      tb.font = "bold " + tb.font;
  } else {
      tb.font = tb.font.substr(idx + 5);
  }
  adorn.diagram.commitTransaction("Change Text Weight");
}

function addDefaultNodeAndLink(e, obj) {
  var adorn = obj.part;
  var diagram = adorn.diagram;
  diagram.startTransaction("Add Node");
  var oldnode = adorn.adornedPart;
  var olddata = oldnode.data;
  var rmPath = olddata.node.rmPath;
  var newNode = null;
  if(rmPath != undefined) {
    newNode = mindmapModel.createConstraintChild(rmPath);
  }
  var label = "New " + (newNode.rmType ? newNode.rmType.substring("DV_".length) : "TEXT").toLowerCase();
  var newdata = { 
  		text: label, 
  		brush: brushArray["added"], 
  		dir: olddata.dir, 
  		parent: olddata.key, 
  		mandatory: false, 
  		fixed: true, 
  		category: "rmNode", 
  		img: "mindmap/resources/icons/" + (newNode ? newNode.rmType.toLowerCase() : "DV_TEXT".toLowerCase()) + ".png",
  		node: {
  			label: label,
  			rmPath: newNode.rmPath,
  			rmType: newNode.rmType
  		}
  };
  diagram.model.addNodeData(newdata);
  layoutTree(diagram, oldnode);
  diagram.commitTransaction("Add Node");
  layoutAll(diagram);
}

function removeNodeAndLink(e, obj) {
  var adorn = obj.part;
  var diagram = adorn.diagram;
  diagram.startTransaction("Remove Node");
  var oldnode = adorn.adornedPart;
  var olddata = oldnode.data;
  deleteNode(diagram, oldnode);
  layoutTree(diagram, oldnode);
  diagram.commitTransaction("Remove Node");
  layoutAll(diagram);
}

function deleteNode(mydiagram, deletedItem)
{
    var nodeToDelete = mydiagram.selection.iterator.first();    
    var childNodes = getChildNodes(mydiagram, deletedItem);
    $.each(childNodes, function()
    {
         myDiagram.remove(this);
    });
    mydiagram.commandHandler.deleteSelection();
}

function getChildNodes(mydiagram, deleteNode)
{
    var children = [];
    var allConnected= deleteNode.findNodesConnected();
    while (allConnected.next())
    {
        var child = allConnected.value;
        if (isChildNode(mydiagram, deleteNode, child))
        {
            children.push(child);
            var subChildren = getChildrenNodes(child);
            $.each(subChildren, function()
            {
                children.push(this);
            });
       }
   }
   return children;
}

function isChildNode(mydiagram, currNode, currChild)
{
    var links = mydiagram.links.iterator;
    while (links.next())
    {
        var currentLinkModel = links.value.data;
        if (currentLinkModel.from === currNode.data.key &&   currentLinkModel.to === currChild.data.key)
        {
             return true;
        }
    }
    return false;
}

function layoutAll(myDiagram) {
  var root = myDiagram.findNodeForKey(0);
  if (root === null) return;
  myDiagram.startTransaction("Layout");
  var rightward = new go.Set(go.Part);
  var leftward = new go.Set(go.Part);
  root.findLinksConnected().each(function(link) {
      var child = link.toNode;
      if (child.data.dir === "left") {
          leftward.add(root);
          leftward.add(link);
          leftward.addAll(child.findTreeParts());
      } else {
          rightward.add(root);
          rightward.add(link);
          rightward.addAll(child.findTreeParts());
      }
  });
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  myDiagram.commitTransaction("Layout");
}

function layoutTree(myDiagram, node) {
  if (node.data.key === 0) {
      layoutAll(myDiagram);
  } else {
      var parts = node.findTreeParts();
      layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
  }
}

function layoutAngle(parts, angle) {
  var layout = go.GraphObject.make(go.TreeLayout,
      { angle: angle,
          arrangement: go.TreeLayout.ArrangementFixedRoots,
          nodeSpacing: 5,
          layerSpacing: 20 });
  layout.doLayout(parts);
}

$( window ).resize(function() {
	// Do nothing for now. Maybe in the future this will be needed.
});

function arrangeLayout (myDiagram) {
  var root = myDiagram.findNodeForKey(0);
  if (root === null) return;
  myDiagram.startTransaction("Layout");
  var rightward = new go.Set(go.Part);
  var leftward = new go.Set(go.Part);
  root.findLinksConnected().each(function(link) {
      var child = link.toNode;
      if (child.data.dir === "left") {
          leftward.add(root);
          leftward.add(link);
          leftward.addAll(child.findTreeParts());
      } else {
          rightward.add(root);
          rightward.add(link);
          rightward.addAll(child.findTreeParts());
      }
  });
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  myDiagram.commitTransaction("Layout");
}
